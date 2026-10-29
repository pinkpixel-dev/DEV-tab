import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  // DOCS is private notes and store images, not source, so it stays out of
  // the sources zip Firefox Add-ons asks for.
  zip: { excludeSources: ['DOCS/**'] },
  manifest: ({ browser }) => ({
    name: 'DEV Tab',
    description: 'Your new tab, filled with DEV (dev.to) posts. Feeds, search, reactions and comments, plus your own stats with a DEV API key.',
    homepage_url: 'https://github.com/pinkpixel-dev/DEV-tab',
    // `alarms` runs the activity check for desktop notifications.
    // `notifications` is requested only when that setting is turned on.
    permissions: ['storage', 'alarms'],
    optional_permissions: ['notifications'],
    host_permissions: ['https://dev.to/*'],
    // Firefox needs a stable add-on id; Chrome warns about the key, so it's Firefox only.
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'dev-tab@pinkpixel.dev',
          // 140 is the first version with built-in data consent, so nothing
          // older needs a consent screen of our own.
          strict_min_version: '140.0',
          // Search terms go to dev.to only when you search. The API key is
          // optional, and Firefox asks before it's first sent (see KeyForm).
          data_collection_permissions: {
            required: ['searchTerms'],
            optional: ['authenticationInfo'],
          },
        },
      },
    }),
  }),
});
