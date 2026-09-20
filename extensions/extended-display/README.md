# Extended-Display Guard

Global Pi extension for macOS, installed through `~/.pi/agent/extensions` → `~/.agents/extensions`. Takes effect in **new sessions or after `/reload`**. Existing running sessions/children are not retroactively modified.

## Enforcement

- Every agent `bash` command runs inside a macOS Seatbelt profile denying WindowServer, LaunchServices, and Apple Event connections. This applies to indirect Node/shell subprocesses too; it is not command-text matching.
- Unknown execution tools, MCP execution/authentication, and known external agent runners are blocked. Read/search metadata, normal file tools, and native Pi coordination remain available. The installed external CLI agent profiles are disabled because they do not inherit Pi hooks.
- A session-scoped pi-subagents capability ceiling excludes raw `bash`, external runners, and unknown execution tools from children. Native worker/scout/delegate/oracle profiles use **`guarded_bash`**, whose own executor applies the sandbox even without a tool hook. If the guard cannot load, the required tool is unavailable and delegation fails rather than using raw bash. Profiles explicitly load this extension through `subagentOnlyExtensions` in `~/.pi/agent/settings.json`. Children without `extended_display` ask the parent to start the instance, then use its owned CDP endpoint.
- `extended_display` launches a **generic Electron runtime** with our bootstrap as its first main module. It refuses direct application executables. It creates an isolated app-data/profile root, preserves HOME, and uses mock Keychain storage.
- Before target app code loads, CJS and ESM Electron imports receive guarded BrowserWindow/BaseWindow constructors. Windows are constructed hidden, nonfocusable and fully inside a non-main, non-overlapping display. Bounds are checked before `showInactive()`. Later moves/resizes are constrained; main-display IDs and mirror-only layouts are rejected. Display removal/primary reassignment hides and destroys owned windows and terminates the app.
- Native dialogs, external app opens, notifications, native menu popups, DevTools windows, renderer popups and permission prompts are unsupported and blocked. Node subprocesses from the target app inherit the no-GUI sandbox.
- Only recorded owned process identities are stopped. A ten-minute deadline and session-shutdown cleanup prevent forgotten instances. Evidence stays in the returned temporary artifact directory; no user app or profile is moved, closed, or edited.

This is a guard against accidental **local** GUI launches through the supported Pi paths, not a hostile-code containment boundary. It does not police already-running sessions, user `!` commands, remote machines, arbitrary external daemons, or third-party extensions executing outside tool hooks. Do not advertise it as an OS-wide security sandbox. New agent profiles/tools need review and explicit guard loading before use; never bypass the guard with another launcher.

## Use

Call `extended_display` with:

```json
{"action":"launch","executable":"/absolute/path/to/Electron.app/Contents/MacOS/Electron","url":"http://127.0.0.1:3000"}
```

For an Electron application, replace `url` with its absolute main-module `entry`. This is a verification adapter, not a way to open a user's existing app. Use an isolated fixture, never their current vault. An application incompatible with this bootstrap remains blocked; do not use its native executable as a fallback.

`inspect` needs the same executable and reads display facts without opening a window. Optional `displayId` pins a non-primary display; without it, the lowest eligible ID is selected deterministically. `status` and `stop` require the returned launch `id`. All physical window bounds fit the selected work area; larger screenshot viewports must use CDP emulation, not a window straddling the main display.

## Checks

```sh
node --test ~/.agents/extensions/extended-display/*.test.cjs
```

Runtime proof on this Mac: main display ID 1; Sidecar ID 10, work area `(1512, 30, 1366, 994)`. A verification window was shown at `(1512, 30, 1366, 949)` with `focused: false`; root and all recorded descendants stopped. Direct WindowServer Mach lookup returned `0`; sandboxed direct and nested Node lookups returned denial `1100`. These are placement/OS-boundary checks, not a claim that every target application is compatible.
