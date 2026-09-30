import type { Job, Recommendation } from "../jobs/types";
import { workloadCost } from "./compare.ts";
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
  "long-running-task": ["terminal-bench-4", "deepswe", "frontiercode-1-1"],
  "fix-ci": ["terminal-bench-2-1", "swe-rebench", "terminal-bench-4"],
  "parallel-subagents": ["frontiercode-1-1", "deepswe", "terminal-bench-4"],
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
 * Rank `candidates` for a job, using the first of the job's benchmarks that scores at least two of
 * them. Ranking within one benchmark keeps the comparison honest; independent results outrank
 * vendor-reported ones when there are enough of them to compare.
 */
export function rankAmong(jobSlug: string, candidates: Model[], limit = 3): { benchmark?: Benchmark; ranked: RankedModel[] } {
  const order = [...(jobBenchmarks[jobSlug] ?? defaultBenchmarks), ...benchmarks.map((b) => b.id)];
  const benchmarkId = order.find((id) => candidates.filter((model) => headlineScore(model.id, id)).length >= 2);
  const benchmark = benchmarks.find((b) => b.id === benchmarkId);
  const scored = candidates.map((model) => ({ model, score: benchmarkId ? headlineScore(model.id, benchmarkId) : undefined }));
  // Vendor self-runs use their own harness, so when two or more independent results exist they rank first.
  const independentFirst = scored.filter(({ score }) => score?.reportedBy === "independent").length >= 2;
  const tier = (score?: Score) => (!score ? 0 : independentFirst && score.reportedBy === "vendor" ? 1 : 2);
  const ranked = scored
    .sort((a, b) => tier(b.score) - tier(a.score) || (b.score?.value ?? -1) - (a.score?.value ?? -1) || b.model.released.localeCompare(a.model.released))
    .slice(0, limit);
  return { benchmark, ranked };
}

/** Rank the models that pass `constraints` for a job. */
export function rankModels(jobSlug: string, constraints: Constraints, limit = 3): { benchmark?: Benchmark; ranked: RankedModel[] } {
  return rankAmong(jobSlug, models.filter((model) => matches(model, constraints)), limit);
}

/** Gaps smaller than this (in points) are within run-to-run noise for these benchmarks. */
export const CLOSE_CALL = 2;

export type JobVerdict = {
  job: Job;
  benchmark?: Benchmark;
  ranked: RankedModel[];
  /** Top scorer on the job's benchmark. */
  winner?: RankedModel;
  /** Models within CLOSE_CALL of the winner, on the same kind of result (vendor or independent). */
  contenders: RankedModel[];
  /** When several models are effectively tied, the cheapest of them at list price. */
  cheaperPick?: RankedModel;
  /** True when the winner's score is vendor-reported, so the lead is less certain. */
  vendorOnly: boolean;
};

/** For each job, which of the compared models to pick: the clear leader, or the cheapest of a tie. */
export function verdictsForComparison(jobs: Job[], compared: Model[]): JobVerdict[] {
  return jobs.map((job) => {
    const { benchmark, ranked } = rankAmong(job.slug, compared, compared.length);
    const first = ranked[0];
    if (!benchmark || !first?.score) return { job, benchmark, ranked, contenders: [], vendorOnly: false };
    const top = first.score;
    const contenders = ranked.filter((r) => r.score && r.score.reportedBy === top.reportedBy && top.value - r.score.value < CLOSE_CALL);
    const priced = contenders.filter((r) => workloadCost(r.model) !== null).sort((a, b) => (workloadCost(a.model) as number) - (workloadCost(b.model) as number));
    // Only a real price difference breaks the tie; equal prices stay "too close to call".
    const strictlyCheaper = priced.length > 0 && (priced.length === 1 || (workloadCost(priced[0].model) as number) < (workloadCost(priced[1].model) as number));
    const cheaperPick = contenders.length > 1 && strictlyCheaper ? priced[0] : undefined;
    return { job, benchmark, ranked, winner: first, contenders, cheaperPick, vendorOnly: top.reportedBy === "vendor" };
  });
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
