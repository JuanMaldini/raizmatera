# Raíz Matera — Arquitectura

Catálogo web de mates y accesorios artesanales. Landing pública minimalista +
dashboard de administración privado.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Base de datos / Auth | PocketBase (`pocketbase.vmoliver.cloud`) |
| Package manager | pnpm |
| Deploy | Vercel |

Misma instancia de PocketBase que `andrea-moro`, con colecciones propias.

---

## Identidad visual

Los valores salen del catálogo (`docs/CATÁLOGO 2026.pdf`) y del logo
(`docs/logo.jpg`) — el fondo de ambos es exactamente el mismo `#e7d2b7`.

### Paleta

| Token | Valor | Uso |
|---|---|---|
| `arena` | `#e7d2b7` | fondo general — logo y catálogo coinciden |
| `oliva` | `#3b4628` | titulares, filetes, line art (color del logo) |
| `sage` | `#b6ad8c` | disco solar del logo — bordes, hovers, superficies secundarias |
| `caramelo` | `#cb9a6a` | chip de precio |
| `crudo` | `#f4e9dc` | superficie de cards (derivado, un escalón sobre `arena`) |
| `tinta` | `#1a1a1a` | texto de producto y specs |

Va dentro de `theme.extend.colors`, **no** en `theme.colors` — definirlo fuera de
`extend` reemplaza la paleta entera de Tailwind y deja muertas todas las clases
`gray-*` (es el bug que tiene `andrea-moro`).

### Tipografía

- **Merriweather** SemiBold → titulares · Regular → cuerpo y precios
  (el catálogo usa Merriweather; el logo, un serif del mismo carácter)
- **Lato** → etiquetas de UI y navegación (reemplaza al Trebuchet MS del PDF)

Ambas por `next/font/google`.

### Motivos gráficos

- Marco de **doble filete fino** oliva (portada del catálogo) → bordes de sección y cards
- **Chip de precio** caramelo, rectangular, sin border-radius
- **Line art** de mate y termo → íconos y separadores
- **Raíz** del pie del logo → separador de secciones y remate del footer
- Etiqueta de categoría con guiones: `~ MATES ~`

Las fotos comparten lenguaje: fondo de lino, luz lateral cálida, sombra suave,
encuadre vertical. Dominantes en tierras (`#a09080`, `#908070`, `#605040`) y
grises de alpaca (`#a0a0a0`).

### Assets de marca

`scripts/build-logo.py` reconstruye el logo desde `docs/logo.jpg` y genera
`assets/brand/`: `logo-{1024,512,256,128}.png`, `icon-{512,180,32}.png` y
`logo-1024-transparente.png`.

**Limitación conocida:** el original es de 150×150 px en JPEG. La reconstrucción
recupera nitidez pero no detalle que no existe, y en la variante recortada los
trazos finos (MATERA, la raíz, los rayos) tiran a sage en vez de oliva, porque a
esa resolución son mitad tinta y mitad fondo. Sobre arena se ve bien; sobre fondo
oscuro se nota. Cuando aparezca el logo en vector o en alta, reemplazar
`docs/logo.jpg` y volver a correr el script.

---

## PocketBase

### `raizmatera_user` — tipo Auth

Existe solo para el administrador. No hay usuarios finales.

| Campo | Tipo | Notas |
|---|---|---|
| `email` / `password` / `tokenKey` | Auth | estándar |
| `name` | Text | opcional |
| `admin` | Bool | `true` → acceso al dashboard |
| `json` | JSON | extras |

**Options:** email/password ON · OAuth2 OFF · username auth OFF

**API Rules**

| Regla | Valor |
|---|---|
| List | `@request.auth.admin = true` |
| View | `id = @request.auth.id \|\| @request.auth.admin = true` |
| Create | bloqueado — sin auto-registro |
| Update | `id = @request.auth.id \|\| @request.auth.admin = true` |
| Delete | bloqueado |

El usuario admin se crea a mano desde la Admin UI de PocketBase.

### `raizmatera_data` — tipo Base

Un record = un producto.

| Campo | Tipo | Notas |
|---|---|---|
| `title` | Text | nombre del producto |
| `slug` | Text | Nonempty |
| `description` | Text | resumen + specs |
| `price` | Number | ARS, min 0, **Nonzero** |
| `category` | Text | `mates` · `accesorios` |
| `files` | File multiple | fotos |
| `estado` | Select (single) | `disponible` · `agotado` · `oculto` — no requerido; vacío = disponible |

**Reglas**

| Regla | Valor |
|---|---|
| List / View | vacía (pública) |
| Create / Update / Delete | `@request.auth.collectionName = "raizmatera_user"` |

