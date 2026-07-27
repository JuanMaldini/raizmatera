import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

// No hay enlace a esta página en ninguna parte del sitio; tampoco tiene por qué
// aparecer en Google.
export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  if (await getSesion()) redirect("/admin");

  const { volver } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="marco-doble w-full max-w-md">
        <div className="flex flex-col items-center gap-7 px-6 py-12">
          <Image
            src="/logo-transparente.png"
            alt="Raíz Matera"
            width={96}
            height={96}
            priority
            className="h-24 w-24"
          />
          <LoginForm volver={volver ?? "/admin"} />
        </div>
      </div>
    </main>
  );
}
