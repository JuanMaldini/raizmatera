/** @type {import('next').NextConfig} */
const pbHost = new URL(
  process.env.NEXT_PUBLIC_PB_URL ?? "https://pocketbase.vmoliver.cloud"
).hostname;

const nextConfig = {
  images: {
    // A diferencia de andrea-moro, el optimizador queda ACTIVO: las fotos de
    // producto son de 1200x1600 y servirlas sin optimizar es la mayor pérdida
    // de velocidad que puede tener el sitio.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: pbHost }],
  },
};

export default nextConfig;
