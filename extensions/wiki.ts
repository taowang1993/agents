import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const WIKI_DIR = ".agents/wiki";
export const METADATA_PATH = ".agents/wiki/.last-update.json";

const STATUS_KEY = "wiki";
const MAX_GIT_SECTION_BYTES = 12_000;

type WikiCommand = "init" | "update";

export interface LastUpdateMetadata {
	updatedAt: string;
	command: string;
	gitHead?: string;
	model?: string;
}

export interface WikiContentSnapshot {
	exists: boolean;
	files: string[];
	hash: string;
}

interface CommandResult {
	code: number;
	output: string;
}

interface GitSection {
	command: string;
	output: string;
}

interface GitEvidence {
	isGitRepo: boolean;
	head: string;
	status: string;
	sections: GitSection[];
}

interface PendingRun {
	command: WikiCommand;
	cwd: string;
	prompt: string;
	beforeHash: string;
	gitHead: string;
	model: string;
	consumed: boolean;
}

const WIKI_SYSTEM_PROMPT = `## Wiki Extension Mode

You are maintaining repository documentation for the Pi Wiki extension.

Rules:
- Use Pi's normal tools and filesystem paths.
- Before creating docs, check for existing documentation (README.md, docs/) and adapt it instead of starting from scratch.
- Write docs only under .agents/wiki/, except for one top-level AGENTS.md or CLAUDE.md Wiki reference section when useful.
- Do not edit .agents/wiki/.last-update.json; the extension owns it.
- Start navigation at .agents/wiki/quickstart.md.
- Do not read secrets, .env files, private keys, credentials, or token caches.
- Prefer targeted reads from Git evidence, package/config files, entrypoints, tests, and representative domain files.
- Keep updates surgical. If docs are already current, do not edit files.
- Avoid formatting-only churn.
- If you create .agents/wiki/_plan.md as scratch space, delete it before finishing.
- Finish with a concise summary of changed wiki pages, or say no wiki changes were needed.`;

export default function wikiExtension(pi: ExtensionAPI) {
	let pending: PendingRun | undefined;

	async function startWikiRun(command: WikiCommand, args: string, ctx: ExtensionCommandContext) {
		if (!ctx.isIdle()) {
			ctx.ui.notify("Wiki is waiting for the current agent run to finish.", "warning");
			return;
		}

		const metadata = await readLastUpdateMetadata(ctx.cwd);
		const before = await createWikiContentSnapshot(ctx.cwd);
		const git = await collectGitEvidence(ctx.cwd, command, metadata);
		const model = formatModel(ctx.model);
		const prompt = buildWikiUserPrompt({
			command,
			cwd: ctx.cwd,
			metadata,
			git,
			extraInstruction: args.trim(),
		});

		pending = {
			command,
			cwd: ctx.cwd,
			prompt,
			beforeHash: before.hash,
			gitHead: git.head,
			model,
			consumed: false,
		};

		ctx.ui.setStatus(STATUS_KEY, command === "init" ? "Wiki Init" : "Wiki Update");
		ctx.ui.notify(`Wiki ${command} queued.`, "info");

		try {
			pi.sendUserMessage(prompt);
		} catch (error) {
			pending = undefined;
			ctx.ui.setStatus(STATUS_KEY, undefined);
			throw error;
		}
	}

	pi.registerCommand("wiki-init", {
		description: "Create or refresh .agents/wiki documentation",
		handler: async (args, ctx) => startWikiRun("init", args, ctx),
	});

	pi.registerCommand("wiki-update", {
		description: "Update .agents/wiki documentation from recent repo changes",
		handler: async (args, ctx) => startWikiRun("update", args, ctx),
	});

	pi.registerCommand("wiki-status", {
		description: "Show .agents/wiki metadata and Git status",
		handler: async (_args, ctx) => {
			const metadata = await readLastUpdateMetadata(ctx.cwd);
			const snapshot = await createWikiContentSnapshot(ctx.cwd);
			const git = await collectGitEvidence(ctx.cwd, "update", metadata);
			const content = formatWikiStatus(metadata, snapshot, git);

			pi.sendMessage({
				customType: "wiki-status",
				content,
				display: true,
				details: { metadata, files: snapshot.files, gitHead: git.head },
			});
			ctx.ui.notify("Wiki status posted.", "info");
		},
	});

	pi.on("before_agent_start", async (event) => {
		if (!pending || pending.prompt !== event.prompt) return undefined;
		pending.consumed = true;
		return { systemPrompt: `${event.systemPrompt}\n\n${WIKI_SYSTEM_PROMPT}` };
	});

	pi.on("agent_end", async (_event, ctx) => {
		const run = pending;
		if (!run?.consumed) return;

		try {
			const after = await createWikiContentSnapshot(run.cwd);
			if (after.hash !== run.beforeHash) {
				const head = (await readGitHead(run.cwd)) || run.gitHead;
				await writeLastUpdateMetadata(run.cwd, {
					updatedAt: new Date().toISOString(),
					command: run.command,
					gitHead: head || undefined,
					model: run.model,
				});
				ctx.ui.notify("Wiki metadata updated.", "info");
			} else {
				ctx.ui.notify("Wiki docs unchanged; metadata left alone.", "info");
			}
		} finally {
			pending = undefined;
			ctx.ui.setStatus(STATUS_KEY, undefined);
		}
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		pending = undefined;
		ctx.ui.setStatus(STATUS_KEY, undefined);
	});
}

