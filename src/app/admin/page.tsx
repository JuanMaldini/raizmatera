import Image from "next/image";
import Link from "next/link";
import { listarRecords, SLUG_AJUSTES, urlsDeFotos } from "@/lib/pb-admin";
import { precio } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductos() {
  const records = await listarRecords();
  const productos = records.filter((r) => r.slug !== SLUG_AJUSTES);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">Productos ({productos.length})</h1>
        <Link
          href="/admin/producto/nuevo"
          className="bg-oliva px-4 py-2 text-xs uppercase tracking-widest text-arena hover:bg-oliva/90"
        >
          Nuevo
        </Link>
      </div>

      {productos.length === 0 ? (
        <p className="font-light text-tinta/60">Todavía no hay productos.</p>
      ) : (
        <ul className="divide-y divide-oliva/15 border border-oliva/15 bg-arena">
          {productos.map((record) => {
            const fotos = urlsDeFotos(record);

            return (
              <li key={record.id}>
                <Link
                  href={`/admin/producto/${record.id}`}
                  className="flex items-center gap-4 p-3 transition hover:bg-crudo"
                >
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-sage/20">
                    {fotos[0] && (
                      <Image
                        src={fotos[0].url}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-sm">{record.title}</p>
                    <p className="truncate text-xs text-tinta/50">
                      {record.category || "sin categoría"} · /{record.slug}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm">{precio(record.price ?? 0)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
