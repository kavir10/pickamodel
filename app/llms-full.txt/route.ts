import { llmsFullTxt } from "@/content/models/llms";
import { text } from "../api/respond";

export const dynamic = "force-static";

export function GET() {
  return text(llmsFullTxt());
}
