import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION } from "@/lib/auth";

/**
 * Primera puerta de /admin: si no hay cookie, ni se renderiza el panel.
 *
 * Es solo comodidad, no seguridad — el middleware corre en el edge y no puede
 * verificar el token contra PocketBase. Quien realmente decide qué se puede
 * leer y escribir son las API Rules de la colección, y cada página del panel
 * vuelve a validar la sesión del lado del servidor.
 */
export function middleware(request: NextRequest) {
  const tieneCookie = Boolean(request.cookies.get(COOKIE_SESION)?.value);

  if (!tieneCookie) {
    const login = new URL("/login", request.url);
    login.searchParams.set("volver", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
