import type { Job } from "./types";

export const parallelSubagents: Job = {
  slug: "parallel-subagents",
  title: "split a job across several agents",
  oneLiner: "The work can run at the same time, not as one long thread. You need a model that can own a slice and a model that can merge the slices when they disagree.",
  recommendations: [
    {
      model: "Frontier",
      bestWhen: "The slices touch the same files, or someone has to decide which result wins.",
      avoidWhen: "Each slice is independent and the merge is a checklist.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud",
      bestWhen: "The cuts don't overlap, and a failed slice can be thrown out without touching the others.",
      avoidWhen: "Two agents will edit the same function and you have no owner for the conflict.",
      costVibe: "$",
    },
    {
      model: "Local mid",
      bestWhen: "The slices are small, private, and you are the merge.",
      avoidWhen: "The fan-out is wide enough that you're just retyping the same prompt five times.",
      costVibe: "~free",
    },
  ],
  why: [
    "Parallel fails by collision, not by a slow first answer. Two agents in the same file is the bug.",
    "Cheap models are fine on slices that don't meet. Frontier earns it on the merge, when the pieces disagree.",
    "Name the owner of each file before you fan out. A job with one shared file is not parallel.",
    "Use long-autonomous-task when the work is sequential. Use this page when the slices can actually run together.",
  ],
  relatedSlugs: ["long-autonomous-task", "tool-loop-debug", "failing-ci"],
  lastUpdated: "2026-10-03",
};
