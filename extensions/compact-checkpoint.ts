import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const TOOL_NAME = "compact_checkpoint";

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

export default function compactCheckpointExtension(pi: ExtensionAPI) {
	let pending: PendingCompaction | undefined;

	pi.registerTool({
		name: TOOL_NAME,
		label: "Compact Checkpoint",
		description:
			"Schedule Pi conversation compaction after the current agent run. Use only at a natural checkpoint, never mid-task.",
		promptSnippet: "Schedule conversation compaction at a safe work checkpoint.",
		promptGuidelines: [
			"Use compact_checkpoint only when you have reached a natural checkpoint and are about to start a new phase.",
			"Do not use compact_checkpoint mid-edit, mid-debug, while waiting for a tool result, or just because context may be large.",
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

	pi.on("agent_end", (_event, ctx) => {
		const request = pending;
		pending = undefined;
		if (!request) return;
		runCompaction(ctx, request);
	});

	pi.on("session_shutdown", () => {
		pending = undefined;
	});
}
