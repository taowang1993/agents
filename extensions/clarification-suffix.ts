import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const SUFFIX = "Let me know if you need clarification.";

export function appendClarification(text: string): string {
	const trimmed = text.trimEnd();
	if (!trimmed || trimmed.endsWith(SUFFIX) || trimmed.startsWith("/")) return text;
	return `${trimmed} ${SUFFIX}`;
}

export default function (pi: ExtensionAPI) {
	pi.on("input", async (event) => {
		if (event.source === "extension") return { action: "continue" };

		const text = String(event.text ?? "");
		const transformed = appendClarification(text);
		if (transformed === text) return { action: "continue" };

		return { action: "transform", text: transformed };
	});
}
