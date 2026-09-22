import { greenfieldScaffold } from "./greenfield-scaffold";
import { localVsApi } from "./local-vs-api";
import { prReview } from "./pr-review";
import { refactorPr } from "./refactor-pr";
import { testGeneration } from "./test-generation";
import { toolLoopDebug } from "./tool-loop-debug";
import type { Job } from "./types";

export const jobs = [greenfieldScaffold, localVsApi, prReview, refactorPr, testGeneration, toolLoopDebug] satisfies Job[];

export function getJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function getRelatedJobs(job: Job): Job[] {
  return job.relatedSlugs
    .map(getJob)
    .filter((related): related is Job => related !== undefined)
    .slice(0, 3);
}
