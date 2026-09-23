import assert from "node:assert/strict";
import { test } from "node:test";
import { refactorPr } from "../jobs/refactor-pr.ts";
import { toolLoopDebug } from "../jobs/tool-loop-debug.ts";
import { allPairs, canonicalCompareHref, compareHref, parseCompareSlug, workloadCost } from "./compare.ts";
import { getModel, headlineScore, leaderboard } from "./index.ts";
import { poolFor, rankForJob, rankModels } from "./use-cases.ts";

test("headline score prefers independent results", () => {
  const score = headlineScore("claude-fable-5-1", "terminal-bench-4");
  assert.equal(score?.reportedBy, "independent");
});

test("leaderboard is sorted high to low, one row per model", () => {
  const rows = leaderboard("frontiercode-1-1");
  assert.ok(rows.length > 2);
  assert.equal(new Set(rows.map((r) => r.model.id)).size, rows.length);
  rows.slice(1).forEach((row, i) => assert.ok(rows[i].score.value >= row.score.value));
});

test("compare slugs round-trip and reject bad input", () => {
  const ids = ["claude-sonnet-5", "gpt-6-sol"];
  assert.deepEqual(parseCompareSlug(compareHref(ids).replace("/compare/", ""))?.map((m) => m.id), ids);
  assert.equal(parseCompareSlug("claude-sonnet-5"), undefined);
  assert.equal(parseCompareSlug("claude-sonnet-5-vs-claude-sonnet-5"), undefined);
  assert.equal(parseCompareSlug("claude-sonnet-5-vs-nope"), undefined);
  assert.equal(parseCompareSlug(["a", "b", "c", "d", "e"].join("-vs-")), undefined);
});

test("workload cost uses list price and is null without one", () => {
  assert.equal(workloadCost(getModel("claude-sonnet-5")!), 30);
  assert.equal(workloadCost(getModel("gpt-oss-20b")!), null);
});

test("recommendation labels map to model pools", () => {
  assert.deepEqual(refactorPr.recommendations.map(poolFor), ["frontier", "fast", "local"]);
});

test("job rankings use one benchmark and stay inside the pool", () => {
  for (const job of [refactorPr, toolLoopDebug]) {
    for (const rec of job.recommendations) {
      const { pool, benchmark, ranked } = rankForJob(job, rec);
      assert.ok(ranked.length > 0, `${job.slug} / ${rec.model}`);
      for (const { model, score } of ranked) {
        if (pool === "local") assert.ok(model.runsLocally, model.id);
        else assert.equal(model.class, pool, model.id);
        if (score) assert.equal(score.benchmark, benchmark?.id);
      }
      const independent = ranked.filter((r) => r.score?.reportedBy === "independent").length;
      const key = (r: (typeof ranked)[number]) => [!r.score ? 0 : independent >= 2 && r.score.reportedBy === "vendor" ? 1 : 2, r.score?.value ?? -1];
      ranked.slice(1).forEach((r, i) => {
        const [ta, va] = key(ranked[i]);
        const [tb, vb] = key(r);
        assert.ok(ta > tb || (ta === tb && va >= vb), `${job.slug} / ${rec.model} order`);
      });
    }
  }
});

test("constraints filter the candidates before ranking", () => {
  const { ranked } = rankModels("tool-loop-debug", { openWeightsOnly: true, maxInputPrice: 2, minContext: 500_000 }, 10);
  assert.ok(ranked.length > 0);
  for (const { model } of ranked) {
    assert.ok(model.openWeight, model.id);
    assert.ok(model.price && model.price.input <= 2, model.id);
    assert.ok(model.contextWindow >= 500_000, model.id);
  }
  assert.equal(rankModels("refactor-pr", { maxInputPrice: 0.01 }).ranked.length, 0);
});

test("independent results outrank vendor self-runs on the same benchmark", () => {
  const { ranked } = rankModels("tool-loop-debug", { pool: "frontier" }, 10);
  const firstVendor = ranked.findIndex((r) => r.score?.reportedBy === "vendor");
  const lastIndependent = ranked.map((r) => r.score?.reportedBy).lastIndexOf("independent");
  assert.ok(firstVendor === -1 || firstVendor > lastIndependent);
});

test("canonical compare URLs ignore pick order; pairs cover every combination once", () => {
  assert.equal(canonicalCompareHref(["gpt-6-sol", "claude-sonnet-5"]), canonicalCompareHref(["claude-sonnet-5", "gpt-6-sol"]));
  const pairs = allPairs(["c", "a", "b"]);
  assert.deepEqual(pairs, [["a", "b"], ["a", "c"], ["b", "c"]]);
});
