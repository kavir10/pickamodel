"use client";

import Link from "next/link";
import { useState } from "react";
import { pickFor, type PickMode } from "@/content/jobs";
import type { Job } from "@/content/jobs/types";
import styles from "./job-finder.module.css";

const modes: { value: PickMode; label: string }[] = [
  { value: "best", label: "best result" },
  { value: "cheapest", label: "cheapest that works" },
  { value: "local", label: "code stays local" },
];

export function JobFinder({ jobs }: { jobs: Job[] }) {
  const [mode, setMode] = useState<PickMode>("best");

  return (
    <section className={styles.finder} aria-labelledby="finder-heading">
      <h2 id="finder-heading" className={styles.heading}>pick by job</h2>
      <fieldset className={styles.modes}>
        <legend>optimize for</legend>
        {modes.map((option) => (
          <label key={option.value} className={styles.mode}>
            <input type="radio" name="mode" value={option.value} checked={mode === option.value} onChange={() => setMode(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <ul className={styles.cards}>
        {jobs.map((job) => {
          const pick = pickFor(job, mode);
          return (
            <li key={job.slug}>
              <Link className={styles.card} href={`/for/${job.slug}`}>
                <span className={styles.title}>{job.title}</span>
                <span className={styles.oneLiner}>{job.oneLiner}</span>
                {pick ? (
                  <span className={styles.pick}>
                    <span className={styles.pickLabel}>pick</span> {pick.model} <span className={styles.cost}>{pick.costVibe}</span>
                    <span className={styles.when}>{pick.bestWhen}</span>
                  </span>
                ) : (
                  <span className={styles.pick}>No pick for this constraint yet.</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
