export type Preset = { title: string; description: string; models: string[] };

/** Starting points on /compare. Each one is prebuilt as a static page. */
export const presets: Preset[] = [
  { title: "top of the independent boards", description: "Leaders on Terminal-Bench 4.0 and FrontierCode, run by third parties.", models: ["claude-opus-5-5", "gpt-6-astra", "claude-fable-5-1"] },
  { title: "mid-price workhorses", description: "Strong enough for most agent work at $2 per 1M input tokens.", models: ["claude-sonnet-5", "gpt-6-sol", "grok-4-7"] },
  { title: "cheap and fast", description: "For high-volume, well-scoped edits and first passes.", models: ["gpt-6-luna", "gemini-3-8-flash", "claude-haiku-4-5"] },
  { title: "open weights, frontier-sized", description: "Self-host or pick your provider. Needs serious hardware.", models: ["kimi-k3", "glm-5-3", "deepseek-v4-pro", "qwen3-8-max"] },
  { title: "runs on your own machine", description: "Small open models for private, offline work.", models: ["qwen3-8-27b", "gpt-oss-20b", "gpt-oss-120b"] },
  { title: "flagships by lab", description: "Each major lab’s most capable API model.", models: ["claude-fable-5-1", "gpt-6-astra", "gemini-3-1-pro", "grok-4-7"] },
];
