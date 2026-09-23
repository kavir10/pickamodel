import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "./site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://pickamodel.dev"),
  title: { default: "pickamodel.dev", template: "%s · pickamodel.dev" },
  description: "Pick the model for the coding job — not the hype thread.",
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/feed.xml", title: "pickamodel.dev: what changed" }] } },
  openGraph: { type: "website", siteName: "pickamodel.dev", url: "/" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
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
