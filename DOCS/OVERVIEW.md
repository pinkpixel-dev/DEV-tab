# DEV Tab Overview

DEV Tab is a browser extension for Chrome and Firefox that replaces the new tab page with a feed of DEV (dev.to) posts. It's read-only right now: it fetches public posts, and clicking one opens it on dev.to.

This document describes how the project works right now. Decisions and their reasoning live in `MEMORY.md`. Release history lives in `CHANGELOG.md`.

## Stack

- [WXT](https://wxt.dev) `0.21.x` for the extension build, manifest and entrypoints
- React 19 with TypeScript `~5.9.3` (the version WXT's template pins)
- `wxt/utils/storage` for typed `browser.storage.local` access
- `lucide-react` for icons
- Geist and Geist Mono, bundled through `@fontsource-variable` so pages never load remote fonts
- Vitest with `WxtVitest` and `fakeBrowser` for unit tests

Builds: Chrome is Manifest V3 (`.output/chrome-mv3`), Firefox is Manifest V2 (`.output/firefox-mv2`). Both come from the same code.

## Core Flow

1. Opening a new tab loads `entrypoints/newtab/`, which waits for settings from storage, then renders the feed for `settings.defaultFeed`.
2. `useFeed` (`hooks/useFeed.ts`) reads the cached first page for the current feed and tag from storage. If there's a cache entry it shows right away.
3. If the cache is missing or older than `CACHE_TTL_MS` (10 minutes), it fetches page 1 from `https://dev.to/api` and writes it back to the cache. Search results and later pages are never cached.
4. If that fetch fails while cached posts are on screen, the posts stay and a banner explains why (offline, rate limited, other error) with a Retry button. With nothing cached, a full error state shows instead.
5. Hidden tags are filtered out in the browser after every fetch (`hideTagged` in `lib/api/articles.ts`), not by the API.
6. Settings changes from the options page reach every open tab through `settingsItem.watch` in `hooks/useSettings.ts`.

Invariant: every network request goes from an extension page straight to `dev.to`. There is no background script, content script or other server.

## Project Structure

```text
entrypoints/
  newtab/        new tab page (App.tsx holds the page layout and state)
  options/       settings page, opens in a full tab
components/
  feed/          FeedGrid, ArticleCard, FeedTabs, LoadMore
  search/        SearchBox
  tags/          TagFilter (feed chips), TagListEditor (settings)
  ui/            StatusMessage and Banner
hooks/           useFeed, useSettings, useKeyboardNav
lib/
  api/           client.ts (fetch, Accept header, ApiError), articles.ts (feeds, search, filtering), types.ts
  cache.ts       TTL cache over storage.local
  settings.ts    settings item, defaults, tag helpers
  format.ts      counts and relative times
  app-info.ts    app name, version from package.json
styles/          tokens.css (OKLCH color tokens), base.css
public/icon/     extension icons, rendered from assets/icon.svg
tests/           Vitest tests for lib/
wxt.config.ts    manifest settings
```

Project documentation lives in `/DOCS`.

- `/DOCS/OVERVIEW.md`: current architecture and behavior
- `/DOCS/MEMORY.md`: significant decisions and rejected alternatives
- `/DOCS/ERRORS.md`: difficult bugs, failed approaches, and reusable fixes
- `/DOCS/PLAN.md`: the phased build plan
- `/DOCS/ROADMAP.md`: what's done and what's next
- `/DOCS/TESTING-AND-PACKAGING.md`: running, loading and zipping the extension
- `/DOCS/reference/`: DEV API notes, endpoint list and the saved OpenAPI spec
- `README.md`: user-facing project documentation
- `CHANGELOG.md`: release history

## Data Model

Everything lives in `browser.storage.local`.

| Key | Shape | Notes |
|---|---|---|
| `settings` | `{ defaultFeed, density, savedTags, hiddenTags }` | Read through `getSettings()`, which fills missing fields from `DEFAULT_SETTINGS` |
| `cache:feed:<kind>:<tag>` | `{ at, data: Article[] }` | First page only. `<tag>` is empty when no tag is selected |

## Feeds

| Feed | Request |
|---|---|
| Today | `GET /articles?top=1` |
| This week | `GET /articles?top=7` |
| Rising | `GET /articles?state=rising` |
| Latest | `GET /articles/latest` |
| Search | `GET /articles/search?q=` |

All feeds use `per_page=30` and `page`. A selected tag adds `tag=<name>`. Every request sends `Accept: application/vnd.forem.api-v1+json`.

## Auth

None yet. Every endpoint used is public. The optional DEV API key is planned for Phase 2.

## Permissions

`storage` and `https://dev.to/*`. The manifest is defined in `wxt.config.ts`. The Firefox build also gets `browser_specific_settings.gecko.id` set to `dev-tab@pinkpixel.dev`.

## Commands

```bash
npm run dev            # Chrome with live reload
npm run dev:firefox    # Firefox with live reload
npm run build          # .output/chrome-mv3
npm run build:firefox  # .output/firefox-mv2
npm run compile        # tsc --noEmit
npm test               # vitest run
npm run zip            # Chrome store zip
npm run zip:firefox    # Firefox store zip and sources zip
```

## Current Limits

- No API key features yet (personal feed, reading list, reactions, stats).
- DEV's rate limits aren't documented. The cache keeps request volume low, but 429s can still happen.
- `npm audit` reports issues in `web-ext`'s dependencies. That's the dev-only browser launcher, and `npm audit --omit=dev` is clean.
