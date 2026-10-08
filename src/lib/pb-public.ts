/**
 * Lectura pública del catálogo. Sin credenciales, a propósito: las API Rules de
 * `raizmatera_data` permiten leer sin autenticar, así que este módulo no tiene
 * ningún secreto que filtrar aunque termine en un bundle de cliente.
 *
 * Las escrituras van por `pb-admin.ts`, que sí lleva token y es server-only.
 */
import { cache } from "react";
import {
  normalizarEstado,
  SEPARADOR_PLANTILLAS,
  type Ajustes,
  type Categoria,
  type PbRecord,
  type Producto,
} from "@/types/producto";

const PB_URL = (process.env.NEXT_PUBLIC_PB_URL ?? "").replace(/\/$/, "");
const COLLECTION = process.env.NEXT_PUBLIC_PB_DATA ?? "raizmatera_data";

/** Slug del record que guarda los ajustes del sitio (no es un producto). */
const SLUG_AJUSTES = "ajustes";

export const AJUSTES_POR_DEFECTO: Ajustes = {
  whatsapp: "",
  plantillaProducto:
    "¡Hola Raíz Matera! Me interesa el {producto} ({precio}). ¿Está disponible?",
  plantillaGeneral: "¡Hola Raíz Matera! Quería hacerles una consulta.",
};

/**
 * Las dos plantillas viajan en un solo campo de texto, separadas por una línea
 * `---`. Si no hay separador, todo el contenido es la de producto y la general
 * queda en su valor por defecto.
 */
export function separarPlantillas(description: string): {
  producto: string;
  general: string;
} {
  const partes = (description ?? "").split(
    new RegExp(`^\\s*${SEPARADOR_PLANTILLAS}\\s*$`, "m")
  );

  return {
    producto: partes[0]?.trim() || AJUSTES_POR_DEFECTO.plantillaProducto,
    general: partes[1]?.trim() || AJUSTES_POR_DEFECTO.plantillaGeneral,
  };
}

/** URL pública de un archivo guardado en PocketBase. */
export function pbFileUrl(recordId: string, filename: string): string {
  return `${PB_URL}/api/files/${COLLECTION}/${recordId}/${filename}`;
}

/**
 * Trae todos los records una sola vez por request.
 *
 * `cache()` es lo que evita el problema que tiene andrea-moro, donde cada
 * sección de la home dispara su propia descarga completa de la colección.
 */
const fetchRecords = cache(async (): Promise<PbRecord[]> => {
  if (!PB_URL) return [];

  const url = `${PB_URL}/api/collections/${COLLECTION}/records?perPage=200&sort=title`;
  const res = await fetch(url, { next: { revalidate: 60, tags: ["productos"] } });
  if (!res.ok) return [];

  const data = (await res.json()) as { items?: PbRecord[] };
  return data.items ?? [];
});

/**
 * Separa la descripción en texto corrido y specs.
 *
 * En el catálogo impreso cada producto se describe con líneas que empiezan con
 * "-" ("- 100% Calabaza", "- Virola de alpaca cincelada"). Se mantiene ese
 * formato al cargar: quien administra escribe igual que en el PDF y el front
 * las convierte en lista.
 */
function separarSpecs(description: string): { descripcion: string; specs: string[] } {
  const lineas = (description ?? "").split("\n").map((l) => l.trim());
  const specs: string[] = [];
  const resto: string[] = [];

  for (const linea of lineas) {
    if (/^[-–•]\s*/.test(linea)) {
      specs.push(linea.replace(/^[-–•]\s*/, ""));
    } else if (linea) {
      resto.push(linea);
    }
  }

  return { descripcion: resto.join("\n"), specs };
}

function toProducto(record: PbRecord): Producto {
  const { descripcion, specs } = separarSpecs(record.description);

  return {
    id: record.id,
    slug: record.slug,
    nombre: record.title,
    precio: record.price ?? 0,
    categoria: record.category as Categoria,
    descripcion,
    specs,
    imagenes: (record.files ?? []).map((f) => pbFileUrl(record.id, f)),
    estado: normalizarEstado(record.estado),
  };
}

/**
 * Un record es un producto si tiene categoría. Los records de sistema —hoy solo
 * el de ajustes— van sin categoría y quedan fuera del catálogo por eso mismo.
 * Los ocultos tampoco cuentan: no salen en el listado, la ficha ni el sitemap.
 */
function esProducto(record: PbRecord): boolean {
  return Boolean(record.category) && normalizarEstado(record.estado) !== "oculto";
}

export const getProductos = cache(async (): Promise<Producto[]> => {
  const records = await fetchRecords();
  return records.filter(esProducto).map(toProducto);
});

export const getProducto = cache(async (slug: string): Promise<Producto | null> => {
  const records = await fetchRecords();
  const record = records.find((r) => esProducto(r) && r.slug === slug);
  return record ? toProducto(record) : null;
});

export const getAjustes = cache(async (): Promise<Ajustes> => {
  const records = await fetchRecords();
  const record = records.find((r) => r.slug === SLUG_AJUSTES);
  if (!record) return AJUSTES_POR_DEFECTO;

  const plantillas = separarPlantillas(record.description ?? "");

  return {
    whatsapp: (record.title ?? "").replace(/\D/g, ""),
    plantillaProducto: plantillas.producto,
    plantillaGeneral: plantillas.general,
  };
});
