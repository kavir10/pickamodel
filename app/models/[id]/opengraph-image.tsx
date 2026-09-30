import { ImageResponse } from "next/og";
import { jobs } from "@/content/jobs";
import { formatPrice, formatTokens, getModel, models } from "@/content/models";
import { jobsForModel } from "@/content/models/use-cases";

export const alt = "pickamodel.dev model card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return models.map(({ id }) => ({ id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const model = getModel((await params).id);
  const name = model?.name ?? "model not found";
  const topFor = model ? [...new Set(jobsForModel(model.id, jobs).map(({ job }) => job.title))].slice(0, 3) : [];
  const facts = model
    ? [
        model.price ? `${formatPrice(model.price.input)} / ${formatPrice(model.price.output)} per 1M tokens` : "open weights, self-host",
        `${formatTokens(model.contextWindow)} context`,
        model.openWeight ? "open weights" : model.provider,
      ]
    : [];
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 72px", background: "#f7f6f1", color: "#181816", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", color: "#315c45", fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>pickamodel.dev / models</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 88, letterSpacing: -3, lineHeight: 1.02 }}>{name}</div>
          <div style={{ display: "flex", color: "#69675f", fontSize: 32 }}>{facts.join(" · ")}</div>
        </div>
        <div style={{ display: "flex", paddingTop: 22, borderTop: "3px solid #181816", fontSize: 28 }}>
          {topFor.length > 0 ? `a top pick for: ${topFor.join(", ")}` : "prices, limits, and sourced coding benchmarks"}
        </div>
      </div>
    ),
    size,
  );
}
