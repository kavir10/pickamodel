import { jobs } from "@/content/jobs";
import { JobFinder } from "./job-finder";

export default function HomePage() {
  return (
    <main className="shell hub">
      <header>
        <p className="eyebrow">pickamodel.dev</p>
        <h1>which model for coding agents</h1>
        <p className="lede">Pick the model for the coding job — not the hype thread.</p>
      </header>
      {jobs.length === 0 ? <p className="empty">pages coming</p> : <JobFinder jobs={jobs} />}
    </main>
  );
}
