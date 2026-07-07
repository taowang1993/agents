import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

export const AUTO_PROCEED_GUIDANCE =
	"Proceed until the plan is fully implemented. Say 'The plan is fully implemented' when it is fully implemented.";
export const COMPLETION_PHRASE = "the plan is fully implemented";

function normalizePrompt(text: string): string {
	return text.trim().toLowerCase().replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
}

export function shouldStartAutoProceed(prompt: string): boolean {
	const normalized = normalizePrompt(prompt);
	return normalized === "implement it" || normalized === "implement the plan";
}

export function addAutoProceedGuidance(systemPrompt: string): string {
	if (systemPrompt.includes(AUTO_PROCEED_GUIDANCE)) return systemPrompt;
	return `${systemPrompt}\n\n${AUTO_PROCEED_GUIDANCE}`;
}

type MessageLike = {
	role: string;
	content?: Array<{ type: string; text?: string }>;
};

function textFromMessage(message: MessageLike): string {
	if (message.role !== "assistant") return "";
	return (message.content ?? [])
		.filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string")
		.map((part) => part.text)
		.join("\n");
}

function normalizeCompletionLine(line: string): string {
	return line
		.trim()
		.toLowerCase()
		.replace(/^[>*_`"'\s]+/g, "")
		.replace(/[.!?\s*_`"']+$/g, "")
		.replace(/\s+/g, " ");
}

export function hasCompletionPhrase(text: string): boolean {
	return text.split(/\r?\n/).some((line) => normalizeCompletionLine(line) === COMPLETION_PHRASE);
}

export function messagesContainCompletion(messages: MessageLike[]): boolean {
	return messages.some((message) => hasCompletionPhrase(textFromMessage(message)));
}

export default function autoProceedExtension(pi: ExtensionAPI) {
	let active = false;

	pi.on("input", (event) => {
		if (event.source !== "extension" && active && !shouldStartAutoProceed(event.text)) active = false;
	});

	pi.on("before_agent_start", (event) => {
		if (shouldStartAutoProceed(event.prompt)) active = true;
		if (!active) return undefined;

		return { systemPrompt: addAutoProceedGuidance(event.systemPrompt) };
	});

	pi.on("agent_end", (event, ctx) => {
		if (!active) return;

		if (messagesContainCompletion(event.messages)) {
			active = false;
			return;
		}

		if (ctx.hasPendingMessages()) return;
		pi.sendUserMessage("Proceed.");
	});

	pi.on("session_shutdown", () => {
		active = false;
	});
}

export function runAutoProceedSelfTest(): void {
	assert.equal(shouldStartAutoProceed("Implement it"), true);
	assert.equal(shouldStartAutoProceed(" implement the plan. "), true);
	assert.equal(shouldStartAutoProceed("Research OpenClaw to learn how it implements skill system"), false);
	assert.equal(shouldStartAutoProceed("Implement this"), false);
	assert.match(addAutoProceedGuidance("base"), /Proceed until the plan is fully implemented/);
	assert.equal(hasCompletionPhrase("**The plan is fully implemented.**"), true);
	assert.equal(hasCompletionPhrase("I will say 'The plan is fully implemented' when done."), false);

	const handlers = new Map<string, Function>();
	const sent: string[] = [];
	autoProceedExtension({
		on: (name: string, handler: Function) => handlers.set(name, handler),
		sendUserMessage: (message: string) => sent.push(message),
	} as unknown as ExtensionAPI);

	const input = handlers.get("input")!;
	const before = handlers.get("before_agent_start")!;
	const end = handlers.get("agent_end")!;
	assert.deepEqual(before({ prompt: "Implement it", systemPrompt: "base" }), {
		systemPrompt: addAutoProceedGuidance("base"),
	});
	end({ messages: [{ role: "assistant", content: [{ type: "text", text: "Made progress." }] }] }, { hasPendingMessages: () => false });
	assert.deepEqual(sent, ["Proceed."]);
	end(
		{ messages: [{ role: "assistant", content: [{ type: "text", text: "The plan is fully implemented." }] }] },
		{ hasPendingMessages: () => false },
	);
	assert.deepEqual(sent, ["Proceed."]);

	assert.deepEqual(before({ prompt: "Implement the plan", systemPrompt: "base" }), {
		systemPrompt: addAutoProceedGuidance("base"),
	});
	input({ source: "interactive", text: "Stop" });
	assert.equal(before({ prompt: "What now?", systemPrompt: "base" }), undefined);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	runAutoProceedSelfTest();
	console.log("auto-proceed extension self-test passed");
}
