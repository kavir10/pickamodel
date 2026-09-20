import type { Job } from "./types";

export const toolLoopDebug: Job = {
  slug: "tool-loop-debug",
  title: "debug a tool loop",
  oneLiner: "Your agent keeps calling tools in a circle and never finishes the job.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The debug session has many steps and the agent needs the judgment to stop, reassess, and replan.",
      avoidWhen: "You are running a pure speed race with a known fix and clear verification.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud model",
      bestWhen: "You understand the failure already and can keep each tool loop tight, explicit, and easy to verify.",
      avoidWhen: "The failure is novel, the errors are ambiguous, or the next useful tool call is unclear.",
      costVibe: "$",
    },
    {
      model: "Local coding model",
      bestWhen: "Traces must stay offline or private and your harness gives the model firm boundaries.",
      avoidWhen: "The model has weak tool-use discipline or the harness does not enforce stop conditions.",
      costVibe: "~free",
    },
  ],
  why: [
    "Tool loops are a judgment failure, not a tokens-per-second failure.",
    "Frontier models are better at bailing out and replanning when tool output is noisy.",
    "Cheap models can thrash by calling the same tool with the same arguments and producing more heat instead of progress.",
    "Local models win only when your harness already enforces clear stop conditions.",
  ],
  relatedSlugs: ["refactor-pr"],
  lastUpdated: "2026-09-20",
};
