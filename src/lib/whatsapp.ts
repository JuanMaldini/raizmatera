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

/**
 * Mensaje para el contacto general, donde no hay ningún producto.
 *
 * Sale de la misma plantilla, quitándole las oraciones que mencionan variables:
 * "¡Hola Raíz Matera! Me interesa el {producto} ({precio}). ¿Está disponible?"
 * queda en "¡Hola Raíz Matera!". Así se configura un solo texto en el panel y
 * sirve para los dos casos, sin que quede un "Me interesa el  ()." colgado.
 */
export function mensajeGeneral(plantilla: string): string {
  const oraciones = plantilla.split(/(?<=[.!?…])\s+/);
  const limpias = oraciones.filter((o) => !o.includes("{"));
  return limpias.join(" ").trim() || "¡Hola Raíz Matera!";
}

/** Link de contacto general, sin producto. */
export function linkContacto(ajustes: Ajustes): string | null {
  const numero = ajustes.whatsapp.replace(/\D/g, "");
  if (!numero) return null;

  return `https://wa.me/${numero}?text=${encodeURIComponent(
    mensajeGeneral(ajustes.plantilla)
  )}`;
}
