"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { compareHref } from "@/content/models/compare";
import styles from "./compare.module.css";

type Option = { id: string; name: string; provider: string };

function ModelOptions({ options }: { options: Option[] }) {
  const providers = [...new Set(options.map((option) => option.provider))];
  return providers.map((provider) => (
    <optgroup key={provider} label={provider}>
      {options.filter((option) => option.provider === provider).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
    </optgroup>
  ));
}

export function AddModel({ current, options }: { current: string[]; options: Option[] }) {
  const router = useRouter();
  return (
    <label className={styles.add}>
      <span>+ add model</span>
      <select value="" onChange={(event) => event.target.value && router.push(compareHref([...current, event.target.value]))}>
        <option value="">choose…</option>
        <ModelOptions options={options} />
      </select>
    </label>
  );
}

export function RemoveModel({ current, id, name }: { current: string[]; id: string; name: string }) {
  const router = useRouter();
  return (
    <button type="button" className={styles.remove} aria-label={`Remove ${name}`} onClick={() => router.push(compareHref(current.filter((other) => other !== id)))}>
      ×
    </button>
  );
}

export function HighlightBest({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(true);
  return (
    <div className={on ? styles.highlight : undefined}>
      <label className={styles.toggle}>
        <input type="checkbox" checked={on} onChange={(event) => setOn(event.target.checked)} />
        <span>highlight best</span>
      </label>
      {children}
    </div>
  );
}

export function ModelSlots({ options, slots = 2 }: { options: Option[]; slots?: number }) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(Array(slots).fill(""));
  const chosen = picked.filter(Boolean);
  const ready = chosen.length >= 2 && new Set(chosen).size === chosen.length;
  return (
    <form
      className={styles.slots}
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) router.push(compareHref(chosen));
      }}
    >
      {picked.map((value, index) => (
        <label key={index} className={styles.slot}>
          <span>model {index + 1}</span>
          <select value={value} onChange={(event) => setPicked(picked.map((old, i) => (i === index ? event.target.value : old)))}>
            <option value="">select a model</option>
            <ModelOptions options={options.filter((option) => option.id === value || !picked.includes(option.id))} />
          </select>
        </label>
      ))}
      <button type="submit" className={styles.go} disabled={!ready}>compare</button>
    </form>
  );
}
