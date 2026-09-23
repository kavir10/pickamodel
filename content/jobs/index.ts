import { codebaseOnboarding } from "./codebase-onboarding";
import { dependencyUpgrade } from "./dependency-upgrade";
import { greenfieldScaffold } from "./greenfield-scaffold";
import { localVsApi } from "./local-vs-api";
import { refactorPr } from "./refactor-pr";
import { testGeneration } from "./test-generation";
import { toolLoopDebug } from "./tool-loop-debug";
import { uiFromDesign } from "./ui-from-design";
import type { Job } from "./types";

export const jobs = [greenfieldScaffold, localVsApi, refactorPr, testGeneration, toolLoopDebug, uiFromDesign, dependencyUpgrade, codebaseOnboarding] satisfies Job[];

export function getJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function getRelatedJobs(job: Job): Job[] {
  return job.relatedSlugs
    .map(getJob)
    .filter((related): related is Job => related !== undefined)
    .slice(0, 3);
}
