import Link from "next/link";
import { listarCategorias } from "@/lib/pb-admin";
import { ProductoForm } from "../../ProductoForm";

export const dynamic = "force-dynamic";

export default async function NuevoProducto() {
  const categorias = await listarCategorias();

  return (
    <>
      <Link href="/admin" className="text-xs uppercase tracking-widest text-oliva">
        ← Volver
      </Link>
      <h1 className="mb-6 mt-3 text-xl">Nuevo producto</h1>
      <ProductoForm categorias={categorias} />
    </>
  );
}
