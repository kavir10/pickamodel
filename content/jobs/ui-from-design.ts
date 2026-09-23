import type { Job } from "./types";

export const uiFromDesign: Job = {
  slug: "ui-from-design",
  title: "build ui from a design",
  oneLiner: "You have a Figma frame or a screenshot and need working components that match it, not a vague cousin of it.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The design has real layout nuance (responsive breakpoints, states, spacing systems) and the model has to read the image closely.",
      avoidWhen: "You’re tweaking copy or colors in a component that already exists.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud model",
      bestWhen: "The layout is settled and you’re iterating on small components, variants, or style fixes in a tight loop.",
      avoidWhen: "The model has to infer structure from a dense screenshot with no design tokens to lean on.",
      costVibe: "$",
    },
    {
      model: "Local coding model",
      bestWhen: "The design is described in text or tokens and the code must stay on your machine.",
      avoidWhen: "The input is an image: most local coding models read screenshots poorly or not at all.",
      costVibe: "~free",
    },
  ],
  why: [
    "UI from a design is a vision task first and a coding task second. Weak image reading shows up as wrong spacing and missing states.",
    "Give the model tokens, component names, and the target breakpoints. A screenshot alone leaves too much to guess.",
    "Cheap models are fine once the structure exists and each change is small and easy to eyeball.",
    "Check the result in a real browser at each breakpoint. The model’s description of its own output is not evidence.",
  ],
  relatedSlugs: ["greenfield-scaffold", "refactor-pr"],
  lastUpdated: "2026-09-22",
};
