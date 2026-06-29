import fs from "node:fs";

type PromptTemplate = {
	name: string;
	body: string;
	hasArgs: boolean;
};

type PromptCommand = {
	name?: unknown;
	source?: unknown;
	sourceInfo?: { path?: unknown };
};

type ExtensionAPI = {
	getCommands?: () => PromptCommand[];
	on: (event: "input", handler: (event: any, ctx: any) => Promise<{ action: string; text?: string } | void>) => void;
};

const INLINE_PROMPT_RE = /(^|[\s([{])\/([A-Za-z0-9][A-Za-z0-9_-]*)([.!?])?([ \t]+)?(?=$|[\s,;:)\]}])/g;
const ARG_PLACEHOLDER_RE = /\$(?:ARGUMENTS|@|\d+)|\$\{(?:\d+:-|@:\d+(?::\d+)?)/;

function stripFrontmatter(raw: string): string {
	return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function loadPromptTemplates(pi: ExtensionAPI): Map<string, PromptTemplate> {
	const templates = new Map<string, PromptTemplate>();
	const commands = pi.getCommands?.() ?? [];

	for (const command of commands) {
		if (command.source !== "prompt") continue;
		if (typeof command.name !== "string") continue;
		if (typeof command.sourceInfo?.path !== "string") continue;
		if (templates.has(command.name)) continue;

		try {
			const body = stripFrontmatter(fs.readFileSync(command.sourceInfo.path, "utf8")).trim();
			templates.set(command.name, {
				name: command.name,
				body,
				hasArgs: ARG_PLACEHOLDER_RE.test(body),
			});
		} catch {
			// Ignore unreadable prompt files; Pi's normal loader reports those.
		}
	}

	return templates;
}

export function expandInlinePrompts(text: string, templates: Map<string, PromptTemplate>): string {
	if (!text.includes("/")) return text;

	let changed = false;
	const expanded = text.replace(INLINE_PROMPT_RE, (match, leading: string, name: string, _punctuation: string, _space: string, offset: number, source: string) => {
		const template = templates.get(name);
		if (!template || template.hasArgs) return match;

		changed = true;
		const atStart = offset === 0 && leading === "";
		const afterIndex = offset + match.length;
		const hasAfter = afterIndex < source.length;
		const before = atStart ? "" : `${leading}\n\n`;
		const after = hasAfter ? "\n\n" : "";
		return `${before}${template.body}${after}`;
	});

	return changed ? expanded.replace(/\n{3,}/g, "\n\n").replace(/\n\n[ \t]+/g, "\n\n").trimEnd() : text;
}

export default function (pi: ExtensionAPI) {
	pi.on("input", async (event) => {
		if (event.source === "extension") return { action: "continue" };

		const text = String(event.text ?? "");
		const expanded = expandInlinePrompts(text, loadPromptTemplates(pi));
		if (expanded === text) return { action: "continue" };

		return { action: "transform", text: expanded };
	});
}
