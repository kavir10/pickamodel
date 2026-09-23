import type { Job } from "./types";

export const longRunningTask: Job = {
  slug: "long-running-task",
  title: "run a long autonomous task",
  oneLiner: "You’re handing an agent a multi-hour job (a migration, a feature, a big cleanup) and walking away until it opens a pull request.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The task runs for hours across many files and tool calls, and the agent has to notice when it’s stuck and change approach without you.",
      avoidWhen: "The work is a checklist of small, independent edits that a cheaper model can grind through with retries.",
      costVibe: "$$$ per run; cheaper than your afternoon",
    },
    {
      model: "Faster / cheaper cloud model",
      bestWhen: "The plan is fully written down, each step has a test, and you can afford a few failed runs.",
      avoidWhen: "Nobody will check in before the end. Cheap models drift on long horizons and compound small mistakes.",
      costVibe: "$ per run; failed runs add up",
    },
    {
      model: "Local coding model",
      bestWhen: "The job is long but narrow, runs overnight on hardware you already own, and the harness enforces checkpoints.",
      avoidWhen: "The task needs a large context or judgment calls across the whole repo.",
      costVibe: "~free (your GPU, your electricity)",
    },
  ],
  why: [
    "Long tasks fail from drift: small wrong turns that nobody corrects. Judgment over hours matters more than speed per step.",
    "Terminal-Bench 4.0 is the closest public measure: each task gets up to eight hours in a real terminal, and scores drop sharply below the top models.",
    "Give the agent a written plan, a test command, and a checkpoint rule (commit after each passing step) before you walk away.",
    "Read the diff when it’s done. A long unattended run is where confident, wrong code hides.",
  ],
  relatedSlugs: ["tool-loop-debug", "refactor-pr", "parallel-subagents"],
  lastUpdated: "2026-09-22",
};
