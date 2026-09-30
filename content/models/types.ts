export type ModelClass = "frontier" | "fast" | "open-weight";

export type Source = { label: string; url: string };

export type Model = {
  /** URL slug, e.g. "claude-sonnet-5". */
  id: string;
  name: string;
  provider: string;
  /** The id you pass to the provider's API. */
  apiId: string;
  class: ModelClass;
  released: string;
  contextWindow: number;
  maxOutput: number | null;
  /** USD per 1M tokens at list price; null when the vendor publishes no API price. */
  price: { input: number; output: number; cachedInput?: number } | null;
  openWeight: boolean;
  license: string | null;
  /** One line on pricing or limit quirks worth knowing (long-context surcharges, peak pricing). */
  note?: string;
  sources: Source[];
};

export type Benchmark = {
  id: string;
  name: string;
  /** What a task looks like, in one sentence. */
  description: string;
  tasks: number | null;
  url: string;
  caveat: string;
};

export type Score = {
  model: string;
  benchmark: string;
  /** Percent, 0–100. */
  value: number;
  /** Who ran it: the model's own vendor, or an independent leaderboard. */
  reportedBy: "vendor" | "independent";
  /** Harness, effort level, subset: anything that changes the number. */
  setting: string;
  source: string;
  observed: string;
};
