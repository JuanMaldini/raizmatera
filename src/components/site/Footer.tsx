import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-oliva/20">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-10 text-center">
        <Image
          src="/logo-transparente.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 opacity-80"
        />
        <a
          href="https://instagram.com/raiiz_matera"
          target="_blank"
          rel="noreferrer"
          className="text-sm tracking-widest text-oliva hover:text-caramelo"
        >
          @raiiz_matera
        </a>
        <p className="text-xs font-light text-tinta/50">
          © {new Date().getFullYear()} Raíz Matera
        </p>
      </div>
    </footer>
  );
}
