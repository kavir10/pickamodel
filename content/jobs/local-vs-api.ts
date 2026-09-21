import type { Job } from "./types";

export const localVsApi: Job = {
  slug: "local-vs-api",
  title: "local vs api",
  oneLiner: "You’re choosing whether the agent runs on your machine or through an API—privacy and offline access versus long-context horsepower.",
  recommendations: [
    {
      model: "Local mid/strong (qwen/llama/deepseek-class)",
      bestWhen: "The code is private, the work must stay offline or air-gapped, and predictable unit cost matters.",
      avoidWhen: "The job needs huge multi-file context or your local tool harness is weak.",
      costVibe: "~free–$$ (gpu)",
    },
    {
      model: "API Sonnet-class",
      bestWhen: "The repo is messy, the context is long, or the agent needs a tool-heavy loop.",
      avoidWhen: "The work has pure privacy requirements.",
      costVibe: "$$$",
    },
    {
      model: "API fast/cheap",
      bestWhen: "You’re running high-volume, simple jobs from the cloud.",
      avoidWhen: "The mandate is “just make it local.”",
      costVibe: "$",
    },
  ],
  why: [
    "Local wins on privacy, latency to disk, and cost at volume—but loses when context and tool discipline matter.",
    "API frontier models still win on messy agent loops and fat repos.",
    "Hybrid is real: use local for scaffolding and tests, then an API for the hard pull request.",
    "Don’t pick “local” as an identity. Pick it as a constraint.",
  ],
  relatedSlugs: ["tool-loop-debug", "greenfield-scaffold", "refactor-pr"],
  lastUpdated: "2026-09-20",
};
