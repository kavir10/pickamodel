import type { Metadata } from "next";
import Link from "next/link";
import { dataAsOf, formatPrice, formatTokens, models } from "@/content/models";
import styles from "./models.module.css";

export const metadata: Metadata = {
  title: "models",
  description: "Current coding models with list price, context window, and license, each linked to its sourced benchmark scores.",
  alternates: { canonical: "/models" },
};

const classLabel = { frontier: "frontier", fast: "fast / cheap", "open-weight": "open weights" } as const;

export default function ModelsPage() {
  const groups = (["frontier", "fast", "open-weight"] as const).map((modelClass) => ({
    modelClass,
    models: models.filter((model) => model.class === modelClass).sort((a, b) => b.released.localeCompare(a.released)),
  }));
  return (
    <main className="shell">
      <Link className="back-link" href="/">← all jobs</Link>
      <header className="job-header">
        <h1>models</h1>
        <p className="lede">The models worth considering for coding agents right now, with list price and limits. Open one for its benchmark scores, or <Link href="/compare">compare them</Link>.</p>
      </header>
      {groups.map((group) => (
        <section key={group.modelClass} aria-labelledby={`${group.modelClass}-heading`}>
          <h2 id={`${group.modelClass}-heading`} className={styles.group}>{classLabel[group.modelClass]}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">model</th><th scope="col">provider</th><th scope="col">context</th><th scope="col">input / 1M</th><th scope="col">output / 1M</th><th scope="col">released</th></tr>
              </thead>
              <tbody>
                {group.models.map((model) => (
                  <tr key={model.id}>
                    <th scope="row"><Link href={`/models/${model.id}`}>{model.name}</Link></th>
                    <td>{model.provider}</td>
                    <td>{formatTokens(model.contextWindow)}</td>
                    <td>{model.price ? formatPrice(model.price.input) : "—"}</td>
                    <td>{model.price ? formatPrice(model.price.output) : "—"}</td>
                    <td><time dateTime={model.released}>{model.released}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <footer>
        <p>data checked <time dateTime={dataAsOf}>{dataAsOf}</time></p>
        <p className="fine-print">List prices in USD from each vendor’s pricing page. Open-weight models show the vendor’s own API price where one exists. Self-hosting cost depends on your hardware.</p>
      </footer>
    </main>
  );
}
