"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  actualizarProducto,
  agregarFotos,
  borrarProducto,
  crearProducto,
  listarRecords,
  quitarFoto,
  SLUG_AJUSTES,
} from "@/lib/pb-admin";
import { normalizarCategoria, SEPARADOR_PLANTILLAS } from "@/types/producto";

export interface EstadoForm {
  error?: string;
  ok?: string;
}

function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * La colección no tiene índice único en `slug`, así que la unicidad se
 * comprueba acá. Sin esto, dos productos con el mismo slug harían que
 * /producto/[slug] sirviera siempre el mismo.
 */
async function slugLibre(slug: string, exceptoId?: string): Promise<boolean> {
  const records = await listarRecords();
  return !records.some((r) => r.slug === slug && r.id !== exceptoId);
}

/**
 * Crea el record de ajustes, que no es un producto y por eso iría en precio 0.
 *
 * Si el campo `price` de la colección tiene la restricción Nonzero, PocketBase
 * rechaza el 0. En vez de pedirle a alguien que vaya a destildarla, se reintenta
 * con 1: el precio de este record no se muestra en ninguna parte, porque el
 * front considera producto solo a lo que tiene categoría. Cuando la restricción
 * no está, el 0 entra al primer intento y queda más prolijo.
 */
async function crearRecordDeAjustes(plantilla: string, numero: string) {
  const base = {
    title: numero,
    slug: SLUG_AJUSTES,
    description: plantilla,
    category: "",
  };

  try {
    return await crearProducto({ ...base, price: 0 });
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "";
    if (!mensaje.includes("price")) throw e;

    return crearProducto({ ...base, price: 1 });
  }
}

function leerProducto(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();

  return {
    title,
    // El slug no se escribe a mano: sale siempre del nombre. Como efecto,
    // renombrar un producto le cambia la URL y la vieja deja de resolver.
    slug: slugificar(title),
    description: String(formData.get("description") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    category: normalizarCategoria(String(formData.get("category") ?? "")),
  };
}

export async function guardarProducto(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const id = String(formData.get("id") ?? "");
  const datos = leerProducto(formData);

  if (!datos.title) return { error: "Falta el nombre del producto." };
  if (!datos.slug) {
    return { error: "Del nombre no sale ninguna URL válida. Probá con otro." };
  }
  if (!datos.category) return { error: "Falta la categoría." };
  if (!Number.isFinite(datos.price) || datos.price <= 0) {
    return { error: "El precio tiene que ser mayor que cero." };
  }

  if (!(await slugLibre(datos.slug, id || undefined))) {
    return { error: `Ya hay otro producto con el slug "${datos.slug}".` };
  }

  const fotos = formData.getAll("fotos").filter((f): f is File => f instanceof File);

  try {
    if (id) {
      await actualizarProducto(id, datos);
      await agregarFotos(id, fotos);
    } else {
      const record = await crearProducto(datos);
      await agregarFotos(record.id, fotos);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo guardar." };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function eliminarProducto(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await borrarProducto(id);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function eliminarFoto(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "");
  if (!id || !nombre) return;

  await quitarFoto(id, nombre);
  revalidatePath(`/admin/producto/${id}`);
}

export async function guardarAjustes(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const numero = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");
  const deProducto = String(formData.get("plantillaProducto") ?? "").trim();
  const general = String(formData.get("plantillaGeneral") ?? "").trim();

  if (numero && numero.length < 8) {
    return { error: "El número parece incompleto. Va con código de país y sin el +." };
  }
  if (!deProducto) return { error: "El mensaje de producto no puede quedar vacío." };
  if (!general) return { error: "El mensaje general no puede quedar vacío." };

  // Las dos plantillas comparten el campo `description`, separadas por una
  // línea con el separador.
  const plantilla = `${deProducto}\n${SEPARADOR_PLANTILLAS}\n${general}`;

  const records = await listarRecords();
  const existente = records.find((r) => r.slug === SLUG_AJUSTES);

  try {
    if (existente) {
      await actualizarProducto(existente.id, {
        title: numero,
        description: plantilla,
      });
    } else {
      await crearRecordDeAjustes(plantilla, numero);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo guardar." };
  }

  revalidatePath("/admin");
  return { ok: "Ajustes guardados." };
}
