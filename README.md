# Raíz Matera

Catálogo de mates y accesorios artesanales. Landing pública + panel de
administración privado, sobre Next.js 15 y PocketBase.

La documentación de arquitectura, paleta y configuración de las colecciones está
en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Arrancar

```bash
pnpm install
cp .env.example .env    # y completar los valores
pnpm dev                # http://localhost:3000
```

## Rutas

| Ruta | Acceso | |
|---|---|---|
| `/` | pública | Hero, presentación, catálogo con filtro, contacto |
| `/producto/[slug]` | pública | Ficha con specs, precio y botones de contacto |
| `/login` | pública | Sin enlace en el sitio: se entra tipeando la URL |
| `/admin` | privada | Ajustes de WhatsApp + productos |
| `/admin/producto/nuevo` · `/admin/producto/[id]` | privada | Alta y edición |

El usuario del panel se crea a mano desde PocketBase. No hay registro público.

## Scripts

Los de Python son de un solo uso, para preparar los assets a partir del catálogo
impreso. Necesitan `pip install pymupdf pillow numpy`.

```bash
python scripts/extract-catalogo.py   # PDF -> assets/catalogo/{slug}.webp
python scripts/build-logo.py         # docs/logo.jpg -> assets/brand/
node scripts/seed-productos.mjs      # sube los 13 productos a PocketBase
node scripts/seed-productos.mjs --fotos   # además re-sube las imágenes
```

El seed es idempotente: busca por `slug` y actualiza si el producto ya existe.

## Notas

- Las fotos y el logo de `assets/` son la fuente; lo que sirve la web sale de
  PocketBase (productos) y de `public/` (marca).
- `pnpm build` y `pnpm dev` comparten la carpeta `.next`: correr los dos a la vez
  hace fallar el build.
