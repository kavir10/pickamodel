import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { benchmarks, dataAsOf, formatPrice, formatTokens, headlineScore, models as allModels, type Model } from "@/content/models";
import { allPairs, canonicalCompareHref, compareHref, MAX_COMPARE, parseCompareSlug, workloadCost } from "@/content/models/compare";
import { presets } from "@/content/models/presets";
import { reportHref } from "@/content/models/report";
import { AddModel, HighlightBest, RemoveModel } from "../compare-controls";
import styles from "../compare.module.css";

type ComparePageProps = { params: Promise<{ models: string }> };

// Presets and every two-model pair are prebuilt; other combinations render on first request and are then cached.
export const dynamicParams = true;

export function generateStaticParams() {
  const slugs = [...presets.map((preset) => preset.models), ...allPairs(allModels.map((model) => model.id))].map((ids) => compareHref(ids).replace("/compare/", ""));
  return [...new Set(slugs)].map((models) => ({ models }));
}

const names = (models: Model[]) => models.map((model) => model.name).join(" vs ");

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const models = parseCompareSlug((await params).models);
  if (!models) return { title: "comparison not found" };
  return {
    title: `${names(models)} for coding`,
    description: `${names(models)} for coding agents: list price, context window, and every sourced coding benchmark side by side.`,
    alternates: { canonical: canonicalCompareHref(models.map((model) => model.id)) },
  };
}

type Row = { label: string; hint?: string; cells: ReactNode[]; values?: (number | null)[]; better?: "higher" | "lower"; eligible?: boolean[] };

/**
 * Indexes of the best value in a row, for "highlight best". Ties share the win, but a row where every
 * model ties (or only one has a value) highlights nothing. When `eligible` is given, only those cells compete.
 */
function bestIndexes(values: (number | null)[] | undefined, better: "higher" | "lower" | undefined, eligible?: boolean[]): Set<number> {
  const candidates = (values ?? []).map((value, index) => ({ value, index })).filter(({ value, index }) => value !== null && (!eligible || eligible[index])) as { value: number; index: number }[];
  if (!better || candidates.length < 2) return new Set();
  const best = better === "higher" ? Math.max(...candidates.map((c) => c.value)) : Math.min(...candidates.map((c) => c.value));
  const winners = candidates.filter((c) => c.value === best).map((c) => c.index);
  return winners.length === candidates.length ? new Set() : new Set(winners);
}

const dash = <span className={styles.missing}>—</span>;

