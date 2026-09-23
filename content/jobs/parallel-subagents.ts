import type { Job } from "./types";

export const parallelSubagents: Job = {
  slug: "parallel-subagents",
  title: "run subagents in parallel",
  oneLiner: "One agent plans and reviews while several others search, edit, or test in parallel, and you want the bill to make sense.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "It’s the orchestrator: it splits the work, writes each subagent’s brief, and judges what comes back.",
      avoidWhen: "You’re using it for every worker too. Paying frontier prices for grep-and-summarize subagents multiplies cost for little gain.",
      costVibe: "$$$ for one seat",
    },
    {
      model: "Faster / cheaper cloud model",
      bestWhen: "It’s a worker with a narrow brief: search the repo, summarize a file, run the tests, apply a planned edit.",
      avoidWhen: "The worker has to make design decisions or resolve conflicts with other workers’ changes.",
      costVibe: "$ × number of workers",
    },
    {
      model: "Local coding model",
      bestWhen: "Workers do high-volume read-only tasks (search, classification, summarizing) on code that can’t leave the machine.",
      avoidWhen: "Workers need to write code the orchestrator won’t re-check.",
      costVibe: "~free per worker; throughput is the limit",
    },
  ],
  why: [
    "Split by judgment, not by task size: the orchestrator needs the best model you can afford, and workers usually don’t.",
    "Cost scales with worker count, so a 10× cheaper worker model matters more than a few points of benchmark score.",
    "Give each worker a self-contained brief and ask for a short, structured result. Long free-text reports waste the orchestrator’s context.",
    "Have the orchestrator verify worker edits (tests, a diff review) before merging them. Parallel mistakes land together.",
  ],
  relatedSlugs: ["long-running-task", "codebase-onboarding", "refactor-pr"],
  lastUpdated: "2026-09-22",
};
