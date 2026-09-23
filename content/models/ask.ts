import type { Constraints, Pool } from "./use-cases.ts";

/**
 * Turns a plain-language question ("cheapest model to fix a failing CI build that runs locally") into
 * a job slug and constraints. Deterministic keyword rules, so the reading is predictable and shown back
 * to the person asking; anything it can't read is left unset rather than guessed.
 */

// Order matters: more specific jobs first ("failing tests in CI" is a CI job, not test generation).
const jobRules: [string, RegExp][] = [
  ["fix-ci", /\bci\b|continuous integration|build (is )?(failing|broken|red)|failing build|red build|pipeline|github actions/i],
  ["tool-loop-debug", /tool[- ]?loop|stuck in a loop|loops? forever|keeps calling|calling (the same )?tools? (over|again)/i],
  ["parallel-subagents", /sub-?agents?|in parallel|parallel agents|orchestrat|multi-?agent|swarm|workers?\b/i],
  ["long-running-task", /long[- ]running|autonomous|overnight|for hours|hours[- ]long|background agent|walk away|unattended/i],
  ["dependency-upgrade", /upgrad|migrat|bump|major version|breaking changes?|deprecat/i],
  ["codebase-onboarding", /understand|onboard|unfamiliar|inherited|read (our|the|my|a|this) (whole |entire )?(code|repo|codebase)|new (to|codebase)|explain (the|this|a) (code|repo|codebase)|how .* fits together/i],
  ["ui-from-design", /figma|mock-?up|from (a )?design|screenshot|frontend|front-end|\bui\b|\bcss\b|components?/i],
  ["pr-review", /code review|review (a |my |the )?(pr|pull request|diff|code)|reviewing/i],
  ["refactor-pr", /refactor|restructur|clean(ing)? up|rename|multi-file change|pull request|\bpr\b/i],
  ["test-generation", /tests?\b|coverage|test suite|unit test/i],
  ["greenfield-scaffold", /scaffold|boilerplate|greenfield|bootstrap|new (repo|project|app|service)|start(ing)? (a )?(new )?project/i],
  ["local-vs-api", /local (vs|or|versus) (api|cloud)|(api|cloud) (vs|or|versus) local/i],
];

const poolRules: [Pool, RegExp][] = [
  ["local", /\blocal(ly)?\b|offline|on my (own )?(machine|laptop|computer|gpu|mac)|air-?gapped|on-?prem|can'?t leave|private code|no api/i],
  ["fast", /cheap|budget|inexpensive|low[- ]cost|affordable|fast(est)?\b|quick|high[- ]volume|bulk/i],
];
// "Best" doesn't filter: rankings already put the strongest first, and filtering to frontier API models
// would wrongly drop open-weight or cheap models that score well.
const wantsBest = /\bbest\b|strongest|smartest|most capable|top model|highest quality|frontier|hardest/i;

export type AskReading = Constraints & { job?: string; understood: string[] };

export function readQuestion(question: string, knownJobs: string[]): AskReading {
  const q = question.trim();
  const understood: string[] = [];
  const reading: AskReading = { understood };

  const job = jobRules.find(([slug, pattern]) => knownJobs.includes(slug) && pattern.test(q));
  if (job) reading.job = job[0];

  const pool = poolRules.find(([, pattern]) => pattern.test(q));
  if (pool) {
    reading.pool = pool[0];
    understood.push(pool[0] === "local" ? "runs on your machine" : "cheap and fast");
  } else if (wantsBest.test(q)) {
    understood.push("strongest first");
  }

  const price = q.match(/(?:under|below|less than|max(?:imum)?|at most|<)\s*\$\s?(\d+(?:\.\d+)?)/i) ?? q.match(/\$\s?(\d+(?:\.\d+)?)\s*(?:\/|per)\s*(?:1?m|million)/i);
  if (price) {
    reading.maxInputPrice = Number(price[1]);
    understood.push(`input price at most $${price[1]} per 1M tokens`);
  }

  const context = q.match(/(\d+(?:\.\d+)?)\s*(k|m)\b[^.]*context|context[^.]*?(\d+(?:\.\d+)?)\s*(k|m)\b/i);
  if (context) {
    const [amount, unit] = context[1] ? [context[1], context[2]] : [context[3], context[4]];
    reading.minContext = Number(amount) * (unit.toLowerCase() === "m" ? 1_000_000 : 1_000);
    understood.push(`context of at least ${amount}${unit.toUpperCase()} tokens`);
  } else if (/long context|large context|huge context|whole (repo|codebase)/i.test(q)) {
    reading.minContext = 500_000;
    understood.push("context of at least 500K tokens");
  }

  if (/open[- ]?(weights?|source)|self[- ]?host|download(able)? (the )?weights/i.test(q)) {
    reading.openWeightsOnly = true;
    understood.push("open weights only");
  }

  return reading;
}
