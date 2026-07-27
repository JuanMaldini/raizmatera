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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-5">
      <Image
        src="/logo-transparente.png"
        alt="Raíz Matera"
        width={96}
        height={96}
        priority
        className="h-24 w-24"
      />
      <LoginForm volver={volver ?? "/admin"} />
    </main>
  );
}
