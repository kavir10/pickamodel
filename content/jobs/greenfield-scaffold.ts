import type { Job } from "./types";

export const greenfieldScaffold: Job = {
  slug: "greenfield-scaffold",
  title: "scaffold a greenfield repo",
  oneLiner: "You’re spinning up a new repo or boilerplate and need speed, not a PhD in architecture.",
  recommendations: [
    {
      model: "Faster / cheaper cloud model",
      tier: "fast",
      bestWhen: "The stack is familiar, the template is proven, and the scaffold is repetitive Haiku- or Flash-class work.",
      avoidWhen: "The project needs novel architecture decisions before the first files are created.",
      costVibe: "$",
    },
    {
      model: "Sonnet-class",
      tier: "frontier",
      bestWhen: "The constraints are unusual, the layout spans multiple packages, or architectural taste matters.",
      avoidWhen: "The job is just making a standard Next app or other well-known boilerplate.",
      costVibe: "$$$",
    },
    {
      model: "Local coding model",
      tier: "local",
      bestWhen: "The greenfield work must stay offline or private and your template library is already strong.",
      avoidWhen: "The model struggles to follow instructions across a long scaffold or many generated files.",
      costVibe: "~free",
    },
  ],
  why: [
    "Greenfield scaffolding is mostly pattern recall, and cheap models crush it.",
    "Frontier spend is wasted unless the stack or constraints are unusual.",
    "Local models are fine when your template library is already good.",
    "Save judgment models for the first hard pull request, not folder creation.",
  ],
  relatedSlugs: ["refactor-pr", "tool-loop-debug"],
  lastUpdated: "2026-09-20",
};
