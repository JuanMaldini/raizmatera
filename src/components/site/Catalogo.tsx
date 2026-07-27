"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { CATEGORIAS, type Categoria, type Producto } from "@/types/producto";

type Filtro = Categoria | "todos";

export function Catalogo({ productos }: { productos: Producto[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");

  // Solo se ofrecen las categorías que realmente tienen productos cargados.
  const disponibles = CATEGORIAS.filter((c) =>
    productos.some((p) => p.categoria === c.valor)
  );

  const visibles =
    filtro === "todos" ? productos : productos.filter((p) => p.categoria === filtro);

  return (
    <section id="catalogo" className="mx-auto max-w-5xl px-5 py-16">
      <h2 className="etiqueta-seccion mb-8 text-center text-sm uppercase tracking-[0.3em]">
        Catálogo
      </h2>

      {disponibles.length > 1 && (
        <div className="mb-10 flex justify-center gap-3">
          {[{ valor: "todos" as const, etiqueta: "Todo" }, ...disponibles].map((c) => (
            <button
              key={c.valor}
              type="button"
              onClick={() => setFiltro(c.valor)}
              aria-pressed={filtro === c.valor}
              className={`border px-4 py-1.5 text-xs uppercase tracking-widest transition ${
                filtro === c.valor
                  ? "border-oliva bg-oliva text-arena"
                  : "border-oliva/40 text-oliva hover:border-oliva"
              }`}
            >
              {c.etiqueta}
            </button>
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <p className="text-center font-light text-tinta/60">
          Todavía no hay productos cargados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </section>
  );
}
