import { getJob, jobs } from "@/content/jobs";
import { shareCard, shareCardSize } from "../../share-card";

export const alt = "pickamodel.dev job recommendation";
export const size = shareCardSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return jobs.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const job = getJob((await params).slug);
  if (!job) return shareCard({ title: "page not found", subtitle: "That coding job isn’t live." });
  const pick = job.recommendations[0];
  return shareCard({ title: job.title, subtitle: job.oneLiner, footer: pick ? `pick: ${pick.model}` : undefined });
}
