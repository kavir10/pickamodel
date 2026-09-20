import type { Job } from "./types";

export const refactorPr: Job = {
  slug: "refactor-pr",
  title: "refactor a pull request",
  oneLiner: "You’re using an agent to carry a long, multi-file refactor from reading the codebase through a tested pull request.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The refactor crosses modules and the agent needs to preserve behavior, conventions, and test intent.",
      avoidWhen: "The change is mechanical, tightly scoped, or easy to verify in one pass.",
      costVibe: "worth it for the main pass",
    },
    {
      model: "Faster / cheaper cloud model",
      bestWhen: "You have a precise plan and want quick, reviewable edits or follow-up fixes.",
      avoidWhen: "The agent must discover the architecture or make judgment calls across a large diff.",
      costVibe: "cheap per turn; retries add up",
    },
    {
      model: "Local coding model",
      bestWhen: "Code cannot leave your machine and you can supply narrow tasks, tools, and strong tests.",
      avoidWhen: "The refactor needs a long context window or reliable decisions across many files.",
      costVibe: "no API bill; hardware and time count",
    },
  ],
  why: [
    "We’d pick Sonnet-class for the main pass: long refactors reward judgment more than low latency.",
    "Faster models are useful once the plan is settled and each edit has a clear boundary.",
    "Local models trade privacy and control for more supervision on broad changes.",
    "Tests, type checks, and diff review matter more than a model’s confident summary.",
  ],
  relatedSlugs: [],
  lastUpdated: "2026-09-20",
};
