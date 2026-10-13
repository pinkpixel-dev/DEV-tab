import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: ({ browser }) => ({
    name: 'DEV Tab',
    description: 'A new tab feed of DEV (dev.to) posts.',
    permissions: ['storage'],
    host_permissions: ['https://dev.to/*'],
    // Firefox needs a stable add-on id; Chrome warns about the key, so it's Firefox only.
    ...(browser === 'firefox' && {
      browser_specific_settings: { gecko: { id: 'dev-tab@pinkpixel.dev' } },
    }),
  }),
});
