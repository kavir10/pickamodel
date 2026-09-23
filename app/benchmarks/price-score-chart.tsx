"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/content/models";
import { chartableBenchmarks, priceFrontier, valuePoints, type ValuePoint } from "@/content/models/value";
import styles from "./price-score-chart.module.css";

const M = { top: 20, right: 16, bottom: 52, left: 44 };
const X_TICKS = [1, 3, 10, 30, 100, 300];
const LABEL_H = 16;
const labelWidth = (text: string) => text.length * 7.4 + 4;

type Box = { x: number; y: number; w: number; h: number };
const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Place each label at the first candidate spot that clears earlier labels, the dots, and the plot edges. */
function placeLabels(items: { id: string; text: string; cx: number; cy: number }[], dots: { cx: number; cy: number }[], width: number, height: number) {
  const placed: (Box & { id: string; text: string; anchor: "start" | "end" })[] = [];
  const dotBoxes = dots.map((d) => ({ x: d.cx - 7, y: d.cy - 7, w: 14, h: 14 }));
  for (const item of items) {
    const w = labelWidth(item.text);
    const candidates: { x: number; y: number; anchor: "start" | "end" }[] = [
      { x: item.cx + 9, y: item.cy - LABEL_H - 6, anchor: "start" },
      { x: item.cx - 9 - w, y: item.cy - LABEL_H - 6, anchor: "end" },
      { x: item.cx + 9, y: item.cy + 6, anchor: "start" },
      { x: item.cx - 9 - w, y: item.cy + 6, anchor: "end" },
      { x: item.cx + 11, y: item.cy - LABEL_H / 2, anchor: "start" },
      { x: item.cx - 11 - w, y: item.cy - LABEL_H / 2, anchor: "end" },
    ];
    const fits = (c: (typeof candidates)[number]) => {
      const box = { x: c.x, y: c.y, w, h: LABEL_H };
      const inside = box.x >= 0 && box.x + box.w <= width && box.y >= 0 && box.y + box.h <= height - M.bottom;
      return inside && !placed.some((p) => overlaps(p, box)) && !dotBoxes.some((d) => overlaps(d, box));
    };
    const spot = candidates.find(fits);
    if (spot) placed.push({ id: item.id, text: item.text, x: spot.x, y: spot.y, w, h: LABEL_H, anchor: spot.anchor });
  }
  return placed;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export function PriceScoreChart({ initial = "frontiercode-1-1" }: { initial?: string }) {
  const options = chartableBenchmarks();
  const [benchmarkId, setBenchmarkId] = useState(options.some((b) => b.id === initial) ? initial : options[0]?.id);
  const [active, setActive] = useState<string | null>(null);
  const [plotRef, W] = useWidth<HTMLDivElement>();
  const H = Math.round(Math.min(460, Math.max(300, W * 0.55)));
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const benchmark = options.find((b) => b.id === benchmarkId);
  if (!benchmark) return null;

  const points = valuePoints(benchmark.id);
  const independent = points.filter((p) => p.score.reportedBy === "independent");
  // Vendor self-runs use their own harness; when there are enough independent results, only those define the frontier.
  const frontierFromIndependent = independent.length >= 3;
  const frontier = priceFrontier(frontierFromIndependent ? independent : points);
  const onFrontier = new Set(frontier.map((p) => p.model.id));

  const [xMin, xMax] = [Math.log10(X_TICKS[0]), Math.log10(X_TICKS[X_TICKS.length - 1])];
  const top = Math.max(...points.map((p) => p.score.value));
  const yStep = top > 50 ? 20 : 10;
  const yMax = Math.min(100, Math.ceil((top + 4) / yStep) * yStep);
  const x = (cost: number) => M.left + ((Math.log10(Math.min(Math.max(cost, X_TICKS[0]), X_TICKS[X_TICKS.length - 1])) - xMin) / (xMax - xMin)) * plotW;
  const y = (value: number) => M.top + plotH - (value / yMax) * plotH;
  const yTicks = Array.from({ length: yMax / yStep + 1 }, (_, i) => i * yStep);
  const activePoint = points.find((p) => p.model.id === active);
  const steps = frontier.map((p, i) => `${i === 0 ? "M" : "H"}${x(p.cost)}${i === 0 ? ` ${y(p.score.value)}` : ` V${y(p.score.value)}`}`).join(" ");
  const cheapest = frontier[0];
  const best = frontier[frontier.length - 1];

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <label className={styles.select}>
          <span>benchmark</span>
          <select value={benchmark.id} onChange={(event) => { setBenchmarkId(event.target.value); setActive(null); }}>
            {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </label>
        <p className={styles.key} aria-hidden="true">
          <span><svg width="12" height="12"><circle cx="6" cy="6" r="4.5" className={styles.dotFilled} /></svg> independent</span>
          <span><svg width="12" height="12"><circle cx="6" cy="6" r="4" className={styles.dotHollow} /></svg> vendor-reported</span>
          <span><svg width="22" height="12"><path d="M1 9 H11 V3 H21" className={styles.frontier} /></svg> best score for the price</span>
        </p>
      </div>
      <div className={styles.plot} ref={plotRef}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${benchmark.name} score against the cost of 10M input and 1M output tokens, ${points.length} models`}>
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className={styles.grid} />
              <text x={M.left - 8} y={y(t)} className={styles.tick} textAnchor="end" dominantBaseline="middle">{t}%</text>
            </g>
          ))}
          {X_TICKS.filter((t) => W >= 520 || t !== 3).map((t) => (
            <text key={`x${t}`} x={x(t)} y={H - M.bottom + 18} className={styles.tick} textAnchor="middle">${t}</text>
          ))}
          <text x={M.left + plotW / 2} y={H - 8} className={styles.axisLabel} textAnchor="middle">{W < 520 ? "cost, 10M in + 1M out (log)" : "cost of 10M input + 1M output tokens at list price (log scale)"}</text>
          <path d={steps} className={styles.frontier} />
          {points.map((p) => (
            <circle key={p.model.id} cx={x(p.cost)} cy={y(p.score.value)} r={p.score.reportedBy === "vendor" ? 5 : 5.5} className={p.score.reportedBy === "vendor" ? styles.dotHollow : styles.dotFilled} data-active={active === p.model.id || undefined} />
          ))}
          {placeLabels(
            frontier.map((p) => ({ id: p.model.id, text: p.model.name, cx: x(p.cost), cy: y(p.score.value) })),
            points.map((p) => ({ cx: x(p.cost), cy: y(p.score.value) })),
            W,
            H,
          ).map((label) => (
            <text key={`l${label.id}`} x={label.anchor === "start" ? label.x : label.x + label.w} y={label.y + LABEL_H - 3} textAnchor={label.anchor} className={styles.label}>{label.text}</text>
          ))}
          {points.map((p) => (
            <circle
              key={`hit${p.model.id}`}
              cx={x(p.cost)}
              cy={y(p.score.value)}
              r={12}
              className={styles.hit}
              tabIndex={0}
              aria-label={`${p.model.name}: ${p.score.value.toFixed(1)}%, ${formatPrice(p.cost)}, ${p.score.reportedBy}`}
              onPointerEnter={() => setActive(p.model.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(p.model.id)}
              onBlur={() => setActive(null)}
            />
          ))}
        </svg>
        {activePoint && <Tooltip point={activePoint} left={(x(activePoint.cost) / W) * 100} top={(y(activePoint.score.value) / H) * 100} frontier={onFrontier.has(activePoint.model.id)} />}
      </div>
      <figcaption className={styles.caption}>
        {cheapest && best && cheapest !== best ? (
          <>On {benchmark.name}, <Link href={`/models/${cheapest.model.id}`}>{cheapest.model.name}</Link> scores {cheapest.score.value.toFixed(1)}% for {formatPrice(cheapest.cost)}; the top score, {best.score.value.toFixed(1)}% from <Link href={`/models/${best.model.id}`}>{best.model.name}</Link>, costs {formatPrice(best.cost)}. </>
        ) : null}
        {frontierFromIndependent ? "The frontier uses independent results only." : "Too few independent results here, so vendor-reported scores are included in the frontier."} Models without a list price (self-hosted open weights) are not plotted. Every value is in the leaderboards below.
      </figcaption>
    </figure>
  );
}

function Tooltip({ point, left, top, frontier }: { point: ValuePoint; left: number; top: number; frontier: boolean }) {
  return (
    <div className={styles.tooltip} style={{ left: `${left}%`, top: `${top}%` }} role="status">
      <strong>{point.score.value.toFixed(1)}%</strong> <span className={styles.muted}>{point.score.reportedBy}</span>
      <span className={styles.tipName}>{point.model.name}</span>
      <span className={styles.muted}>{formatPrice(point.cost)} for 10M in + 1M out{frontier ? " · on the frontier" : ""}</span>
    </div>
  );
}
