import { useEffect, useState } from 'react';
import { fetchSavedIds } from '@/lib/api/user';
import { readCache, writeCache } from '@/lib/cache';

const CACHE_KEY = 'me:saved-ids';

// Posts in your reading list, so cards can show a filled bookmark. Empty
// without a key, and a failed load just leaves the bookmarks off.
export function useSavedIds(apiKey: string | null): Set<number> {
  const [ids, setIds] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setIds(new Set());
    if (!apiKey) return;
    const ctrl = new AbortController();
    (async () => {
      const hit = await readCache<number[]>(CACHE_KEY);
      if (ctrl.signal.aborted) return;
      if (hit) setIds(new Set(hit.data));
      if (hit?.fresh) return;
      try {
        const fresh = await fetchSavedIds(apiKey, ctrl.signal);
        if (ctrl.signal.aborted) return;
        setIds(new Set(fresh));
        await writeCache(CACHE_KEY, fresh);
      } catch {
        // Bookmarks are a nice extra, so a failure stays quiet.
      }
    })();
    return () => ctrl.abort();
  }, [apiKey]);

  return ids;
}
