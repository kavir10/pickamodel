import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pickamodel.dev"),
  title: { default: "pickamodel.dev", template: "%s · pickamodel.dev" },
  description: "Pick the model for the coding job — not the hype thread.",
  alternates: { types: { "application/rss+xml": [{ url: "/feed.xml", title: "pickamodel.dev: what changed" }] } },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="site-footer">
          <Link href="/">all jobs</Link>
          <Link href="/changelog">what changed</Link>
          <a href="/feed.xml">rss</a>
        </footer>
      </body>
    </html>
  );
}
