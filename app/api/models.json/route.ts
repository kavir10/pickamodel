import { dataAsOf } from "@/content/models";
import { modelData, models } from "@/content/models/api";
import { json } from "../respond";

export const dynamic = "force-static";

export function GET() {
  return json({ dataAsOf, models: models.map(modelData) });
}
