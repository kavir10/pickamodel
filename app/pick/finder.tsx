"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getJob, jobs } from "@/content/jobs";
import { formatPrice, formatTokens } from "@/content/models";
import { compareHref } from "@/content/models/compare";
import { poolFor, rankModels, type Pool } from "@/content/models/use-cases";
import styles from "./finder.module.css";

export type FinderState = { job: string; pool: Pool | "any"; maxPrice: number | null; minContext: number | null; openWeights: boolean };

export const defaultState: FinderState = { job: "refactor-pr", pool: "any", maxPrice: null, minContext: null, openWeights: false };

const pools: { value: FinderState["pool"]; label: string }[] = [
  { value: "any", label: "any model" },
  { value: "frontier", label: "strongest" },
  { value: "fast", label: "cheap and fast" },
  { value: "local", label: "runs on my machine" },
];
const prices = [null, 0.5, 1, 2, 5, 10];
const contexts = [null, 200_000, 500_000, 1_000_000];

function fromParams(params: URLSearchParams): FinderState {
  const pool = params.get("pool");
  const number = (key: string) => (params.get(key) && !Number.isNaN(Number(params.get(key))) ? Number(params.get(key)) : null);
  return {
    job: getJob(params.get("job") ?? "") ? (params.get("job") as string) : defaultState.job,
    pool: pool === "frontier" || pool === "fast" || pool === "local" ? pool : "any",
    maxPrice: number("maxInputPrice"),
    minContext: number("minContext"),
    openWeights: params.get("openWeightsOnly") === "true",
  };
}

function toQuery(state: FinderState): string {
  const params = new URLSearchParams({ job: state.job });
  if (state.pool !== "any") params.set("pool", state.pool);
  if (state.maxPrice !== null) params.set("maxInputPrice", String(state.maxPrice));
  if (state.minContext !== null) params.set("minContext", String(state.minContext));
  if (state.openWeights) params.set("openWeightsOnly", "true");
  return params.toString();
}

export function Finder() {
  const router = useRouter();
  const pathname = usePathname();
  const state = fromParams(new URLSearchParams(useSearchParams().toString()));
  return <FinderView state={state} onChange={(next) => router.replace(`${pathname}?${toQuery(next)}`, { scroll: false })} />;
}

export function FinderView({ state, onChange }: { state: FinderState; onChange?: (next: FinderState) => void }) {
  const set = (patch: Partial<FinderState>) => onChange?.({ ...state, ...patch });
  const job = getJob(state.job) ?? jobs[0];
  const pool = state.pool === "any" ? undefined : state.pool;
  const { benchmark, ranked } = rankModels(job.slug, { pool, maxInputPrice: state.maxPrice ?? undefined, minContext: state.minContext ?? undefined, openWeightsOnly: state.openWeights }, 5);
  // The editorial blurb describes a pool; with no pool chosen it only fits when no other filter narrows the list.
  const unfiltered = state.maxPrice === null && state.minContext === null && !state.openWeights;
  const editorial = pool ? job.recommendations.find((rec) => poolFor(rec) === pool) : unfiltered ? job.recommendations[0] : undefined;

  return (
    <div className={styles.finder}>
      <form className={styles.controls} onSubmit={(event) => event.preventDefault()}>
        <label className={styles.field}>
          <span>job</span>
          <select value={job.slug} onChange={(event) => set({ job: event.target.value })}>
            {jobs.map((option) => <option key={option.slug} value={option.slug}>{option.title}</option>)}
          </select>
        </label>
        <fieldset className={styles.field}>
          <legend>which kind</legend>
          <div className={styles.chips}>
            {pools.map((option) => (
              <label key={option.value} className={styles.chip}>
                <input type="radio" name="pool" checked={state.pool === option.value} onChange={() => set({ pool: option.value })} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className={styles.field}>
          <span>max input price</span>
          <select value={state.maxPrice ?? ""} onChange={(event) => set({ maxPrice: event.target.value === "" ? null : Number(event.target.value) })}>
            {prices.map((price) => <option key={price ?? "any"} value={price ?? ""}>{price === null ? "any" : `${formatPrice(price)} / 1M tokens`}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          <span>min context</span>
          <select value={state.minContext ?? ""} onChange={(event) => set({ minContext: event.target.value === "" ? null : Number(event.target.value) })}>
            {contexts.map((context) => <option key={context ?? "any"} value={context ?? ""}>{context === null ? "any" : `${formatTokens(context)} tokens`}</option>)}
          </select>
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={state.openWeights} onChange={(event) => set({ openWeights: event.target.checked })} />
          <span>open weights only</span>
        </label>
      </form>

      <section className={styles.results} aria-live="polite" aria-labelledby="results-heading">
        <h2 id="results-heading">for {job.title}</h2>
        {editorial && (
          <p className={styles.editorial}>
            <strong>{editorial.model}</strong>: best when {editorial.bestWhen.charAt(0).toLowerCase() + editorial.bestWhen.slice(1)} <Link href={`/for/${job.slug}`}>Full job page</Link>
          </p>
        )}
        {ranked.length === 0 ? (
          <p className={styles.empty}>No current model fits all of these constraints. Loosen the price or context limit.</p>
        ) : (
          <>
            <p className={styles.rankedBy}>
              {benchmark ? <>Ranked by <a href={benchmark.url}>{benchmark.name}</a>. {benchmark.caveat}</> : "None of these models share a benchmark yet, so they are listed newest first."}
            </p>
            <ol className={styles.list}>
              {ranked.map(({ model, score }, index) => (
                <li key={model.id} className={styles.item}>
                  <span className={styles.rank}>{index + 1}</span>
                  <span className={styles.who}>
                    <Link className={styles.name} href={`/models/${model.id}`}>{model.name}</Link>
                    <span className={styles.meta}>
                      {model.provider} · {model.price ? `${formatPrice(model.price.input)} in / ${formatPrice(model.price.output)} out` : "no list price"} · {formatTokens(model.contextWindow)} context{model.openWeight ? " · open weights" : ""}
                    </span>
                  </span>
                  <span className={styles.score}>
                    {score ? (
                      <>
                        <span className={styles.track} aria-hidden="true"><span className={styles.bar} data-reported={score.reportedBy} style={{ width: `${score.value}%` }} /></span>
                        <a href={score.source} title={score.setting}>{score.value.toFixed(1)}%</a>
                        <span className={styles.meta}>{score.reportedBy}</span>
                      </>
                    ) : (
                      <span className={styles.meta}>not scored{benchmark ? ` on ${benchmark.name}` : ""}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            {ranked.length >= 2 && <Link className={styles.compare} href={compareHref(ranked.slice(0, 4).map(({ model }) => model.id))}>compare the top {Math.min(ranked.length, 4)} →</Link>}
          </>
        )}
      </section>
    </div>
  );
}
