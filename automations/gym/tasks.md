# Tasks

## Daily Gym Review

Review and improve the high-risk areas recently documented for Tockbot:

1. Auth and identity: `.agents/reference/auth.md`, `packages/backend/convex/auth*.ts`, `apps/web/src/components/auth/`, `apps/web/src/lib/auth-client.ts`, `apps/*/lib/auth-return-to.ts`, and native sign-in/bootstrap. Focus on trusted origins, return-to sanitization, OAuth restore behavior, E2E bypass boundaries, and missing tests around runtime config.
2. Runtime env config: `.agents/reference/env.md`, `packages/env/src/`, `apps/web/electron/*env*.ts`, `.env.local.example`, `packages/backend/.env.local.example`, and env audit scripts. Focus on public/secret boundaries, Electron renderer env normalization, native runtime env normalization, alias drift, and docs/example parity.
3. Desktop app update: `.agents/reference/app-update.md`, `apps/web/electron/app-update.ts`, update IPC/preload bridges, `apps/web/src/lib/desktop-app-update.ts`, `apps/web/src/lib/use-desktop-app-update.ts`, and update UI components. Focus on disabled packaged-build behavior, state transitions, retry/install safety, IPC parsing, and tests.
4. Native shell and notifications: `.agents/reference/native-shell.md`, `apps/native/app/_layout.tsx`, `apps/native/app/(tabs)/_layout.tsx`, `apps/native/components/PushNotificationsManager.tsx`, `apps/native/lib/push-notification-registration.ts`, `apps/native/lib/android-navigation-bar.tsx`, and native settings shell routes. Focus on protected-route redirect, push-token reconciliation, notification route sanitization, Android chrome, and native design-system compliance.
5. Shared UI shell when touched: `.agents/reference/ui-shell.md`, `packages/ui/src/`, `apps/web/src/components/layout/`, `apps/web/src/components/ui/`, and design-system CSS. Do not broaden into a full design-system audit unless a reviewed area leads there.

For each run:

- Start with the area that has the oldest or weakest recent review signal in `memory.md`; otherwise use the order above.
- Review real source, not only docs. Use CodeGraph where available before editing symbols.
- Fix all confirmed findings that are not false positives. Prefer deletion/reuse and one root-cause fix over caller-by-caller patches.
- Add the smallest useful regression test for non-trivial logic changes or missing coverage discovered during review.
- Update the related `.agents/reference/*.md` only when behavior or ownership changes.
- Run React Doctor for affected React/TypeScript UI where applicable; otherwise run the smallest relevant project validation.
- File Beads follow-up issues for confirmed work that cannot fit safely in the current run.
- Commit and push only changes made by the gym run.
