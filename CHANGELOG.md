# Changelog

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
