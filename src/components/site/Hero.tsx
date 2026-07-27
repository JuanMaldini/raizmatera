import Image from "next/image";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-16 pt-10">
      <div className="marco-doble">
        <div className="flex flex-col items-center gap-6 px-6 py-14 text-center sm:py-20">
          <Image
            src="/logo-transparente.png"
            alt="Raíz Matera"
            width={160}
            height={160}
            priority
            className="h-32 w-32 sm:h-40 sm:w-40"
          />
          <h1 className="max-w-xl text-3xl leading-snug sm:text-4xl">
            Mates y accesorios artesanales
          </h1>
          <p className="max-w-md font-light leading-relaxed text-tinta/80">
            Calabaza, algarrobo, cuero y alpaca. Piezas hechas de a una, para
            acompañar todos los días.
          </p>
        </div>
      </div>
    </section>
  );
}
