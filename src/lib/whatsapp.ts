import { precio } from "./format";
import type { Ajustes, Producto } from "@/types/producto";

/** Variables que quien administra puede usar en la plantilla de producto. */
export const VARIABLES = ["{producto}", "{precio}", "{link}"] as const;

/** Usuario de Instagram de la marca. */
export const INSTAGRAM = "raiiz_matera";

/**
 * Perfil público. Se apunta acá y no a `ig.me/m/` (los mensajes directos):
 * ese atajo solo resuelve para cuentas con mensajería habilitada y en esta
 * queda en una página de error.
 */
export const INSTAGRAM_PERFIL = `https://instagram.com/${INSTAGRAM}`;

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

function soloDigitos(numero: string): string {
  return numero.replace(/\D/g, "");
}

/** Arma un link de wa.me con el texto ya encodeado. */
export function linkWhatsapp(numero: string, texto: string): string | null {
  const limpio = soloDigitos(numero);
  if (!limpio) return null;

  return `https://wa.me/${limpio}?text=${encodeURIComponent(texto)}`;
}

/**
 * Link de WhatsApp para consultar por un producto.
 *
 * Devuelve `null` si todavía no se cargó el número, para que el botón no se
 * pinte apuntando a ningún lado.
 */
export function linkProducto(
  producto: Producto,
  ajustes: Ajustes,
  siteUrl: string
): string | null {
  // Si está agotado no se pregunta por disponibilidad: se pide aviso.
  const plantilla =
    producto.estado === "agotado"
      ? "¡Hola Raíz Matera! ¿Me avisan cuando vuelva el {producto}? {link}"
      : ajustes.plantillaProducto;

  const texto = renderPlantilla(plantilla, {
    producto: producto.nombre,
    precio: precio(producto.precio),
    link: `${siteUrl.replace(/\/$/, "")}/producto/${producto.slug}`,
  });

  return linkWhatsapp(ajustes.whatsapp, texto);
}

/** Link de contacto general, sin producto. */
export function linkContacto(ajustes: Ajustes): string | null {
  return linkWhatsapp(ajustes.whatsapp, ajustes.plantillaGeneral);
}
