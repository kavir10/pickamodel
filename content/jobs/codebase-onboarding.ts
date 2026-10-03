import type { Job } from "./types";

export const codebaseOnboarding: Job = {
  slug: "codebase-onboarding",
  title: "onboard onto an unfamiliar codebase",
  oneLiner: "You just inherited a repo and need a working map — where things live, what not to touch — without a week of tab-hopping.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The repo is large, messy, or the real question is “what breaks if i change this.”",
      avoidWhen: "You only need a file tree and a one-paragraph readme.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud",
      bestWhen: "First pass: entrypoints, main modules, how to run tests.",
      avoidWhen: "Architecture is implicit and wrong guesses are expensive.",
      costVibe: "$",
    },
    {
      model: "Local mid",
      bestWhen: "Private code, and you want a disposable map you can throw away.",
      avoidWhen: "You need cross-file judgment, not a summary of the files you opened.",
      costVibe: "~free",
    },
  ],
  why: [
    "Onboarding is a map problem. Speed matters less than not inventing a structure that isn’t there.",
    "Cheap models narrate the files you showed them. Frontier earns it when the answer is “this looks unused but three jobs depend on it.”",
    "Local is fine for private repos if you treat the map as a draft, not a spec.",
    "Pair with pr-review once you start changing things — the map is not the review.",
  ],
  relatedSlugs: ["refactor-pr", "pr-review", "tool-loop-debug"],
  lastUpdated: "2026-10-03",
};
