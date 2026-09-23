import { ImageResponse } from "next/og";
import { formatPrice, formatTokens } from "@/content/models";
import { compareHref, parseCompareSlug } from "@/content/models/compare";
import { presets } from "@/content/models/presets";

export const alt = "pickamodel.dev model comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamicParams = true;

export function generateStaticParams() {
  return presets.map((preset) => ({ models: compareHref(preset.models).replace("/compare/", "") }));
}

export default async function Image({ params }: { params: Promise<{ models: string }> }) {
  const models = parseCompareSlug((await params).models) ?? [];
  const title = models.map((model) => model.name).join(" vs ") || "compare models";
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 72px", background: "#f7f6f1", color: "#181816", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", color: "#315c45", fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>pickamodel.dev / compare</div>
        <div style={{ display: "flex", fontSize: title.length > 40 ? 60 : 76, letterSpacing: -2, lineHeight: 1.05 }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", borderTop: "3px solid #181816" }}>
          {models.map((model) => (
            <div key={model.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #d9d7cf", fontSize: 28 }}>
              <span style={{ display: "flex" }}>{model.name}</span>
              <span style={{ display: "flex", color: "#69675f" }}>
                {model.price ? `${formatPrice(model.price.input)} / ${formatPrice(model.price.output)} per 1M` : "open weights, self-host"} · {formatTokens(model.contextWindow)} context
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
