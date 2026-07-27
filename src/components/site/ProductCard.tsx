import Image from "next/image";
import Link from "next/link";
import { precio } from "@/lib/format";
import type { Producto } from "@/types/producto";

export function ProductCard({ producto }: { producto: Producto }) {
  const foto = producto.imagenes[0];

  return (
    <Link
      href={`/producto/${producto.slug}`}
      className="group flex flex-col bg-crudo transition hover:shadow-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-sage/20">
        {foto ? (
          <Image
            src={foto}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-oliva/50">
            Sin foto
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-serif text-base leading-snug">{producto.nombre}</h3>
        {producto.specs.length > 0 && (
          <ul className="flex-1 space-y-0.5 text-sm font-light text-tinta/70">
            {producto.specs.slice(0, 3).map((spec) => (
              <li key={spec}>– {spec}</li>
            ))}
          </ul>
        )}
        <span className="chip-precio self-start text-base">
          {precio(producto.precio)}
        </span>
      </div>
    </Link>
  );
}
