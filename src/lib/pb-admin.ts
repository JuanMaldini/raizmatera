import "server-only";
import { revalidateTag } from "next/cache";
import { getSesion } from "./auth";
import { pbFileUrl } from "./pb-public";
import type { PbRecord } from "@/types/producto";

const PB_URL = (process.env.NEXT_PUBLIC_PB_URL ?? "").replace(/\/$/, "");
const COLLECTION = process.env.NEXT_PUBLIC_PB_DATA ?? "raizmatera_data";

/** Slug del record de ajustes. No es un producto: va sin categoría. */
export const SLUG_AJUSTES = "ajustes";

/**
 * Toda escritura pasa por acá y va firmada con el token del usuario logueado.
 * Nunca con el token de superusuario: ese vive solo en los scripts de seed.
 */
async function pedir(ruta: string, init: RequestInit): Promise<Response> {
  const sesion = await getSesion();
  if (!sesion) throw new Error("Sesión vencida. Volvé a entrar.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", sesion.token);

  return fetch(`${PB_URL}${ruta}`, { ...init, headers, cache: "no-store" });
}

async function fallar(res: Response, accion: string): Promise<never> {
  const cuerpo = await res.text();
  throw new Error(`${accion} falló (${res.status}): ${cuerpo.slice(0, 300)}`);
}

/** Refresca la home y las fichas sin esperar a que venza el cache. */
function refrescar(): void {
  revalidateTag("productos");
}

/** Todos los records, incluido el de ajustes. Para el panel, sin cache. */
export async function listarRecords(): Promise<PbRecord[]> {
  const res = await pedir(
    `/api/collections/${COLLECTION}/records?perPage=200&sort=title`,
    { method: "GET" }
  );
  if (!res.ok) await fallar(res, "Listar");

  const data = (await res.json()) as { items?: PbRecord[] };
  return data.items ?? [];
}

export async function obtenerRecord(id: string): Promise<PbRecord> {
  const res = await pedir(`/api/collections/${COLLECTION}/records/${id}`, {
    method: "GET",
  });
  if (!res.ok) await fallar(res, "Buscar");
  return res.json();
}

export interface DatosProducto {
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
}

export async function crearProducto(datos: DatosProducto): Promise<PbRecord> {
  const res = await pedir(`/api/collections/${COLLECTION}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) await fallar(res, "Crear");

  refrescar();
  return res.json();
}

export async function actualizarProducto(
  id: string,
  datos: Partial<DatosProducto>
): Promise<PbRecord> {
  const res = await pedir(`/api/collections/${COLLECTION}/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) await fallar(res, "Guardar");

  refrescar();
  return res.json();
}

export async function borrarProducto(id: string): Promise<void> {
  const res = await pedir(`/api/collections/${COLLECTION}/records/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) await fallar(res, "Borrar");

  refrescar();
}

/** Agrega fotos sin pisar las que ya están (el `+` de PocketBase). */
export async function agregarFotos(id: string, fotos: File[]): Promise<void> {
  const utiles = fotos.filter((f) => f.size > 0);
  if (utiles.length === 0) return;

  const form = new FormData();
  for (const foto of utiles) form.append("files+", foto);

  const res = await pedir(`/api/collections/${COLLECTION}/records/${id}`, {
    method: "PATCH",
    body: form,
  });
  if (!res.ok) await fallar(res, "Subir fotos");

  refrescar();
}

/** Quita una foto puntual del record. */
export async function quitarFoto(id: string, filename: string): Promise<void> {
  const form = new FormData();
  form.append("files-", filename);

  const res = await pedir(`/api/collections/${COLLECTION}/records/${id}`, {
    method: "PATCH",
    body: form,
  });
  if (!res.ok) await fallar(res, "Quitar foto");

  refrescar();
}

/**
 * Las categorías que ya están en uso, ordenadas. Alimentan las sugerencias del
 * panel: no hay una lista fija en el código.
 */
export async function listarCategorias(): Promise<string[]> {
  const records = await listarRecords();
  const usadas = new Set(
    records.map((r) => (r.category ?? "").trim().toLowerCase()).filter(Boolean)
  );

  return [...usadas].sort();
}

/** URLs de las fotos de un record, para mostrarlas en el panel. */
export function urlsDeFotos(record: PbRecord): { url: string; nombre: string }[] {
  return (record.files ?? []).map((f) => ({ url: pbFileUrl(record.id, f), nombre: f }));
}