La instancia se comparte con `andrea-moro`, así que **no alcanza con
`@request.auth.id != ""`**: eso deja escribir a cualquier usuario logueado de
*cualquier* colección auth de la instancia. Hay que fijar la colección.

**Estado del producto.** `agotado` se sigue mostrando con un cartel y el botón de
WhatsApp pide aviso de reposición (JSON-LD `OutOfStock`). `oculto` no sale en el
catálogo, la ficha da 404 y no entra al sitemap. Se filtra en `esProducto()` de
`lib/pb-public.ts`.

**Slug estable.** Se genera del nombre solo al crear el producto; al editar se
conserva, así renombrar no rompe los links ya compartidos.

Consecuencia de las reglas: **la web pública lee sin token**. `PB_ADMIN_TOKEN` queda solo para
los scripts de seed y nunca llega al navegador.

**Specs dentro de `description`.** No hay campo `json`, así que las
características van como líneas que empiezan con `-`, igual que en el catálogo
impreso. `separarSpecs()` en `lib/pb-public.ts` las separa del texto corrido y el
front las pinta como lista:

```
Algarrobo y acero, sin vueltas. Liviano, resistente y de agarre justo.
- Algarrobo
- Virola de acero
```

**Sin índice único en `slug`.** La unicidad se valida en `admin/actions.ts` antes
de guardar. Conviene agregar igual el índice en PocketBase: el seed y cualquier
edición hecha desde la Admin UI se saltean esa validación.

### Record de ajustes

Un record sin categoría, con `slug = "ajustes"`. Como no hay campo `json`, usa
los que existen: **`title` guarda el número de WhatsApp** y **`description`, la
plantilla del mensaje**. Es lo que edita `/admin/ajustes`.

Variables de la plantilla: `{producto}` · `{precio}` · `{link}`.
El botón arma `https://wa.me/{numero}?text=<plantilla renderizada y encodeada>`.

Un producto es un record **con** categoría, así que el de ajustes queda fuera del
catálogo por construcción, sin necesidad de un campo que lo marque.

> **Pendiente:** `price` tiene la restricción **Nonzero** y el record de ajustes
> va en 0, así que PocketBase lo rechaza. Destildar Nonzero en ese campo y
> guardar de nuevo desde `/admin/ajustes`.

### Variables de entorno

```bash
NEXT_PUBLIC_PB_URL=https://pocketbase.vmoliver.cloud
NEXT_PUBLIC_PB_DATA=raizmatera_data
NEXT_PUBLIC_PB_USERS=raizmatera_user
PB_ADMIN_TOKEN=...          # server-side y scripts, nunca NEXT_PUBLIC_
```

No hay variable con la URL del sitio: todavía no hay dominio propio, así que
`lib/site.ts` la deduce de las variables que inyecta Vercel y cae a
`localhost:3000` en desarrollo.

El `PB_ADMIN_TOKEN` de `andrea-moro` sirve tal cual: es de superusuario y no está
atado a una colección.

---

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Hero · presentación · productos · contacto |
| `/producto/[slug]` | Público | Foto, specs, precio, botón de WhatsApp |
| `/login` | Público | **Sin enlace en la navegación**, `noindex` |
| `/admin` | Admin | Listado de productos |
| `/admin/producto/nuevo` | Admin | Alta |
| `/admin/producto/[id]` | Admin | Edición + uploader de fotos |
| `/admin/ajustes` | Admin | Número y plantilla de WhatsApp |

---

## Estructura

```
src/
  app/
    page.tsx                    landing
    producto/[slug]/page.tsx
    login/page.tsx
    admin/
      layout.tsx                guard + shell
      page.tsx
      producto/[id]/page.tsx
      producto/nuevo/page.tsx
      ajustes/page.tsx
    api/auth/login/route.ts     setea la cookie HttpOnly
    api/auth/logout/route.ts
  components/
    site/    Navbar Hero Presentacion Catalogo ProductCard Galeria Contacto Footer
    admin/   ProductForm ImageUploader WhatsappSettings LoginForm
    ui/      Button Input Modal Chip PriceTag
  lib/
    pb-public.ts    lectura pública, sin credenciales, envuelta en cache()
    pb-admin.ts     server-only, con token — solo /admin y scripts
    pb-browser.ts   SDK cliente, solo para el login
    whatsapp.ts     render de plantilla + armado del link
    format.ts       precio en ARS
  types/
    producto.ts  settings.ts
  middleware.ts
```

---

## Seguridad

- **Dos clientes separados por archivo**, no uno con condicionales. `pb-public.ts`
  no puede filtrar credenciales porque no las tiene; `pb-admin.ts` lleva
  `import "server-only"` para que el build falle si se importa desde un componente
  cliente.
