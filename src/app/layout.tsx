import type { Metadata } from "next";
import { Merriweather, Lato } from "next/font/google";
import { SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

// Las dos del catálogo: Merriweather es la del PDF; Lato reemplaza al
// Trebuchet MS de las etiquetas, que no está en Google Fonts.
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — Mates y accesorios artesanales`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Mates de calabaza y algarrobo, termos, yerberas y bombillas. Piezas artesanales, hechas para durar.",
  // Declarados a mano y servidos desde /public. Los archivos especiales de
  // metadata (app/icon.png) generan una ruta por ícono y en 15.5.18 sobre
  // Windows eso rompe el build con un chunk que no resuelve.
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE_NAME,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${merriweather.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  );
}
