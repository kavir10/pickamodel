import { changes } from "@/content/changelog";

export const dynamic = "force-static";

const baseUrl = "https://pickamodel.dev";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function GET() {
  const items = changes
    .map((change) => {
      const link = `${baseUrl}${change.href ?? "/changelog"}`;
      return `    <item>
      <title>${escapeXml(`${change.kind}: ${change.title}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${escapeXml(change.id)}</guid>
      <pubDate>${new Date(`${change.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(change.summary)}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = changes[0] ? new Date(`${changes[0].date}T00:00:00Z`).toUTCString() : new Date(0).toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>pickamodel.dev: what changed</title>
    <link>${baseUrl}/changelog</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>New jobs and changed model picks for coding agents.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