- **Doble puerta en `/admin`:** el `middleware.ts` redirige a `/login` (eso es UX);
  las **API Rules** son la seguridad real, del lado del servidor. El middleware
  solo no alcanza.
- **Cookie `HttpOnly`.** El login pasa por `/api/auth/login`, que setea
  `pb_auth` con `HttpOnly + Secure + SameSite=Lax`. El token queda fuera del
  alcance de JavaScript. (En `andrea-moro-users` la cookie es `HttpOnly: false` y
  su propio `ARCHITECTURE.md` lo marca como deuda.)
- **`/login` sin enlace** en navegación ni footer, `noindex` en su metadata y
  excluida del `robots.ts`. No es seguridad por sí sola, pero mantiene la web limpia.
- **Create bloqueado** en `raizmatera_user`: nadie se registra solo.

---

## Optimizaciones respecto del código heredado

1. `colors` dentro de `theme.extend` (en `andrea-moro` está fuera y borra la
   paleta de Tailwind: todas las clases `gray-*` del `Footer.tsx` no generan CSS).
2. **Optimizador de imágenes activo** — `andrea-moro` tiene
   `images: { unoptimized: true }`. Con fotos de 1536×2048 es la mayor diferencia
   de velocidad de carga.
3. Sin clases inválidas heredadas (`xl:lg:h-lvh`, `lg:md:sm:text-sm`, `w/auto`,
   `max-h-auto` — Tailwind las ignora en silencio).
4. **`cache()` de React** en las lecturas. Hoy `fetchGallery()` y `fetchAndrea()`
   se bajan 200 records cada una, dos veces por render.
5. **SEO**: `metadata` por página, JSON-LD `Product` con precio y disponibilidad,
   `sitemap.ts`, `robots.ts`, OG image.
6. **`revalidateTag('productos')`** disparado desde el dashboard: se edita un
   precio y la web se actualiza al instante, sin rebuild ni esperar 60 segundos.
7. **Accesibilidad**: `alt` reales; el modal de galería cierra con `Escape`,
   bloquea el scroll del body y atrapa el foco.
8. Nombres sinceros: `lib/products.ts`, no `mockup.ts`.
9. `.env.example` commiteado.

---

## Catálogo 2026 — datos de origen

13 productos, una foto cada uno. El orden de las imágenes embebidas en el PDF
**no** coincide con el orden visual; el mapeo se hizo por coordenadas de la página
(ver `scripts/extract-catalogo.py`).

| # | Producto | Categoría | Precio | Foto |
|---|---|---|---|---|
| 1 | Mate criollo (incluye base) | mates | $15.000 | p2-2 |
| 2 | Mate criollo SP (incluye base) | mates | $15.500 | p2-1 |
| 3 | Mate criollo SP laqueado (incluye base) | mates | $17.000 | p3-1 |
| 4 | Mate criollo SP laqueado negro (incluye base) | mates | $19.500 | p3-2 |
| 5 | Imperial deluxe cincelado | mates | $30.000 | p4-1 |
| 6 | Torpedo cincelado | mates | $33.000 | p4-2 |
| 7 | Imperial cincelado | mates | $23.500 | p5-2 |
| 8 | Torpedo | mates | $22.000 | p5-1 |
| 9 | Termo media manija 1L plateado | accesorios | $25.000 | p6-1 |
| 10 | Termo media manija 1L negro | accesorios | $25.000 | p6-2 |
| 11 | Yerbera cuero gamuzado ½ kg | accesorios | $14.000 | p7-1 |
| 12 | Bombilla pico de loro MINI | accesorios | $7.500 | p7-2 |
| 13 | Bombilla pico de loro cincelada | accesorios | $8.800 | p7-3 |

Instagram: [@raiiz_matera](https://instagram.com/raiiz_matera)

---

## Fases

| # | Qué | Estado |
|---|---|---|
| 0 | Extraer y convertir las 13 fotos + assets de marca | ✅ |
| 1 | Scaffold Next 15 + pnpm + Tailwind con los tokens | ✅ |
| 2 | Colecciones en PocketBase + seed de los 13 productos | ✅ |
| 3 | Landing + `/producto/[slug]` + WhatsApp | ✅ |
| 4 | `/login` + middleware + `/admin` | ✅ |
| 5 | SEO, JSON-LD, sitemap, robots | ✅ |
| 6 | Deploy en Vercel | pendiente |

Queda pendiente, aparte del deploy: destildar **Nonzero** en `price` para poder
guardar los ajustes, agregar el **índice único en `slug`**, y cargar el **número
de WhatsApp** desde `/admin/ajustes` — sin él, el botón de consulta se reemplaza
por uno a Instagram.
