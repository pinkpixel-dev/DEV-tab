import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { readCache, writeCache } from '@/lib/cache';

type Status = 'loading' | 'ready' | 'error';

const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

// One authenticated request, cached for the usual 10 minutes under the
// personal prefix so removing the key clears it. Cached data stays on screen
// if a refresh fails.
export function usePersonalData<T>(cacheKey: string, fetcher: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  // Stored as `cache:me:<cacheKey>`, inside PERSONAL_CACHE_PREFIX.
  const key = `me:${cacheKey}`;

  useEffect(() => {
    const ctrl = new AbortController();
    const force = reloadToken > 0;
    setError(null);

    (async () => {
      const hit = await readCache<T>(key);
      if (ctrl.signal.aborted) return;
      if (hit) {
        setData(hit.data);
        setStatus('ready');
        if (hit.fresh && !force) return;
      } else {
        setData(null);
        setStatus('loading');
      }
      try {
        const fresh = await fetcher(ctrl.signal);
        if (ctrl.signal.aborted) return;
        setData(fresh);
        setStatus('ready');
        await writeCache(key, fresh);
      } catch (err) {
        if (isAbort(err) || ctrl.signal.aborted) return;
        setError(err instanceof ApiError ? err : new ApiError('http', 'Something went wrong.'));
        if (!hit) setStatus('error');
      }
    })();

    return () => ctrl.abort();
    // `key` stands in for the fetcher, which is a new function every render.
  }, [key, reloadToken]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);
  return { data, status, error, reload };
}
