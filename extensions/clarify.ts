import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const CLARIFICATION_GUIDANCE =
	"Push back when you need clarification. If the user's request is ambiguous or underspecified, ask one focused clarifying question instead of guessing.";

export function addClarificationGuidance(systemPrompt: string): string {
	if (systemPrompt.includes(CLARIFICATION_GUIDANCE)) return systemPrompt;
	return `${systemPrompt}\n\n${CLARIFICATION_GUIDANCE}`;
}

export default function (pi: ExtensionAPI) {
	pi.on("before_agent_start", (event) => ({
		systemPrompt: addClarificationGuidance(event.systemPrompt),
	}));
}
