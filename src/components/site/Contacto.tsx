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
            Escribinos por WhatsApp y coordinamos. Hacemos envíos a todo el país.
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
