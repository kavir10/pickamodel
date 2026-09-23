import { ImageResponse } from "next/og";

export const shareCardSize = { width: 1200, height: 630 };

type ShareCardProps = { title: string; subtitle: string; footer?: string };

/** 1200×630 card used for Open Graph and Twitter previews. */
export function shareCard({ title, subtitle, footer }: ShareCardProps) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "72px 80px", background: "#f7f6f1", color: "#181816", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", color: "#315c45", fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>pickamodel.dev</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: title.length > 28 ? 76 : 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02 }}>{title}</div>
          <div style={{ display: "flex", maxWidth: 980, color: "#69675f", fontSize: 34, lineHeight: 1.3 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", paddingTop: 24, borderTop: "3px solid #181816", fontSize: 28 }}>{footer ?? "Pick the model for the coding job — not the hype thread."}</div>
      </div>
    ),
    shareCardSize,
  );
}
