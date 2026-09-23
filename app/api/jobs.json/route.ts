import { dataAsOf } from "@/content/models";
import { jobData, jobs } from "@/content/models/api";
import { json } from "../respond";

export const dynamic = "force-static";

export function GET() {
  return json({ dataAsOf, jobs: jobs.map(jobData) });
}
