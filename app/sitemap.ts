import type { MetadataRoute } from "next";
import { jobs } from "@/content/jobs";
import { dataAsOf } from "@/content/models";
import { compareHref } from "@/content/models/compare";
import { presets } from "@/content/models/presets";

const baseUrl = "https://pickamodel.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    ...jobs.map((job) => ({ url: `${baseUrl}/for/${job.slug}`, lastModified: job.lastUpdated, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${baseUrl}/benchmarks`, lastModified: dataAsOf, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: dataAsOf, changeFrequency: "weekly", priority: 0.8 },
    ...presets.map((preset) => ({ url: `${baseUrl}${compareHref(preset.models)}`, lastModified: dataAsOf, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
