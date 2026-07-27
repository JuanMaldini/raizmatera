"use client";

import { useMemo, useRef, useState } from "react";
import { etiquetaCategoria, normalizarCategoria } from "@/types/producto";

/**
 * Campo de categoría con sugerencias.
 *
 * No es un select: la lista sale de lo que ya está cargado en los productos, y
 * si lo escrito no coincide con nada, se crea una categoría nueva. Así no hay
 * dos categorías fijas en el código que haya que tocar para agregar una tercera.
 */
export function CategoriaInput({
  nombre,
  existentes,
  valorInicial = "",
  className,
}: {
  nombre: string;
  existentes: string[];
  valorInicial?: string;
  className?: string;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [abierto, setAbierto] = useState(false);
  const cerrarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizado = normalizarCategoria(valor);

  const sugerencias = useMemo(() => {
    if (!normalizado) return existentes;
    return existentes.filter((c) => c.includes(normalizado));
  }, [existentes, normalizado]);

  const esNueva = normalizado.length > 0 && !existentes.includes(normalizado);

  // El blur del input llega antes que el click de la sugerencia, así que se
  // demora el cierre lo justo para que el click alcance a registrarse.
  const cerrarConDemora = () => {
    cerrarTimer.current = setTimeout(() => setAbierto(false), 120);
  };

  const elegir = (categoria: string) => {
    if (cerrarTimer.current) clearTimeout(cerrarTimer.current);
    setValor(categoria);
    setAbierto(false);
  };

  return (
    <div className="relative">
      <input
        name={nombre}
        value={valor}
        onChange={(e) => {
          setValor(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={cerrarConDemora}
        onKeyDown={(e) => {
          if (e.key === "Escape") setAbierto(false);
        }}
        autoComplete="off"
        placeholder="mates, accesorios, …"
        required
        className={`w-full ${className ?? ""}`}
      />

      {abierto && sugerencias.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full border border-oliva/30 bg-arena shadow-md">
          {sugerencias.map((categoria) => (
            <li key={categoria}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(categoria)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-crudo"
              >
                {etiquetaCategoria(categoria)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {esNueva && (
        <p className="mt-1 text-xs font-light text-caramelo">
          Se va a crear la categoría «{normalizado}».
        </p>
      )}
    </div>
  );
}
