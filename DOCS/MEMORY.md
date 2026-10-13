# Memory

Significant project decisions, the reasoning behind them, and the alternatives that were turned down.

Log a decision when a real fork in the road existed, the reason is not visible in the code, and reversing it later without knowing that reason would cost something. Skip routine implementation choices, feature announcements, and anything that belongs in `CHANGELOG.md` or `ROADMAP.md`.

## 2026-10-11

### Decision: Public feed first, API key features as an optional layer

What was decided: The extension works fully without an account using public `dev.to/api` endpoints. A DEV API key will be optional and only adds personal features (followed-tag feed, reading list, reactions, stats).

Why: It ships sooner, nobody has to hand over a key just to try it, and most of the value (a good feed) needs no auth.

Rejected: Public-only with no key support at all (no personal feed), and a side panel or popup instead of a new tab override (less room for a card grid).

### Decision: Build with WXT and keep Firefox on Manifest V2

What was decided: The extension uses WXT so one codebase builds Chrome (MV3) and Firefox (MV2). The Firefox build stays on WXT's default MV2.

Why: MV2 grants the `https://dev.to/*` host permission at install, so fetches just work. Firefox MV3 treats host permissions differently and needs testing before switching.

Rejected: Plain Vite with a hand-written manifest (more manual work for two browsers), and building Firefox as MV3 right away (untested permission behavior).

### Decision: Make every API call from the new tab page itself

What was decided: `lib/api/client.ts` runs inside the extension pages. There's no background script or content script.

Why: Extension pages run on the extension's origin and have `host_permissions`, which is expected to get past the CORS block DEV puts on authenticated endpoints. Content scripts would not get that exemption.

Rejected: Routing requests through a background service worker. It adds messaging code without a current need. Revisit if the Phase 2 authenticated-call test fails.
