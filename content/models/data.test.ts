import assert from "node:assert/strict";
import { test } from "node:test";
import { benchmarks } from "./benchmarks.ts";
import { models } from "./models.ts";
import { presets } from "./presets.ts";
import { scores } from "./scores.ts";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isHttps = (url: string) => url.startsWith("https://");

test("ids are unique", () => {
  assert.equal(new Set(models.map((m) => m.id)).size, models.length);
  assert.equal(new Set(benchmarks.map((b) => b.id)).size, benchmarks.length);
});

test("every model has sourced facts", () => {
  for (const model of models) {
    assert.match(model.id, /^[a-z0-9-]+$/, model.id);
    assert.match(model.released, isoDate, `${model.id} released`);
    assert.ok(model.contextWindow > 0, `${model.id} contextWindow`);
    assert.ok(model.sources.length > 0 && model.sources.every((s) => isHttps(s.url)), `${model.id} sources`);
    if (model.price) assert.ok(model.price.input >= 0 && model.price.output >= 0, `${model.id} price`);
    if (model.openWeight) assert.ok(model.license, `${model.id} open-weight needs a license`);
  }
});

test("every benchmark links to its home", () => {
  for (const benchmark of benchmarks) assert.ok(isHttps(benchmark.url), benchmark.id);
});

test("every score points at a known model and benchmark, with a source", () => {
  const modelIds = new Set(models.map((m) => m.id));
  const benchmarkIds = new Set(benchmarks.map((b) => b.id));
  for (const score of scores) {
    const label = `${score.model} / ${score.benchmark}`;
    assert.ok(modelIds.has(score.model), `unknown model: ${label}`);
    assert.ok(benchmarkIds.has(score.benchmark), `unknown benchmark: ${label}`);
    assert.ok(score.value >= 0 && score.value <= 100, `value out of range: ${label}`);
    assert.ok(isHttps(score.source), `source: ${label}`);
    assert.ok(score.setting.length > 0, `setting: ${label}`);
    assert.match(score.observed, isoDate, `observed: ${label}`);
  }
});

test("no duplicate score rows", () => {
  const keys = scores.map((s) => `${s.model}|${s.benchmark}|${s.reportedBy}|${s.source}`);
  assert.equal(new Set(keys).size, keys.length);
});

test("compare presets use 2–4 distinct known models", () => {
  const modelIds = new Set(models.map((m) => m.id));
  for (const preset of presets) {
    assert.ok(preset.models.length >= 2 && preset.models.length <= 4, preset.title);
    assert.equal(new Set(preset.models).size, preset.models.length, preset.title);
    for (const id of preset.models) assert.ok(modelIds.has(id), `${preset.title}: ${id}`);
  }
});
