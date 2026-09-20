const { spawn, execFileSync } = require('node:child_process');
const { mkdtempSync, mkdirSync, readFileSync, openSync, closeSync, realpathSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, basename } = require('node:path');
const net = require('node:net');
const { randomUUID } = require('node:crypto');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function processes() {
  return execFileSync('/bin/ps', ['-axo', 'pid=,ppid=,pgid=,lstart=,command='], { encoding: 'utf8' }).trim().split('\n').map(line => {
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/);
    return match && { pid: Number(match[1]), parent: Number(match[2]), group: Number(match[3]), identity: match[4] };
  }).filter(Boolean);
}
function remember(run) {
  const rows = processes();
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of rows) if (!run.owned.has(p.pid) && (p.pid === run.child.pid || p.group === run.child.pid || run.owned.has(p.parent))) {
      run.owned.set(p.pid, p.identity); changed = true;
    }
  }
  return rows.filter(p => run.owned.get(p.pid) === p.identity);
}
async function stopRun(run) {
  if (run.stopping) return run.stopping;
  run.stopping = (async () => {
    clearInterval(run.monitor); clearTimeout(run.deadline);
    for (const signal of ['SIGTERM', 'SIGKILL']) {
      for (const p of remember(run).reverse()) { try { process.kill(p.pid, signal); } catch (error) { if (error.code !== 'ESRCH') throw error; } }
      await sleep(300);
    }
    const remaining = remember(run);
    if (remaining.length) throw new Error('Owned processes remain: ' + remaining.map(p => p.pid).join(', '));
    return { id: run.id, stopped: true, rootPid: run.child.pid, recordedPids: [...run.owned.keys()], remaining: [], artifacts: run.root };
  })();
  return run.stopping;
}
async function startRun(input, signal) {
  if (process.platform !== 'darwin') throw new Error('Guarded GUI launch is implemented only on macOS; refusing unguarded fallback.');
  const executable = realpathSync(input.executable);
  if (basename(executable) !== 'Electron' || !executable.includes('/Electron.app/Contents/MacOS/')) throw new Error('Use an installed generic Electron runtime, not an application executable; the guard must load before app code.');
  if (input.entry && input.url) throw new Error('Choose an Electron entry or browser URL, not both.');
  if (input.url && !/^https?:\/\//.test(input.url) && input.url !== 'about:blank') throw new Error('Only http(s) or about:blank browser URLs are allowed.');
  const entry = input.entry ? realpathSync(input.entry) : undefined;
  const root = mkdtempSync(join(tmpdir(), 'pi-extended-display-'));
  mkdirSync(join(root, 'user-data'));
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  const report = join(root, 'placement.json');
  const config = { root, report, port, entry, url: input.url, displayId: input.displayId, inspect: input.inspect };
  const log = openSync(join(root, 'electron.log'), 'a', 0o600);
  const env = { ...process.env, PI_EXTENDED_DISPLAY_CONFIG: JSON.stringify(config) };
  delete env.ELECTRON_RUN_AS_NODE; delete env.NODE_OPTIONS;
  const child = spawn(executable, ['--use-mock-keychain', join(__dirname, 'bootstrap.cjs')], { detached: true, cwd: root, stdio: ['ignore', log, log], env });
  closeSync(log);
  const run = { id: randomUUID(), child, root, report, owned: new Map() };
  let spawnError;
  child.on('error', error => { spawnError = error; });
  run.monitor = setInterval(() => { try { remember(run); } catch { void stopRun(run).catch(() => {}); } }, 500);
  run.deadline = setTimeout(() => { void stopRun(run).catch(() => {}); }, 10 * 60_000);
  try {
    remember(run);
    for (let attempt = 0; attempt < 200; attempt++) {
      signal?.throwIfAborted();
      if (spawnError) throw spawnError;
      let state;
      try { state = JSON.parse(readFileSync(report, 'utf8')); } catch { /* awaiting first atomic report */ }
      if (state?.error) throw new Error(state.error);
      if (state?.ready) return { run, state };
      if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Guarded Electron exited before readiness; see ${root}/electron.log`);
      await sleep(50);
    }
    throw new Error('Guarded Electron did not become ready within 10 seconds.');
  } catch (error) { await stopRun(run); throw error; }
}
module.exports = { startRun, stopRun };
