const PROFILE = `(version 1)
(allow default)
(deny mach-lookup
  (global-name-regex #"^com\\.apple\\.windowserver")
  (global-name "com.apple.coreservices.launchservicesd")
  (global-name "com.apple.coreservices.appleevents")
  (global-name "com.apple.appleeventsd"))
(deny appleevent-send)
`;
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const shellCommand = command => `/usr/bin/sandbox-exec -p ${quote(PROFILE)} /bin/bash -c ${quote(command)}`;
const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
const rectangle = b => b && ['x', 'y', 'width', 'height'].every(k => Number.isFinite(b[k])) && b.width > 0 && b.height > 0;

// Electron requires standard custom schemes before ready; target code still loads
// only after display validation. The sidecar is data, never an early code hook.
function registerEntrySchemes(electron, entry) {
  if (!entry) return;
  const { readFileSync } = require('node:fs');
  let text;
  try { text = readFileSync(entry + '.protocols.json', 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  const names = JSON.parse(text);
  const reserved = new Set(['http', 'https', 'file', 'data', 'javascript', 'about', 'blob', 'chrome', 'devtools', 'ws', 'wss']);
  if (!Array.isArray(names) || names.length > 8 || new Set(names).size !== names.length
    || names.some(name => typeof name !== 'string' || !/^[a-z][a-z0-9+.-]{1,31}$/.test(name) || reserved.has(name))) {
    throw new Error('Invalid entry scheme declaration. Supply up to eight unique custom scheme names.');
  }
  if (names.length) electron.protocol.registerSchemesAsPrivileged(names.map(scheme => ({ scheme,
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true, corsEnabled: true } })));
}

function chooseDisplay(displays, primary, requestedId) {
  const candidates = displays.filter(d => d.id !== primary.id && rectangle(d.bounds) && rectangle(d.workArea)
    && !overlaps(d.bounds, primary.bounds) && (requestedId === undefined || requestedId === d.id));
  candidates.sort((a, b) => a.id - b.id);
  if (!candidates.length) throw new Error('No eligible extended display. Refusing to open on the main or mirrored display.');
  return candidates[0];
}
function fitBounds(input, display) {
  const area = display.workArea;
  const b = { x: area.x, y: area.y, width: 1200, height: 800, ...input };
  if (!rectangle(b)) throw new Error('Invalid window bounds.');
  const width = Math.min(Math.round(b.width), area.width), height = Math.min(Math.round(b.height), area.height);
  return { x: Math.round(Math.max(area.x, Math.min(b.x, area.x + area.width - width))),
    y: Math.round(Math.max(area.y, Math.min(b.y, area.y + area.height - height))), width, height };
}

function installWindowGuard(electron, { displayId, stop, record = () => {} }) {
  const { app, screen } = electron;
  const chosen = chooseDisplay(screen.getAllDisplays(), screen.getPrimaryDisplay(), displayId);
  const windows = new Set();
  let failed = false;
  const fail = error => {
    if (failed) return;
    failed = true;
    for (const win of windows) if (!win.isDestroyed()) { win.hide(); win.destroy(); }
    record({ error: String(error) });
    stop(error);
  };
  const current = () => chooseDisplay(screen.getAllDisplays(), screen.getPrimaryDisplay(), chosen.id);
  const constrain = bounds => {
    if (failed) throw new Error('Extended-display launch has stopped.');
    return fitBounds(bounds, current());
  };
  for (const key of ['BrowserWindow', 'BaseWindow']) {
    const Original = electron[key];
    if (!Original) continue;
    const Wrapped = new Proxy(Original, {
      construct(Target, args) {
        const options = args[0] ?? {};
        // Main verification windows fill the selected display; child dialogs stay bounded.
        const windowBounds = b => constrain(options.parent ? b : current().workArea);
        const bounds = windowBounds(Object.fromEntries(['x', 'y', 'width', 'height'].filter(k => options[k] !== undefined).map(k => [k, options[k]])));
        const win = new Target({ ...options, ...bounds, show: false, focusable: false, fullscreen: false,
          fullscreenable: false, maximizable: false, movable: false, resizable: false,
          minWidth: 1, minHeight: 1, maxWidth: current().workArea.width, maxHeight: current().workArea.height,
          webPreferences: { ...options.webPreferences, disableDialogs: true } });
        windows.add(win);
        const setBounds = win.setBounds.bind(win), showInactive = win.showInactive.bind(win);
        const place = b => { const fitted = windowBounds(b); setBounds(fitted, false); return fitted; };
        win.setBounds = b => { place({ ...win.getBounds(), ...b }); };
        win.setPosition = (x, y) => { place({ ...win.getBounds(), x, y }); };
        win.setSize = (width, height) => { place({ ...win.getBounds(), width, height }); };
        win.setContentBounds = win.setBounds;
        win.setContentSize = win.setSize;
        win.center = () => { place({ ...win.getBounds(), x: current().workArea.x, y: current().workArea.y }); };
        win.show = win.showInactive = () => {
          try {
            const fitted = place(win.getBounds());
            // Inspect actual native bounds before visibility, not an optimistic requested position.
            const actual = win.getBounds();
            if (Object.keys(fitted).some(k => fitted[k] !== actual[k])) throw new Error('Native window placement did not match the extended display.');
            showInactive();
            if (win.isFocused?.()) throw new Error('Verification window unexpectedly took focus.');
            record({ windowId: win.id, displayId: chosen.id, bounds: actual, visible: true, focused: false });
          } catch (error) { fail(error); throw error; }
        };
        for (const method of ['focus', 'moveTop', 'maximize', 'unmaximize', 'setFullScreen', 'setSimpleFullScreen',
          'setFocusable', 'setMovable', 'setResizable', 'setAlwaysOnTop', 'setMinimumSize', 'setMaximumSize', 'setAspectRatio']) win[method] = () => {};
        win.restore = win.showInactive;
        win.on('closed', () => windows.delete(win));
        if (options.show !== false) win.showInactive();
        return win;
      },
    });
    Object.defineProperty(electron, key, { configurable: true, enumerable: true, value: Wrapped });
  }
  app.focus = () => {};
  app.dock?.hide();
  app.setActivationPolicy?.('accessory');
  // These can create unmanaged system/browser windows on the main screen.
  const deny = () => { throw new Error('Use a guarded app-scoped operation; native dialogs/external launches are disabled during verification.'); };
  for (const key of ['openExternal', 'openPath', 'showItemInFolder']) if (electron.shell) electron.shell[key] = deny;
  for (const key of Object.keys(electron.dialog ?? {})) if (key.startsWith('show')) electron.dialog[key] = deny;
  if (electron.Menu) {
    electron.Menu.setApplicationMenu(null);
    electron.Menu.setApplicationMenu = () => {};
    electron.Menu.prototype.popup = deny;
  }
  if (electron.systemPreferences) electron.systemPreferences.askForMediaAccess = deny;
  app.on?.('web-contents-created', (_event, contents) => {
    const setHandler = contents.setWindowOpenHandler.bind(contents);
    setHandler(() => ({ action: 'deny' }));
    contents.setWindowOpenHandler = () => setHandler(() => ({ action: 'deny' }));
    contents.openDevTools = deny;
    contents.inspectElement = deny;
    contents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    contents.session.setPermissionCheckHandler(() => false);
  });
  if (electron.Notification) Object.defineProperty(electron, 'Notification', { configurable: true, value: class { constructor() { deny(); } } });
  const topology = () => {
    try { current(); for (const win of windows) win.setBounds(win.getBounds()); }
    catch (error) { fail(error); }
  };
  for (const event of ['display-removed', 'display-added', 'display-metrics-changed']) screen.on(event, topology);
  return { display: chosen, windows };
}

const SAFE_TOOLS = new Set(['read', 'write', 'edit', 'bash', 'guarded_bash', 'grep', 'find', 'ls', 'extended_display',
  'ask_user', 'intercom', 'subagent_supervisor', 'bg_wait', 'compact_checkpoint', 'goal_wait', 'goal_complete', 'goal_blocked',
  'web_search', 'fetch_content', 'get_search_content', 'source_check', 'contact_supervisor']);
function toolBlockReason(toolName, input) {
  const name = toolName.split('.').at(-1);
  if (SAFE_TOOLS.has(name)) return null;
  if (name === 'subagent') {
    if (input.action) return null;
    if (input.machine || /(?:codex-exec|claude-code|cursor-agent)/.test(JSON.stringify(input))) return 'Extended-display guard: external agent runners cannot inherit the native Pi guard. Use native Pi children.';
    return null;
  }
  if (name === 'mcp' && !input.tool && !input.connect && !input.url && !input.server && (!input.action || input.action === 'ui-messages')) return null;
  return `Extended-display guard: ${name} is not a guarded local GUI execution path. Use extended_display for visible app/browser verification; do not bypass this guard.`;
}
module.exports = { PROFILE, chooseDisplay, fitBounds, installWindowGuard, shellCommand, toolBlockReason, registerEntrySchemes };
