"use client";

import { useState } from "react";
import { formatPrice } from "@/content/models";
import { usageCost, type Usage } from "@/content/models/compare";
import type { Model } from "@/content/models/types";
import styles from "./compare.module.css";

// Example volumes to start from, not measurements; people should type their own.
const examples: { label: string; usage: Usage }[] = [
  { label: "light", usage: { inputMillions: 20, outputMillions: 2, cachedShare: 0.5 } },
  { label: "daily agent use", usage: { inputMillions: 200, outputMillions: 15, cachedShare: 0.6 } },
  { label: "team", usage: { inputMillions: 2000, outputMillions: 150, cachedShare: 0.6 } },
];

const money = (usd: number) => (usd >= 100 ? `$${Math.round(usd).toLocaleString("en-US")}` : formatPrice(Math.round(usd * 100) / 100));

export function CostCalculator({ models }: { models: Model[] }) {
  const [usage, setUsage] = useState<Usage>(examples[1].usage);
  const rows = models
    .map((model) => ({ model, cost: usageCost(model, usage) }))
    .sort((a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity));
  const max = Math.max(...rows.map((r) => r.cost ?? 0), 1);
  const cheapest = rows[0]?.cost;
  const number = (value: string) => (Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0);

  return (
    <section className={styles.calculator} aria-labelledby="cost-heading">
      <h2 id="cost-heading">your monthly cost</h2>
      <p className={styles.verdictNote}>At list price for your volume. Cached input uses the vendor’s cached price where one is published. Long-context surcharges and batch discounts aren’t included; see each model’s pricing notes.</p>
      <div className={styles.usageRow}>
        <label className={styles.usageField}>
          <span>input tokens / month (millions)</span>
          <input type="number" min={0} inputMode="decimal" value={usage.inputMillions} onChange={(e) => setUsage({ ...usage, inputMillions: number(e.target.value) })} />
        </label>
        <label className={styles.usageField}>
          <span>output tokens / month (millions)</span>
          <input type="number" min={0} inputMode="decimal" value={usage.outputMillions} onChange={(e) => setUsage({ ...usage, outputMillions: number(e.target.value) })} />
        </label>
        <label className={styles.usageField}>
          <span>cache hit rate: {Math.round(usage.cachedShare * 100)}%</span>
          <input type="range" min={0} max={0.95} step={0.05} value={usage.cachedShare} onChange={(e) => setUsage({ ...usage, cachedShare: Number(e.target.value) })} />
        </label>
      </div>
      <p className={styles.examples}>
        examples:{" "}
        {examples.map((example) => (
          <button key={example.label} type="button" className={styles.exampleButton} onClick={() => setUsage(example.usage)}>
            {example.label} ({example.usage.inputMillions}M in / {example.usage.outputMillions}M out)
          </button>
        ))}
      </p>
      <ol className={styles.costList}>
        {rows.map(({ model, cost }) => (
          <li key={model.id} className={styles.costRow}>
            <span className={styles.costName}>
              {model.name}
              {model.price && model.price.cachedInput === undefined && usage.cachedShare > 0 && <span className={styles.sub}>no cached price published</span>}
            </span>
            <span className={cost === null ? undefined : styles.costTrack} aria-hidden="true">{cost !== null && <span className={styles.costBar} style={{ width: `${(cost / max) * 100}%` }} />}</span>
            <span className={styles.costValue}>
              {cost === null ? "self-host" : money(cost)}
              {cost !== null && cheapest != null && cost > cheapest && cheapest > 0 && <span className={styles.sub}>{(cost / cheapest).toFixed(1)}× the cheapest</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
