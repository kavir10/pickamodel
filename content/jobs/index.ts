import { fixCi } from "./fix-ci";
import { greenfieldScaffold } from "./greenfield-scaffold";
import { localVsApi } from "./local-vs-api";
import { longRunningTask } from "./long-running-task";
import { parallelSubagents } from "./parallel-subagents";
import { refactorPr } from "./refactor-pr";
import { testGeneration } from "./test-generation";
import { toolLoopDebug } from "./tool-loop-debug";
import type { Job } from "./types";

export const jobs = [greenfieldScaffold, localVsApi, refactorPr, testGeneration, toolLoopDebug, longRunningTask, fixCi, parallelSubagents] satisfies Job[];

export function getJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function getRelatedJobs(job: Job): Job[] {
  return job.relatedSlugs
    .map(getJob)
    .filter((related): related is Job => related !== undefined)
    .slice(0, 3);
}
