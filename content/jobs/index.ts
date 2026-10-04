import { codebaseOnboarding } from "./codebase-onboarding";
import { dependencyUpgrade } from "./dependency-upgrade";
import { failingCi } from "./failing-ci";
import { greenfieldScaffold } from "./greenfield-scaffold";
import { localVsApi } from "./local-vs-api";
import { longAutonomousTask } from "./long-autonomous-task";
import { parallelSubagents } from "./parallel-subagents";
import { prReview } from "./pr-review";
import { refactorPr } from "./refactor-pr";
import { testGeneration } from "./test-generation";
import { toolLoopDebug } from "./tool-loop-debug";
import { uiFromDesign } from "./ui-from-design";
import type { Job } from "./types";

export const jobs = [codebaseOnboarding, dependencyUpgrade, failingCi, greenfieldScaffold, localVsApi, longAutonomousTask, parallelSubagents, prReview, refactorPr, testGeneration, toolLoopDebug, uiFromDesign] satisfies Job[];

export function getJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function getRelatedJobs(job: Job): Job[] {
  return job.relatedSlugs
    .map(getJob)
    .filter((related): related is Job => related !== undefined)
    .slice(0, 3);
}
