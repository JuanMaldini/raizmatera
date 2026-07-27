import { linkContacto } from "@/lib/whatsapp";
import type { Ajustes } from "@/types/producto";

export function Contacto({ ajustes }: { ajustes: Ajustes }) {
  const whatsapp = linkContacto(ajustes);

  return (
    <section id="contacto" className="mx-auto max-w-5xl px-5 py-16">
      <div className="marco-doble">
        <div className="flex flex-col items-center gap-5 px-6 py-14 text-center">
          <h2 className="text-2xl">¿Te gustó alguno?</h2>
          <p className="max-w-sm font-light text-tinta/80">
            Escribinos por{" "}
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                // Resaltado suave en vez de un link duro: se nota que es
                // tocable sin romper la línea de texto.
                className="bg-caramelo/35 px-1.5 py-0.5 font-normal text-oliva decoration-caramelo decoration-2 underline-offset-4 transition hover:bg-caramelo/60 hover:underline hover:shadow-md"
              >
                WhatsApp
              </a>
            ) : (
              <span className="font-normal text-oliva">WhatsApp</span>
            )}{" "}
            y coordinamos. Hacemos envíos a todo el país.
          </p>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="border border-oliva px-6 py-2 text-sm uppercase tracking-widest text-oliva transition hover:bg-oliva hover:text-arena"
            >
              Escribinos
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
