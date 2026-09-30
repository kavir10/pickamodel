import { apiIndex } from "@/content/models/api";
import { json } from "./respond";

export const dynamic = "force-static";

export function GET() {
  return json(apiIndex);
}
