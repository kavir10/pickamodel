import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { benchmarks, dataAsOf, formatPrice, formatTokens, getModel, models, scores } from "@/content/models";
import { jobs } from "@/content/jobs";
import { compareHref } from "@/content/models/compare";
import { jobsForModel } from "@/content/models/use-cases";
import styles from "../models.module.css";

type ModelPageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return models.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const model = getModel((await params).id);
  if (!model) return { title: "model not found" };
  return {
    title: `${model.name} for coding`,
    description: `${model.name} from ${model.provider}: list price, ${formatTokens(model.contextWindow)} context, and every sourced coding benchmark score.`,
    alternates: { canonical: `/models/${model.id}` },
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const model = getModel((await params).id);
  if (!model) notFound();

  const modelScores = benchmarks
    .map((benchmark) => ({ benchmark, rows: scores.filter((s) => s.model === model.id && s.benchmark === benchmark.id) }))
    .filter(({ rows }) => rows.length > 0);
  const goodFor = jobsForModel(model.id, jobs);
  const peers = models.filter((other) => other.id !== model.id && other.class === model.class).slice(0, 3);

  const facts: [string, React.ReactNode][] = [
    ["provider", model.provider],
    ["api id", <code key="api">{model.apiId}</code>],
    ["released", <time key="rel" dateTime={model.released}>{model.released}</time>],
    ["context window", `${model.contextWindow.toLocaleString("en-US")} tokens`],
    ["max output", model.maxOutput ? `${model.maxOutput.toLocaleString("en-US")} tokens` : "not published"],
    ["input price", model.price ? `${formatPrice(model.price.input)} / 1M tokens` : "no list price"],
    ["output price", model.price ? `${formatPrice(model.price.output)} / 1M tokens` : "no list price"],
    ...(model.price?.cachedInput !== undefined ? ([["cached input", `${formatPrice(model.price.cachedInput)} / 1M tokens`]] as [string, string][]) : []),
    ["weights", model.openWeight ? `open (${model.license})` : "closed"],
  ];

  return (
    <main className="shell job-page">
      <Link className="back-link" href="/models">← all models</Link>
      <header className="job-header">
        <p className="eyebrow">{model.provider}</p>
        <h1>{model.name}</h1>
        {model.note && <p className="lede">{model.note}</p>}
      </header>
      <section aria-labelledby="facts-heading">
        <h2 id="facts-heading">facts</h2>
        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        <p className={styles.sources}>Sources: {model.sources.map((source, index) => <span key={source.url}>{index > 0 && ", "}<a href={source.url}>{source.label}</a></span>)}</p>
      </section>
      <section aria-labelledby="jobs-heading">
        <h2 id="jobs-heading">a top pick for</h2>
        {goodFor.length === 0 ? (
          <p className={styles.sources}>Not in the top three for any job yet, usually because it lacks scores on the benchmarks those jobs rank by.</p>
        ) : (
          <ul className="related-list">
            {goodFor.map(({ job, rec }) => (
              <li key={`${job.slug}-${rec.model}`}><Link href={`/for/${job.slug}`}>{job.title}</Link> <span className={styles.sources}>as the “{rec.model}” option</span></li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="scores-heading">
        <h2 id="scores-heading">benchmark scores</h2>
        {modelScores.length === 0 ? (
          <p className={styles.sources}>No coding benchmark scores published for this model yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">benchmark</th><th scope="col">score</th><th scope="col">reported by</th><th scope="col">setting</th></tr></thead>
              <tbody>
                {modelScores.flatMap(({ benchmark, rows }) =>
                  rows.map((score, index) => (
                    <tr key={`${benchmark.id}-${index}`}>
                      <th scope="row">{index === 0 ? <a href={benchmark.url}>{benchmark.name}</a> : ""}</th>
                      <td>{score.value.toFixed(1)}%</td>
                      <td><a href={score.source}>{score.reportedBy}</a></td>
                      <td className={styles.setting}>{score.setting}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {peers.length > 0 && (
        <section aria-labelledby="compare-heading">
          <h2 id="compare-heading">compare</h2>
          <ul className="related-list">
            {peers.map((peer) => <li key={peer.id}><Link href={compareHref([model.id, peer.id])}>{model.name} vs {peer.name}</Link></li>)}
            <li><Link href={compareHref([model.id, ...peers.map((peer) => peer.id)])}>{model.name} vs all {peers.length}</Link></li>
          </ul>
        </section>
      )}
      <footer>
        <p>data checked <time dateTime={dataAsOf}>{dataAsOf}</time><span aria-hidden="true"> · </span><Link href="/benchmarks">all benchmarks</Link></p>
      </footer>
    </main>
  );
}
