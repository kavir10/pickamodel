import type { Job } from "./types";

export const prodIncident: Job = {
  slug: "prod-incident",
  title: "production is down",
  oneLiner: "Users can't use the product right now. You need the smallest change that restores it, not a rewrite that happens to include the fix.",
  recommendations: [
    {
      model: "Frontier",
      bestWhen: "The last deploy doesn't explain the outage, or the tempting fix is to rebuild the path.",
      avoidWhen: "The log already names the bad release and rollback is the whole job.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud",
      bestWhen: "The error is one line, a bad flag, or a config you can revert.",
      avoidWhen: '"While we\'re in here" starts growing the diff.',
      costVibe: "$",
    },
    {
      model: "Local mid",
      bestWhen: "Prod logs and secrets can't leave the machine.",
      avoidWhen: "The incident is wider than the context you can paste.",
      costVibe: "~free",
    },
  ],
  why: [
    "An incident ends when users are back, not when the code looks better.",
    "Cheap models patch the symptom. Frontier earns it when you don't yet know which change took prod down.",
    "Roll back before you rewrite. If the last deploy is the suspect, reverting is the fix.",
    "Use failing-ci only after prod is up. A green build doesn't mean the page loads.",
  ],
  relatedSlugs: ["failing-ci", "tool-loop-debug", "refactor-pr"],
  lastUpdated: "2026-10-04",
};
