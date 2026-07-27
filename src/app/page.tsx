import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Nosotros } from "@/components/site/Nosotros";
import { Catalogo } from "@/components/site/Catalogo";
import { Contacto } from "@/components/site/Contacto";
import { Footer } from "@/components/site/Footer";
import { getAjustes, getProductos } from "@/lib/pb-public";

export default async function Home() {
  const [productos, ajustes] = await Promise.all([getProductos(), getAjustes()]);

  return (
    <>
      <Navbar />
      <main id="inicio">
        <Hero />
        <Nosotros />
        <Catalogo productos={productos} />
        <Contacto ajustes={ajustes} />
      </main>
      <Footer />
    </>
  );
}
