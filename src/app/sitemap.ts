import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/dados";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts(500);
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/como-assar`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/perguntas-frequentes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/novidades`, changeFrequency: "weekly", priority: 0.5 },
    ...posts.map((p) => ({ url: `${SITE_URL}/novidades/${p.slug}`, lastModified: p.atualizado_em, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
