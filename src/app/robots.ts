import type { MetadataRoute } from "next";
import { env } from "@/server/config/env";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/minha-conta", "/checkout"] }], sitemap: `${env.appUrl}/sitemap.xml` };
}
