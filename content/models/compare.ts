import { getModel } from "./index.ts";
import type { Model } from "./types";

export const MAX_COMPARE = 4;

export function compareSlug(ids: string[]): string {
  return ids.join("-vs-");
}

export function compareHref(ids: string[]): string {
  return ids.length ? `/compare/${compareSlug(ids)}` : "/compare";
}

/** Parses "a-vs-b-vs-c" into models. Returns undefined for unknown, duplicate, or too few/many ids. */
export function parseCompareSlug(slug: string): Model[] | undefined {
  const ids = decodeURIComponent(slug).split("-vs-");
  if (ids.length < 2 || ids.length > MAX_COMPARE || new Set(ids).size !== ids.length) return undefined;
  const found = ids.map(getModel);
  return found.every((model): model is Model => model !== undefined) ? found : undefined;
}

/** Cost in USD of a fixed token mix, for comparing list prices on one number. */
export function workloadCost(model: Model, inputTokens = 10_000_000, outputTokens = 1_000_000): number | null {
  if (!model.price) return null;
  return (model.price.input * inputTokens + model.price.output * outputTokens) / 1_000_000;
}
