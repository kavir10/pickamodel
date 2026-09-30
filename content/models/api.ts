import { getJob, jobs } from "../jobs";
import type { Job } from "../jobs/types";
import { compareHref, parseCompareSlug, workloadCost } from "./compare.ts";
import { benchmarks, dataAsOf, headlineScore, leaderboard, models, scores } from "./index.ts";
import type { Model } from "./types";
import { poolFor, rankForJob, rankModels, verdictsForComparison, type Constraints, type Pool } from "./use-cases.ts";

/** Shapes shared by the JSON API, llms-full.txt, and the MCP server. Plain data, absolute URLs. */

export const siteUrl = "https://pickamodel.dev";

export function modelData(model: Model) {
  return {
    id: model.id,
    name: model.name,
    provider: model.provider,
    apiId: model.apiId,
    class: model.class,
    released: model.released,
    contextWindow: model.contextWindow,
    maxOutput: model.maxOutput,
    priceUsdPer1M: model.price,
    openWeight: model.openWeight,
    license: model.license,
    runsLocally: model.runsLocally ?? false,
    note: model.note ?? null,
    url: `${siteUrl}/models/${model.id}`,
    sources: model.sources,
    scores: scores
      .filter((score) => score.model === model.id)
      .map(({ benchmark, value, reportedBy, setting, source, observed }) => ({ benchmark, value, reportedBy, setting, source, observed })),
  };
}

export function benchmarkData(benchmarkId: string) {
  const benchmark = benchmarks.find((b) => b.id === benchmarkId);
  if (!benchmark) return undefined;
  return {
    ...benchmark,
    leaderboard: leaderboard(benchmark.id).map(({ model, score }) => ({ model: model.id, name: model.name, value: score.value, reportedBy: score.reportedBy, setting: score.setting, source: score.source })),
  };
}

export function jobData(job: Job) {
  return {
    slug: job.slug,
    title: job.title,
    summary: job.oneLiner,
    url: `${siteUrl}/for/${job.slug}`,
    lastUpdated: job.lastUpdated,
    recommendations: job.recommendations.map((rec) => {
      const { pool, benchmark, ranked } = rankForJob(job, rec);
      return {
        label: rec.model,
        pool,
        bestWhen: rec.bestWhen,
        avoidWhen: rec.avoidWhen,
        costVibe: rec.costVibe,
        currentModels: {
          rankedBy: benchmark?.id ?? null,
          models: ranked.map(({ model, score }) => ({ id: model.id, name: model.name, score: score?.value ?? null, reportedBy: score?.reportedBy ?? null, priceUsdPer1M: model.price })),
          compareUrl: ranked.length >= 2 ? `${siteUrl}${compareHref(ranked.map(({ model }) => model.id))}` : null,
        },
      };
    }),
    why: job.why,
  };
}

export function compareData(slug: string) {
  const picked = parseCompareSlug(slug);
  if (!picked) return undefined;
  return {
    url: `${siteUrl}${compareHref(picked.map((m) => m.id))}`,
    dataAsOf,
    models: picked.map((model) => ({ ...modelData(model), workloadCostUsd10MIn1MOut: workloadCost(model) })),
    benchmarks: benchmarks
      .map((benchmark) => ({ id: benchmark.id, name: benchmark.name, values: picked.map((model) => headlineScore(model.id, benchmark.id)?.value ?? null) }))
      .filter((row) => row.values.some((value) => value !== null)),
    byJob: verdictsForComparison(jobs, picked).map(({ job, benchmark, ranked, winner, contenders, cheaperPick, vendorOnly }) => ({
      job: job.slug,
      pick: cheaperPick?.model.id ?? (contenders.length > 1 ? null : winner?.model.id ?? null),
      verdict: !winner ? "no shared score" : cheaperPick ? "tied on score; cheapest of the tied models" : contenders.length > 1 ? "too close to call" : vendorOnly ? "vendor-reported lead" : "clear lead",
      tiedWith: contenders.length > 1 ? contenders.map((r) => r.model.id) : [],
      benchmark: benchmark?.id ?? null,
      scores: ranked.filter((r) => r.score).map((r) => ({ model: r.model.id, value: r.score!.value, reportedBy: r.score!.reportedBy })),
    })),
  };
}

export type RecommendInput = Constraints & { job: string; limit?: number };

export function recommendData({ job: slug, limit = 5, ...constraints }: RecommendInput) {
  const job = getJob(slug);
  if (!job) return { error: `Unknown job "${slug}". Valid jobs: ${jobs.map((j) => j.slug).join(", ")}.` };
  const { benchmark, ranked } = rankModels(job.slug, constraints, Math.min(Math.max(limit, 1), 10));
  const editorialPick = job.recommendations.find((rec) => !constraints.pool || poolFor(rec) === constraints.pool);
  return {
    job: { slug: job.slug, title: job.title, url: `${siteUrl}/for/${job.slug}` },
    constraints,
    editorial: editorialPick ? { label: editorialPick.model, bestWhen: editorialPick.bestWhen, avoidWhen: editorialPick.avoidWhen } : null,
    rankedBy: benchmark ? { id: benchmark.id, name: benchmark.name, caveat: benchmark.caveat } : null,
    models: ranked.map(({ model, score }) => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      apiId: model.apiId,
      score: score ? { value: score.value, reportedBy: score.reportedBy, setting: score.setting, source: score.source } : null,
      priceUsdPer1M: model.price,
      contextWindow: model.contextWindow,
      url: `${siteUrl}/models/${model.id}`,
    })),
    compareUrl: ranked.length >= 2 ? `${siteUrl}${compareHref(ranked.slice(0, 4).map(({ model }) => model.id))}` : null,
    dataAsOf,
  };
}

export function parsePool(value: string | null | undefined): Pool | undefined {
  return value === "frontier" || value === "fast" || value === "local" ? value : undefined;
}

export const apiIndex = {
  name: "pickamodel.dev",
  description: "Which model for which coding-agent job: editorial picks, current model prices, and sourced benchmark scores.",
  dataAsOf,
  endpoints: {
    models: `${siteUrl}/api/models.json`,
    benchmarks: `${siteUrl}/api/benchmarks.json`,
    jobs: `${siteUrl}/api/jobs.json`,
    compare: `${siteUrl}/api/compare/{modelA}-vs-{modelB}[-vs-{modelC}[-vs-{modelD}]]`,
    recommend: `${siteUrl}/api/recommend?job={slug}&pool={frontier|fast|local}&maxInputPrice={usd}&minContext={tokens}&openWeightsOnly={true|false}&limit={1-10}`,
    mcp: `${siteUrl}/mcp`,
    llmsTxt: `${siteUrl}/llms.txt`,
    llmsFullTxt: `${siteUrl}/llms-full.txt`,
  },
  docs: `${siteUrl}/agents`,
};

export { jobs, models, benchmarks };
