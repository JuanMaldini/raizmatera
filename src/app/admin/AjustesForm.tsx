"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { guardarAjustes, type EstadoForm } from "./actions";
import { VARIABLES } from "@/lib/whatsapp";

const campo =
  "border border-oliva/30 bg-crudo px-3 py-2 outline-none focus:border-oliva";
const etiqueta = "text-xs uppercase tracking-widest text-oliva";

function Guardar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start bg-oliva px-6 py-2.5 text-sm uppercase tracking-widest text-arena transition hover:bg-oliva/90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

export function AjustesForm({
  whatsapp,
  plantillaProducto,
  plantillaGeneral,
}: {
  whatsapp: string;
  plantillaProducto: string;
  plantillaGeneral: string;
}) {
  const [estado, accion] = useActionState<EstadoForm, FormData>(guardarAjustes, {});

  return (
    <form action={accion} className="flex flex-col gap-7">
      <label className="flex flex-col gap-1">
        <span className={etiqueta}>Número de WhatsApp</span>
        <input
          name="whatsapp"
          defaultValue={whatsapp}
          inputMode="numeric"
          placeholder="5493576483367"
          className={campo}
        />
        <span className="text-xs font-light text-tinta/60">
          Con código de país, sin el <code>+</code> ni espacios ni guiones. Sin
          número cargado, los botones de WhatsApp no aparecen en la web.
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className={etiqueta}>Mensaje al consultar por un producto</span>
        <textarea
          name="plantillaProducto"
          rows={3}
          defaultValue={plantillaProducto}
          className={`${campo} font-mono text-sm`}
        />
        <span className="text-xs font-light text-tinta/60">
          Variables:{" "}
          {VARIABLES.map((v) => (
            <code key={v}>{v} </code>
          ))}
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className={etiqueta}>Mensaje del contacto general</span>
        <textarea
          name="plantillaGeneral"
          rows={3}
          defaultValue={plantillaGeneral}
          className={`${campo} font-mono text-sm`}
        />
        <span className="text-xs font-light text-tinta/60">
          Es el de la home, donde no hay ningún producto: acá las variables no
          aplican.
        </span>
      </label>

      {estado.error && (
        <p role="alert" className="text-sm text-red-800">
          {estado.error}
        </p>
      )}
      {estado.ok && <p className="text-sm text-oliva">{estado.ok}</p>}

      <Guardar />
    </form>
  );
}
