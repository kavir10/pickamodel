import type { Metadata } from "next";
import { Suspense } from "react";
import { dataAsOf } from "@/content/models";
import { defaultState, Finder, FinderView } from "./finder";

export const metadata: Metadata = {
  title: "find a model",
  description: "Pick a coding job and your constraints (price, context window, open weights, local) and get current models ranked by the benchmark closest to that job.",
  alternates: { canonical: "/pick" },
};

export default function PickPage() {
  return (
    <main className="shell job-page">
      <header className="job-header">
        <h1>find a model</h1>
        <p className="lede">Choose the job and your constraints. You get current models ranked by the benchmark closest to that job, with prices and sources. The URL updates, so you can share the result.</p>
      </header>
      <Suspense fallback={<FinderView state={defaultState} />}>
        <Finder />
      </Suspense>
      <footer>
        <p>data checked <time dateTime={dataAsOf}>{dataAsOf}</time></p>
        <p className="fine-print">Rankings only compare scores from one benchmark at a time. Independent results rank ahead of vendor self-runs when there are at least two to compare. Agents can get the same answer from /api/recommend or the MCP tool recommend_model.</p>
      </footer>
    </main>
  );
}
