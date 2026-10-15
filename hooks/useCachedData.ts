import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { readCache, writeCache } from '@/lib/cache';

type Status = 'idle' | 'loading' | 'ready' | 'error';

const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

/**
 * Loads one cached request (trends, events, popular tags). Cached data shows
 * right away and refreshes in the background once it's older than the cache TTL.
 * Nothing loads while `enabled` is false.
 */
export function useCachedData<T>(key: string, fetcher: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  // Set when a refresh failed. Cached data, if any, stays on screen.
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const handledToken = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    const force = reloadToken !== handledToken.current;
    handledToken.current = reloadToken;

    (async () => {
      const hit = await readCache<T>(key);
      if (ctrl.signal.aborted) return;
      if (hit) {
        setData(hit.data);
        setStatus('ready');
        if (hit.fresh && !force) return;
      } else {
        setStatus('loading');
      }
      setError(null);
      try {
        const fresh = await fetcher(ctrl.signal);
        if (ctrl.signal.aborted) return;
        setData(fresh);
        setStatus('ready');
        await writeCache(key, fresh);
      } catch (err) {
        if (isAbort(err) || ctrl.signal.aborted) return;
        setError(err instanceof ApiError ? err : new ApiError('http', 'Something went wrong loading this.'));
        if (!hit) setStatus('error');
      }
    })();

    return () => ctrl.abort();
    // `fetcher` is always a module-level function, so `key` covers it.
  }, [key, enabled, reloadToken]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  return { data, status, error, reload };
}
