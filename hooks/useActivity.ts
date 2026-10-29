import { useCallback, useEffect, useState } from 'react';
import { activityItem, checkActivity, unreadCount, type ActivityState } from '@/lib/activity';
import type { Account } from '@/lib/api/types';

/**
 * Activity on your posts for the bell. Opening a tab runs a check (at most
 * every few minutes), and the storage watcher picks up checks made by other
 * tabs or the background script.
 */
export function useActivity(apiKey: string | null, account: Account | null) {
  const [state, setState] = useState<ActivityState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!apiKey || !account) return;
    activityItem.getValue().then(setState);
    const unwatch = activityItem.watch(setState);
    checkActivity(apiKey, account.username)
      .then(() => setFailed(false))
      .catch(() => setFailed(true));
    return unwatch;
  }, [apiKey, account?.username]);

  const markSeen = useCallback(async () => {
    const current = await activityItem.getValue();
    if (current && unreadCount(current) > 0) await activityItem.setValue({ ...current, seenAt: Date.now() });
  }, []);

  return { items: state?.items ?? [], unread: unreadCount(state), seenAt: state?.seenAt ?? 0, ready: state !== null, failed, markSeen };
}
