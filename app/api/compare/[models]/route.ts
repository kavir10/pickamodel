import { compareData } from "@/content/models/api";
import { compareHref } from "@/content/models/compare";
import { presets } from "@/content/models/presets";
import { json } from "../../respond";

export const dynamicParams = true;

export function generateStaticParams() {
  return presets.map((preset) => ({ models: compareHref(preset.models).replace("/compare/", "") }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ models: string }> }) {
  const data = compareData((await params).models);
  return data ? json(data) : json({ error: "Use 2–4 distinct model ids joined by -vs-. See /api/models.json for ids." }, 404);
}
