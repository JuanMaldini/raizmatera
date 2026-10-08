import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getAjustes, getProducto, getProductos } from "@/lib/pb-public";
import { precio } from "@/lib/format";
import { INSTAGRAM_PERFIL, linkProducto } from "@/lib/whatsapp";
import { SITE_NAME, siteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const productos = await getProductos();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProducto(slug);
  if (!producto) return { title: "Producto no encontrado" };

  const descripcion =
    producto.descripcion || producto.specs.join(" · ") || SITE_NAME;

  return {
    title: producto.nombre,
    description: descripcion,
    openGraph: {
      title: producto.nombre,
      description: descripcion,
      images: producto.imagenes.slice(0, 1),
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [producto, ajustes] = await Promise.all([getProducto(slug), getAjustes()]);

  if (!producto) notFound();

  const base = siteUrl();
  const whatsapp = linkProducto(producto, ajustes, base);

  // Marcado para que Google entienda que esto es un producto con precio, y no
  // una página cualquiera.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion || producto.specs.join(" · "),
    image: producto.imagenes,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: producto.precio,
      priceCurrency: "ARS",
      availability:
        producto.estado === "agotado"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${base}/producto/${producto.slug}`,
    },
  };

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/#catalogo" className="text-xs uppercase tracking-widest text-oliva">
          ← Catálogo
        </Link>

        <article className="mt-6 grid gap-10 md:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden bg-sage/20">
            {producto.imagenes[0] ? (
              <Image
                src={producto.imagenes[0]}
                alt={producto.nombre}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-oliva/50">
                Sin foto
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-6">
            <h1 className="text-2xl leading-snug sm:text-3xl">{producto.nombre}</h1>

            {producto.descripcion && (
              <p className="font-light leading-relaxed text-tinta/80">
                {producto.descripcion}
              </p>
            )}

            {producto.specs.length > 0 && (
              <ul className="space-y-1 font-light text-tinta/70">
                {producto.specs.map((spec) => (
                  <li key={spec}>– {spec}</li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <span className="chip-precio">{precio(producto.precio)}</span>
              {producto.estado === "agotado" && (
                <span className="bg-oliva px-2 py-1 text-xs uppercase tracking-widest text-arena">
                  Agotado
                </span>
              )}
            </div>

            <div className="flex w-full max-w-xs flex-col gap-3">
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-oliva px-6 py-2.5 text-center text-sm uppercase tracking-widest text-arena transition hover:bg-oliva/90 hover:shadow-md"
                >
                  {producto.estado === "agotado"
                    ? "Avisame cuando vuelva"
                    : "Consultar por WhatsApp"}
                </a>
              )}

              <a
                href={INSTAGRAM_PERFIL}
                target="_blank"
                rel="noreferrer"
                className="border border-oliva px-6 py-2.5 text-center text-sm uppercase tracking-widest text-oliva transition hover:bg-oliva hover:text-arena hover:shadow-md"
              >
                Consultar por Instagram
              </a>
            </div>
          </div>
        </article>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
