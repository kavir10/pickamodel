export type Tier = "frontier" | "fast" | "local";

export type Recommendation = {
  model: string;
  /** Optional so older content still type-checks; `tierOf` falls back to the model label. */
  tier?: Tier;
  bestWhen: string;
  avoidWhen: string;
  costVibe: string;
};

export type Job = {
  slug: string;
  title: string;
  oneLiner: string;
  recommendations: Recommendation[];
  why: string[];
  relatedSlugs: string[];
  lastUpdated: string;
};
