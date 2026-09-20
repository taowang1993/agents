const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');
const { readFileSync, realpathSync, mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { homedir, tmpdir } = require('node:os');
const { join } = require('node:path');
const { PROFILE, shellCommand } = require('./guard.cjs');

test('real Pi hooks wrap shell calls and apply a child capability ceiling, including fresh sessions', async () => {
  const root = JSON.parse(execFileSync('pnpm', ['list', '-g', '@earendil-works/pi-coding-agent', '--depth', '0', '--json'], { encoding: 'utf8' }))[0].dependencies['@earendil-works/pi-coding-agent'].path;
  const sdk = createRequire(realpathSync(join(root, 'package.json')));
  const jiti = sdk('jiti').createJiti(__filename, { alias: { typebox: sdk.resolve('typebox'), '@earendil-works/pi-coding-agent': join(root, 'dist/index.js') } });
  const { default: extension } = await jiti.import(join(__dirname, 'index.ts'));
  const peer = createRequire(join(homedir(), '.pi/agent/npm/node_modules/pi-subagents/package.json'));
  const api = await jiti.import(peer.resolve('pi-subagents/capability-ceiling'));
  for (const sessionId of ['display-guard-parent-test', 'display-guard-fresh-child-test']) {
    const hooks = new Map(), tools = new Map();
    await extension({ on: (name, handler) => hooks.set(name, handler), registerTool: tool => tools.set(tool.name, tool) });
    assert.equal(hooks.get('tool_call')({ toolName: 'subagent', input: { agent: 'worker' } }).block, true);
    await hooks.get('session_start')({}, { sessionManager: { getSessionId: () => sessionId } });
    const ceiling = api.resolveCurrentSubagentCapabilityCeiling(sessionId);
    assert.ok(ceiling.allowedTools.includes('guarded_bash'));
    assert.ok(!ceiling.allowedTools.includes('bash'));
    assert.ok(!ceiling.allowedTools.includes('mcp'));
    assert.ok(!ceiling.allowedAgents.includes('codex-exec'));
    const input = { command: `printf '%s' "a'b"` };
    hooks.get('tool_call')({ toolName: 'bash', input });
    assert.equal(execFileSync('/bin/bash', ['-c', input.command], { encoding: 'utf8' }), "a'b");
    const result = await tools.get('guarded_bash').execute('test', { command: 'printf guarded-child' });
    assert.match(result.content[0].text, /guarded-child/);
    await hooks.get('session_shutdown')();
    assert.equal(api.resolveCurrentSubagentCapabilityCeiling(sessionId), undefined);
  }
});

test('macOS denies WindowServer before connection, including indirect Node launches', { skip: process.platform !== 'darwin' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'display-guard-test-'));
  try {
    const source = join(dir, 'probe.c'), executable = join(dir, 'probe');
    writeFileSync(source, '#include <mach/mach.h>\n#include <servers/bootstrap.h>\n#include <stdio.h>\nint main(){mach_port_t p=MACH_PORT_NULL;printf("%d\\n",bootstrap_look_up(bootstrap_port,"com.apple.windowserver.active",&p));return 0;}');
    execFileSync('clang', [source, '-o', executable]);
    const blocked = execFileSync('/usr/bin/sandbox-exec', ['-p', PROFILE, executable], { encoding: 'utf8' }).trim();
    const nested = execFileSync('/bin/bash', ['-c', shellCommand(`node -e 'require("child_process").execFileSync(${JSON.stringify(executable)},{stdio:"inherit"})'`)], { encoding: 'utf8' }).trim();
    assert.notEqual(blocked, '0');
    assert.equal(nested, blocked);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('installed native child profiles use the guard and cannot silently retain raw bash', () => {
  const settings = JSON.parse(readFileSync(join(homedir(), '.pi/agent/settings.json'), 'utf8'));
  for (const name of ['worker', 'scout', 'delegate', 'oracle']) {
    const config = settings.subagents.agentOverrides[name];
    assert.ok(config.subagentOnlyExtensions.includes(join(__dirname, 'index.ts')));
    assert.ok(config.tools.includes('guarded_bash'));
    assert.ok(!config.tools.includes('bash'));
  }
});
