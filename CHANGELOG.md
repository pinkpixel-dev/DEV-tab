# Changelog

## 1.1.0 - In progress

### 🔔 Activity

- New bell in the top bar when an API key is connected. It lists new comments and replies on your posts, new reactions and new followers, newest first, with a count for anything you haven't seen
- Optional desktop notifications for the same activity, turned on under Notifications in settings. The browser asks for permission first, and DEV Tab checks every 5 minutes while they're on. Clicking a notification opens the comment, post or profile on DEV
- Removing the key also clears stored activity

## 1.0.1 - October 17, 2026

### 🎨 Look

- New app icon in the toolbar, on the extensions page and in the store listings
- The logo in the top left corner is bigger and sharper

### 📰 Feed

- More posts load on their own as you scroll near the bottom. The Load more button is still there for keyboard use and for retrying after an error

### 📊 Dashboard

- The activity heatmap stretches to fill the whole card on wide screens instead of stopping partway across

## 1.0.0 - October 16, 2026

The first store release. Everything since 0.1.0 is below.

### 🔑 Account

- Connect an optional DEV API key in settings. It's checked with DEV before it's saved, stays in your browser's extension storage, and only ever goes to dev.to
- My feed tab built from the tags you follow on DEV, and your followed tags as the quick filters above the feed
- Your avatar in the top bar links to your DEV profile
- Removing the key clears everything that was cached for your account
- Firefox asks for your OK before the key is first sent to DEV, and removes the key if you take that back in the add-on's settings

### 📊 Dashboard

- New dashboard page for your own DEV stats, opened from the grid icon next to your avatar
- Follower count, plus views, reactions, comments, new followers and read time for the last 7, 30 or 90 days
- Daily views chart with per-day hover readouts
- Your posts with views, reactions and comments, sortable by newest or most viewed, plus your drafts with edit links
- Recent followers, top supporters, reaction breakdown and where your readers came from
- Activity heatmap with one square per day for your posts, comments and reactions given. Hover or focus a day for its breakdown, use the arrow keys to move around, and step back through each year since you joined

### 📰 Feed

- Reading list tab when an API key is connected
- New post button in the top bar that opens the DEV editor
- Posts from an earlier year now show the year ("Oct 4, 2024") instead of just the month and day
- Click the heart on a card to see each reaction count (💖 🦄 🤯 🙌 🔥), the same picker DEV uses. Picking one opens the post on DEV so you can react there
- Posts in your reading list get a filled bookmark on their card when an API key is connected
- Click the comment count on a card to read the three newest comments without leaving the page. Each one links to the comment on DEV, and there's a link to the full discussion
- Search finds posts by meaning when an API key is connected, so "rust text editor" turns up posts about building editors in Rust even when they're worded differently. Without a key, or if DEV's semantic search is down, it uses normal search
- The feed tabs scroll sideways on narrow screens instead of making the whole page scroll
- Cards with a square or tall cover image keep the same shape as the rest instead of growing taller
- On narrow screens the search box gets its own row, and New post shrinks to its icon, so nothing overlaps

### 🎙️ Podcasts and videos

- Podcasts tab with the newest episodes from the podcasts DEV hosts, linking to each episode's page
- Videos tab with DEV's hottest video posts, using the YouTube thumbnail when there is one

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
- Orgs, Trends, Events, Podcasts and Videos can be picked as the default feed

### 🏷️ Versioning

- 1.0.0, the first version submitted to the Chrome Web Store and Firefox Add-ons

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
