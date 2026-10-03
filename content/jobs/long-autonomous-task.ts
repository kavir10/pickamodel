import type { Job } from "./types";

export const longAutonomousTask: Job = {
  slug: "long-autonomous-task",
  title: "leave a model running for hours",
  oneLiner: "The job takes hours, not one prompt. You need a model that stays on the task when the plan breaks, not the one that writes the best first reply.",
  recommendations: [
    {
      model: "Frontier",
      bestWhen: "The task is open-ended, the repo is unfamiliar, and a wrong turn wastes the next hour.",
      avoidWhen: "The steps are already written and the only job is to execute them.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud",
      bestWhen: "The plan is fixed, the checks are automatic, and you can stop it the moment a check fails.",
      avoidWhen: '"Keep going" is the only instruction. It will.',
      costVibe: "$",
    },
    {
      model: "Local mid",
      bestWhen: "The work can't leave the machine and the context still fits.",
      avoidWhen: "The run is long enough that context rot matters more than privacy.",
      costVibe: "~free",
    },
  ],
  why: [
    "A long run fails by drift, not by a bad opening answer. The model has to notice it left the job.",
    'Cheap models look fine for the first twenty minutes, then loop. Frontier earns it when the stop condition is "the job is done," not "the script exited."',
    "Write the stop condition before you start the run. A model with no finish line will spend the budget.",
    "Pair with tool-loop-debug when it starts repeating, and failing-ci when the run goes green for the wrong reason.",
  ],
  relatedSlugs: ["tool-loop-debug", "failing-ci", "codebase-onboarding"],
  lastUpdated: "2026-10-03",
};
