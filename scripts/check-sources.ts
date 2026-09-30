// Requests every source URL in the dataset and reports the ones that no longer resolve.
// Usage: npm run check-sources   (exits 1 if any source is broken)
import { benchmarks } from "../content/models/benchmarks.ts";
import { dataAsOf } from "../content/models/index.ts";
import { models } from "../content/models/models.ts";
import { scores } from "../content/models/scores.ts";

const urls = new Map<string, string[]>();
const add = (url: string, usedBy: string) => urls.set(url, [...(urls.get(url) ?? []), usedBy]);
for (const model of models) for (const source of model.sources) add(source.url, `${model.id} (${source.label})`);
for (const benchmark of benchmarks) add(benchmark.url, `benchmark ${benchmark.id}`);
for (const score of scores) add(score.source, `${score.model} / ${score.benchmark}`);

async function check(url: string): Promise<number | string> {
  const attempt = async (method: "HEAD" | "GET") => {
    const response = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(15_000), headers: { "User-Agent": "pickamodel.dev source checker" } });
    return response.status;
  };
  try {
    const status = await attempt("HEAD");
    // Many sites reject HEAD or bots; retry with GET before calling it broken.
    return status < 400 ? status : await attempt("GET");
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

const entries = [...urls.entries()];
const results: { url: string; status: number | string; usedBy: string[] }[] = [];
for (let i = 0; i < entries.length; i += 8) {
  const batch = entries.slice(i, i + 8);
  results.push(...(await Promise.all(batch.map(async ([url, usedBy]) => ({ url, status: await check(url), usedBy })))));
}

// 401/403/429 usually mean bot protection, not a dead page: report them, but don't fail.
const blocked = results.filter((r) => typeof r.status === "number" && [401, 403, 429].includes(r.status));
const broken = results.filter((r) => !(typeof r.status === "number" && (r.status < 400 || [401, 403, 429].includes(r.status))));

console.log(`Checked ${results.length} unique source URLs: ${results.length - broken.length - blocked.length} ok, ${blocked.length} blocked by the site, ${broken.length} broken.`);
for (const r of blocked) console.log(`  blocked ${r.status}  ${r.url}`);
for (const r of broken) console.log(`  BROKEN  ${r.status}  ${r.url}\n          used by: ${r.usedBy.slice(0, 4).join(", ")}${r.usedBy.length > 4 ? ` +${r.usedBy.length - 4} more` : ""}`);
// Model prices and scores move within weeks; a stale dataset should page someone, not sit quietly.
const MAX_AGE_DAYS = 30;
const ageDays = Math.floor((Date.now() - Date.parse(`${dataAsOf}T00:00:00Z`)) / 86_400_000);
const stale = ageDays > MAX_AGE_DAYS;
console.log(stale ? `STALE  data last checked ${dataAsOf} (${ageDays} days ago, limit ${MAX_AGE_DAYS}). Re-check prices and scores, then bump dataAsOf.` : `Data last checked ${dataAsOf} (${ageDays} days ago).`);

process.exit(broken.length > 0 || stale ? 1 : 0);
