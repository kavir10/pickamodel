import type { Job } from "./types";

export const refactorPr: Job = {
  slug: "refactor-pr",
  title: "refactor a pull request",
  oneLiner: "You’re reshaping an existing pull request without changing what it does.",
  recommendations: [
    {
      model: "Claude Sonnet",
      bestWhen: "The change spans several files and needs careful codebase context.",
      avoidWhen: "The edit is tiny enough to make directly.",
      costVibe: "mid",
    },
    {
      model: "GPT Codex",
      bestWhen: "You want an agent to inspect, edit, and verify the repository end to end.",
      avoidWhen: "You only need a quick explanation, not implementation.",
      costVibe: "mid–high",
    },
  ],
  why: [
    "Both can keep a multi-file change coherent.",
    "Repository context matters more here than fast autocomplete.",
    "Agent workflows help close the loop with tests and type checks.",
    "A narrow prompt reduces accidental behavior changes.",
  ],
  relatedSlugs: [],
  lastUpdated: "2026-09-20",
};
