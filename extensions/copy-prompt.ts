import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { copyToClipboard } from "@mariozechner/pi-coding-agent";

type TextPart = {
	type: "text";
	text: string;
};

type ImagePart = {
	type: "image";
	mimeType?: string;
};

function isTextPart(part: unknown): part is TextPart {
	return Boolean(part && typeof part === "object" && "type" in part && part.type === "text" && "text" in part && typeof part.text === "string");
}

function isImagePart(part: unknown): part is ImagePart {
	return Boolean(part && typeof part === "object" && "type" in part && part.type === "image");
}

function extractPromptText(content: unknown): string {
	if (typeof content === "string") {
		return content;
	}

	if (!Array.isArray(content)) {
		return "";
	}

	const parts: string[] = [];

	for (const part of content) {
		if (isTextPart(part)) {
			parts.push(part.text);
			continue;
		}

		if (isImagePart(part)) {
			parts.push("[image omitted]");
		}
	}

	return parts.join("\n");
}

function getInitialUserPrompt(ctx: ExtensionContext): string | undefined {
	for (const entry of ctx.sessionManager.getBranch()) {
		if (entry.type !== "message") continue;
		if (entry.message.role !== "user") continue;

		const prompt = extractPromptText(entry.message.content).trim();
		if (prompt) {
			return prompt;
		}
	}

	return undefined;
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("copy-prompt", {
		description: "Copy the first user prompt in the current session to the clipboard",
		handler: async (_args, ctx) => {
			const prompt = getInitialUserPrompt(ctx);
			if (!prompt) {
				ctx.ui.notify("No initial user prompt found to copy.", "warning");
				return;
			}

			try {
				await copyToClipboard(prompt);
				ctx.ui.notify("Copied initial user prompt to clipboard", "info");
			} catch (error) {
				ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
			}
		},
	});
}
