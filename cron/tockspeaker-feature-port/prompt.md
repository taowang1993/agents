You are running as an unattended Pi maintenance task.

Goal: keep `/Users/max/projects/resources/.voice/features.md` up to date by porting user-facing feature coverage from these source project directories:

- Handy: `/Users/max/projects/resources/.voice/handy`
- OmniVoice: `/Users/max/projects/resources/.voice/omnivoice`
- OpenWhispr: `/Users/max/projects/resources/.voice/openwhispr`
- Voicebox: `/Users/max/projects/resources/.voice/voicebox`

Rules:

1. Read `/Users/max/projects/resources/.voice/features.md` first.
2. Inspect only the four source directories above plus existing `.voice/*.md` source inventories when useful.
3. Modify only `/Users/max/projects/resources/.voice/features.md`.
4. Keep the file a user-facing feature checklist. Do not copy implementation internals, code architecture, or source-app marketing fluff.
5. Preserve the cross-platform commitment: committed TockSpeaker features must work on macOS, Windows, and Linux. Do not mark macOS-only behavior as complete.
6. Keep an explicit Source Project References section in `features.md` that points to all four source directories.
7. When adding or updating planned features, include compact source references such as `(Source: Handy)` or `(Sources: OpenWhispr, Voicebox)` when the origin is not already obvious from the coverage tables.
8. Merge duplicates instead of adding parallel checklist items.
9. Leave existing checked items checked only when they are already claimed as Available Today in `features.md`; add newly ported items unchecked unless the file already documents them as available.
10. If there is no safe update, leave the file unchanged and say why.

Do not install packages. Do not run dev servers. Do not edit code.