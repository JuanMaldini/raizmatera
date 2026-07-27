/** Un record crudo de la colección `raizmatera_data`. */
export interface PbRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  /** "mates" | "accesorios" para productos; vacío para records de sistema. */
  category: string;
  files: string[];
  created: string;
  updated: string;
}

/**
 * Las categorías no son una lista fija: son lo que haya cargado en los
 * productos. El panel sugiere las que ya existen mientras se escribe, pero
 * nada impide inventar una nueva.
 */
export type Categoria = string;

/** "mates" -> "Mates", para mostrarla sin tocar el dato guardado. */
export function etiquetaCategoria(categoria: Categoria): string {
  return categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

/** Normaliza lo que se escribe en el panel: minúsculas y sin espacios de más. */
export function normalizarCategoria(categoria: string): string {
  return categoria.trim().toLowerCase();
}

/** Un producto ya listo para pintar. */
export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  precio: number;
  categoria: Categoria;
  /** La descripción sin las líneas de specs. */
  descripcion: string;
  /** Las líneas que empiezan con "-", como en el catálogo impreso. */
  specs: string[];
  imagenes: string[];
}

/**
 * Ajustes del sitio. Viven en un record de `raizmatera_data` sin categoría:
 * `title` guarda el número de WhatsApp y `description`, las dos plantillas de
 * mensaje separadas por una línea `---` (no hay más campos libres donde
 * ponerlas).
 */
export interface Ajustes {
  whatsapp: string;
  /** El que se manda al consultar por un producto. Admite variables. */
  plantillaProducto: string;
  /** El del contacto general, donde no hay ningún producto. */
  plantillaGeneral: string;
}

/** Separador de las dos plantillas dentro de `description`. */
export const SEPARADOR_PLANTILLAS = "---";
