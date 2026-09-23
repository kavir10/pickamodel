import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, getRelatedJobs, jobs } from "@/content/jobs";
import { dataAsOf, formatPrice } from "@/content/models";
import { compareHref } from "@/content/models/compare";
import { rankForJob } from "@/content/models/use-cases";
import styles from "./job.module.css";

type JobPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return jobs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = getJob((await params).slug);
  if (!job) return { title: "page not found" };
  const url = `/for/${job.slug}`;
  return {
    title: job.title,
    description: job.oneLiner,
    alternates: { canonical: url },
    openGraph: { type: "article", siteName: "pickamodel.dev", url, title: job.title, description: job.oneLiner, modifiedTime: job.lastUpdated },
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const job = getJob((await params).slug);
  if (!job) notFound();
  const relatedJobs = getRelatedJobs(job);
  const rankings = job.recommendations.map((rec) => ({ rec, ...rankForJob(job, rec) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: job.title,
    description: job.oneLiner,
    dateModified: job.lastUpdated,
    url: `https://pickamodel.dev/for/${job.slug}`,
    publisher: { "@type": "Organization", name: "pickamodel.dev", url: "https://pickamodel.dev" },
  };

  return (
    <main className="shell job-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link className="back-link" href="/">← all jobs</Link>
      <header className="job-header">
        <h1>{job.title}</h1>
        <p className="lede">{job.oneLiner}</p>
      </header>
      <section aria-labelledby="recommendations-heading">
        <h2 id="recommendations-heading">recs</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th scope="col">model</th><th scope="col">best when</th><th scope="col">avoid when</th><th scope="col">cost vibe</th></tr></thead>
            <tbody>
              {job.recommendations.map((rec) => (
                <tr key={rec.model}><th scope="row">{rec.model}</th><td>{rec.bestWhen}</td><td>{rec.avoidWhen}</td><td>{rec.costVibe}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="today-heading">
        <h2 id="today-heading">which models that means today</h2>
        <p className={styles.intro}>Current models in each class, ranked by the benchmark closest to this job. Scores link to their source; hatched bars are vendor-reported.</p>
        <div className={styles.pools}>
          {rankings.map(({ rec, benchmark, ranked }) => (
            <div key={rec.model} className={styles.pool}>
              <h3>{rec.model}</h3>
              <p className={styles.rankedBy}>{benchmark ? <>ranked by <a href={benchmark.url}>{benchmark.name}</a></> : "no shared benchmark yet: newest first"}</p>
              <ol className={styles.models}>
                {ranked.map(({ model, score }) => (
                  <li key={model.id}>
                    <Link className={styles.modelName} href={`/models/${model.id}`}>{model.name}</Link>
                    <span className={styles.meta}>
                      {model.provider} · {model.price ? `${formatPrice(model.price.input)} / ${formatPrice(model.price.output)}` : "self-host"}
                    </span>
                    {score ? (
                      <span className={styles.score}>
                        <span className={styles.track} aria-hidden="true"><span className={styles.bar} data-reported={score.reportedBy} style={{ width: `${score.value}%` }} /></span>
                        <a href={score.source} title={score.setting}>{score.value.toFixed(1)}%</a>
                      </span>
                    ) : (
                      benchmark && <span className={styles.meta}>not scored on {benchmark.name}</span>
                    )}
                  </li>
                ))}
              </ol>
              {ranked.length >= 2 && <Link className={styles.compare} href={compareHref(ranked.map(({ model }) => model.id))}>compare these →</Link>}
            </div>
          ))}
        </div>
        <p className={styles.asOf}>model data checked <time dateTime={dataAsOf}>{dataAsOf}</time> · <Link href="/benchmarks">all benchmarks</Link></p>
      </section>
      <section aria-labelledby="why-heading">
        <h2 id="why-heading">why</h2>
        <ul className="why-list">{job.why.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      </section>
      {relatedJobs.length > 0 && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading">related jobs</h2>
          <ul className="related-list">
            {relatedJobs.map((related) => <li key={related.slug}><Link href={`/for/${related.slug}`}>{related.title}</Link></li>)}
          </ul>
        </section>
      )}
      <footer id="how-we-pick">
        <p>last updated <time dateTime={job.lastUpdated}>{job.lastUpdated}</time><span aria-hidden="true"> · </span><a href="#how-we-pick">how we pick</a></p>
        <p className="fine-print">We’d pick based on the job’s context, judgment, speed, and cost. The recs are editorial starting points from agent coding work, not paid placements. The model lists under them come from published benchmarks.</p>
      </footer>
    </main>
  );
}
