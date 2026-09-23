import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, getRelatedJobs, jobs } from "@/content/jobs";

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
        <p className="fine-print">We’d pick based on the job’s context, judgment, speed, and cost. These are editorial starting points from agent coding work, not benchmarks or paid placements.</p>
      </footer>
    </main>
  );
}
