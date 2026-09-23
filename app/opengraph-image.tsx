import { shareCard, shareCardSize } from "./share-card";

export const alt = "pickamodel.dev: which model for coding agents";
export const size = shareCardSize;
export const contentType = "image/png";

export default function Image() {
  return shareCard({ title: "which model for coding agents", subtitle: "Editorial picks for common coding-agent jobs: when to pay for judgment, when cheap is fine, when to run local." });
}
