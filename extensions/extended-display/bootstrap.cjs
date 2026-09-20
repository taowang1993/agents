// This is the first Electron main module. Never load the target app before the guard.
const electron = { ...require('electron') };
const { app } = electron;
const Module = require('node:module');
const load = Module._load;
Module._load = function (name, ...args) {
  return name === 'electron' || name === 'electron/main' ? electron : load.call(this, name, ...args);
};
// Also cover ESM consumers; Electron's native exports are non-configurable.
const guardKey = Symbol.for('pi.extended-display.electron');
globalThis[guardKey] = electron;
Module.registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'electron' || specifier === 'electron/main') return { url: 'pi-guard:electron', shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url !== 'pi-guard:electron') return next(url, context);
    return { format: 'module', shortCircuit: true, source: `const e = globalThis[Symbol.for('pi.extended-display.electron')]; export default e; ${Object.keys(electron).filter(key => /^[A-Za-z_$][\w$]*$/.test(key)).map(key => `export const ${key} = e.${key};`).join(' ')}` };
  },
});
const { writeFileSync, renameSync } = require('node:fs');
const path = require('node:path');
const { installWindowGuard, PROFILE } = require('./guard.cjs');
const childProcess = require('node:child_process');
const { syncBuiltinESMExports } = require('node:module');
const config = JSON.parse(process.env.PI_EXTENDED_DISPLAY_CONFIG);
delete process.env.PI_EXTENDED_DISPLAY_CONFIG;
const events = [];
function report(update) {
  if (update) events.push(update);
  const record = { pid: process.pid, events: events.slice(-100), ...state };
  writeFileSync(config.report + '.tmp', JSON.stringify(record));
  renameSync(config.report + '.tmp', config.report);
}
let state = { ready: false };
function stop(error) { state.error = String(error); report(); app.exit(1); }
process.on('uncaughtException', stop);
process.on('unhandledRejection', stop);
app.setPath('appData', config.root);
app.setPath('userData', path.join(config.root, 'user-data'));
app.setPath('sessionData', path.join(config.root, 'user-data'));
app.commandLine.appendSwitch('use-mock-keychain');
app.commandLine.appendSwitch('remote-debugging-address', '127.0.0.1');
app.commandLine.appendSwitch('remote-debugging-port', String(config.port));
app.on('window-all-closed', () => app.quit());

// Target app Node subprocesses inherit a no-GUI sandbox; Electron's own native
// renderer/GPU helpers remain owned by Electron. No second unguarded app launch.
for (const method of ['spawn', 'spawnSync', 'execFile', 'execFileSync']) {
  const original = childProcess[method].bind(childProcess);
  childProcess[method] = (file, args, ...rest) => {
    if (!Array.isArray(args)) { if (args !== undefined) rest.unshift(args); args = []; }
    return original('/usr/bin/sandbox-exec', ['-p', PROFILE, file, ...args], ...rest);
  };
}
for (const method of ['exec', 'execSync', 'fork']) childProcess[method] = () => { throw new Error('Unmanaged subprocess launch disabled in GUI verification; use spawn/execFile.'); };
syncBuiltinESMExports();
app.whenReady().then(() => {
  const guard = installWindowGuard(electron, { displayId: config.displayId, stop, record: report });
  state = { ready: true, display: guard.display, port: config.port };
  report();
  if (config.inspect) { app.quit(); return; }
  if (config.entry) {
    app.setAppPath(path.dirname(config.entry));
    require(config.entry);
  } else {
    const window = new electron.BrowserWindow({ width: 1512, height: 949, show: false,
      webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false } });
    window.once('ready-to-show', () => window.showInactive());
    window.loadURL(config.url ?? 'about:blank').catch(stop);
  }
}).catch(stop);
