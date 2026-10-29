# Privacy Policy

**DEV Tab** is a browser extension made by Pink Pixel. It replaces your new tab page with posts from [DEV](https://dev.to).

Last updated: October 29, 2026

## The short version

DEV Tab has no server of its own, no analytics, no ads and no tracking. It talks to dev.to and nothing else. Everything it keeps stays in your browser. Nobody sells your data, because nobody collects it.

## What's stored in your browser

DEV Tab saves these in the browser's extension storage (`storage.local`). Nothing is synced between devices, and none of it is sent to Pink Pixel.

- **Settings:** your default feed, layout, saved and hidden tags, and the DEV organizations you picked.
- **Your DEV API key, if you add one.** It's optional. Everything except the personal features works without it.
- **Your account basics, if you add a key:** your DEV user id, username, display name, profile image link and the year you joined. DEV Tab gets these from DEV when you connect the key.
- **Activity, if you add a key:** the new comments, replies, reactions and followers the bell in the top bar shows (the newest 50), plus the comment and reaction counts on your posts from the last check. That's how DEV Tab tells what's new.
- **Cached responses:** recent feeds, trends, events and, with a key, things like your followed tags and dashboard stats. They're kept for a short while so new tabs open fast, and they get replaced as they go stale.

## What gets sent, and where

All of it goes over HTTPS.

- **To dev.to:** requests for the feeds, trends, events, podcasts, videos, comments and reaction counts you look at. These are DEV's public endpoints, the same data anyone can see on the site.
- **What you search for:** when you use the search box, your search terms go to dev.to, and only to dev.to, to get the results.
- **Your API key:** if you add one, it's sent to dev.to in a request header, and only to dev.to. That's how DEV knows the request is yours, for things like My feed, your reading list, your dashboard stats and semantic search. It's never put in a URL and never logged.
- **Activity checks:** with a key, DEV Tab asks dev.to for your posts and your newest followers when you open a new tab (at most once every 5 minutes), plus the comments on any post that got new ones. If you turn on desktop notifications, a background script makes the same check every 5 minutes, even when no DEV Tab page is open. Turning notifications off stops that.
- **Reaction counts:** these come from an endpoint DEV's own pages use. DEV Tab asks for them without your dev.to cookies, so the request isn't tied to your DEV login.
- **Images:** cover images, avatars and podcast art load from DEV's image servers, and video thumbnails load from YouTube (`i.ytimg.com`). Like any image on the web, those servers see your IP address and a normal browser request when an image loads.

When you click a post, comment, event or link, it opens on dev.to (or wherever the link points). From there, that site's own privacy policy applies. [DEV's privacy policy](https://dev.to/privacy) covers dev.to.

## What DEV Tab doesn't do

- It doesn't read the pages you visit or your browsing history.
- It doesn't run on any website. It only runs on its own new tab, settings and dashboard pages, plus a small background script that runs the activity check when desktop notifications are on.
- Desktop notifications are shown by your browser on your computer. Their text isn't sent anywhere.
- It doesn't send anything to Pink Pixel or to anyone other than dev.to.
- It doesn't use your data for ads, profiling or anything besides showing you DEV.

## Firefox

Firefox lists two kinds of data for DEV Tab. **Search terms** are sent to dev.to when you search. **Authentication information** is your API key, and Firefox asks for your OK before it's sent to DEV for the first time. If you take that back later in the add-on's settings, DEV Tab removes the key.

## Removing your data

- **Removing the key:** open DEV Tab's settings and click **Remove key**. That deletes the key, your account basics, your stored activity and everything cached for your account.
- **Uninstalling:** uninstalling DEV Tab deletes everything it stored.
- **Revoking the key:** you can also revoke the key itself on DEV under [Settings > Extensions](https://dev.to/settings/extensions).

## Changes

If this policy changes, the new version goes in this file with a new date, and the change shows up in the project's history on GitHub.

## Contact

Questions about privacy? Email [support@pinkpixel.dev](mailto:support@pinkpixel.dev) or open an issue on [GitHub](https://github.com/pinkpixel-dev/DEV-tab/issues).

DEV Tab is an independent project and isn't affiliated with DEV or Forem.

Made with 💖 by Pink Pixel