export default async function ComparePage({ params }: ComparePageProps) {
  const models = parseCompareSlug((await params).models);
  if (!models) notFound();
  const ids = models.map((model) => model.id);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: "overview",
      rows: [
        { label: "provider", cells: models.map((m) => m.provider) },
        { label: "released", cells: models.map((m) => <time key={m.id} dateTime={m.released}>{m.released}</time>) },
        { label: "weights", cells: models.map((m) => (m.openWeight ? <span key={m.id}>open<span className={styles.sub}>{m.license}</span></span> : "closed")) },
        { label: "api id", cells: models.map((m) => <code key={m.id}>{m.apiId}</code>) },
      ],
    },
    {
      title: "pricing",
      rows: [
        { label: "input", hint: "per 1M tokens", cells: models.map((m) => (m.price ? formatPrice(m.price.input) : dash)), values: models.map((m) => m.price?.input ?? null), better: "lower" },
        { label: "output", hint: "per 1M tokens", cells: models.map((m) => (m.price ? formatPrice(m.price.output) : dash)), values: models.map((m) => m.price?.output ?? null), better: "lower" },
        { label: "cached input", hint: "per 1M tokens", cells: models.map((m) => (m.price?.cachedInput !== undefined ? formatPrice(m.price.cachedInput) : dash)), values: models.map((m) => m.price?.cachedInput ?? null), better: "lower" },
        {
          label: "10M in + 1M out",
          hint: "roughly a heavy day of agent work, at list price",
          cells: models.map((m) => {
            const cost = workloadCost(m);
            return cost === null ? dash : formatPrice(cost);
          }),
          values: models.map((m) => workloadCost(m)),
          better: "lower",
        },
        { label: "pricing notes", cells: models.map((m) => (m.note ? <span key={m.id} className={styles.note}>{m.note}</span> : dash)) },
      ],
    },
    {
      title: "limits",
      rows: [
        { label: "context window", cells: models.map((m) => `${formatTokens(m.contextWindow)} tokens`), values: models.map((m) => m.contextWindow), better: "higher" },
        { label: "max output", cells: models.map((m) => (m.maxOutput ? `${formatTokens(m.maxOutput)} tokens` : dash)), values: models.map((m) => m.maxOutput), better: "higher" },
      ],
    },
    {
      title: "benchmarks",
      rows: benchmarks
        .map((benchmark) => ({ benchmark, row: models.map((m) => headlineScore(m.id, benchmark.id)) }))
        .filter(({ row }) => row.some(Boolean))
        .map(({ benchmark, row }) => ({
          label: benchmark.name,
          hint: benchmark.description,
          cells: row.map((score, index) =>
            score ? (
              <span key={index} className={styles.score}>
                <span className={styles.scoreValue}>{score.value.toFixed(1)}%</span>
                <span className={styles.track} aria-hidden="true"><span className={styles.bar} data-reported={score.reportedBy} style={{ width: `${score.value}%` }} /></span>
                <span className={styles.sub}>{score.reportedBy} · <a href={score.source} title={score.setting}>source</a></span>
              </span>
            ) : (
              dash
            ),
          ),
          values: row.map((score) => score?.value ?? null),
          better: "higher" as const,
          // With two or more third-party results, vendor self-runs don't compete for "best".
          eligible: row.filter((score) => score?.reportedBy === "independent").length >= 2 ? row.map((score) => score?.reportedBy === "independent") : undefined,
        })),
    },
  ];

  const addable = allModels.filter((model) => !ids.includes(model.id)).map((model) => ({ id: model.id, name: model.name, provider: model.provider }));
  const priced = models.filter((m) => workloadCost(m) !== null);
  const lowestCost = Math.min(...priced.map((m) => workloadCost(m) as number));
  const cheapest = priced.filter((m) => workloadCost(m) === lowestCost);
  const largestContext = Math.max(...models.map((m) => m.contextWindow));
  const biggestContext = models.filter((m) => m.contextWindow === largestContext);
  const list = (items: Model[]) => new Intl.ListFormat("en", { type: "conjunction" }).format(items.map((m) => m.name));

  return (
    <main className={`shell ${styles.page}`}>
      <nav className={styles.crumbs} aria-label="breadcrumb"><Link href="/compare">compare</Link><span aria-hidden="true"> / </span>{names(models)}</nav>
      <header className={styles.header}>
        <h1 className={styles.title}>{names(models)}</h1>
        <p className="lede">List price, context window, and every coding benchmark we could source, side by side. Scores link to where they were published.</p>
      </header>
      <div className={styles.controls}>
        {models.length < MAX_COMPARE && <AddModel current={ids} options={addable} />}
      </div>
      <HighlightBest>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <td />
                {models.map((model) => (
                  <th key={model.id} scope="col">
                    <Link className={styles.modelName} href={`/models/${model.id}`}>{model.name}</Link>
                    <span className={styles.sub}>{model.provider}</span>
                    {models.length > 2 && <RemoveModel current={ids} id={model.id} name={model.name} />}
                  </th>
                ))}
              </tr>
            </thead>
            {sections.map((section) => (
              <tbody key={section.title}>
                <tr className={styles.sectionRow}><th scope="rowgroup" colSpan={models.length + 1}>{section.title}</th></tr>
                {section.rows.length === 0 && (
                  <tr><td colSpan={models.length + 1} className={styles.missing}>No sourced scores for these models yet.</td></tr>
                )}
                {section.rows.map((row) => {
                  const best = bestIndexes(row.values, row.better, row.eligible);
                  return (
                    <tr key={row.label}>
                      <th scope="row">{row.label}{row.hint && <span className={styles.hint}>{row.hint}</span>}</th>
                      {row.cells.map((cell, index) => <td key={ids[index]} data-best={best.has(index) || undefined}>{cell}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </HighlightBest>
      <section className={styles.summary} aria-labelledby="summary-heading">
        <h2 id="summary-heading">{names(models)}: summary</h2>
        {models.map((model) => (
          <p key={model.id}>
            <strong>{model.name}</strong>, from {model.provider}, has a {model.contextWindow.toLocaleString("en-US")}-token context window
            {model.price ? ` and lists at ${formatPrice(model.price.input)} per 1M input tokens and ${formatPrice(model.price.output)} per 1M output tokens.` : ". Its maker publishes no API list price."}
            {model.openWeight ? ` Its weights are open (${model.license}), so you can run it yourself.` : ""}
          </p>
        ))}
        {priced.length > 1 && (
          <p>
            {cheapest.length === priced.length
              ? `At list price, ${list(cheapest)} cost the same for a 10M-input, 1M-output workload (${formatPrice(lowestCost)}).`
              : `At list price, ${list(cheapest)} ${cheapest.length > 1 ? "are" : "is"} the cheapest of these for a 10M-input, 1M-output workload (${formatPrice(lowestCost)}).`}{" "}
            {biggestContext.length === models.length ? "All have the same context window." : `${list(biggestContext)} ${biggestContext.length > 1 ? "have" : "has"} the largest context window.`}
          </p>
        )}
      </section>
      <footer>
        <p>data checked <time dateTime={dataAsOf}>{dataAsOf}</time><span aria-hidden="true"> · </span><Link href="/benchmarks">all benchmarks</Link><span aria-hidden="true"> · </span><a href={reportHref(names(models), [`Page: https://pickamodel.dev${compareHref(ids)}`, `Data checked: ${dataAsOf}`])}>report a wrong number</a></p>
        <p className="fine-print">Prices are the vendor’s list price in USD. Scores come from vendor launch posts, model cards, and independent leaderboards. Settings differ between sources, so treat small gaps as noise.</p>
      </footer>
    </main>
  );
}