export async function readLastUpdateMetadata(cwd: string): Promise<LastUpdateMetadata | undefined> {
	try {
		const raw = await readFile(join(cwd, METADATA_PATH), "utf8");
		const parsed = JSON.parse(raw) as Partial<LastUpdateMetadata>;
		if (!parsed || typeof parsed !== "object") return undefined;
		if (typeof parsed.updatedAt !== "string" || typeof parsed.command !== "string") return undefined;
		return {
			updatedAt: parsed.updatedAt,
			command: parsed.command,
			gitHead: typeof parsed.gitHead === "string" ? parsed.gitHead : undefined,
			model: typeof parsed.model === "string" ? parsed.model : undefined,
		};
	} catch (error) {
		if (isNodeError(error, "ENOENT")) return undefined;
		return undefined;
	}
}

export async function writeLastUpdateMetadata(cwd: string, metadata: LastUpdateMetadata): Promise<void> {
	await mkdir(join(cwd, WIKI_DIR), { recursive: true });
	await writeFile(join(cwd, METADATA_PATH), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

export async function createWikiContentSnapshot(cwd: string): Promise<WikiContentSnapshot> {
	const root = join(cwd, WIKI_DIR);
	const hasher = createHash("sha256");
	const files: string[] = [];
	let exists = true;

	async function walk(dir: string, prefix: string): Promise<void> {
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch (error) {
			if (isNodeError(error, "ENOENT")) {
				exists = false;
				return;
			}
			throw error;
		}

		entries.sort((a, b) => a.name.localeCompare(b.name));
		for (const entry of entries) {
			const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
			const abs = join(dir, entry.name);

			if (rel === ".last-update.json") continue;
			if (entry.isDirectory()) {
				await walk(abs, rel);
				continue;
			}
			if (!entry.isFile()) continue;

			const content = await readFile(abs);
			files.push(rel);
			hasher.update(rel);
			hasher.update("\0");
			hasher.update(content);
			hasher.update("\0");
		}
	}

	await walk(root, "");
	return { exists, files, hash: hasher.digest("hex") };
}

export async function collectGitEvidence(
	cwd: string,
	command: WikiCommand,
	metadata?: LastUpdateMetadata,
): Promise<GitEvidence> {
	const root = await git(cwd, ["rev-parse", "--show-toplevel"]);
	if (root.code !== 0) {
		return {
			isGitRepo: false,
			head: "",
			status: "",
			sections: [{ command: "git rev-parse --show-toplevel", output: root.output || "Not a Git repository." }],
		};
	}

	const head = await readGitHead(cwd);
	const status = await git(cwd, ["status", "--short"]);
	const sections: GitSection[] = [
		{ command: "git status --short", output: status.output },
		{ command: "git rev-parse HEAD", output: head },
	];

	let hasHistory = false;
	if (command === "update" && metadata?.gitHead) {
		const range = `${metadata.gitHead}..HEAD`;
		const history = await git(cwd, ["log", range, "--name-status", "--oneline"]);
		if (history.code === 0 && history.output) {
			sections.push({ command: `git log ${range} --name-status --oneline`, output: history.output });
			hasHistory = true;
		}
	}

	if (!hasHistory && command === "update" && metadata?.updatedAt) {
		const history = await git(cwd, ["log", `--since=${metadata.updatedAt}`, "--name-status", "--oneline"]);
		if (history.code === 0 && history.output) {
			sections.push({ command: `git log --since=${metadata.updatedAt} --name-status --oneline`, output: history.output });
			hasHistory = true;
		}
	}

	if (!hasHistory) {
		const history = await git(cwd, ["log", "-20", "--name-status", "--oneline"]);
		sections.push({ command: "git log -20 --name-status --oneline", output: history.output });
	}

	const diff = await git(cwd, ["diff", "--name-status", "HEAD"]);
	sections.push({ command: "git diff --name-status HEAD", output: diff.output });

	return { isGitRepo: true, head, status: status.output, sections };
}

export function buildWikiUserPrompt(input: {
	command: WikiCommand;
	cwd: string;
	metadata?: LastUpdateMetadata;
	git: GitEvidence;
	extraInstruction?: string;
}): string {
	const action = input.command === "init" ? "initialize" : "update";
	const metadata = input.metadata ? JSON.stringify(input.metadata, null, 2) : "No prior metadata.";
	const extra = input.extraInstruction ? `\n## Extra Instruction\n\n${input.extraInstruction}\n` : "";

	return `# Wiki ${input.command}

Please ${action} the repository wiki using Pi only.

## Target

- Working directory: ${input.cwd}
- Docs directory: ${WIKI_DIR}
- Required entrypoint: ${WIKI_DIR}/quickstart.md
- Metadata file owned by extension: ${METADATA_PATH}

## Prior Metadata

${metadata}

## Git Evidence

${formatGitEvidence(input.git)}
${extra}
## Task

${input.command === "init" ? initTaskText() : updateTaskText()}

## Boundaries

- Do not edit ${METADATA_PATH}.
- Do not read secrets or credential files.
- Do not create docs outside ${WIKI_DIR}, except one concise Wiki reference section in a top-level AGENTS.md or CLAUDE.md when useful.
- Keep docs short, linked, and accurate to this repo.
- If no content change is needed, leave files unchanged and say so.`;
}

export function formatWikiStatus(
	metadata: LastUpdateMetadata | undefined,
	snapshot: WikiContentSnapshot,
	git: GitEvidence,
): string {
	return [
		"# Wiki Status",
		"",
		`Docs: ${snapshot.exists ? `${snapshot.files.length} file(s)` : "missing"}`,
		`Path: ${WIKI_DIR}`,
		`Metadata: ${metadata ? `${metadata.command} at ${metadata.updatedAt}` : "missing"}`,
		`Metadata HEAD: ${metadata?.gitHead ?? "unknown"}`,
		`Current HEAD: ${git.head || "unknown"}`,
		`Dirty Git: ${git.status ? "yes" : "no"}`,
	].join("\n");
}

async function readGitHead(cwd: string): Promise<string> {
	const result = await git(cwd, ["rev-parse", "HEAD"]);
	return result.code === 0 ? result.output.split("\n")[0]?.trim() ?? "" : "";
}

async function git(cwd: string, args: string[]): Promise<CommandResult> {
	return new Promise((resolve) => {
		execFile(
			"git",
			["--no-pager", ...args],
			{ cwd, timeout: 10_000, maxBuffer: 2 * 1024 * 1024 },
			(error, stdout, stderr) => {
				const code = typeof (error as { code?: unknown } | null)?.code === "number"
					? ((error as { code: number }).code)
					: error
						? 1
						: 0;
				const output = [stdout, stderr]
					.map((part) => String(part ?? "").trim())
					.filter(Boolean)
					.join("\n")
					.trim();
				resolve({ code, output: truncateText(output, MAX_GIT_SECTION_BYTES) });
			},
		);
	});
}

function formatGitEvidence(git: GitEvidence): string {
	if (!git.isGitRepo) return "Not a Git repository. Build docs from files only.";
	return git.sections
		.map((section) => `$ ${section.command}\n${section.output || "(no output)"}`)
		.join("\n\n");
}

function initTaskText(): string {
	return `Create an initial wiki for this repository.

Important: read existing documentation first — README.md, docs/, or any other doc directories — and adapt them into ${WIKI_DIR}. Do not rewrite from zero if good docs already exist.

Minimum useful shape:
- ${WIKI_DIR}/quickstart.md: where to start, install/run/test commands, and links to the rest.
- Add only supporting pages that make navigation easier, such as architecture, workflows, operations, integrations, or testing notes.
- Prefer fewer pages over a sprawling stub tree.`;
}

function updateTaskText(): string {
	return `Update the existing wiki from the Git evidence.

Steps:
- Read ${WIKI_DIR}/quickstart.md first if it exists.
- Read only impacted wiki pages and source files needed to verify changes.
- Patch stale pages, add missing pages only when needed, and remove obsolete claims.
- If Git evidence does not imply doc changes, do not edit files.`;
}

function formatModel(model: ExtensionCommandContext["model"]): string {
	return model ? `${model.provider}/${model.id}` : "unknown";
}

function truncateText(text: string, maxBytes: number): string {
	if (Buffer.byteLength(text, "utf8") <= maxBytes) return text;
	const sliced = Buffer.from(text, "utf8").subarray(0, maxBytes).toString("utf8");
	return `${sliced}\n[truncated to ${maxBytes} bytes]`;
}

function isNodeError(error: unknown, code: string): boolean {
	return error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === code;
}

export async function runWikiSelfTest(): Promise<void> {
	const root = await mkdtemp(join(tmpdir(), "wiki-extension-"));
	try {
		assert.equal(await readLastUpdateMetadata(root), undefined);

		const missing = await createWikiContentSnapshot(root);
		assert.equal(missing.exists, false);
		assert.deepEqual(missing.files, []);

		await mkdir(join(root, WIKI_DIR), { recursive: true });
		await writeFile(join(root, METADATA_PATH), "{}\n", "utf8");
		const metadataOnly = await createWikiContentSnapshot(root);
		assert.equal(metadataOnly.exists, true);
		assert.deepEqual(metadataOnly.files, []);
		assert.equal(metadataOnly.hash, missing.hash);

		await writeFile(join(root, WIKI_DIR, "quickstart.md"), "# Quickstart\n", "utf8");
		const withDoc = await createWikiContentSnapshot(root);
		assert.deepEqual(withDoc.files, ["quickstart.md"]);
		assert.notEqual(withDoc.hash, metadataOnly.hash);

		await writeLastUpdateMetadata(root, {
			updatedAt: "2026-07-01T00:00:00.000Z",
			command: "update",
			gitHead: "abc123",
			model: "provider/model",
		});
		assert.equal((await createWikiContentSnapshot(root)).hash, withDoc.hash);
		assert.equal((await readLastUpdateMetadata(root))?.gitHead, "abc123");

		const git = await collectGitEvidence(root, "update", undefined);
		assert.equal(git.isGitRepo, false);

		const prompt = buildWikiUserPrompt({
			command: "init",
			cwd: root,
			git,
			extraInstruction: "Prefer short docs.",
		});
		assert.match(prompt, /\.agents\/wiki\/quickstart\.md/);
		assert.match(prompt, /Prefer short docs\./);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	runWikiSelfTest()
		.then(() => console.log("wiki extension self-test passed"))
		.catch((error) => {
			console.error(error);
			process.exitCode = 1;
		});
}
