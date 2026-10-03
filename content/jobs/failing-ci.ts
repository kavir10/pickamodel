import type { Job } from "./types";

export const failingCi: Job = {
  slug: "failing-ci",
  title: "get a red build green",
  oneLiner: "CI is red and you need the smallest change that makes it pass — not a refactor that happens to go green.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The failure is a real bug: flaky test, race, wrong assertion, or the log doesn’t match the diff.",
      avoidWhen: "The log already says the exact line and the fix is one character.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud",
      bestWhen: "Lint, type errors, a missing import, a snapshot that should update.",
      avoidWhen: "“Just make it pass” would mean deleting the test.",
      costVibe: "$",
    },
    {
      model: "Local mid",
      bestWhen: "Private repo, and the log is short enough to paste.",
      avoidWhen: "The failure only reproduces in CI, not on your machine.",
      costVibe: "~free",
    },
  ],
  why: [
    "A green build is not the job. The job is the failure the test was written to catch.",
    "Cheap models silence the error. Frontier earns it when the red is a real regression and the tempting fix is to weaken the check.",
    "Read the log before the diff. Most red builds are one cause, not five.",
    "Pair with test-generation only after it’s green for the right reason.",
  ],
  relatedSlugs: ["test-generation", "tool-loop-debug", "dependency-upgrade"],
  lastUpdated: "2026-10-03",
};
