import Link from "next/link";
import { ProductoForm } from "../../ProductoForm";

export default function NuevoProducto() {
  return (
    <>
      <Link href="/admin" className="text-xs uppercase tracking-widest text-oliva">
        ← Volver
      </Link>
      <h1 className="mb-6 mt-3 text-xl">Nuevo producto</h1>
      <ProductoForm />
    </>
  );
}
