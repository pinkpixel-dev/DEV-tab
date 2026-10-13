# DEV Tab

DEV Tab replaces your browser's new tab page with a feed of posts from [DEV](https://dev.to). Open a tab, see what people are writing about today, click through to anything that looks good.

I wanted something like daily.dev that only shows DEV, so I made it. It works in Chrome and Firefox and doesn't need an account.

## What it does

- Shows a grid of DEV posts every time you open a new tab
- Switches between **Today**, **This week**, **Rising** and **Latest**
- Filters by tag. Keep your favorite tags as quick filters, or click any tag on a card
- Hides posts with tags you never want to see
- Searches DEV from the box at the top (press `/` to jump there)
- Arrow keys move between cards and `Enter` opens one
- **Compact** mode drops the cover images if you want more posts on screen
- Caches the feed for 10 minutes, so new tabs open instantly and you still see posts when you're offline

Clicking a post opens it on dev.to. Commenting, bookmarking and reacting happen there for now.

## Install

DEV Tab isn't in the Chrome Web Store or Firefox Add-ons yet. Until it is, you can build it and load it yourself.

You'll need Node.js and npm. Grab a copy of this repo, then install the dependencies from its folder:

```bash
npm install
```

### Chrome

```bash
npm run build
```

1. Go to `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `.output/chrome-mv3`.
3. Open a new tab. When Chrome asks whether to keep the change, pick **Keep it**.

### Firefox

```bash
npm run build:firefox
```

1. Go to `about:debugging` and click **This Firefox**.
2. Click **Load Temporary Add-on** and pick `manifest.json` in `.output/firefox-mv2`.

Firefox removes temporary add-ons when it restarts, so you'll need to load it again after that.

## Settings

Click the gear icon in the top right, or open the extension's options from your browser's extensions page.

| Setting | What it does |
|---|---|
| Default feed | Which feed a new tab opens on |
| Card density | Comfortable shows cover images and descriptions. Compact hides them |
| Your tags | The quick filter chips above the feed |
| Hidden tags | Posts with any of these tags never show up |

Changes apply right away, including in tabs you already have open.

## Privacy

DEV Tab only talks to `dev.to`. Settings and the cached feed live in your browser's extension storage, and nothing gets sent anywhere else.

## Development

```bash
npm run dev            # Chrome with live reload
npm run dev:firefox    # Firefox with live reload
npm run compile        # type-check
npm test               # unit tests
npm run zip            # Chrome Web Store zip
npm run zip:firefox    # Firefox Add-ons zips
```

It's built with [WXT](https://wxt.dev), React and TypeScript. [DOCS/TESTING-AND-PACKAGING.md](DOCS/TESTING-AND-PACKAGING.md) walks through testing and packaging in more detail. [DOCS/reference/DEV-API.md](DOCS/reference/DEV-API.md) has my notes on the DEV API.

## What's next

Adding your own DEV API key (optional) to get a feed from the tags you follow, your reading list, reactions and stats on your own posts. [DOCS/ROADMAP.md](DOCS/ROADMAP.md) has the rest.

## License

Apache 2.0. See [LICENSE](LICENSE).

DEV Tab is an independent project and isn't affiliated with DEV or Forem.

Made with 💖 by [Pink Pixel](https://pinkpixel.dev)
