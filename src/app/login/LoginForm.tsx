"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { iniciarSesion, type EstadoLogin } from "./actions";

function Boton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-oliva py-2.5 text-sm uppercase tracking-widest text-arena transition hover:bg-oliva/90 disabled:opacity-60"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export function LoginForm({ volver }: { volver: string }) {
  const [estado, accion] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});

  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="volver" value={volver} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="uppercase tracking-widest text-oliva">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          className="border border-oliva/30 bg-crudo px-3 py-2 outline-none focus:border-oliva"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="uppercase tracking-widest text-oliva">Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="border border-oliva/30 bg-crudo px-3 py-2 outline-none focus:border-oliva"
        />
      </label>

      {estado.error && (
        <p role="alert" className="text-sm text-red-800">
          {estado.error}
        </p>
      )}

      <Boton />
    </form>
  );
}
