import { describe, type ActivityItem } from './activity';

// `notifications` is an optional permission, so installing or updating never
// asks for it. It's requested when the setting is turned on.
const permission = (): Browser.permissions.Permissions => ({ permissions: ['notifications'] });

export const ACTIVITY_ALARM = 'activity';
export const ACTIVITY_PERIOD_MINUTES = 15;
// More than this in one check becomes a single summary notification.
const MAX_SEPARATE = 3;
const SUMMARY_ID = 'activity:summary';
export const NOTIFICATIONS_URL = 'https://dev.to/notifications';

// Has to be the first thing the click handler awaits, or the browser won't
// show the prompt.
export function requestNotifyPermission(): Promise<boolean> {
  return browser.permissions.request(permission());
}

export function hasNotifyPermission(): Promise<boolean> {
  return browser.permissions.contains(permission());
}

const TITLES: Record<ActivityItem['kind'], string> = {
  comment: 'New comment',
  reply: 'New reply',
  reactions: 'New reactions',
  follower: 'New follower',
};

// Firefox only supports title and message, so everything goes in those two.
export function notificationFor(item: ActivityItem): { title: string; message: string } {
  const line = describe(item);
  return { title: TITLES[item.kind], message: item.excerpt ? `${line}\n${item.excerpt}` : line };
}

export async function showNotifications(items: ActivityItem[]): Promise<void> {
  const iconUrl = browser.runtime.getURL('/icon/128.png');
  if (items.length > MAX_SEPARATE) {
    await browser.notifications.create(SUMMARY_ID, {
      type: 'basic',
      iconUrl,
      title: `${items.length} new things on DEV`,
      message: items.slice(0, MAX_SEPARATE).map(describe).join('\n'),
    });
    return;
  }
  for (const item of items) {
    await browser.notifications.create(item.id, { type: 'basic', iconUrl, ...notificationFor(item) });
  }
}

// Item ids double as notification ids, so a click can find its link.
export function urlForNotification(id: string, items: ActivityItem[]): string {
  if (id === SUMMARY_ID) return NOTIFICATIONS_URL;
  return items.find((i) => i.id === id)?.url ?? NOTIFICATIONS_URL;
}
