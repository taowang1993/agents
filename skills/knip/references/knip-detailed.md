# Knip CLI reference (on-demand)

Use this file for deeper flag semantics, common patterns, and troubleshooting.

## Table of contents
- CLI flags reference
- Common audit patterns
- Configuration quick-start
- Troubleshooting false positives
- Documentation sources

## CLI flags reference

### Mode flags

| Flag | Effect |
|------|--------|
| `--production` | Exclude entry files defined by plugins (tests, stories, config) and `devDependencies` |
| `--strict` | Isolate workspaces, consider only direct dependencies. Implies `--production` |
| `--cache` | Cache AST results; 10-40% faster consecutive runs |
| `--cache-location <dir>` | Override cache dir (default: `./node_modules/.cache/knip`) |
| `--watch` | Watch mode; updates on file changes |
| `--no-gitignore` | Ignore `.gitignore` files |
| `--include-entry-exports` | Include entry file exports in unused-export reports |

### Scope flags

| Flag | Effect |
|------|--------|
| `--workspace <filter>` | Target one or more workspaces (shortcut: `-W`) |
| `--directory <dir>` | Run from a different directory |
| `--include <types>` | Report only these issue types (comma-separated) |
| `--exclude <types>` | Exclude these issue types |

### Issue types

| Type | Meaning |
|------|---------|
| `files` | Unused files |
| `dependencies` | Unused dependencies in `package.json` |
| `unlisted` | Used-but-not-listed dependencies |
| `unresolved` | Imports that can't be resolved |
| `exports` | Unused exports |
| `nsExports` | Unused namespace exports |
| `types` | Unused types/interfaces |
| `nsTypes` | Unused namespace types |
| `enumMembers` | Unused enum members |
| `duplicates` | Duplicate exports across entry files |

### Shortcut flags

| Flag | Expands to |
|------|-----------|
| `--dependencies` | `--include dependencies,unlisted,binaries,unresolved,catalog` |
| `--exports` | `--include exports,nsExports,types,nsTypes,enumMembers,duplicates` |

### Config flag

| Flag | Effect |
|------|--------|
| `--config <file>` | Path to config (`knip.json`, `knip.ts`, `package.json#knip`) |
| `--tsConfig <file>` | Path to tsconfig (shortcut: `-t`) |

## Common audit patterns

### Fast dependency-only scan
```bash
npx knip --dependencies --reporter json
```

### Export dead-code sweep
```bash
npx knip --exports --reporter json
```

### Production-only check (CI)
```bash
npx knip --production --reporter json
```

### Strict monorepo check
```bash
npx knip --strict --reporter json
```

### Single workspace
```bash
npx knip --workspace packages/core --reporter json
```

### Exclude known noise
```bash
npx knip --exclude files,enumMembers --reporter json
```

## Configuration quick-start

Config files (knip picks the first found):
- `knip.json` / `knip.jsonc` / `.knip.json` / `.knip.jsonc`
- `knip.js` / `knip.ts`
- `package.json#knip`

Minimal config for a monorepo:
```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": ["src/index.ts"],
  "project": ["src/**/*.ts"],
  "ignore": ["**/__mocks__/**"],
  "ignoreDependencies": ["some-false-positive"]
}
```

## Troubleshooting false positives

1. **File reported as unused but is used**: Add to `entry` or `project` patterns, or add an `ignore` pattern.
2. **Dependency reported as unused**: Add to `ignoreDependencies`. Common for plugins, config loaders, and convention-based tools.
3. **Dynamic import not detected**: Knip does static analysis. Dynamic `import()` and `require()` may be missed. Use `ignore` or `ignoreDependencies`.
4. **Export reported as unused but used in another workspace**: Check workspace cross-references in knip config.

## Documentation sources

- CLI reference: `https://knip.dev/reference/cli`
- Plugins list: `https://knip.dev/reference/plugins`
- Configuration: `https://knip.dev/reference/configuration`
- Handling issues: `https://knip.dev/guides/handling-issues`
- Monorepos: `https://knip.dev/guides/monorepos-and-workspaces`
