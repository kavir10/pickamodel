import type { MetadataRoute } from "next";
import { changes } from "@/content/changelog";
import { jobs } from "@/content/jobs";

const baseUrl = "https://pickamodel.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/changelog`, lastModified: changes[0]?.date, changeFrequency: "weekly", priority: 0.5 },
    ...jobs.map((job) => ({ url: `${baseUrl}/for/${job.slug}`, lastModified: job.lastUpdated, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
