import { createBashTool, type ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { Type } from 'typebox';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { shellCommand, toolBlockReason } = require('./guard.cjs');
const { startRun, stopRun } = require('./runner.cjs');

export default async function extendedDisplay(pi: ExtensionAPI) {
  const runs = new Map<string, any>();
  let ceilingReady = false;
  let ceiling: { dispose(): void } | undefined;
  // Children may execute only this intrinsically sandboxed shell, never a raw
  // builtin bash from a profile that accidentally omitted extension loading.
  pi.registerTool({
    ...createBashTool(process.cwd(), { spawnHook: context => {
      if (process.platform !== 'darwin') throw new Error('No unguarded shell fallback outside macOS.');
      return { ...context, command: shellCommand(context.command) };
    } }),
    name: 'guarded_bash',
    label: 'Guarded Bash',
  });
  pi.on('tool_call', (event) => {
    const input = event.input as Record<string, unknown>;
    if (event.toolName === 'subagent' && !input.action && !ceilingReady) return { block: true, reason: 'Extended-display child capability gate is unavailable; refusing unguarded delegation.' };
    const reason = toolBlockReason(event.toolName, input);
    if (reason) return { block: true, reason };
    if (event.toolName.split('.').at(-1) === 'bash') {
      if (process.platform !== 'darwin') return { block: true, reason: 'Extended-display shell guard is macOS-only; no unguarded fallback.' };
      if (typeof input.command !== 'string') return { block: true, reason: 'Missing shell command.' };
      const marked = input as Record<symbol, unknown>;
      const key = Symbol.for('pi.extended-display.shell-wrapped');
      if (!marked[key]) { input.command = shellCommand(input.command); marked[key] = true; }
    }
  });
  pi.on('before_agent_start', event => ({ systemPrompt: event.systemPrompt + '\n\nExtended-display-only verification is enforced. Shell subprocesses cannot open local GUI windows or send Apple Events. Use extended_display for supported app/browser launches; windows are placed on a non-main display before showing without focus. If the tool is unavailable in a child, ask the supervisor to launch it. No main-screen fallback, raw app launch, external agent runner, native dialog, or user-app attachment. Use app-scoped CDP only against a returned owned endpoint. Stop owned runs explicitly. Do not disable or bypass this guard.' }));
  pi.registerTool({
    name: 'extended_display',
    label: 'Extended Display',
    description: 'Inspect, launch, inspect status, or stop an isolated macOS Electron/Chromium verification instance on an extended display only. Requires a generic Electron.app executable. Optional entry is an Electron main module; omit it for a browser window at url. Never uses a user profile. Returns owned loopback CDP endpoint and placement evidence. Stops after 10 minutes or session shutdown. Unsupported apps must not be launched through another path.',
    parameters: Type.Object({
      action: Type.Union([Type.Literal('inspect'), Type.Literal('launch'), Type.Literal('status'), Type.Literal('stop')]),
      executable: Type.Optional(Type.String({ description: 'Absolute generic Electron.app/Contents/MacOS/Electron path.' })),
      entry: Type.Optional(Type.String({ description: 'Absolute Electron main module, loaded after the guard.' })),
      url: Type.Optional(Type.String()),
      displayId: Type.Optional(Type.Integer()),
      id: Type.Optional(Type.String()),
    }),
    async execute(_id, input, signal) {
      if (input.action === 'stop' || input.action === 'status') {
        const run = runs.get(input.id ?? '');
        if (!run) throw new Error('Unknown owned launch ID; cannot control another session or user app.');
        const result = input.action === 'stop' ? await stopRun(run) : JSON.parse(readFileSync(run.report, 'utf8'));
        if (input.action === 'stop') runs.delete(run.id);
        return { content: [{ type: 'text', text: JSON.stringify(result) }], details: result };
      }
      if (!input.executable) throw new Error('A generic Electron runtime path is required.');
      const { run, state } = await startRun({ ...input, inspect: input.action === 'inspect' }, signal);
      runs.set(run.id, run);
      if (input.action === 'inspect') {
        const cleanup = await stopRun(run); runs.delete(run.id);
        return { content: [{ type: 'text', text: JSON.stringify({ ...state, cleanup }) }], details: { ...state, cleanup } };
      }
      const result = { id: run.id, rootPid: run.child.pid, display: state.display,
        cdp: `http://127.0.0.1:${state.port}`, artifacts: run.root, expiresInSeconds: 600 };
      return { content: [{ type: 'text', text: JSON.stringify(result) }], details: result };
    },
  });
  // Public pi-subagents integration; failure leaves delegation blocked, not
  // silently downgraded to prompt-only instructions.
  try {
    const peer = createRequire(join(homedir(), '.pi/agent/npm/node_modules/pi-subagents/package.json'));
    const { createJiti } = peer('jiti');
    const api = await createJiti(import.meta.url).import(peer.resolve('pi-subagents/capability-ceiling'));
    pi.on('session_start', (_event, ctx) => {
      ceiling = api.registerSubagentCapabilityCeiling({
        sessionId: ctx.sessionManager.getSessionId(), source: 'extended-display',
        ceiling: {
          allowedAgents: ['delegate', 'scout', 'worker', 'reviewer', 'oracle', 'researcher', 'evidence-auditor', 'exa-pro'],
          allowedTools: ['read', 'write', 'edit', 'grep', 'find', 'ls', 'guarded_bash', 'extended_display', 'contact_supervisor',
            'web_search', 'fetch_content', 'get_search_content', 'source_check'],
        },
      });
      ceilingReady = true;
    });
  } catch { /* shell/file tools remain guarded; delegation fails closed */ }
  pi.on('session_shutdown', async () => {
    ceilingReady = false;
    ceiling?.dispose();
    await Promise.all([...runs.values()].map(run => stopRun(run)));
    runs.clear();
  });
}
