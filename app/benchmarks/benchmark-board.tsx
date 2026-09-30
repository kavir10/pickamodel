"use client";

import Link from "next/link";
import { useState } from "react";
import { benchmarksByCoverage, leaderboard } from "@/content/models";
import styles from "./benchmarks.module.css";

export function BenchmarkBoard() {
  const [independentOnly, setIndependentOnly] = useState(false);
  const benchmarks = benchmarksByCoverage();

  return (
    <>
      <label className={styles.toggle}>
        <input type="checkbox" checked={independentOnly} onChange={(event) => setIndependentOnly(event.target.checked)} />
        <span>independent results only</span>
      </label>
      {benchmarks.map((benchmark) => {
        const rows = leaderboard(benchmark.id, independentOnly);
        return (
          <section key={benchmark.id} className={styles.benchmark} aria-labelledby={`${benchmark.id}-heading`}>
            <div className={styles.meta}>
              <h2 id={`${benchmark.id}-heading`}><a href={benchmark.url}>{benchmark.name}</a></h2>
              <p>{benchmark.description}{benchmark.tasks ? ` ${benchmark.tasks.toLocaleString("en-US")} tasks.` : ""}</p>
              <p className={styles.caveat}>Caveat: {benchmark.caveat}</p>
            </div>
            {rows.length === 0 ? (
              <p className={styles.empty}>No independent results yet.</p>
            ) : (
              <ol className={styles.rows}>
                {rows.map(({ model, score }) => (
                  <li key={model.id} className={styles.row}>
                    <span className={styles.name}><Link href={`/models/${model.id}`}>{model.name}</Link><span className={styles.provider}>{model.provider}</span></span>
                    <span className={styles.track} aria-hidden="true"><span className={styles.bar} data-reported={score.reportedBy} style={{ width: `${score.value}%` }} /></span>
                    <span className={styles.value}>{score.value.toFixed(1)}%</span>
                    <span className={styles.badge} data-reported={score.reportedBy}>{score.reportedBy}</span>
                    <a className={styles.source} href={score.source} title={score.setting}>source</a>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </>
  );
}
