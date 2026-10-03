import type { Job } from "./types";

export const uiFromDesign: Job = {
  slug: "ui-from-design",
  title: "turn a design into working ui",
  oneLiner: "You have a screenshot, figma, or a rough mock and need the ui that matches it — layout, states, and the bits the picture left out.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The design has real states (empty, error, loading), responsive breakpoints, or it has to match an existing component system.",
      avoidWhen: "It’s a single static card with no interaction.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud",
      bestWhen: "A first pass of the layout from a screenshot, then you fix spacing yourself.",
      avoidWhen: "Pixel match and accessibility both matter and you won’t review it.",
      costVibe: "$",
    },
    {
      model: "Local mid",
      bestWhen: "Private designs, and the job is mostly html/css you can see immediately.",
      avoidWhen: "The design system is implicit and the model has never seen your components.",
      costVibe: "~free",
    },
  ],
  why: [
    "Screenshot-to-code is easy to fake. The failure is the state the mock never drew.",
    "Cheap models copy the picture. Frontier earns it when it has to invent the empty state without inventing a new design.",
    "Don’t let it restyle the product. Match what exists.",
    "Pair with tool-loop-debug if the ui is really “the agent’s screen,” not a marketing page.",
  ],
  relatedSlugs: ["greenfield-scaffold", "refactor-pr", "tool-loop-debug"],
  lastUpdated: "2026-10-03",
};
