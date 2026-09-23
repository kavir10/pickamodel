import type { Metadata } from "next";
import Link from "next/link";
import { jobs } from "@/content/jobs";
import { dataAsOf } from "@/content/models";
import { recommendData, siteUrl } from "@/content/models/api";
import styles from "./agents.module.css";

export const metadata: Metadata = {
  title: "for agents",
  description: "Use pickamodel.dev from an AI agent: llms.txt, a JSON API for models, benchmarks, jobs, comparisons, and ranked recommendations.",
  alternates: { canonical: "/agents" },
};

const endpoints = [
  { path: "/llms.txt", what: "Short index of every page, in the llms.txt format." },
  { path: "/llms-full.txt", what: "The whole dataset as readable text: jobs, models, scores, benchmarks." },
  { path: "/api", what: "JSON index of the endpoints below." },
  { path: "/api/models.json", what: "Every model: API id, prices, context, license, and every score with its source and setting." },
  { path: "/api/jobs.json", what: "Every job: editorial recommendations plus the current models behind each one." },
  { path: "/api/benchmarks.json", what: "Every benchmark: description, caveat, and leaderboard." },
  { path: "/api/compare/claude-sonnet-5-vs-gpt-6-sol", what: "Side-by-side data for 2–4 models (ids joined by -vs-)." },
  { path: "/api/recommend?job=refactor-pr&pool=fast", what: "Ranked models for a job, filtered by your constraints." },
];

const params = [
  { name: "job", what: `Required. One of: ${jobs.map((job) => job.slug).join(", ")}.` },
  { name: "pool", what: "frontier, fast, or local (fits on one machine). Omit for all models." },
  { name: "maxInputPrice", what: "Highest acceptable list price per 1M input tokens, in USD. Excludes models without a list price." },
  { name: "minContext", what: "Smallest acceptable context window, in tokens." },
  { name: "openWeightsOnly", what: "true to keep only models with downloadable weights." },
  { name: "limit", what: "How many models to return, 1–10. Default 5." },
];

const agentsMdSnippet = `## Choosing a model
Before picking a model for a coding task, fetch
${siteUrl}/api/recommend?job=<job>&pool=<frontier|fast|local>
Job slugs are listed at ${siteUrl}/api/jobs.json.
Prefer independent scores over vendor-reported ones.`;

export default function AgentsPage() {
  const example = recommendData({ job: "refactor-pr", pool: "fast", limit: 2 });
  return (
    <main className="shell job-page">
      <header className="job-header">
        <h1>for agents</h1>
        <p className="lede">Everything on the site is also plain text and JSON. No API key. Responses allow any origin, and scores keep their source link and a vendor/independent label so an agent can cite them.</p>
      </header>

      <section aria-labelledby="endpoints-heading">
        <h2 id="endpoints-heading">endpoints</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th scope="col">path</th><th scope="col">returns</th></tr></thead>
            <tbody>
              {endpoints.map((endpoint) => (
                <tr key={endpoint.path}><th scope="row"><a href={endpoint.path}><code>{endpoint.path}</code></a></th><td>{endpoint.what}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="recommend-heading">
        <h2 id="recommend-heading">recommend parameters</h2>
        <p className={styles.note}>Models are ranked by the first of the job’s relevant benchmarks that scores at least two of the candidates, so every ranking compares like with like. The response says which benchmark it used and its caveat.</p>
        <dl className={styles.params}>
          {params.map((param) => <div key={param.name}><dt><code>{param.name}</code></dt><dd>{param.what}</dd></div>)}
        </dl>
        <h3 className={styles.sub}>example</h3>
        <pre className={styles.code}><code>{`curl "${siteUrl}/api/recommend?job=refactor-pr&pool=fast&limit=2"`}</code></pre>
        <pre className={styles.code}><code>{JSON.stringify(example, null, 2)}</code></pre>
      </section>

      <section aria-labelledby="snippet-heading">
        <h2 id="snippet-heading">add it to AGENTS.md or CLAUDE.md</h2>
        <p className={styles.note}>Paste this into your agent’s instructions so it checks before choosing a model.</p>
        <pre className={styles.code}><code>{agentsMdSnippet}</code></pre>
      </section>

      <footer>
        <p>data checked <time dateTime={dataAsOf}>{dataAsOf}</time><span aria-hidden="true"> · </span><Link href="/benchmarks">benchmarks</Link></p>
        <p className="fine-print">Data is compiled from vendor docs, model cards, and public leaderboards, each linked from the record it supports. Please link back to the page you used.</p>
      </footer>
    </main>
  );
}
