import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

export const AUTO_PROCEED_GUIDANCE = [
	"Proceed until the plan is fully implemented.",
	"Say exactly 'The plan is fully implemented' when it is fully implemented.",
	"If the plan cannot be safely completed because of missing inputs, credentials, artifacts, permissions, or another real blocker, say exactly 'The plan is blocked' and explain what is needed.",
].join(" ");
export const COMPLETION_PHRASE = "the plan is fully implemented";
export const BLOCKED_PHRASE = "the plan is blocked";

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
	stopReason?: string;
};

function textFromMessage(message: MessageLike): string {
	if (message.role !== "assistant") return "";
	return (message.content ?? [])
		.filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string")
		.map((part) => part.text)
		.join("\n");
}

function normalizeTerminalLine(line: string): string {
	return line
		.trim()
		.toLowerCase()
		.replace(/^[>*_`"'\s]+/g, "")
		.replace(/[.!?\s*_`"']+$/g, "")
		.replace(/\s+/g, " ");
}

function hasExactTerminalLine(text: string, phrase: string): boolean {
	return text.split(/\r?\n/).some((line) => normalizeTerminalLine(line) === phrase);
}

export function hasCompletionPhrase(text: string): boolean {
	return hasExactTerminalLine(text, COMPLETION_PHRASE);
}

export function hasBlockedPhrase(text: string): boolean {
	return hasExactTerminalLine(text, BLOCKED_PHRASE);
}

export function messagesContainTerminal(messages: MessageLike[]): boolean {
	return messages.some((message) => {
		if (message.role === "assistant" && (message.stopReason === "aborted" || message.stopReason === "error")) return true;

		const text = textFromMessage(message);
		return hasCompletionPhrase(text) || hasBlockedPhrase(text);
	});
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

		if (messagesContainTerminal(event.messages)) {
			active = false;
			return;
		}

		if (ctx.hasPendingMessages()) return;
		pi.sendUserMessage("Proceed.", { deliverAs: "followUp" });
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
	assert.match(addAutoProceedGuidance("base"), /The plan is blocked/);
	assert.equal(hasCompletionPhrase("**The plan is fully implemented.**"), true);
	assert.equal(hasCompletionPhrase("I will say 'The plan is fully implemented' when done."), false);
	assert.equal(hasBlockedPhrase("The plan is blocked.\nNeed signed artifact URLs."), true);
	assert.equal(hasBlockedPhrase("I will say 'The plan is blocked' if blocked."), false);

	const handlers = new Map<string, Function>();
	const sent: Array<{ message: string; options?: unknown }> = [];
	autoProceedExtension({
		on: (name: string, handler: Function) => handlers.set(name, handler),
		sendUserMessage: (message: string, options?: unknown) => sent.push({ message, options }),
	} as unknown as ExtensionAPI);

	const input = handlers.get("input")!;
	const before = handlers.get("before_agent_start")!;
	const end = handlers.get("agent_end")!;
	assert.deepEqual(before({ prompt: "Implement it", systemPrompt: "base" }), {
		systemPrompt: addAutoProceedGuidance("base"),
	});
	end({ messages: [{ role: "assistant", content: [{ type: "text", text: "Made progress." }] }] }, { hasPendingMessages: () => false });
	assert.deepEqual(sent, [{ message: "Proceed.", options: { deliverAs: "followUp" } }]);
	end(
		{ messages: [{ role: "assistant", content: [{ type: "text", text: "The plan is fully implemented." }] }] },
		{ hasPendingMessages: () => false },
	);
	assert.deepEqual(sent, [{ message: "Proceed.", options: { deliverAs: "followUp" } }]);
	assert.deepEqual(before({ prompt: "Implement the plan", systemPrompt: "base" }), {
		systemPrompt: addAutoProceedGuidance("base"),
	});
	end({ messages: [{ role: "assistant", content: [{ type: "text", text: "The plan is blocked.\nNeed input." }] }] }, { hasPendingMessages: () => false });
	assert.deepEqual(sent, [{ message: "Proceed.", options: { deliverAs: "followUp" } }]);

	assert.deepEqual(before({ prompt: "Implement the plan", systemPrompt: "base" }), {
		systemPrompt: addAutoProceedGuidance("base"),
	});
	end({ messages: [{ role: "assistant", stopReason: "aborted", content: [{ type: "text", text: "Operation aborted" }] }] }, { hasPendingMessages: () => false });
	assert.deepEqual(sent, [{ message: "Proceed.", options: { deliverAs: "followUp" } }]);

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
