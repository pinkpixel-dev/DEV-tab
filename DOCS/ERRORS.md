# Errors

Failed approaches and difficult bugs that are worth remembering.

Log a failure when it took more than two attempts, the root cause was somewhere other than the symptom, the behavior is environment-specific and will recur, or a reasonable next approach would fail the same way. This is not a bug tracker. Ordinary bugs found and fixed quickly do not belong here.

## 2026-10-11

### Note: DEV ignores the `tags` and `tags_exclude` params even though the spec lists them

What did not work: `GET /api/articles?tags=rust,go` and `?tags_exclude=ai,webdev`, alone or with `top=7` or `state=rising`. DEV returned the normal unfiltered feed every time, with no error.

What worked instead: The singular `tag` param filters correctly, including with `top`, `state` and on `/articles/latest`. Hidden tags are filtered client-side with `hideTagged` in `lib/api/articles.ts`. Multi-tag feeds need one request per tag.

Note for next time: Check a filter param against live dev.to responses before building on it, because the OpenAPI spec isn't reliable for this.

## 2026-10-13

### Note: `npm run dev` opens a blank Google Chrome without the extension

What did not work: WXT's dev mode with Google Chrome 154 (`/usr/bin/google-chrome-stable`). The window opened on `about:blank` with an "unsupported command-line flag" warning, and the extension was never loaded. WXT still printed "Opened browser", so nothing looked wrong in the terminal.

What worked instead: Nothing that opens a browser automatically. Pointing `binaries.chrome` at `/usr/bin/chromium` loaded the extension (the profile's `Default/Preferences` listed it), but on the user's screen both Chromium and `npm run dev:firefox` opened windows that drew nothing, not even the tab bar. The same dev build rendered fine in agent-browser. The working setup is `disabled: true` in the gitignored `web-ext.config.ts`, plus loading `.output/chrome-mv3-dev` into the user's normal Chrome with Load unpacked.

Note for next time: On this machine, don't rely on WXT opening a browser. Load the `-dev` output folder into a normal browser instead. The option is `disabled`, not `enabled`. WXT's upgrade docs say `enabled: false`, but the 0.21.4 types only accept `disabled`.
