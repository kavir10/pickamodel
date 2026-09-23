import { benchmarks } from "./benchmarks";
import { models } from "./models";
import { scores } from "./scores";
import type { Benchmark, Model, Score } from "./types";

export { benchmarks, models, scores };
export type { Benchmark, Model, Score };

/** Date the benchmark and pricing data was last checked against its sources. */
export const dataAsOf = "2026-09-22";

export function getModel(id: string): Model | undefined {
  return models.find((model) => model.id === id);
}

export function getBenchmark(id: string): Benchmark | undefined {
  return benchmarks.find((benchmark) => benchmark.id === id);
}

/**
 * The one score to show for a model on a benchmark. Independent results win over
 * vendor-reported ones; ties go to the most recently observed.
 */
export function headlineScore(modelId: string, benchmarkId: string, independentOnly = false): Score | undefined {
  return scores
    .filter((score) => score.model === modelId && score.benchmark === benchmarkId)
    .filter((score) => !independentOnly || score.reportedBy === "independent")
    .sort((a, b) => Number(b.reportedBy === "independent") - Number(a.reportedBy === "independent") || b.observed.localeCompare(a.observed))[0];
}

/** One headline score per model, highest first. */
export function leaderboard(benchmarkId: string, independentOnly = false): { model: Model; score: Score }[] {
  return models
    .map((model) => ({ model, score: headlineScore(model.id, benchmarkId, independentOnly) }))
    .filter((row): row is { model: Model; score: Score } => row.score !== undefined)
    .sort((a, b) => b.score.value - a.score.value);
}

/** Benchmarks ordered by how many models have a score, so the most comparable come first. */
export function benchmarksByCoverage(): Benchmark[] {
  return [...benchmarks]
    .map((benchmark) => ({ benchmark, count: leaderboard(benchmark.id).length }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count)
    .map(({ benchmark }) => benchmark);
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${+(tokens / 1_000_000).toFixed(2)}M`;
  return `${Math.round(tokens / 1000)}K`;
}

export function formatPrice(usd: number): string {
  return `$${usd < 1 ? usd.toFixed(2) : +usd.toFixed(2)}`;
}
