/**
 * Carga en PocketBase los productos del catálogo 2026, con sus fotos.
 *
 * Uso (desde la raíz del proyecto):
 *   node scripts/seed-productos.mjs
 *   node scripts/seed-productos.mjs --fotos    # además re-sube las imágenes
 *
 * Requiere:
 *   - .env con NEXT_PUBLIC_PB_URL y PB_ADMIN_TOKEN
 *   - assets/catalogo/{slug}.webp (los genera scripts/extract-catalogo.py)
 *
 * Es idempotente: busca por `slug` y actualiza el record si ya existe, así que
 * se puede correr todas las veces que haga falta. Las fotos solo se suben si el
 * record todavía no tiene ninguna, salvo que se pase --fotos.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RESUBIR_FOTOS = process.argv.includes("--fotos");

// ── .env ───────────────────────────────────────────────────────────────────
const envPath = resolve(ROOT, ".env");
if (!existsSync(envPath)) {
  console.error("Falta el .env en la raíz del proyecto.");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const PB_URL = (env.NEXT_PUBLIC_PB_URL ?? "").replace(/\/$/, "");
const TOKEN = env.PB_ADMIN_TOKEN ?? "";
const COLLECTION = env.NEXT_PUBLIC_PB_DATA ?? "raizmatera_data";

if (!PB_URL || !TOKEN) {
  console.error("Faltan NEXT_PUBLIC_PB_URL o PB_ADMIN_TOKEN en el .env");
  process.exit(1);
}

// ── Catálogo 2026 ──────────────────────────────────────────────────────────
// Las specs van como líneas con "-" dentro de description, igual que en el PDF:
// el front las separa del texto corrido y las pinta como lista.
const PRODUCTOS = [
  {
    slug: "mate-criollo",
    title: "Mate criollo (incluye base)",
    category: "mates",
    price: 15000,
    resumen: "El clásico de todos los días, en calabaza natural y con su base de cuero crudo.",
    specs: ["100% Calabaza", "Base cuero crudo"],
  },
  {
    slug: "mate-criollo-sp",
    title: "Mate criollo SP (incluye base)",
    category: "mates",
    price: 15500,
    resumen: "Mismo criollo de siempre, en formato SP. Calabaza entera y base de cuero crudo.",
    specs: ["100% Calabaza", "Base cuero crudo"],
  },
  {
    slug: "mate-criollo-sp-laqueado",
    title: "Mate criollo SP laqueado (incluye base)",
    category: "mates",
    price: 17000,
    resumen: "Criollo SP con terminación laqueada, que le da brillo y lo protege del uso diario.",
    specs: ["100% Calabaza", "Base cuero crudo"],
  },
  {
    slug: "mate-criollo-sp-laqueado-negro",
    title: "Mate criollo SP laqueado negro (incluye base)",
    category: "mates",
    price: 19500,
    resumen: "El criollo SP en negro laqueado. Sobrio, parejo y con la calabaza a la vista.",
    specs: ["100% Calabaza", "Base cuero crudo"],
  },
  {
    slug: "imperial-deluxe-cincelado",
    title: "Imperial deluxe cincelado",
    category: "mates",
    price: 30000,
    resumen: "Calabaza forrada en cuero y virola de alpaca cincelada a mano, pieza por pieza.",
    specs: ["100% calabaza", "Forrado en cuero", "Virola de alpaca cincelada"],
  },
  {
    slug: "torpedo-cincelado",
    title: "Torpedo cincelado",
    category: "mates",
    price: 33000,
    resumen: "El torpedo en su versión más trabajada: cuero, calabaza y alpaca cincelada.",
    specs: ["100% calabaza", "Forrado en cuero", "Virola de alpaca cincelada"],
  },
  {
    slug: "imperial-cincelado",
    title: "Imperial cincelado",
    category: "mates",
    price: 23500,
    resumen: "Torneado en algarrobo macizo, con virola de alpaca cincelada a mano.",
    specs: ["Algarrobo", "Virola de alpaca cincelada"],
  },
  {
    slug: "torpedo",
    title: "Torpedo",
    category: "mates",
    price: 22000,
    resumen: "Algarrobo y acero, sin vueltas. Liviano, resistente y de agarre justo.",
    specs: ["Algarrobo", "Virola de acero"],
  },
  {
    slug: "termo-1l-plateado",
    title: "Termo media manija 1L plateado",
    category: "accesorios",
    price: 25000,
    resumen: "Un litro, media manija y pico cebador. Para toda la mañana.",
    specs: ["1 litro", "Media manija"],
  },
  {
    slug: "termo-1l-negro",
    title: "Termo media manija 1L negro",
    category: "accesorios",
    price: 25000,
    resumen: "El mismo termo de un litro, en negro mate.",
    specs: ["1 litro", "Media manija"],
  },
  {
    slug: "yerbera-cuero-gamuzado",
    title: "Yerbera cuero gamuzado ½ kg",
    category: "accesorios",
    price: 14000,
    resumen: "Media yerba adentro y lista para salir. En cuero gamuzado, con cierre.",
    specs: ["Cuero gamuzado", "Capacidad ½ kg"],
  },
  {
    slug: "bombilla-pico-de-loro-mini",
    title: "Bombilla pico de loro MINI",
    category: "accesorios",
    price: 7500,
    resumen: "Pico de loro en tamaño chico, para mates de boca angosta.",
    specs: ["Pico de loro", "Tamaño mini"],
  },
  {
    slug: "bombilla-pico-de-loro-cincelada",
    title: "Bombilla pico de loro cincelada",
    category: "accesorios",
    price: 8800,
    resumen: "Pico de loro con el cuerpo cincelado a mano.",
    specs: ["Pico de loro", "Cincelada a mano"],
  },
];

// Record de ajustes: no es un producto, así que va sin categoría y el front lo
// deja fuera del catálogo por eso mismo. `title` guarda el número de WhatsApp y
// `description`, la plantilla del mensaje.
// Las dos plantillas comparten el campo `description`, separadas por una línea
// con "---": la de arriba es la de producto, la de abajo la del contacto general.
const AJUSTES = {
  slug: "ajustes",
  title: "",
  category: "",
  price: 0,
  description: [
    "¡Hola Raíz Matera! Me interesa el {producto} ({precio}). ¿Está disponible?",
    "---",
    "¡Hola Raíz Matera! Quería hacerles una consulta.",
  ].join("\n"),
};

// ── PocketBase ─────────────────────────────────────────────────────────────
const headers = { Authorization: TOKEN };

async function buscarPorSlug(slug) {
  const filtro = encodeURIComponent(`slug="${slug}"`);
  const url = `${PB_URL}/api/collections/${COLLECTION}/records?perPage=1&filter=${filtro}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`buscar ${slug}: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.items?.[0] ?? null;
}

async function guardar(datos, existente) {
  const url = existente
    ? `${PB_URL}/api/collections/${COLLECTION}/records/${existente.id}`
    : `${PB_URL}/api/collections/${COLLECTION}/records`;

  const res = await fetch(url, {
    method: existente ? "PATCH" : "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error(`guardar ${datos.slug}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function subirFoto(recordId, slug) {
  const ruta = resolve(ROOT, "assets", "catalogo", `${slug}.webp`);
  if (!existsSync(ruta)) return null;

  const form = new FormData();
  form.append("files", new Blob([readFileSync(ruta)], { type: "image/webp" }), `${slug}.webp`);

  const res = await fetch(`${PB_URL}/api/collections/${COLLECTION}/records/${recordId}`, {
    method: "PATCH",
    headers,
    body: form,
  });

  if (!res.ok) throw new Error(`subir foto ${slug}: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`PocketBase: ${PB_URL}/${COLLECTION}\n`);

  for (const p of PRODUCTOS) {
    const description = [p.resumen, ...p.specs.map((s) => `- ${s}`)].join("\n");
    const existente = await buscarPorSlug(p.slug);

    const record = await guardar(
      {
        slug: p.slug,
        title: p.title,
        category: p.category,
        price: p.price,
        description,
      },
      existente
    );

    let nota = existente ? "actualizado" : "creado";

    const tieneFotos = (record.files ?? []).length > 0;
    if (!tieneFotos || RESUBIR_FOTOS) {
      const conFoto = await subirFoto(record.id, p.slug);
      nota += conFoto ? " + foto" : " (sin foto en assets/)";
    }

    console.log(`  ${p.slug.padEnd(34)} ${nota}`);
  }

  const existente = await buscarPorSlug(AJUSTES.slug);
  if (existente) {
    console.log(`\n  ${AJUSTES.slug.padEnd(34)} ya existía, no se toca`);
  } else {
    await guardar(AJUSTES, null);
    console.log(`\n  ${AJUSTES.slug.padEnd(34)} creado (falta cargarle el número)`);
  }

  console.log(`\nListo: ${PRODUCTOS.length} productos.`);
}

main().catch((e) => {
  console.error(`\n${e.message}`);
  process.exit(1);
});
