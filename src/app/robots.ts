import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // El panel y el login no tienen nada que hacer en un buscador.
      disallow: ["/admin", "/login"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
