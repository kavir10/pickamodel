import type { Job } from "./types";

export const codebaseOnboarding: Job = {
  slug: "codebase-onboarding",
  title: "understand an unfamiliar codebase",
  oneLiner: "You just inherited a repo and need to know how it fits together before you change anything.",
  recommendations: [
    {
      model: "Long-context API model",
      bestWhen: "The questions cross many modules (“how does a request reach the database?”) and you can load large parts of the repo at once.",
      avoidWhen: "You only need to find where one function is defined. Search is faster and free.",
      costVibe: "$$–$$$ (context adds up)",
    },
    {
      model: "Faster / cheaper cloud model",
      bestWhen: "The agent has good search tools and you’re asking narrow questions: what calls this, where is that configured.",
      avoidWhen: "The answer depends on reasoning across the whole architecture rather than finding the right file.",
      costVibe: "$",
    },
    {
      model: "Local coding model",
      bestWhen: "The code can’t leave your machine and you pair the model with ripgrep or an index instead of stuffing the context window.",
      avoidWhen: "You need it to hold dozens of files in mind at once.",
      costVibe: "~free",
    },
  ],
  why: [
    "Onboarding is reading, not writing. Context window size and retrieval quality decide the result more than raw coding skill.",
    "A 1M-token window helps, but a model with good search tools often beats a model with a stuffed context.",
    "Ask for file paths and line numbers with every claim, then open them. Summaries of code you haven’t seen drift quickly.",
    "Save what you learn to a notes file or CLAUDE.md so the next session starts from it instead of re-reading the repo.",
  ],
  relatedSlugs: ["refactor-pr", "local-vs-api"],
  lastUpdated: "2026-09-22",
};
