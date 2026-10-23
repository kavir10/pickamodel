import type { NextRequest } from "next/server";
import { askData } from "@/content/models/api";
import { json } from "../respond";

export function GET(request: NextRequest) {
  const question = request.nextUrl.searchParams.get("q")?.trim();
  if (!question) return json({ error: "Pass ?q=<your question>, e.g. ?q=cheapest model to fix a failing CI build" }, 400);
  if (question.length > 500) return json({ error: "Keep the question under 500 characters." }, 400);
  const data = askData(question);
  return json(data, "error" in data ? 422 : 200);
}
