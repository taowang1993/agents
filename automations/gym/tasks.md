# Tasks

Each gym run executes exactly one review task below.

Selection:

- Start with the task that has the oldest or weakest recent review signal in `memory.md`.
- If `memory.md` has no useful signal, use the task order below.
- Do not inspect, preview, or fix another task unless the selected task directly leads there.

Common rules for every task:

- Review real source, not only docs. Use CodeGraph where available before editing symbols.
- Fix confirmed findings that are not false positives. Prefer deletion/reuse and one root-cause fix over caller-by-caller patches.
- Add the smallest useful regression test for non-trivial logic changes or missing coverage discovered during review.
- Update related `.agents/reference/*.md` only when behavior or ownership changes.
- Run React Doctor for affected React/TypeScript UI where applicable; otherwise run the smallest relevant validation.
- If shared UI shell code is touched, keep changes consistent with `.agents/reference/ui-shell.md`, `packages/ui/src/`, `apps/web/src/components/layout/`, `apps/web/src/components/ui/`, and design-system CSS. Do not broaden into a full design-system audit unless the selected task requires it.
- File Beads follow-up issues for confirmed work that cannot fit safely in the current run.
- Commit and push only changes made by the gym run.

## Auth and Identity Review

Review and improve `.agents/reference/auth.md`, `packages/backend/convex/auth*.ts`, `apps/web/src/components/auth/`, `apps/web/src/lib/auth-client.ts`, `apps/*/lib/auth-return-to.ts`, and native sign-in/bootstrap.

Focus on trusted origins, return-to sanitization, OAuth restore behavior, E2E bypass boundaries, and missing tests around runtime config.

## Runtime Environment Config Review

Review and improve `.agents/reference/env.md`, `packages/env/src/`, `apps/web/electron/*env*.ts`, `.env.local.example`, `packages/backend/.env.local.example`, and env audit scripts.

Focus on public/secret boundaries, Electron renderer env normalization, native runtime env normalization, alias drift, and docs/example parity.

## Desktop App Update Review

Review and improve `.agents/reference/app-update.md`, `apps/web/electron/app-update.ts`, update IPC/preload bridges, `apps/web/src/lib/desktop-app-update.ts`, `apps/web/src/lib/use-desktop-app-update.ts`, and update UI components.

Focus on disabled packaged-build behavior, state transitions, retry/install safety, IPC parsing, and tests.

## Native Shell and Notifications Review

Review and improve `.agents/reference/native-shell.md`, `apps/native/app/_layout.tsx`, `apps/native/app/(tabs)/_layout.tsx`, `apps/native/components/PushNotificationsManager.tsx`, `apps/native/lib/push-notification-registration.ts`, `apps/native/lib/android-navigation-bar.tsx`, and native settings shell routes.

Focus on protected-route redirect, push-token reconciliation, notification route sanitization, Android chrome, and native design-system compliance.
