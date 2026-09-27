import type { Job } from "./types";

export const testGeneration: Job = {
  slug: "test-generation",
  title: "generate tests from existing code",
  oneLiner: "You need tests written from existing code—coverage without inventing an architecture religion.",
  recommendations: [
    {
      model: "Sonnet-class",
      tier: "frontier",
      bestWhen: "The code has tricky edge cases, asynchronous behavior, or a history of flaky failures.",
      avoidWhen: "You need to generate 200 trivial tests and volume matters more than judgment.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud model",
      tier: "fast",
      bestWhen: "You need boilerplate unit tests and straightforward happy-path coverage.",
      avoidWhen: "The behavior depends on subtle concurrency, timing, or hard-to-reproduce flakes.",
      costVibe: "$",
    },
    {
      model: "Local mid",
      tier: "local",
      bestWhen: "The repository must stay private or you are experimenting with test generation in offline CI.",
      avoidWhen: "You need realistic failure cases rather than plausible-looking assertions around the happy path.",
      costVibe: "~free",
    },
  ],
  why: [
    "Test generation rewards concrete examples and sound judgment more than raw speed.",
    "Cheap models tend to overfit to the happy path and miss the bug that actually matters.",
    "Frontier models earn their cost when the failure mode is ambiguous and the useful assertion is not obvious.",
    "Local models are fine for private code if you review their tests and failure cases aggressively.",
  ],
  relatedSlugs: ["refactor-pr", "tool-loop-debug", "local-vs-api"],
  lastUpdated: "2026-09-20",
};
