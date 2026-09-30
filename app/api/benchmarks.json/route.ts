import { dataAsOf } from "@/content/models";
import { benchmarkData, benchmarks } from "@/content/models/api";
import { json } from "../respond";

export const dynamic = "force-static";

export function GET() {
  return json({ dataAsOf, benchmarks: benchmarks.map((b) => benchmarkData(b.id)) });
}
