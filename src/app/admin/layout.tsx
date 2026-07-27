import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";
import { cerrarSesion } from "../login/actions";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El middleware ya frenó a quien no trae cookie, pero eso solo mira que la
  // cookie exista. Acá se valida el token de verdad contra PocketBase.
  const sesion = await getSesion();
  if (!sesion) redirect("/login?volver=/admin");

  return (
    <div className="min-h-dvh bg-crudo">
      <header className="border-b border-oliva/20 bg-arena">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-9" />
            <span className="font-serif text-oliva">Panel</span>
          </Link>

          <nav className="flex items-center gap-5 text-sm uppercase tracking-widest text-oliva">
            <Link href="/admin" className="hover:text-caramelo">
              Productos
            </Link>
            <Link href="/admin/ajustes" className="hover:text-caramelo">
              Ajustes
            </Link>
            <Link href="/" className="hover:text-caramelo">
              Ver web
            </Link>
            <form action={cerrarSesion}>
              <button type="submit" className="uppercase hover:text-caramelo">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8">{children}</main>
    </div>
  );
}
