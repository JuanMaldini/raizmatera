"""
Reconstruye el logo a partir de docs/logo.jpg (150x150, con ruido de JPEG) y
genera los tamaños que necesita la web.

Uso:
    pip install pillow numpy
    python scripts/build-logo.py

Salida: assets/brand/

Cómo funciona
-------------
El logo es un diseño plano de tres colores, pero viene en 150 px y comprimido en
JPEG, así que los bordes traen halos y el fondo, moteado. El proceso:

  1. se amplía 8x con LANCZOS, lo que convierte cada borde duro en una rampa suave;
  2. cada píxel se mezcla un 80% hacia el color de marca más cercano: eso limpia
     el ruido de compresión pero deja el 20% de la rampa original, que es lo que
     mantiene el antialiasing y con él los trazos finos;
  3. se reduce al tamaño final con LANCZOS.

El 80% es deliberado. Probé mapear al color exacto (100%) y filtrar el ruido con
un median antes de escalar: ambas cosas destruyen las letras de MATERA y la raíz
del pie, que en el original miden 3 o 4 píxeles de alto. A esa escala no hay
margen para filtrar — solo para no ensuciar.

Sigue siendo una reconstrucción de un original de 150 px: recupera nitidez, no
detalle que nunca estuvo. Cuando aparezca el logo en vector o en alta,
reemplazar docs/logo.jpg y volver a correr esto.
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta pillow. Instalalo con: pip install pillow")

try:
    import numpy as np
except ImportError:
    sys.exit("Falta numpy. Instalalo con: pip install numpy")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "logo.jpg"
OUT = ROOT / "assets" / "brand"

# Los tres colores de marca. `arena` es además el fondo que se vuelve
# transparente en la variante recortada.
ARENA = (0xE7, 0xD2, 0xB7)
OLIVA = (0x3B, 0x46, 0x28)
SAGE = (0xB6, 0xAD, 0x8C)
PALETA = np.array([ARENA, OLIVA, SAGE], dtype=float)

ESCALA = 8
MEZCLA = 0.8  # cuánto se corrige cada píxel hacia su color de marca
TAMANOS = [1024, 512, 256, 128]
ICONOS = {"icon-512.png": 512, "icon-180.png": 180, "icon-32.png": 32}


def limpiar(im: Image.Image) -> Image.Image:
    """Acerca cada píxel al color de marca más cercano sin aplanarlo del todo."""
    a = np.asarray(im, dtype=float)
    distancias = ((a[:, :, None, :] - PALETA[None, None, :, :]) ** 2).sum(-1)
    cercano = PALETA[distancias.argmin(-1)]
    mezclado = a * (1 - MEZCLA) + cercano * MEZCLA
    return Image.fromarray(mezclado.clip(0, 255).astype("uint8"))


def recortar_fondo(im: Image.Image) -> Image.Image:
    """Variante con el fondo arena en alfa, para montar sobre cualquier color.

    El alfa no sale de la distancia al arena: el sage está a solo 75 unidades del
    arena y el ruido del fondo llega a 40, así que un umbral simple deja halo. Se
    compara cuánto se parece cada píxel al arena contra cuánto se parece al color
    de tinta más cercano, y el alfa es de qué lado del límite cae. Los bordes
    antialiaseados quedan a mitad de camino, que es exactamente lo que se quiere.
    """
    a = np.asarray(im.convert("RGB"), dtype=float)
    d_arena = np.sqrt(((a - np.array(ARENA, dtype=float)) ** 2).sum(-1))
    tinta = np.array([OLIVA, SAGE], dtype=float)
    d_tinta = np.sqrt(((a[:, :, None, :] - tinta[None, None, :, :]) ** 2).sum(-1)).min(-1)

    alfa = (0.5 + (d_arena - d_tinta) / 40.0).clip(0, 1) * 255
    rgba = np.dstack([a, alfa]).astype("uint8")
    return Image.fromarray(rgba, "RGBA")


def guardar(im: Image.Image, nombre: str, tam: int) -> None:
    destino = OUT / nombre
    im.resize((tam, tam), Image.LANCZOS).save(destino, "PNG", optimize=True)
    print(f"  {destino.name:26} {tam}x{tam}  {destino.stat().st_size / 1024:.0f} KB")


def main() -> None:
    if not SRC.exists():
        sys.exit(f"No encuentro el logo en {SRC}")

    OUT.mkdir(parents=True, exist_ok=True)

    original = Image.open(SRC).convert("RGB")
    print(f"origen: {original.size[0]}x{original.size[1]}")

    grande = original.resize(
        (original.width * ESCALA, original.height * ESCALA), Image.LANCZOS
    )
    limpio = limpiar(grande)

    for tam in TAMANOS:
        guardar(limpio, f"logo-{tam}.png", tam)

    for nombre, tam in ICONOS.items():
        guardar(limpio, nombre, tam)

    recortado = recortar_fondo(limpio)
    destino = OUT / "logo-1024-transparente.png"
    recortado.resize((1024, 1024), Image.LANCZOS).save(destino, "PNG", optimize=True)
    print(f"  {destino.name:26} 1024x1024  {destino.stat().st_size / 1024:.0f} KB")

    print(f"\nassets de marca en {OUT}")


if __name__ == "__main__":
    main()
