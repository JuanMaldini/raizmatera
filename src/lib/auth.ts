import "server-only";
import { cookies } from "next/headers";

const PB_URL = (process.env.NEXT_PUBLIC_PB_URL ?? "").replace(/\/$/, "");
const USERS = process.env.NEXT_PUBLIC_PB_USERS ?? "raizmatera_user";

/**
 * La sesión viaja en una cookie HttpOnly, así que ningún script de la página
 * puede leerla. Es la diferencia con andrea-moro-users, donde la escribe el
 * cliente con document.cookie y queda expuesta a cualquier XSS.
 */
export const COOKIE_SESION = "pb_auth";

const OPCIONES_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 14, // dos semanas
};

export interface Sesion {
  token: string;
  email: string;
}

/** Autentica contra PocketBase. Devuelve null si las credenciales no sirven. */
export async function autenticar(
  email: string,
  password: string
): Promise<Sesion | null> {
  const res = await fetch(
    `${PB_URL}/api/collections/${USERS}/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password }),
      cache: "no-store",
    }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as { token?: string; record?: { email?: string } };
  if (!data.token) return null;

  return { token: data.token, email: data.record?.email ?? email };
}

export async function guardarSesion(sesion: Sesion): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_SESION, sesion.token, OPCIONES_COOKIE);
}

export async function borrarSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_SESION);
}

/**
 * Devuelve la sesión si el token de la cookie sigue siendo válido.
 *
 * No alcanza con que la cookie exista: se le pregunta a PocketBase, porque el
 * token puede haber expirado o el usuario haber sido borrado.
 */
export async function getSesion(): Promise<Sesion | null> {
  const store = await cookies();
  const token = store.get(COOKIE_SESION)?.value;
  if (!token) return null;

  const res = await fetch(`${PB_URL}/api/collections/${USERS}/auth-refresh`, {
    method: "POST",
    headers: { Authorization: token },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { token?: string; record?: { email?: string } };
  return { token: data.token ?? token, email: data.record?.email ?? "" };
}
