export type Recommendation = {
  model: string;
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
