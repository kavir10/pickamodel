import { benchmarkData, compareData, jobData, modelData, recommendData, siteUrl } from "./api.ts";
import { compareSlug, MAX_COMPARE } from "./compare.ts";
import { benchmarks, dataAsOf, getModel, models } from "./index.ts";
import { getJob, jobs } from "../jobs";

/**
 * A stateless MCP server (Streamable HTTP transport, JSON responses). Read-only tools over the same
 * data as the site and the JSON API. Spec: https://modelcontextprotocol.io/specification
 */

const SUPPORTED_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const serverInfo = { name: "pickamodel", title: "pickamodel.dev", version: dataAsOf };

type JsonRpcRequest = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> };
type JsonRpcResponse = { jsonrpc: "2.0"; id: string | number | null; result?: unknown; error?: { code: number; message: string } };

const jobSlugs = () => jobs.map((job) => job.slug);
const modelIds = () => models.map((model) => model.id);

export const tools = [
  {
    name: "recommend_model",
    title: "Recommend a model for a coding job",
    description:
      "Rank current models for a coding-agent job, optionally filtered by pool, price, context window, or open weights. Returns the editorial recommendation, the benchmark used for ranking (with its caveat), and each model's score, price, and source link.",
    inputSchema: {
      type: "object",
      properties: {
        job: { type: "string", enum: jobSlugs(), description: "The coding job." },
        pool: { type: "string", enum: ["frontier", "fast", "local"], description: "frontier = strongest API models, fast = cheap API models, local = fits on one machine." },
        maxInputPrice: { type: "number", description: "Highest list price per 1M input tokens, USD." },
        minContext: { type: "number", description: "Smallest context window, tokens." },
        openWeightsOnly: { type: "boolean", description: "Only models with downloadable weights." },
        limit: { type: "number", minimum: 1, maximum: 10, description: "Models to return (default 5)." },
      },
      required: ["job"],
    },
  },
  {
    name: "compare_models",
    title: "Compare models side by side",
    description: "Side-by-side prices, limits, licenses, and every sourced benchmark score for 2–4 models, plus which of them to pick for each coding job (byJob) and the comparison page URL.",
    inputSchema: {
      type: "object",
      properties: { models: { type: "array", items: { type: "string", enum: modelIds() }, minItems: 2, maxItems: MAX_COMPARE, description: "Model ids." } },
      required: ["models"],
    },
  },
  {
    name: "get_model",
    title: "Get one model",
    description: "Everything known about one model: API id, prices, context, license, pricing quirks, and every benchmark score with its source and setting.",
    inputSchema: { type: "object", properties: { id: { type: "string", enum: modelIds() } }, required: ["id"] },
  },
  {
    name: "get_job",
    title: "Get one coding job",
    description: "A job's editorial recommendations (best when / avoid when / cost) and the current models behind each recommendation.",
    inputSchema: { type: "object", properties: { job: { type: "string", enum: jobSlugs() } }, required: ["job"] },
  },
  {
    name: "list_jobs",
    title: "List coding jobs",
    description: "Every coding job the site covers, with a one-line summary. Use the slug with recommend_model or get_job.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "benchmark_leaderboard",
    title: "Benchmark leaderboard",
    description: "One benchmark's description, caveat, and ranked scores (independent results preferred over vendor-reported ones).",
    inputSchema: { type: "object", properties: { benchmark: { type: "string", enum: benchmarks.map((b) => b.id) } }, required: ["benchmark"] },
  },
].map((tool) => ({ ...tool, annotations: { readOnlyHint: true, openWorldHint: false } }));

class ToolInputError extends Error {}

function callTool(name: string, args: Record<string, unknown>): unknown {
  const str = (key: string) => (typeof args[key] === "string" ? (args[key] as string) : undefined);
  const num = (key: string) => (typeof args[key] === "number" ? (args[key] as number) : undefined);
  switch (name) {
    case "recommend_model": {
      const job = str("job");
      if (!job) throw new ToolInputError(`"job" is required. One of: ${jobSlugs().join(", ")}.`);
      const pool = str("pool");
      return recommendData({
        job,
        pool: pool === "frontier" || pool === "fast" || pool === "local" ? pool : undefined,
        maxInputPrice: num("maxInputPrice"),
        minContext: num("minContext"),
        openWeightsOnly: args.openWeightsOnly === true,
        limit: num("limit"),
      });
    }
    case "compare_models": {
      const ids = Array.isArray(args.models) ? args.models.filter((id): id is string => typeof id === "string") : [];
      const data = compareData(compareSlug(ids));
      if (!data) throw new ToolInputError(`Pass 2–${MAX_COMPARE} distinct model ids. Valid ids: ${modelIds().join(", ")}.`);
      return data;
    }
    case "get_model": {
      const model = getModel(str("id") ?? "");
      if (!model) throw new ToolInputError(`Unknown model. Valid ids: ${modelIds().join(", ")}.`);
      return modelData(model);
    }
    case "get_job": {
      const job = getJob(str("job") ?? "");
      if (!job) throw new ToolInputError(`Unknown job. One of: ${jobSlugs().join(", ")}.`);
      return jobData(job);
    }
    case "list_jobs":
      return { jobs: jobs.map((job) => ({ slug: job.slug, title: job.title, summary: job.oneLiner, url: `${siteUrl}/for/${job.slug}` })) };
    case "benchmark_leaderboard": {
      const data = benchmarkData(str("benchmark") ?? "");
      if (!data) throw new ToolInputError(`Unknown benchmark. One of: ${benchmarks.map((b) => b.id).join(", ")}.`);
      return data;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/** Handle one JSON-RPC message. Returns null for notifications, which get no response. */
export function handleMessage(message: JsonRpcRequest): JsonRpcResponse | null {
  const id = message.id ?? null;
  const isNotification = message.id === undefined;
  const ok = (result: unknown): JsonRpcResponse => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, text: string): JsonRpcResponse => ({ jsonrpc: "2.0", id, error: { code, message: text } });

  if (message?.jsonrpc !== "2.0" || typeof message.method !== "string") return fail(-32600, "Invalid request");
  if (isNotification) return null;

  switch (message.method) {
    case "initialize": {
      const requested = typeof message.params?.protocolVersion === "string" ? message.params.protocolVersion : "";
      return ok({
        protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo,
        instructions:
          "Use recommend_model to answer 'which model for this coding job?'. Scores from different benchmarks are not comparable; prefer independent over vendor-reported results and cite the source URL.",
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({ tools });
    case "tools/call": {
      const name = message.params?.name;
      if (typeof name !== "string" || !tools.some((tool) => tool.name === name)) return fail(-32602, `Unknown tool: ${String(name)}`);
      try {
        const data = callTool(name, (message.params?.arguments as Record<string, unknown>) ?? {});
        const isError = typeof data === "object" && data !== null && "error" in data;
        return ok({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data, isError });
      } catch (error) {
        if (error instanceof ToolInputError) return ok({ content: [{ type: "text", text: error.message }], isError: true });
        throw error;
      }
    }
    default:
      return fail(-32601, `Method not found: ${message.method}`);
  }
}
