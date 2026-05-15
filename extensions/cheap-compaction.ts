/**
 * Cheap Compaction Extension
 *
 * Uses budget models for conversation summarization instead of the main
 * conversation model. Falls back through a chain of models:
 *   1. GitHub Copilot GPT-5 Mini (264k context)
 *   2. DeepSeek V4 Flash (1M context)
 *   3. Default pi compaction (built-in)
 *
 * Covers both auto-compaction and manual /compact.
 */

import { complete } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { convertToLlm, serializeConversation } from "@earendil-works/pi-coding-agent";
import type { AssistantMessage } from "@earendil-works/pi-ai";

// ── Configuration ────────────────────────────────────────────────────────────

/** Models to try in order. First one that fits the context is used. */
const MODEL_CHAIN: Array<{ provider: string; id: string }> = [
  { provider: "openrouter", id: "deepseek/deepseek-v4-flash:free" },
  { provider: "opencode", id: "deepseek-v4-flash-free" },
];

/** Tokens reserved for the system prompt and the model's response. */
const TOKEN_BUFFER = 4096;

/** Rough chars-per-token estimate for English text (conservative). */
const CHARS_PER_TOKEN = 3.5;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Rough token count estimate from a text string.
 * Not exact, but good enough for context-window gating.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Build the summarization prompt. Kept concise to minimize overhead.
 */
function buildSummaryMessages(
  conversationText: string,
  previousSummary?: string,
): Array<{ role: "user"; content: Array<{ type: "text"; text: string }>; timestamp: number }> {
  const previousContext = previousSummary
    ? `\n\nPrevious session summary for context:\n${previousSummary}`
    : "";

  return [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Summarize this conversation. Capture goals, key decisions, code changes, ongoing work, blockers, and next steps. Be thorough but concise — this summary will replace the full history.${previousContext}

<conversation>
${conversationText}
</conversation>`,
        },
      ],
      timestamp: Date.now(),
    },
  ];
}

// ── Extension ────────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  pi.on("session_before_compact", async (event, ctx) => {
    const { preparation, signal } = event;
    const { messagesToSummarize, turnPrefixMessages, tokensBefore, firstKeptEntryId, previousSummary } =
      preparation;

    // Combine all messages that need summarization
    const allMessages = [...messagesToSummarize, ...turnPrefixMessages];
    if (allMessages.length === 0) return; // nothing to summarize

    // Serialize to text
    const conversationText = serializeConversation(convertToLlm(allMessages));
    const summaryMessages = buildSummaryMessages(conversationText, previousSummary);
    const estimatedInputTokens =
      estimateTokens(conversationText) + estimateTokens(summaryMessages[0].content[0].text);

    ctx.ui.notify(
      `Cheap compaction: ~${estimatedInputTokens.toLocaleString()} est. tokens across ${allMessages.length} messages`,
      "info",
    );

    // Try each model in the chain
    for (const choice of MODEL_CHAIN) {
      const model = ctx.modelRegistry.find(choice.provider, choice.id);
      if (!model) {
        ctx.ui.notify(`Model not found: ${choice.provider}/${choice.id}, skipping`, "warning");
        continue;
      }

      // Check context window
      const availableTokens = (model.contextWindow ?? 128_000) - TOKEN_BUFFER;
      if (estimatedInputTokens > availableTokens) {
        ctx.ui.notify(
          `Skipping ${model.id}: needs ~${estimatedInputTokens} tokens, window is ${model.contextWindow}`,
          "warning",
        );
        continue;
      }

      // Check auth
      const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
      if (!auth.ok || !auth.apiKey) {
        ctx.ui.notify(`No API key for ${model.id}, skipping`, "warning");
        continue;
      }

      ctx.ui.notify(`Compacting with ${model.id} (${choice.provider})...`, "info");

      try {
        const response: AssistantMessage = await complete(
          model,
          { messages: summaryMessages },
          {
            apiKey: auth.apiKey,
            headers: auth.headers,
            maxTokens: 8192,
            signal,
          },
        );

        const summary = response.content
          .filter((c): c is { type: "text"; text: string } => c.type === "text")
          .map((c) => c.text)
          .join("\n");

        if (!summary.trim()) {
          if (!signal.aborted) {
            ctx.ui.notify(`${model.id} returned empty summary, trying next`, "warning");
          }
          continue;
        }

        ctx.ui.notify(`Compacted with ${model.id} ✓`, "success");

        return {
          compaction: {
            summary,
            firstKeptEntryId,
            tokensBefore,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.notify(`${model.id} failed: ${message}, trying next...`, "warning");
        // Continue to next model in chain
      }
    }

    // All models failed — fall back to default pi compaction
    ctx.ui.notify("All cheap models failed, using default compaction", "warning");
    return; // undefined → default compaction runs
  });
}
