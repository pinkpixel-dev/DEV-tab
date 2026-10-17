# Changelog

## Unreleased

### 📊 Dashboard

- New dashboard page for your own DEV stats, opened from the grid icon next to your avatar
- Follower count, plus views, reactions, comments, new followers and read time for the last 7, 30 or 90 days
- Daily views chart with per-day hover readouts
- Your posts with views, reactions and comments, sortable by newest or most viewed, plus your drafts with edit links
- Recent followers, top supporters, reaction breakdown and where your readers came from

### 📰 Feed

- Reading list tab when an API key is connected
- New post button in the top bar that opens the DEV editor
- Posts from an earlier year now show the year ("Oct 4, 2024") instead of just the month and day
- Click the heart on a card to see each reaction count (💖 🦄 🤯 🙌 🔥), the same picker DEV uses. Picking one opens the post on DEV so you can react there
- Posts in your reading list get a filled bookmark on their card when an API key is connected
- Search finds posts by meaning when an API key is connected, so "rust text editor" turns up posts about building editors in Rust even when they're worded differently. Without a key, or if DEV's semantic search is down, it uses normal search
- The feed tabs scroll sideways on narrow screens instead of making the whole page scroll
- On narrow screens the search box gets its own row, and New post shrinks to its icon, so nothing overlaps

### 🏢 Orgs

- Orgs tab with posts from DEV organizations you pick, newest first
- Filter chips to see one org at a time, or all of them together
- Add orgs in settings by username or by pasting any dev.to link to the org or one of its posts. Each one is checked against DEV before it's saved

### 📈 Trends and events

- Trends tab with DEV's current trends, a short description of each, and the posts in it
- Events tab with live streams and challenges that are on now or coming up, filterable by type
- Event cards show whether something is live or open now, when it starts, and link to the event on DEV

### ⚙️ Settings

- Tag fields suggest DEV's 1000 most popular tags as you type
- Orgs, Trends and Events can be picked as the default feed

## 0.1.0 - October 11, 2026

### 📰 Feed

- New tab page with a grid of DEV posts
- Today, This week, Rising and Latest feeds
- Cards show the cover image, author, time, tags, reactions, comments and reading time
- Load more button for the next page of posts

### 🏷️ Tags and search

- Quick tag filters above the feed, plus clicking any tag on a card
- Hidden tags that keep matching posts out of every feed and search
- Search box for DEV posts, with `/` to focus it and `Esc` to clear

### ⌨️ Keyboard

- Arrow keys move between cards, `Enter` opens the focused one

### ⚙️ Settings

- Default feed, card density (comfortable or compact), your tags and hidden tags
- Changes sync to open tabs right away

### 📶 Offline and errors

- Feeds are cached for 10 minutes so new tabs open instantly
- Cached posts stay on screen when you're offline or DEV is rate limiting, with a Retry button

### 🧹 Maintenance

- Chrome (MV3) and Firefox (MV2) builds from one WXT codebase
- Unit tests for the API client, feed requests, cache and settings
