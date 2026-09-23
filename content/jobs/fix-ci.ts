import type { Job } from "./types";

export const fixCi: Job = {
  slug: "fix-ci",
  title: "fix a failing ci build",
  oneLiner: "CI is red, the log is 4,000 lines, and you want the agent to find the real failure and fix it without disabling the test.",
  recommendations: [
    {
      model: "Faster / cheaper cloud model",
      bestWhen: "The failure is a lint error, a type error, a snapshot update, or a dependency bump with an obvious fix in the log.",
      avoidWhen: "The test is flaky, the failure only happens in CI, or the fix needs a change in behavior rather than syntax.",
      costVibe: "$",
    },
    {
      model: "Sonnet-class",
      bestWhen: "The failure is environment-specific, intermittent, or buried under cascading errors, and finding the first real error takes judgment.",
      avoidWhen: "The log already points at one line and the fix is mechanical.",
      costVibe: "$$$",
    },
    {
      model: "Local coding model",
      bestWhen: "The logs contain secrets or internal hostnames that can’t go to an API, and the failures are routine.",
      avoidWhen: "The log is too long for the model’s context. Trim it to the failing step first.",
      costVibe: "~free",
    },
  ],
  why: [
    "Most red builds are boring: a cheap model reading the failing step’s log fixes them faster than you can open the tab.",
    "Escalate to a frontier model when the first error isn’t the real one, or when the failure won’t reproduce locally.",
    "Tell the agent it may not skip, delete, or loosen tests. The fastest way to green is the wrong one.",
    "Feed it the failing step’s log, not the whole run. Less context means fewer wrong guesses.",
  ],
  relatedSlugs: ["tool-loop-debug", "test-generation"],
  lastUpdated: "2026-09-22",
};
