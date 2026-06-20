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

export type PromptChoice = {
	index: number;
	label: string;
	prompt: string;
};

export function extractPromptText(content: unknown): string {
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

export function firstWords(text: string, maxWords = 15): string {
	const words = text.trim().split(/\s+/).filter(Boolean);
	const snippet = words.slice(0, maxWords).join(" ");
	return words.length > maxWords ? `${snippet}…` : snippet;
}

export function getUserPromptChoices(ctx: Pick<ExtensionContext, "sessionManager">): PromptChoice[] {
	const prompts: string[] = [];

	for (const entry of ctx.sessionManager.getBranch()) {
		if (entry.type !== "message") continue;
		if (entry.message.role !== "user") continue;

		const prompt = extractPromptText(entry.message.content).trim();
		if (prompt) {
			prompts.push(prompt);
		}
	}

	return prompts.map((prompt, index) => ({
		index: index + 1,
		label: `${index + 1}. ${firstWords(prompt)}`,
		prompt,
	}));
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("copy-prompt", {
		description: "Copy a user prompt from the current session to the clipboard",
		handler: async (_args, ctx) => {
			const choices = getUserPromptChoices(ctx);
			if (choices.length === 0) {
				ctx.ui.notify("No user prompts found to copy.", "warning");
				return;
			}

			const selectedLabel = await ctx.ui.select(
				"Copy Which Prompt?",
				choices.map((choice) => choice.label),
			);
			if (!selectedLabel) {
				ctx.ui.notify("No prompt copied.", "info");
				return;
			}

			const choice = choices.find((choice) => choice.label === selectedLabel);
			if (!choice) {
				ctx.ui.notify("Selected prompt was not found.", "error");
				return;
			}

			try {
				await copyToClipboard(choice.prompt);
				ctx.ui.notify(`Copied prompt ${choice.index} to clipboard.`, "info");
			} catch (error) {
				ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
			}
		},
	});
}
