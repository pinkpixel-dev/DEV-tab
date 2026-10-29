import { accountItem, apiKeyItem, hasKeyConsent } from '@/lib/account';
import { activityItem, checkActivity } from '@/lib/activity';
import {
  ACTIVITY_ALARM,
  ACTIVITY_PERIOD_MINUTES,
  hasNotifyPermission,
  showNotifications,
  urlForNotification,
} from '@/lib/notify';
import { getSettings, settingsItem } from '@/lib/settings';

// Only here for desktop notifications. Everything else still runs from the
// extension pages. The alarm exists only while notifications are on, a key
// is connected and the permission is granted.
export default defineBackground({
  persistent: false,
  main() {
    async function syncAlarm() {
      const [settings, key, allowed] = await Promise.all([getSettings(), apiKeyItem.getValue(), hasNotifyPermission()]);
      const want = settings.notify && key !== null && allowed;
      const existing = await browser.alarms.get(ACTIVITY_ALARM);
      // A period from an older build gets replaced with the current one.
      if (want && existing?.periodInMinutes !== ACTIVITY_PERIOD_MINUTES) {
        await browser.alarms.create(ACTIVITY_ALARM, { delayInMinutes: 1, periodInMinutes: ACTIVITY_PERIOD_MINUTES });
      } else if (!want && existing) {
        await browser.alarms.clear(ACTIVITY_ALARM);
      }
    }

    async function check() {
      const [key, account, consent, allowed] = await Promise.all([
        apiKeyItem.getValue(),
        accountItem.getValue(),
        hasKeyConsent(),
        hasNotifyPermission(),
      ]);
      // Firefox consent withdrawn: the next new tab drops the key, so just don't send it.
      if (!key || !account || !consent || !allowed) return syncAlarm();
      try {
        // The alarm already sets the pace. Without force, a check that lands a
        // few ms early against the 5 minute gap would be skipped.
        await checkActivity(key, account.username, { force: true });
      } catch {
        // Offline, rate limited or a rejected key. The next alarm tries again.
        return;
      }
      // A new tab may have found items first, so notify for anything that's
      // neither been notified nor seen on the bell.
      const state = await activityItem.getValue();
      if (!state) return;
      const since = Math.max(state.notifiedAt, state.seenAt);
      const pending = state.items.filter((i) => i.foundAt > since);
      await activityItem.setValue({ ...state, notifiedAt: Date.now() });
      if (pending.length) await showNotifications(pending);
    }

    // Listeners go on synchronously so a woken worker still hears the event.
    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === ACTIVITY_ALARM) void check();
    });
    // `browser.notifications` only exists once the permission is granted, so
    // this also runs when it's added.
    let listening = false;
    function listenForClicks() {
      if (listening || !browser.notifications) return;
      listening = true;
      browser.notifications.onClicked.addListener(async (id) => {
        const state = await activityItem.getValue();
        await browser.tabs.create({ url: urlForNotification(id, state?.items ?? []) });
        await browser.notifications.clear(id);
      });
    }
    listenForClicks();
    browser.permissions.onAdded.addListener(() => {
      listenForClicks();
      void syncAlarm();
    });
    browser.permissions.onRemoved.addListener(() => void syncAlarm());
    settingsItem.watch(() => void syncAlarm());
    apiKeyItem.watch(() => void syncAlarm());
    void syncAlarm();
  },
});
