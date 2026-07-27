/** Lo único fijo del sitio: cómo se llama. */
export const SITE_NAME = "Raíz Matera";

/**
 * URL base del sitio, deducida del entorno en vez de escrita a mano.
 *
 * Todavía no hay dominio propio, así que en producción sale de las variables
 * que Vercel inyecta sola: `PROJECT_PRODUCTION_URL` es el dominio estable del
 * proyecto y `VERCEL_URL` el de cada preview, que cambia en cada deploy. El día
 * que haya dominio propio, se agrega acá arriba y no hay que tocar nada más.
 */
export function siteUrl(): string {
  const produccion = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (produccion) return `https://${produccion}`;

  const preview = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (preview) return `https://${preview}`;

  return "http://localhost:3000";
}
