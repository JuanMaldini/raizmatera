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

function leerProducto(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugCrudo = String(formData.get("slug") ?? "").trim();

  return {
    title,
    slug: slugificar(slugCrudo || title),
    description: String(formData.get("description") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    category: String(formData.get("category") ?? "").trim(),
  };
}

export async function guardarProducto(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const id = String(formData.get("id") ?? "");
  const datos = leerProducto(formData);

  if (!datos.title) return { error: "Falta el nombre del producto." };
  if (!datos.slug) return { error: "Falta el slug." };
  if (!datos.category) return { error: "Elegí una categoría." };
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
  const plantilla = String(formData.get("plantilla") ?? "").trim();

  if (numero && numero.length < 8) {
    return { error: "El número parece incompleto. Va con código de país y sin el +." };
  }
  if (!plantilla) return { error: "La plantilla no puede quedar vacía." };

  const records = await listarRecords();
  const existente = records.find((r) => r.slug === SLUG_AJUSTES);

  try {
    if (existente) {
      await actualizarProducto(existente.id, {
        title: numero,
        description: plantilla,
      });
    } else {
      await crearProducto({
        title: numero,
        slug: SLUG_AJUSTES,
        description: plantilla,
        category: "",
        price: 0,
      });
    }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "No se pudo guardar.";

    // El record de ajustes no es un producto y va en precio 0. Si el campo
    // `price` tiene la restricción Nonzero, PocketBase lo rechaza y conviene
    // decir exactamente qué destildar en vez de mostrar el error crudo.
    if (mensaje.includes("price")) {
      return {
        error:
          "PocketBase rechaza el precio 0. Destildá «Nonzero» en el campo price de raizmatera_data y volvé a guardar.",
      };
    }

    return { error: mensaje };
  }

  revalidatePath("/admin/ajustes");
  return { ok: "Ajustes guardados." };
}
