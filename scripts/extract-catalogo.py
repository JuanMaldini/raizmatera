"""
Extrae las fotos de producto del catálogo PDF y las deja listas para subir a
PocketBase: convertidas a WebP y nombradas por el slug del producto.

Uso (una sola vez):
    pip install pymupdf pillow
    python scripts/extract-catalogo.py

Salida: assets/catalogo/{slug}.webp

Nota importante sobre el mapeo
------------------------------
El orden en que PyMuPDF devuelve las imágenes de una página NO coincide con el
orden visual del layout. En las páginas 2 y 5 las dos fotos vienen invertidas.
Por eso el mapeo de abajo se armó comparando las coordenadas reales de cada
imagen (`page.get_image_rects`) contra las del texto de cada producto, y se
verifica en cada corrida: si una imagen cae lejos de donde se la espera, el
script avisa en vez de escribir una foto equivocada.
"""

import sys
from pathlib import Path

try:
    import fitz  # pymupdf
except ImportError:
    sys.exit("Falta pymupdf. Instalalo con: pip install pymupdf")

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta pillow. Instalalo con: pip install pillow")

import io

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "docs" / "CATÁLOGO 2026.pdf"
OUT = ROOT / "assets" / "catalogo"

# Lado largo máximo de la foto exportada. Las originales son 1536x2048; 1600 es
# de sobra para web y PocketBase, y Next optimiza de nuevo al servir.
MAX_SIDE = 1600
# Las fotos están sobre lino: la trama de la tela es ruido de alta frecuencia y
# comprime caro. Entre q75 y q88 el archivo solo baja un 20% y la diferencia
# visible es nula, así que 82 es el punto razonable.
WEBP_QUALITY = 82

# (página, índice de imagen dentro de la página) -> slug del producto.
# El índice es el que devuelve get_images(), no el orden visual.
MAPEO = {
    (2, 2): "mate-criollo",
    (2, 1): "mate-criollo-sp",
    (3, 1): "mate-criollo-sp-laqueado",
    (3, 2): "mate-criollo-sp-laqueado-negro",
    (4, 1): "imperial-deluxe-cincelado",
    (4, 2): "torpedo-cincelado",
    (5, 2): "imperial-cincelado",
    (5, 1): "torpedo",
    (6, 1): "termo-1l-plateado",
    (6, 2): "termo-1l-negro",
    (7, 1): "yerbera-cuero-gamuzado",
    (7, 2): "bombilla-pico-de-loro-mini",
    (7, 3): "bombilla-pico-de-loro-cincelada",
}

# Posición esperada de cada foto (esquina superior izquierda, en puntos de la
# página de 720x405). Sirve de control: si el PDF cambia, saltan estas.
POSICION_ESPERADA = {
    (2, 2): (25, -7),    (2, 1): (498, 138),
    (3, 1): (29, -10),   (3, 2): (490, 83),
    (4, 1): (18, -9),    (4, 2): (480, 126),
    (5, 2): (24, -52),   (5, 1): (438, 96),
    (6, 1): (48, 33),    (6, 2): (506, 125),
    (7, 1): (199, 183),  (7, 2): (17, 13),   (7, 3): (508, 40),
}
TOLERANCIA = 8  # puntos


def main() -> None:
    if not PDF.exists():
        sys.exit(f"No encuentro el PDF en {PDF}")

    OUT.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF)

    escritas = 0
    avisos = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        pagina = page_num + 1

        for n, img in enumerate(page.get_images(full=True), start=1):
            slug = MAPEO.get((pagina, n))
            if slug is None:
                continue  # portada y adornos

            rects = page.get_image_rects(img[0])
            if rects:
                x, y = rects[0].x0, rects[0].y0
                ex, ey = POSICION_ESPERADA[(pagina, n)]
                if abs(x - ex) > TOLERANCIA or abs(y - ey) > TOLERANCIA:
                    avisos.append(
                        f"p{pagina}-{n} ({slug}): esperaba ({ex}, {ey}) "
                        f"pero está en ({x:.0f}, {y:.0f}) — revisá el mapeo"
                    )

            data = doc.extract_image(img[0])
            im = Image.open(io.BytesIO(data["image"])).convert("RGB")
            original = im.size
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)

            destino = OUT / f"{slug}.webp"
            im.save(destino, "WEBP", quality=WEBP_QUALITY, method=6)
            kb = destino.stat().st_size / 1024
            print(
                f"  {slug:34} {original[0]}x{original[1]} -> "
                f"{im.size[0]}x{im.size[1]}  {kb:.0f} KB"
            )
            escritas += 1

    doc.close()

    print(f"\n{escritas}/{len(MAPEO)} fotos en {OUT}")

    if avisos:
        print("\nAVISOS:")
        for a in avisos:
            print(f"  ! {a}")
        sys.exit(1)

    if escritas != len(MAPEO):
        sys.exit("Faltan fotos — el PDF no coincide con el mapeo.")


if __name__ == "__main__":
    main()
