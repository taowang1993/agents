import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerProvider("sail", {
    baseUrl: "https://api.sailresearch.com/v1",
    apiKey: "$SAIL_API_KEY",
    api: "openai-completions",
    models: [
      {
        id: "zai-org/GLM-5.2-FP8",
        name: "GLM-5.2 (FP8)",
        reasoning: true,
        input: ["text"],
        cost: { input: 0.5, output: 2.5, cacheRead: 0.12, cacheWrite: 0.5 },
        contextWindow: 1_000_000,
        maxTokens: 65536,
      },
    ],
  });
}
