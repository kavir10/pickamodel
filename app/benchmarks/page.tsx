import type { Metadata } from "next";
import Link from "next/link";
import { dataAsOf } from "@/content/models";
import { BenchmarkBoard } from "./benchmark-board";
import { PriceScoreChart } from "./price-score-chart";

export const metadata: Metadata = {
  title: "coding benchmarks",
  description: "Published coding-agent benchmark scores for current models, each with its source and whether the vendor or an independent leaderboard ran it.",
  alternates: { canonical: "/benchmarks" },
};

export default function BenchmarksPage() {
  return (
    <main className="shell">
      <Link className="back-link" href="/">← all jobs</Link>
      <header className="job-header">
        <h1>coding benchmarks</h1>
        <p className="lede">Every published score we could source for current models, with a link to where it came from. Harnesses and effort levels differ, so compare models within a benchmark, not across benchmarks.</p>
      </header>
      <section className="value-section" aria-labelledby="value-heading">
        <h2 id="value-heading">score for the money</h2>
        <PriceScoreChart />
      </section>
      <h2 className="value-section">every benchmark</h2>
      <BenchmarkBoard />
      <footer>
        <p>data checked <time dateTime={dataAsOf}>{dataAsOf}</time></p>
        <p className="fine-print">“Vendor” means the model’s maker published the number in a launch post or model card. “Independent” means a public leaderboard ran it. Hover or tap a score’s source link to see the harness and settings. Missing scores mean nobody we trust has published one, not that the model scored zero.</p>
      </footer>
    </main>
  );
}
