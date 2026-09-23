import type { Job } from "./types";

export const dependencyUpgrade: Job = {
  slug: "dependency-upgrade",
  title: "upgrade a framework or dependency",
  oneLiner: "You’re moving to a new major version and need every breaking change handled, including the ones released after the model’s training cutoff.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The upgrade touches many call sites, changes behavior (not only names), or needs a migration plan before any edits.",
      avoidWhen: "An official codemod already covers the change and you only need to run it and fix a handful of leftovers.",
      costVibe: "$$$ for the plan",
    },
    {
      model: "Faster / cheaper cloud model",
      bestWhen: "The plan is written, the pattern is known, and the job is applying the same edit across dozens of files.",
      avoidWhen: "The new version’s API post-dates the model and you haven’t pasted in the migration guide.",
      costVibe: "$",
    },
    {
      model: "Local coding model",
      bestWhen: "The repo is private, a codemod does the heavy lifting, and the model cleans up what the codemod missed.",
      avoidWhen: "The upgrade needs judgment about changed runtime behavior across a large codebase.",
      costVibe: "~free",
    },
  ],
  why: [
    "The failure mode is stale knowledge: a model confidently writes the old API if the new version shipped after its training cutoff.",
    "Paste the migration guide and changelog into context. That matters more than which model you pick.",
    "Use a frontier model to plan and find the behavioral changes, then a cheap one to apply the repetitive edits.",
    "Run the full test suite and a build after every batch. Type errors catch renames; only tests catch changed behavior.",
  ],
  relatedSlugs: ["refactor-pr", "test-generation"],
  lastUpdated: "2026-09-22",
};
