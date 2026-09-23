import type { Job, Recommendation } from "../jobs/types";
import { benchmarks, headlineScore, models } from "./index.ts";
import type { Benchmark, Model, Score } from "./types";

/** Benchmarks that best reflect each job, most relevant first. Jobs not listed use `defaultBenchmarks`. */
export const jobBenchmarks: Record<string, string[]> = {
  "refactor-pr": ["frontiercode-1-1", "swe-rebench", "swe-bench-pro", "deepswe"],
  "tool-loop-debug": ["terminal-bench-4", "terminal-bench-2-1", "deepswe"],
  "greenfield-scaffold": ["terminal-bench-2-1", "deepswe", "swe-bench-verified"],
  "test-generation": ["swe-rebench", "frontiercode-1-1", "swe-bench-pro", "swe-bench-verified"],
  "local-vs-api": ["terminal-bench-2-1", "swe-bench-verified", "frontiercode-1-1"],
  "pr-review": ["frontiercode-1-1", "swe-rebench", "swe-bench-pro"],
  "ui-from-design": ["frontiercode-1-1", "deepswe", "terminal-bench-2-1"],
  "dependency-upgrade": ["swe-rebench", "frontiercode-1-1", "terminal-bench-4"],
  "codebase-onboarding": ["frontiercode-1-1", "swe-rebench", "deepswe"],
};
const defaultBenchmarks = ["frontiercode-1-1", "terminal-bench-4", "swe-rebench", "deepswe"];

export type Pool = "frontier" | "fast" | "local";

/**
 * Which pool of concrete models a recommendation's label refers to ("Sonnet-class", "Faster / cheaper
 * cloud model", "Local coding model"). Mirrors the label fallback in tierOf() from the jobs content.
 */
export function poolFor(rec: Recommendation): Pool {
  if (/local/i.test(rec.model)) return "local";
  if (/fast|cheap|flash|haiku|mini/i.test(rec.model)) return "fast";
  return "frontier";
}

export type RankedModel = { model: Model; score?: Score };
export type PoolRanking = { pool: Pool; benchmark?: Benchmark; ranked: RankedModel[] };

/** Constraints an agent or the finder can put on the candidate set. */
export type Constraints = { pool?: Pool; maxInputPrice?: number; minContext?: number; openWeightsOnly?: boolean };

export function matches(model: Model, { pool, maxInputPrice, minContext, openWeightsOnly }: Constraints): boolean {
  if (pool === "local" && !model.runsLocally) return false;
  if ((pool === "frontier" || pool === "fast") && model.class !== pool) return false;
  if (maxInputPrice !== undefined && (!model.price || model.price.input > maxInputPrice)) return false;
  if (minContext !== undefined && model.contextWindow < minContext) return false;
  if (openWeightsOnly && !model.openWeight) return false;
  return true;
}

/**
 * Rank the models that pass `constraints` for a job, using the first of the job's benchmarks that
 * scores at least two of them. Ranking within one benchmark keeps the comparison honest.
 */
export function rankModels(jobSlug: string, constraints: Constraints, limit = 3): { benchmark?: Benchmark; ranked: RankedModel[] } {
  const pickFrom = models.filter((model) => matches(model, constraints));
  const order = [...(jobBenchmarks[jobSlug] ?? defaultBenchmarks), ...benchmarks.map((b) => b.id)];
  const benchmarkId = order.find((id) => pickFrom.filter((model) => headlineScore(model.id, id)).length >= 2);
  const benchmark = benchmarks.find((b) => b.id === benchmarkId);
  const ranked = pickFrom
    .map((model) => ({ model, score: benchmarkId ? headlineScore(model.id, benchmarkId) : undefined }))
    .sort((a, b) => (b.score?.value ?? -1) - (a.score?.value ?? -1) || b.model.released.localeCompare(a.model.released))
    .slice(0, limit);
  return { benchmark, ranked };
}

/** Current models for one of a job's recommendations. */
export function rankForJob(job: Job, rec: Recommendation, limit = 3): PoolRanking {
  const pool = poolFor(rec);
  return { pool, ...rankModels(job.slug, { pool }, limit) };
}

/** Jobs where a model makes the top three for at least one recommendation. */
export function jobsForModel(modelId: string, jobs: Job[]): { job: Job; rec: Recommendation }[] {
  return jobs.flatMap((job) =>
    job.recommendations
      .filter((rec) => rankForJob(job, rec).ranked.some(({ model }) => model.id === modelId))
      .map((rec) => ({ job, rec })),
  );
}
