import { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://apiplaygrnd.tracielyy.com"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}