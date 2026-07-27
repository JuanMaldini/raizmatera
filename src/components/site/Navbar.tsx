import Image from "next/image";
import Link from "next/link";

/**
 * Navegación mínima. Sin enlace a /login a propósito: al panel se entra
 * escribiendo la URL.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-arena/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        {/* Apunta al ancla y no a "/" para que, estando ya en la home, el clic
            suba al principio en vez de no hacer nada. */}
        <Link href="/#inicio" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Raíz Matera"
            width={48}
            height={48}
            priority
            className="h-12 w-12"
          />
          <span className="sr-only">Raíz Matera</span>
        </Link>

        <ul className="flex items-center gap-6 text-sm uppercase tracking-widest text-oliva">
          <li>
            <Link href="/#catalogo" className="hover:text-caramelo">
              Catálogo
            </Link>
          </li>
          <li>
            <Link href="/#nosotros" className="hover:text-caramelo">
              Nosotros
            </Link>
          </li>
          <li>
            <Link href="/#contacto" className="hover:text-caramelo">
              Contacto
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
