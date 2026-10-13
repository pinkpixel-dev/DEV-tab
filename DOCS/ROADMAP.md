# Roadmap

The full plan is in `PLAN.md`. This is the short version of where things stand.

## Done

### Phase 1: public feed (0.1.0)

- New tab feed with Today, This week, Rising and Latest
- Tag filters, hidden tags and search
- Keyboard navigation
- 10 minute cache with offline and rate limit handling
- Settings page
- Chrome and Firefox builds

## Next

### Phase 2: optional API key

- Paste and check a DEV API key in settings (`GET /api/users/me`)
- First thing to test: an authenticated call from the new tab page
- My feed from followed tags (one request per tag, merged)
- Reading list view
- Reactions on cards
- Stats panel for your own posts

### Phase 3: polish and shipping

- Toolbar button that opens the feed
- Option to stop overriding the new tab
- Privacy policy and store listing text
- Submit to the Chrome Web Store and Firefox Add-ons

## Ideas, not committed

- Semantic search (`/api/articles/semantic_search`) once it's been tested
- Light theme, if anyone asks for it
