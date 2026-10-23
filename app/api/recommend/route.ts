import type { NextRequest } from "next/server";
import { parsePool, recommendData } from "@/content/models/api";
import { json } from "../respond";

const number = (value: string | null) => (value === null || value === "" || Number.isNaN(Number(value)) ? undefined : Number(value));

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const job = query.get("job");
  if (!job) return json({ error: "Pass ?job=<slug>. See /api/jobs.json for slugs." }, 400);
  const data = recommendData({
    job,
    pool: parsePool(query.get("pool")),
    maxInputPrice: number(query.get("maxInputPrice")),
    minContext: number(query.get("minContext")),
    openWeightsOnly: query.get("openWeightsOnly") === "true",
    limit: number(query.get("limit")),
  });
  return json(data, "error" in data ? 404 : 200);
}
