import { getModel } from "./index.ts";
import type { Model } from "./types";

export const MAX_COMPARE = 4;

/** One URL per set of models, whatever order they were picked in. Used for canonical links and the sitemap. */
export function canonicalCompareHref(ids: string[]): string {
  return compareHref([...ids].sort());
}

/** Every two-model comparison, in canonical order. */
export function allPairs(ids: string[]): string[][] {
  const sorted = [...ids].sort();
  return sorted.flatMap((a, i) => sorted.slice(i + 1).map((b) => [a, b]));
}

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

export type Usage = { inputMillions: number; outputMillions: number; cachedShare: number };

/**
 * Monthly list-price cost for a usage profile. The cached share of input is billed at the cached-input
 * price when the vendor publishes one, otherwise at the normal input price. Long-context surcharges and
 * batch discounts are ignored; model notes call those out.
 */
export function usageCost(model: Model, { inputMillions, outputMillions, cachedShare }: Usage): number | null {
  if (!model.price) return null;
  const share = Math.min(Math.max(cachedShare, 0), 1);
  const cachedRate = model.price.cachedInput ?? model.price.input;
  return inputMillions * ((1 - share) * model.price.input + share * cachedRate) + outputMillions * model.price.output;
}
