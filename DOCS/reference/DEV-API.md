# DEV API notes

These are my notes on the DEV (dev.to) API, written with the extension idea in mind: a new tab page that shows a DEV feed, similar to what daily.dev does for its sources.

DEV runs on [Forem](https://github.com/forem/forem), so the DEV API is the Forem API V1. The source of truth is the OpenAPI spec saved next to this file.

## Files in this folder

| File | What it is |
|---|---|
| `forem-api-v1.openapi.json` | The full OpenAPI spec, pulled from `forem/forem` main on 2026-10-11 |
| `endpoints.md` | Every endpoint grouped by tag, generated from the spec |
| `forem-api-v1-docs.md` | The rendered docs page from https://developers.forem.com/api/v1, saved as Markdown. Easier to read than the JSON, with response samples and usage tips |
| `DEV-API.md` | This file |

## Making requests

Base URL is `https://dev.to`, and every path starts with `/api`. Send the versioned `Accept` header on every request:

```http
GET https://dev.to/api/articles?top=7&per_page=30
Accept: application/vnd.forem.api-v1+json
```

For anything tied to your account, add your key:

```http
api-key: YOUR_DEV_API_KEY
```

You create a key at https://dev.to/settings/extensions under "DEV API Keys". The spec also mentions an `Authorization: Bearer` JWT option, but that only works on Forem instances that set up a delegation service. I wouldn't plan around it for DEV.

Dates use RFC 3339. Pagination is `page` (starts at 1) plus `per_page`. The defaults and limits change per endpoint. For example, `/api/articles` defaults to 30 per page and allows up to 1000, and semantic search caps at 100.

## CORS, and why it matters for an extension

The spec says this about authenticated endpoints:

> All authenticated endpoints are CORS disabled, the API key is intended for non-browser scripts.

Public endpoints are fine. I checked `GET /api/articles` on 2026-10-11 and it returns `access-control-allow-origin: *`.

For a Chrome extension:

- The new tab page and popup run on the extension's own origin. If the manifest has `host_permissions` for `https://dev.to/*`, those pages can make cross-origin requests without CORS getting in the way. That's how Chrome documents extension origins, but I'd still test it with an authenticated call early on.
- Content scripts run under the page's origin, so they don't get that exemption. If the extension ever injects UI into dev.to itself, route API calls through the background service worker.
- The API key would sit in `chrome.storage`. Keep it out of anything that gets synced or logged.

## What's useful for a daily.dev style feed

### The feed itself (no key needed)

| What | Endpoint | Notes |
|---|---|---|
| Top posts | `GET /api/articles?top=N` | `N` is days. `top=1` is today, `top=7` is this week |
| Rising or fresh | `GET /api/articles?state=rising` | `state` takes `fresh`, `rising` or `all` |
| Newest | `GET /api/articles/latest` | Sorted by publish date |
| By tag | `GET /api/articles?tag=rust` | One tag at a time. It also works with `top`, `state` and `/articles/latest` |
| By author or org | `GET /api/articles?username=...` | Works for users and organizations |
| Search | `GET /api/articles/search?q=...` | Matches titles, tags and body. `top` limits it to recent posts |
| Semantic search | `GET /api/articles/semantic_search?q=...` | Has an optional `threshold` (0.0 to 2.0). Newer endpoint, worth testing before relying on it |
| Full article | `GET /api/articles/{id}` or `/api/articles/{username}/{slug}` | Includes the body, so you could show a preview without leaving the tab |
| Comments | `GET /api/comments?a_id={id}` | Read only |
| Tags | `GET /api/tags` | For a tag picker |
| Videos | `GET /api/videos` | Articles that have a video |
| Trends | `GET /api/trends`, `/api/trends/{slug}/articles` | |

A feed card has what you'd want. The list response includes `title`, `description`, `url`, `cover_image`, `social_image`, `tag_list`, `reading_time_minutes`, `public_reactions_count`, `comments_count`, `published_at`, `readable_publish_date` and a `user` object with the author's name and profile image.

One small thing: `comments_count` shows up in real responses but isn't listed in the spec's `ArticleIndex` schema. Don't trust the schema blindly when building types.

### Personal stuff (needs a key)

| What | Endpoint |
|---|---|
| Who's signed in | `GET /api/users/me` |
| Followed tags | `GET /api/follows/tags` |
| Reading list | `GET /api/readinglist` |
| Followers | `GET /api/followers/users` |
| Follow someone | `POST /api/follows` |
| React to a post | `POST /api/reactions/toggle` |
| Your posts and drafts | `GET /api/articles/me/all` (also `/published` and `/unpublished`) |
| Your stats | `GET /api/analytics/totals`, `/historical`, `/past_day`, `/referrers`, `/dashboard`, `/heatmap` |

Followed tags are probably the best way to build a "My feed" view. Since only the single `tag` param works (see below), that means one request per followed tag, merged and sorted on our side.

Reactions use `category` (`like`, `unicorn`, `exploding_head`, `raised_hands`, `fire`), `reactable_id` and `reactable_type` (`Article`, `Comment` or `User`).

## Params that don't work on live DEV

The spec lists `tags` (any of several tags) and `tags_exclude` (hide tags) for `GET /api/articles`. I tested both against dev.to on 2026-10-11, alone and combined with `top` and `state`. DEV ignored them every time and returned the normal unfiltered feed.

The single `tag` param does work, including with `top=7`, `state=rising` and on `/articles/latest`. So:

- Filtering by one tag: use `tag`.
- Hiding tags: filter the results client-side by `tag_list`.
- Several tags at once: one request per tag.

## What the API can't do

These are gaps I found in the spec. Plan around them.

- **No posting comments.** Comments are read only.
- **No bookmarking.** You can read the reading list, but there's no endpoint to add or remove items.
- **No notifications.**
- **No DMs.**
- **No profile or settings edits** for normal accounts.
- **No personalized "For You" feed.** The extension would have to build its own from followed tags, top and rising.

So bookmark and comment buttons would have to open the article on dev.to.

## Admin-only endpoints

The spec includes plenty of endpoints a normal DEV account can't use: billboards, badges, segments, surveys, recommended article lists, request redirects, feedback messages, user moderation (`suspend`, `spam`, `trusted`, `limited`), and everything under `/api/admin/*`. They're in `endpoints.md`, but they don't matter for this extension.

## Rate limits

The spec doesn't document them. I don't know the current numbers. Assume you can get a `429` back, especially on write endpoints, and cache feed responses instead of refetching on every new tab.
