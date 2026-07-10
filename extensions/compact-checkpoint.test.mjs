import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./compact-checkpoint.ts", import.meta.url), "utf8");

test("keeps context reminders passive and postpones compaction until the agent settles", () => {
	assert.match(source, /const REMINDER_THRESHOLDS = \[80, 90, 95\] as const;/);
	assert.match(source, /ctx\.ui\.notify\(/);
	assert.doesNotMatch(source, /pi\.sendMessage\(/);
	assert.doesNotMatch(source, /systemPrompt:/);
	assert.match(source, /pi\.on\("agent_settled"/);
	assert.doesNotMatch(source, /pi\.on\("agent_end"/);
});

test("only permits a checkpoint after task completion or an explicit pause", () => {
	assert.match(source, /only after completing the user's task or when the user explicitly asks to pause/i);
	assert.match(source, /never use it merely to split active work into phases/i);
});
