const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { chooseDisplay, fitBounds, installWindowGuard, shellCommand, toolBlockReason, registerEntrySchemes } = require('./guard.cjs');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const primary = { id: 1, bounds: { x: 0, y: 0, width: 1512, height: 982 }, workArea: { x: 0, y: 33, width: 1512, height: 949 } };
const side = { id: 10, bounds: { x: -1366, y: 0, width: 1366, height: 1024 }, workArea: { x: -1366, y: 25, width: 1366, height: 999 } };

test('entry scheme declarations register only named secure protocols, not early app code or privilege overrides', () => {
  const dir = mkdtempSync(join(tmpdir(), 'guard-schemes-'));
  const entry = join(dir, 'main.cjs');
  const calls = [];
  const electron = { protocol: { registerSchemesAsPrivileged: value => calls.push(value) } };
  try {
    registerEntrySchemes(electron);
    registerEntrySchemes(electron, entry);
    assert.deepEqual(calls, []);
    writeFileSync(entry + '.protocols.json', JSON.stringify(['app']));
    registerEntrySchemes(electron, entry);
    assert.deepEqual(calls, [[{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true, corsEnabled: true } }]]);
    for (const bad of [['http'], ['file'], ['javascript'], ['APP'], ['app', 'app'], Array(9).fill('app'), [{ scheme: 'app', privileges: { bypassCSP: true } }], { app: true }, null]) {
      writeFileSync(entry + '.protocols.json', JSON.stringify(bad));
      assert.throws(() => registerEntrySchemes(electron, entry), /scheme declaration/i);
    }
    writeFileSync(entry + '.protocols.json', '{broken');
    assert.throws(() => registerEntrySchemes(electron, entry));
    assert.equal(calls.length, 1, 'Invalid declarations must not reach Electron');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('chooses an extended display regardless of negative coordinates; rejects absent/mirrored/main targets', () => {
  assert.equal(chooseDisplay([primary, side], primary).id, 10);
  assert.throws(() => chooseDisplay([primary], primary), /extended display/i);
  assert.throws(() => chooseDisplay([primary, { ...primary, id: 2 }], primary), /extended display/i);
  assert.throws(() => chooseDisplay([primary, side], primary, 1), /extended display/i);
});
test('fits the entire window, not just its origin, inside the extended work area', () => {
  assert.deepEqual(fitBounds({ x: 40, y: 40, width: 1512, height: 949 }, side), { x: -1366, y: 40, width: 1366, height: 949 });
  assert.throws(() => fitBounds({ width: NaN }, side), /bounds/i);
});
test('blocks unguarded GUI tools, but preserves inspection, normal tools and management', () => {
  assert.match(toolBlockReason('mcpScript', {}), /guarded/i);
  assert.match(toolBlockReason('mcp', { action: 'auth-start' }), /guarded/i);
  assert.match(toolBlockReason('browser_open', {}), /guarded/i);
  assert.equal(toolBlockReason('mcp', { search: 'docs' }), null);
  assert.equal(toolBlockReason('bash', { command: 'node test.cjs' }), null);
  assert.equal(toolBlockReason('read', {}), null);
  assert.equal(toolBlockReason('subagent', { action: 'status' }), null);
  assert.match(toolBlockReason('subagent', { agent: 'codex-exec' }), /native/i);
  assert.match(shellCommand('printf "hello"'), /sandbox-exec/);
});
test('creates hidden, places before showing, never focuses, constrains subsequent moves and exits on display loss', () => {
  const calls = []; const windows = [];
  class Window extends EventEmitter {
    constructor(options) { super(); this.bounds = options; this.visible = false; this.dead = false; windows.push(this); calls.push(['construct', options]); }
    setBounds(b) { this.bounds = b; calls.push(['bounds', b]); }
    getBounds() { return this.bounds; }
    showInactive() { this.visible = true; calls.push(['show', this.bounds]); }
    show() { throw Error('Must not focus'); }
    focus() { throw Error('Must not focus'); }
    hide() { this.visible = false; calls.push(['hide']); }
    destroy() { this.dead = true; }
    isDestroyed() { return this.dead; }
    static getAllWindows() { return windows.filter(w => !w.dead); }
  }
  const screen = Object.assign(new EventEmitter(), { getAllDisplays: () => [primary, side], getPrimaryDisplay: () => primary });
  const electron = { BrowserWindow: Window, BaseWindow: Window, screen, app: { focus() {}, dock: { hide() {} } }, shell: {}, dialog: {} };
  let stopped = false;
  installWindowGuard(electron, { stop: () => { stopped = true; } });
  const win = new electron.BrowserWindow({ x: 40, y: 40, width: 1512, height: 949 });
  assert.equal(calls[0][1].show, false);
  assert.equal(calls[0][1].focusable, false);
  assert.equal(calls[0][1].x, -1366);
  assert.equal(calls[0][1].y, side.workArea.y);
  assert.equal(calls[0][1].width, side.workArea.width);
  assert.equal(calls[0][1].height, side.workArea.height);
  assert.equal(calls.at(-1)[0], 'show');
  win.show(); win.focus(); win.setPosition(0, 0);
  assert.equal(win.getBounds().x, -1366);
  assert.equal(win.getBounds().y, 25);
  win.setSize(640, 480);
  assert.deepEqual(win.getBounds(), side.workArea, 'Main verification windows keep filling the extended display');
  const dialog = new electron.BrowserWindow({ parent: win, width: 400, height: 300, show: false });
  assert.equal(dialog.getBounds().width, 400, 'Owned child dialogs retain their requested size');
  assert.equal(dialog.getBounds().height, 300);
  screen.getAllDisplays = () => [primary]; screen.emit('display-removed');
  assert.equal(win.dead, true); assert.equal(stopped, true);
});
