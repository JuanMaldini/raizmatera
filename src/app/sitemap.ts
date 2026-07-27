import type { MetadataRoute } from "next";
import { getProductos } from "@/lib/pb-public";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const productos = await getProductos();

  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...productos.map((p) => ({
      url: `${base}/producto/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
