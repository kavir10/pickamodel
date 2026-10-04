import type { Metadata } from "next";
import Link from "next/link";
import { changes } from "@/content/changelog";

export const metadata: Metadata = {
  title: "what changed",
  description: "New jobs and changed picks on pickamodel.dev, newest first.",
  alternates: { canonical: "/changelog", types: { "application/rss+xml": "/feed.xml" } },
};

export default function ChangelogPage() {
  return (
    <main className="shell hub">
      <Link className="back-link" href="/">← all jobs</Link>
      <header>
        <h1>what changed</h1>
        <p className="lede">New jobs and changed picks, newest first. Follow along with the <a href="/feed.xml">RSS feed</a>.</p>
      </header>
      <ol className="change-list">
        {changes.map((change) => (
          <li key={change.id}>
            <p className="change-meta"><time dateTime={change.date}>{change.date}</time><span aria-hidden="true"> · </span>{change.kind}</p>
            <h2>{change.href ? <Link href={change.href}>{change.title}</Link> : change.title}</h2>
            <p>{change.summary}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
