import { precio } from "./format";
import type { Ajustes, Producto } from "@/types/producto";

/** Variables que quien administra puede usar dentro de la plantilla. */
export const VARIABLES = ["{producto}", "{precio}", "{link}"] as const;

interface Contexto {
  producto: string;
  precio: string;
  link: string;
}

/** Reemplaza las variables de la plantilla. Deja intacto lo que no reconoce. */
export function renderPlantilla(plantilla: string, ctx: Contexto): string {
  return plantilla
    .replaceAll("{producto}", ctx.producto)
    .replaceAll("{precio}", ctx.precio)
    .replaceAll("{link}", ctx.link);
}

/**
 * Arma el link de WhatsApp para un producto.
 *
 * Devuelve `null` si todavía no se cargó el número, para que el botón no se
 * pinte apuntando a ningún lado.
 */
export function linkProducto(
  producto: Producto,
  ajustes: Ajustes,
  siteUrl: string
): string | null {
  const numero = ajustes.whatsapp.replace(/\D/g, "");
  if (!numero) return null;

  const texto = renderPlantilla(ajustes.plantilla, {
    producto: producto.nombre,
    precio: precio(producto.precio),
    link: `${siteUrl.replace(/\/$/, "")}/producto/${producto.slug}`,
  });

  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/** Link de contacto general, sin producto. */
export function linkContacto(ajustes: Ajustes): string | null {
  const numero = ajustes.whatsapp.replace(/\D/g, "");
  return numero ? `https://wa.me/${numero}` : null;
}
