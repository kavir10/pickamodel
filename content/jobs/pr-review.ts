import type { Job } from "./types";

export const prReview: Job = {
  slug: "pr-review",
  title: "review a pull request",
  oneLiner: "You need a second pair of eyes on a diff—catch real bugs before merge without drowning in style nits.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The diff touches auth, concurrency, data integrity, or subtle regressions.",
      avoidWhen: "You’re rubber-stamping a 12-line typo fix.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud",
      bestWhen: "High volume of small PRs; you want a first pass for missing tests and obvious holes.",
      avoidWhen: "The risk is in a rare race or a domain rule the model won’t know.",
      costVibe: "$",
    },
    {
      model: "Local mid",
      bestWhen: "Private repos / offline review loops where the patch is mostly mechanical.",
      avoidWhen: "You need judgment on product intent or ambiguous failure modes.",
      costVibe: "~free",
    },
  ],
  why: [
    "PR review is mostly judgment: “is this wrong?” beats “is this pretty?”",
    "Cheap models flood you with nits; frontier earns it when the bug is quiet.",
    "Local is fine for private code if a human still owns the merge call.",
    "Pair with test-generation when the review’s real ask is “prove it.”",
  ],
  relatedSlugs: ["refactor-pr", "test-generation", "tool-loop-debug"],
  lastUpdated: "2026-09-22",
};
