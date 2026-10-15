# Testing and packaging

How to run DEV Tab while you work on it, try a real build in your everyday browser, and make the zips the stores want.

All commands run from the project root.

## First time setup

```bash
npm install
```

`npm install` also runs `wxt prepare`, which generates the `.wxt/` folder with types and the TypeScript config. If your editor ever complains about missing types like `browser`, run `npx wxt prepare` again.

## Dev mode

```bash
npm run dev
```

WXT builds the extension, opens a separate Chrome window with it already installed, and reloads it every time you save a file. Open a new tab in that window and you'll see the feed.

That Chrome window uses a throwaway profile, so it doesn't touch your normal browser. Settings you change there disappear when you close it.

### If the window opens blank

On this machine, the browser windows WXT opens don't work. Branded Google Chrome won't load the extension at all (you get `about:blank` and an "unsupported command-line flag" warning). Chromium and Firefox load it but draw a blank window, probably a GPU issue with their throwaway profiles.

So dev mode here doesn't open a browser. The gitignored `web-ext.config.ts` turns that off:

```ts
import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  disabled: true,
});
```

Instead, load the dev build into your normal Chrome once:

1. Run `npm run dev` and leave it running.
2. Go to `chrome://extensions`, turn on **Developer mode** and click **Load unpacked**.
3. Pick `.output/chrome-mv3-dev` (the `-dev` folder, not `chrome-mv3`).

Live reload still works, because the dev build pulls its code from the dev server. The page only loads while `npm run dev` is running, so turn the extension off in `chrome://extensions` when you're done.

For Firefox:

```bash
npm run dev:firefox
```

Same thing, but in a temporary Firefox profile.

## Debugging

The new tab and settings pages are regular web pages, so DevTools works on them like on any site:

- Right-click anywhere on the new tab and choose **Inspect**.
- **Console** shows errors.
- **Network** shows every request to `dev.to/api`.
- **Application → Storage → Extension storage** (Chrome) shows saved settings and the feed cache. In Firefox, it's under **Storage** in the add-on's inspector.

## Trying a real build in your own browser

### Chrome

```bash
npm run build
```

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick the `.output/chrome-mv3` folder.

Chrome will ask whether you want to keep the new tab change the first time you open a new tab. Pick **Keep it**.

After you rebuild, click the reload icon on the extension's card in `chrome://extensions`. Chrome doesn't pick up changes on its own.

### Firefox

```bash
npm run build:firefox
```

1. Go to `about:debugging`.
2. Click **This Firefox**.
3. Click **Load Temporary Add-on** and pick `manifest.json` inside `.output/firefox-mv2`.

Temporary add-ons are removed when Firefox restarts. That's normal. Installing it permanently means going through Mozilla's signing, which happens when you submit it.

The Firefox build is Manifest V2 on purpose. That's WXT's default for Firefox, and it means the `dev.to` permission is granted at install without an extra prompt.

## Checks before shipping

```bash
npm run compile
npm test
```

`compile` type-checks everything. `test` runs the Vitest tests in `tests/`, which cover the API client, feed requests, hidden tags, the cache and settings. They don't call the real DEV API.

## Packaging for the stores

```bash
npm run zip
npm run zip:firefox
```

Both put zips in `.output/`:

| Command | What you get | Where it goes |
|---|---|---|
| `npm run zip` | `dev-tab-<version>-chrome.zip` | Chrome Web Store |
| `npm run zip:firefox` | `dev-tab-<version>-firefox.zip` and `dev-tab-<version>-sources.zip` | Firefox Add-ons (AMO) |

Mozilla asks for the sources zip because the shipped code is bundled. Their reviewers rebuild it from source to check it matches.

The version comes from `package.json`. Bump it there before zipping a new release.

### Store accounts

I haven't double-checked these lately, so confirm when you sign up:

- **Chrome Web Store:** needs a developer account. I believe there's a one-time $5 registration fee.
- **Firefox Add-ons:** free with a Mozilla account.

Both stores will want a privacy policy once the API key feature exists, since the key counts as user data even though it only ever goes to dev.to. That's on the list for Phase 3, along with the store listing text.
