import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "./site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://pickamodel.dev"),
  title: { default: "pickamodel.dev", template: "%s · pickamodel.dev" },
  description: "Pick the model for the coding job — not the hype thread.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body><SiteHeader />{children}</body></html>;
}
