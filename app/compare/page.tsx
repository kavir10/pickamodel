import type { Metadata } from "next";
import Link from "next/link";
import { getModel, models } from "@/content/models";
import { compareHref } from "@/content/models/compare";
import { presets } from "@/content/models/presets";
import { ModelSlots } from "./compare-controls";
import styles from "./compare.module.css";

export const metadata: Metadata = {
  title: "compare models",
  description: "Compare coding models side by side: list price, context window, and sourced coding benchmarks.",
  alternates: { canonical: "/compare" },
};

export default function CompareLandingPage() {
  const options = models.map((model) => ({ id: model.id, name: model.name, provider: model.provider }));
  return (
    <main className={`shell ${styles.page}`}>
      <Link className="back-link" href="/">← all jobs</Link>
      <header className={styles.header}>
        <h1 className={styles.title}>compare models</h1>
        <p className="lede">Pick two to four models to see list price, context window, and every coding benchmark we could source, side by side. Or start from a preset. See all scores on <Link href="/benchmarks">benchmarks</Link>.</p>
      </header>
      <ModelSlots options={options} />
      <ul className={styles.presets}>
        {presets.map((preset) => (
          <li key={preset.title}>
            <Link className={styles.preset} href={compareHref(preset.models)}>
              <span className={styles.presetTitle}>{preset.title}</span>
              <span className={styles.sub}>{preset.description}</span>
              <span className={styles.presetModels}>{preset.models.map((id) => getModel(id)?.name).join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
