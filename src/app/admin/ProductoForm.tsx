"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { eliminarFoto, eliminarProducto, guardarProducto, type EstadoForm } from "./actions";
import { CATEGORIAS } from "@/types/producto";

interface Props {
  id?: string;
  valores?: {
    title: string;
    slug: string;
    description: string;
    price: number;
    category: string;
  };
  fotos?: { url: string; nombre: string }[];
}

const campo =
  "border border-oliva/30 bg-crudo px-3 py-2 outline-none focus:border-oliva";
const etiqueta = "text-xs uppercase tracking-widest text-oliva";

function Guardar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-oliva px-6 py-2.5 text-sm uppercase tracking-widest text-arena transition hover:bg-oliva/90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

export function ProductoForm({ id, valores, fotos = [] }: Props) {
  const [estado, accion] = useActionState<EstadoForm, FormData>(guardarProducto, {});

  return (
    <div className="flex flex-col gap-8">
      <form action={accion} className="flex flex-col gap-5">
        {id && <input type="hidden" name="id" value={id} />}

        <label className="flex flex-col gap-1">
          <span className={etiqueta}>Nombre</span>
          <input name="title" defaultValue={valores?.title} required className={campo} />
        </label>

        <label className="flex flex-col gap-1">
          <span className={etiqueta}>Slug</span>
          <input
            name="slug"
            defaultValue={valores?.slug}
            placeholder="se arma solo del nombre si lo dejás vacío"
            className={campo}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={etiqueta}>Precio (ARS)</span>
            <input
              type="number"
              name="price"
              min={1}
              step={100}
              defaultValue={valores?.price}
              required
              className={campo}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className={etiqueta}>Categoría</span>
            <select
              name="category"
              defaultValue={valores?.category ?? ""}
              required
              className={campo}
            >
              <option value="">Elegir…</option>
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className={etiqueta}>Descripción</span>
          <textarea
            name="description"
            rows={6}
            defaultValue={valores?.description}
            className={`${campo} font-mono text-sm`}
          />
          <span className="text-xs font-light text-tinta/60">
            Las líneas que empiezan con <code>-</code> se muestran como lista de
            características, igual que en el catálogo impreso.
          </span>
        </label>

        <label className="flex flex-col gap-1">
          <span className={etiqueta}>Agregar fotos</span>
          <input
            type="file"
            name="fotos"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="text-sm"
          />
        </label>

        {estado.error && (
          <p role="alert" className="text-sm text-red-800">
            {estado.error}
          </p>
        )}

        <Guardar />
      </form>

      {fotos.length > 0 && id && (
        <section className="flex flex-col gap-3">
          <h2 className={etiqueta}>Fotos cargadas</h2>
          <ul className="flex flex-wrap gap-3">
            {fotos.map((foto) => (
              <li key={foto.nombre} className="flex flex-col gap-1">
                <div className="relative h-32 w-24 overflow-hidden bg-sage/20">
                  <Image src={foto.url} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <form action={eliminarFoto}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="nombre" value={foto.nombre} />
                  <button type="submit" className="text-xs text-red-800 hover:underline">
                    Quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {id && (
        <form action={eliminarProducto} className="border-t border-oliva/15 pt-6">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-sm text-red-800 hover:underline">
            Eliminar este producto
          </button>
        </form>
      )}
    </div>
  );
}
