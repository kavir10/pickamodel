import { codebaseOnboarding } from "./codebase-onboarding";
import { dependencyUpgrade } from "./dependency-upgrade";
import { greenfieldScaffold } from "./greenfield-scaffold";
import { localVsApi } from "./local-vs-api";
import { prReview } from "./pr-review";
import { refactorPr } from "./refactor-pr";
import { testGeneration } from "./test-generation";
import { toolLoopDebug } from "./tool-loop-debug";
import { uiFromDesign } from "./ui-from-design";
import type { Job, Recommendation, Tier } from "./types";

export const jobs = [greenfieldScaffold, localVsApi, prReview, refactorPr, testGeneration, toolLoopDebug, uiFromDesign, dependencyUpgrade, codebaseOnboarding] satisfies Job[];

export function getJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function getRelatedJobs(job: Job): Job[] {
  return job.relatedSlugs
    .map(getJob)
    .filter((related): related is Job => related !== undefined)
    .slice(0, 3);
}

export function tierOf(rec: Recommendation): Tier {
  if (rec.tier) return rec.tier;
  if (/local/i.test(rec.model)) return "local";
  if (/fast|cheap|flash|haiku|mini/i.test(rec.model)) return "fast";
  return "frontier";
}

export type PickMode = "best" | "cheapest" | "local";

/** The recommendation to surface for a job under a given constraint. */
export function pickFor(job: Job, mode: PickMode): Recommendation | undefined {
  if (mode === "best") return job.recommendations[0];
  const tier: Tier = mode === "cheapest" ? "fast" : "local";
  return job.recommendations.find((rec) => tierOf(rec) === tier);
}
