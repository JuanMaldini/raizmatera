"use server";

import { redirect } from "next/navigation";
import { autenticar, borrarSesion, guardarSesion } from "@/lib/auth";

export interface EstadoLogin {
  error?: string;
}

export async function iniciarSesion(
  _estado: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const volver = String(formData.get("volver") ?? "/admin");

  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  const sesion = await autenticar(email, password);
  if (!sesion) {
    // A propósito sin distinguir si falló el email o la contraseña: decirlo
    // permitiría averiguar qué cuentas existen.
    return { error: "Email o contraseña incorrectos." };
  }

  await guardarSesion(sesion);
  redirect(volver.startsWith("/admin") ? volver : "/admin");
}

export async function cerrarSesion(): Promise<void> {
  await borrarSesion();
  redirect("/");
}
