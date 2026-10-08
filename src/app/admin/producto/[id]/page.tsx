import Link from "next/link";
import { notFound } from "next/navigation";
import { listarCategorias, obtenerRecord, urlsDeFotos } from "@/lib/pb-admin";
import { normalizarEstado } from "@/types/producto";
import { ProductoForm } from "../../ProductoForm";

export const dynamic = "force-dynamic";

export default async function EditarProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let record;
  try {
    record = await obtenerRecord(id);
  } catch {
    notFound();
  }

  const categorias = await listarCategorias();

  return (
    <>
      <Link href="/admin" className="text-xs uppercase tracking-widest text-oliva">
        ← Volver
      </Link>
      <h1 className="mb-6 mt-3 text-xl">{record.title}</h1>

      <ProductoForm
        id={record.id}
        valores={{
          title: record.title ?? "",
          slug: record.slug ?? "",
          description: record.description ?? "",
          price: record.price ?? 0,
          category: record.category ?? "",
          estado: normalizarEstado(record.estado),
        }}
        fotos={urlsDeFotos(record)}
        categorias={categorias}
      />
    </>
  );
}
