import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const TOOL_NAME = "compact_checkpoint";
const STATUS_KEY = "compact-checkpoint";
const REMINDER_THRESHOLDS = [80, 90, 95] as const;

interface PendingCompaction {
	instructions: string;
}

function buildCompactionInstructions(handoff: string): string {
	return [
		"The assistant chose this as a safe checkpoint for compaction.",
		"Preserve the current goal, constraints, decisions, completed work, open risks, files read or modified, and the next step after compaction.",
		"",
		"Assistant checkpoint handoff:",
		handoff.trim(),
	].join("\n");
}

function runCompaction(ctx: ExtensionContext, pending: PendingCompaction) {
	ctx.compact({
		customInstructions: pending.instructions,
		onComplete: () => ctx.hasUI && ctx.ui.notify("Checkpoint compaction completed.", "info"),
		onError: (error) => ctx.hasUI && ctx.ui.notify(`Checkpoint compaction failed: ${error.message}`, "error"),
	});
}

function getReminderThreshold(percent: number): number | undefined {
	let threshold: number | undefined;
	for (const candidate of REMINDER_THRESHOLDS) {
		if (percent >= candidate) threshold = candidate;
	}
	return threshold;
}

export default function compactCheckpointExtension(pi: ExtensionAPI) {
	let pending: PendingCompaction | undefined;
	let lastReminderThreshold: number | undefined;

	function resetReminderState(ctx?: ExtensionContext) {
		lastReminderThreshold = undefined;
		if (ctx?.hasUI) ctx.ui.setStatus(STATUS_KEY, undefined);
	}

	function maybeNotifyContextUsage(ctx: ExtensionContext) {
		const usage = ctx.getContextUsage();
		if (!usage || usage.percent === null || !Number.isFinite(usage.percent)) return;

		const threshold = getReminderThreshold(usage.percent);
		if (!threshold) {
			resetReminderState(ctx);
			return;
		}

		const percent = Math.round(usage.percent);
		if (ctx.hasUI) ctx.ui.setStatus(STATUS_KEY, `Context ${percent}%`);
		if (lastReminderThreshold !== undefined && threshold <= lastReminderThreshold) return;

		lastReminderThreshold = threshold;
		if (ctx.hasUI) {
			ctx.ui.notify(
				`Context is ${percent}% full. Pi will compact automatically near capacity; use a checkpoint only after task completion or an explicit pause.`,
				threshold >= 95 ? "warning" : "info",
			);
		}
	}

	pi.registerTool({
		name: TOOL_NAME,
		label: "Compact Checkpoint",
		description:
			"End the current agent run and compact the session. Use only after completing the user's task or when the user explicitly asks to pause.",
		promptSnippet: "End the current agent run and compact only after task completion or an explicit user-requested pause.",
		promptGuidelines: [
			"Use compact_checkpoint only after completing the user's task or when the user explicitly asks to pause; it ends the current agent run, so never use it merely to split active work into phases.",
		],
		parameters: Type.Object({
			handoff: Type.String({
				description: "Checkpoint summary: current goal, important state, and next step after compaction.",
			}),
		}),
		async execute(_toolCallId, params) {
			pending = { instructions: buildCompactionInstructions(params.handoff) };

			return {
				content: [{ type: "text", text: "Checkpoint requested. This ends the current agent run; compaction will start after it settles." }],
				details: { scheduled: true },
				terminate: true,
			};
		},
	});

	pi.on("before_agent_start", (_event, ctx) => {
		maybeNotifyContextUsage(ctx);
	});

	pi.on("turn_end", (_event, ctx) => {
		maybeNotifyContextUsage(ctx);
	});

	pi.on("agent_settled", (_event, ctx) => {
		const request = pending;
		pending = undefined;
		if (!request) return;
		runCompaction(ctx, request);
	});

	pi.on("session_compact", (_event, ctx) => resetReminderState(ctx));
	pi.on("model_select", (_event, ctx) => resetReminderState(ctx));
	pi.on("session_start", (_event, ctx) => resetReminderState(ctx));

	pi.on("session_shutdown", () => {
		pending = undefined;
		lastReminderThreshold = undefined;
	});
}
