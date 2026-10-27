export type ChangeKind = "new job" | "pick changed" | "site";

export type Change = {
  /** Unique and stable: used as the RSS guid. */
  id: string;
  date: string;
  kind: ChangeKind;
  title: string;
  summary: string;
  href?: string;
};

/** Newest first. Add an entry whenever a job ships or a pick changes. */
export const changes: Change[] = [
  {
    id: "2026-09-21-test-generation",
    date: "2026-09-21",
    kind: "new job",
    title: "generate tests from existing code",
    summary: "Sonnet-class when the edge cases are subtle or flaky; a cheap model is fine for boilerplate happy-path coverage.",
    href: "/for/test-generation",
  },
  {
    id: "2026-09-21-local-vs-api",
    date: "2026-09-21",
    kind: "new job",
    title: "local vs api",
    summary: "Pick local as a constraint, not an identity: it wins on privacy and cost at volume, and loses on long context and tool-heavy loops.",
    href: "/for/local-vs-api",
  },
  {
    id: "2026-09-20-greenfield-scaffold",
    date: "2026-09-20",
    kind: "new job",
    title: "scaffold a greenfield repo",
    summary: "Scaffolding is pattern recall. Cheap models handle it; save frontier spend for unusual stacks.",
    href: "/for/greenfield-scaffold",
  },
  {
    id: "2026-09-20-tool-loop-debug",
    date: "2026-09-20",
    kind: "new job",
    title: "debug a tool loop",
    summary: "Tool loops are a judgment failure, not a speed failure. Sonnet-class models are better at stopping and replanning.",
    href: "/for/tool-loop-debug",
  },
  {
    id: "2026-09-20-refactor-pr",
    date: "2026-09-20",
    kind: "new job",
    title: "refactor a pull request",
    summary: "First page on the site. Sonnet-class for the main pass; faster models once the plan is settled.",
    href: "/for/refactor-pr",
  },
];
