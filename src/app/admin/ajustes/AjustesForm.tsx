"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { guardarAjustes, type EstadoForm } from "../actions";
import { renderPlantilla, VARIABLES } from "@/lib/whatsapp";

const campo =
  "border border-oliva/30 bg-crudo px-3 py-2 outline-none focus:border-oliva";
const etiqueta = "text-xs uppercase tracking-widest text-oliva";

/** Producto de mentira, solo para que el preview muestre algo real. */
const EJEMPLO = {
  producto: "Imperial deluxe cincelado",
  precio: "$ 30.000",
  link: "/producto/imperial-deluxe-cincelado",
};

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
  plantilla,
}: {
  whatsapp: string;
  plantilla: string;
}) {
  const [estado, accion] = useActionState<EstadoForm, FormData>(guardarAjustes, {});
  const [numero, setNumero] = useState(whatsapp);
  const [texto, setTexto] = useState(plantilla);

  const numeroLimpio = numero.replace(/\D/g, "");
  const mensaje = renderPlantilla(texto, EJEMPLO);
  const link = numeroLimpio
    ? `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`
    : null;

  return (
    <form action={accion} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1">
        <span className={etiqueta}>Número de WhatsApp</span>
        <input
          name="whatsapp"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          inputMode="numeric"
          placeholder="5493576483367"
          className={campo}
        />
        <span className="text-xs font-light text-tinta/60">
          Con código de país, sin el <code>+</code> ni espacios ni guiones.
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className={etiqueta}>Mensaje al tocar un producto</span>
        <textarea
          name="plantilla"
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className={`${campo} font-mono text-sm`}
        />
        <span className="text-xs font-light text-tinta/60">
          Variables: {VARIABLES.map((v) => <code key={v}>{v} </code>)}
        </span>
      </label>

      <div className="border border-oliva/20 bg-arena p-4">
        <p className={etiqueta}>Así lo va a recibir el cliente</p>
        <p className="mt-2 whitespace-pre-wrap font-light">{mensaje}</p>

        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-oliva underline hover:text-caramelo"
          >
            Probar el link
          </a>
        ) : (
          <p className="mt-3 text-sm text-red-800">
            Sin número cargado, el botón de WhatsApp no aparece en la web.
          </p>
        )}
      </div>

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
