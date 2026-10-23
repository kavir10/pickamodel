import { workloadCost } from "./compare.ts";
import { benchmarks, headlineScore, models } from "./index.ts";
import type { Model, Score } from "./types";

export type ValuePoint = { model: Model; score: Score; cost: number };

/** Models with both a list price and a score on the benchmark, for plotting score against cost. */
export function valuePoints(benchmarkId: string): ValuePoint[] {
  return models.flatMap((model) => {
    const score = headlineScore(model.id, benchmarkId);
    const cost = workloadCost(model);
    return score && cost !== null ? [{ model, score, cost }] : [];
  });
}

/** The price frontier: each point scores higher than every cheaper point. Sorted by cost. */
export function priceFrontier(points: ValuePoint[]): ValuePoint[] {
  const frontier: ValuePoint[] = [];
  for (const point of [...points].sort((a, b) => a.cost - b.cost || b.score.value - a.score.value)) {
    if (frontier.length === 0 || point.score.value > frontier[frontier.length - 1].score.value) frontier.push(point);
  }
  return frontier;
}

/** Benchmarks with enough priced, scored models to be worth a chart. */
export function chartableBenchmarks(minPoints = 4) {
  return benchmarks.filter((benchmark) => valuePoints(benchmark.id).length >= minPoints);
}
