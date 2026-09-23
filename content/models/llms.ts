import { benchmarkData, jobData, modelData, siteUrl } from "./api.ts";
import { compareHref } from "./compare.ts";
import { benchmarks, dataAsOf, formatPrice, formatTokens, models } from "./index.ts";
import { presets } from "./presets.ts";
import { jobs } from "../jobs";

const price = (model: (typeof models)[number]) => (model.price ? `${formatPrice(model.price.input)} in / ${formatPrice(model.price.output)} out per 1M tokens` : "no API list price");

/** llms.txt: a short, link-first index for agents (https://llmstxt.org). */
export function llmsTxt(): string {
  return `# pickamodel.dev

> Which model to use for which coding-agent job. Editorial picks per job, current models with list prices, and coding benchmark scores where every number links to its source and says whether the vendor or an independent leaderboard reported it. Data checked ${dataAsOf}.

Scores from different benchmarks are not comparable, and vendor-reported numbers use each vendor's own harness. Prefer independent results when both exist.

## Jobs

${jobs.map((job) => `- [${job.title}](${siteUrl}/for/${job.slug}): ${job.oneLiner}`).join("\n")}

## Compare and browse

- [Compare models](${siteUrl}/compare): pick 2–4 models; URLs look like ${siteUrl}/compare/claude-sonnet-5-vs-gpt-6-sol
${presets.map((preset) => `- [${preset.title}](${siteUrl}${compareHref(preset.models)}): ${preset.description}`).join("\n")}
- [All benchmarks](${siteUrl}/benchmarks)
- [All models](${siteUrl}/models)

## Machine-readable

- [MCP server](${siteUrl}/mcp): Streamable HTTP, no auth. Tools: ask, recommend_model, compare_models, get_model, get_job, list_jobs, benchmark_leaderboard
- [API index](${siteUrl}/api): lists every endpoint
- [Models JSON](${siteUrl}/api/models.json): prices, limits, licenses, every score with source
- [Jobs JSON](${siteUrl}/api/jobs.json): each job's recommendations and the current models behind them
- [Benchmarks JSON](${siteUrl}/api/benchmarks.json): descriptions, caveats, leaderboards
- [Ask](${siteUrl}/api/ask?q=cheapest%20model%20to%20fix%20a%20failing%20CI%20build): a plain-language question in, how it was read and ranked models out
- [Recommend](${siteUrl}/api/recommend?job=refactor-pr&pool=fast): ranked models for a job under constraints (pool, maxInputPrice, minContext, openWeightsOnly)
- [Agent docs](${siteUrl}/agents): API reference and MCP setup

## Optional

- [Everything in one file](${siteUrl}/llms-full.txt)
`;
}

/** llms-full.txt: the whole dataset as readable text, for agents that want one fetch. */
export function llmsFullTxt(): string {
  const jobSections = jobs.map((job) => {
    const data = jobData(job);
    const recs = data.recommendations
      .map((rec) => {
        const current = rec.currentModels.models.map((m) => `${m.name}${m.score !== null ? ` (${m.score}% ${m.reportedBy})` : ""}`).join(", ");
        return `- **${rec.label}** (${rec.costVibe})\n  - Best when: ${rec.bestWhen}\n  - Avoid when: ${rec.avoidWhen}\n  - Current models${rec.currentModels.rankedBy ? `, ranked by ${benchmarks.find((b) => b.id === rec.currentModels.rankedBy)?.name}` : ""}: ${current}`;
      })
      .join("\n");
    return `### ${job.title}\n\n${job.oneLiner}\n\n${recs}\n\nWhy:\n${job.why.map((line) => `- ${line}`).join("\n")}\n\nPage: ${data.url}`;
  });

  const modelSections = models.map((model) => {
    const data = modelData(model);
    const scoreLines = data.scores.map((s) => `- ${benchmarks.find((b) => b.id === s.benchmark)?.name}: ${s.value}% (${s.reportedBy}; ${s.setting}) ${s.source}`).join("\n");
    return `### ${model.name}\n\n- Provider: ${model.provider}\n- API id: ${model.apiId}\n- Released: ${model.released}\n- Context: ${formatTokens(model.contextWindow)} tokens${model.maxOutput ? `, max output ${formatTokens(model.maxOutput)}` : ""}\n- Price: ${price(model)}\n- Weights: ${model.openWeight ? `open (${model.license})` : "closed"}${model.runsLocally ? ", runs on one machine" : ""}\n${model.note ? `- Note: ${model.note}\n` : ""}\nScores:\n${scoreLines || "- none published"}\n\nPage: ${data.url}`;
  });

  const benchmarkSections = benchmarks.map((b) => {
    const data = benchmarkData(b.id)!;
    return `### ${b.name}\n\n${b.description} Caveat: ${b.caveat}\n\n${data.leaderboard.map((row, i) => `${i + 1}. ${row.name}: ${row.value}% (${row.reportedBy})`).join("\n") || "No scores yet."}\n\nHome: ${b.url}`;
  });

  return `# pickamodel.dev: full dataset

Data checked ${dataAsOf}. Scores from different benchmarks are not comparable; vendor-reported numbers use each vendor's own harness.

## Jobs

${jobSections.join("\n\n")}

## Models

${modelSections.join("\n\n")}

## Benchmarks

${benchmarkSections.join("\n\n")}
`;
}
