import type { ContextUsage, ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const TOOL_NAME = "compact_checkpoint";
const REMINDER_MESSAGE_TYPE = "compact-checkpoint-reminder";
const STATUS_KEY = "compact-checkpoint";
const REMINDER_THRESHOLDS = [50, 70, 85, 95] as const;

interface PendingCompaction {
	instructions: string;
}

interface ContextReminder {
	content: string;
	percent: number;
	threshold: number;
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

function formatNumber(value: number): string {
	return Math.round(value).toLocaleString("en-US");
}

function buildContextReminder(usage: ContextUsage, threshold: number): ContextReminder | undefined {
	if (usage.percent === null || !Number.isFinite(usage.percent)) return;

	const tokenSummary = usage.tokens === null
		? ""
		: ` (${formatNumber(usage.tokens)} of ${formatNumber(usage.contextWindow)} tokens)`;
	const percent = Math.round(usage.percent);

	return {
		content: [
			`Context checkpoint reminder: the active model context is about ${percent}% full${tokenSummary}, crossing the ${threshold}% reminder threshold.`,
			`Do not compact solely because of this warning. If you are mid-edit, mid-debug, or waiting for tool output, continue working.`,
			`At the next natural checkpoint, consider calling ${TOOL_NAME} as the only tool in the turn with a concise handoff.`,
		].join("\n"),
		percent,
		threshold,
	};
}

export default function compactCheckpointExtension(pi: ExtensionAPI) {
	let pending: PendingCompaction | undefined;
	let lastReminderThreshold: number | undefined;

	function resetReminderState(ctx?: ExtensionContext) {
		lastReminderThreshold = undefined;
		if (ctx?.hasUI) ctx.ui.setStatus(STATUS_KEY, undefined);
	}

	function maybeCreateContextReminder(ctx: ExtensionContext): ContextReminder | undefined {
		const usage = ctx.getContextUsage();
		if (!usage || usage.percent === null || !Number.isFinite(usage.percent)) return;

		const threshold = getReminderThreshold(usage.percent);
		if (!threshold) {
			resetReminderState(ctx);
			return;
		}

		if (ctx.hasUI) ctx.ui.setStatus(STATUS_KEY, `Context ${Math.round(usage.percent)}%`);
		if (lastReminderThreshold !== undefined && threshold <= lastReminderThreshold) return;

		const reminder = buildContextReminder(usage, threshold);
		if (!reminder) return;

		lastReminderThreshold = threshold;
		if (ctx.hasUI) {
			ctx.ui.notify(
				`Context is ${reminder.percent}% full. Compact at the next natural checkpoint.`,
				threshold >= 85 ? "warning" : "info",
			);
		}
		return reminder;
	}

	pi.registerTool({
		name: TOOL_NAME,
		label: "Compact Checkpoint",
		description:
			"Schedule Pi conversation compaction after the current agent run. Use only at a natural checkpoint, never mid-task.",
		promptSnippet: "Schedule conversation compaction at a safe work checkpoint.",
		promptGuidelines: [
			"Use compact_checkpoint only when you have reached a natural checkpoint and are about to start a new phase.",
			"Do not use compact_checkpoint mid-edit, mid-debug, while waiting for a tool result, or just because context may be large.",
			"When the compact-checkpoint extension warns that context is over 50% full, treat it as a reminder to checkpoint soon, not as permission to interrupt active work.",
			"Call compact_checkpoint as the only tool in a turn and include a handoff with what should survive compaction plus the next step.",
		],
		parameters: Type.Object({
			handoff: Type.String({
				description: "Checkpoint summary: current goal, important state, and next step after compaction.",
			}),
		}),
		async execute(_toolCallId, params) {
			pending = { instructions: buildCompactionInstructions(params.handoff) };

			return {
				content: [{ type: "text", text: "Checkpoint compaction scheduled after this agent run ends." }],
				details: { scheduled: true },
				terminate: true,
			};
		},
	});

	pi.on("before_agent_start", (event, ctx) => {
		const reminder = maybeCreateContextReminder(ctx);
		if (!reminder) return;
		return { systemPrompt: `${event.systemPrompt}\n\n${reminder.content}` };
	});

	pi.on("turn_end", (_event, ctx) => {
		const reminder = maybeCreateContextReminder(ctx);
		if (!reminder) return;

		pi.sendMessage({
			customType: REMINDER_MESSAGE_TYPE,
			content: reminder.content,
			display: false,
			details: {
				percent: reminder.percent,
				threshold: reminder.threshold,
			},
		}, { deliverAs: "steer" });
	});

	pi.on("agent_end", (_event, ctx) => {
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
