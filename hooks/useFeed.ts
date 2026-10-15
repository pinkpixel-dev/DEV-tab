import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dedupe, fetchFeed, fetchMyFeed, hideTagged, MY_FEED_TAGS, PER_PAGE, searchArticles } from '@/lib/api/articles';
import { ApiError } from '@/lib/api/client';
import type { Article, FeedKind } from '@/lib/api/types';
import { readCache, writeCache } from '@/lib/cache';
import { fetchReadingList } from '@/lib/api/user';
import { getFollowedTags } from '@/lib/follows';

export type FeedSource =
  | { type: 'feed'; kind: FeedKind; tag?: string }
  | { type: 'mine'; apiKey: string }
  | { type: 'reading'; apiKey: string }
  | { type: 'search'; q: string };

type Status = 'loading' | 'ready' | 'error';

// Cache keys. Personal feeds live under `me:` so removing the API key clears them.
function sourceKey(source: FeedSource): string {
  if (source.type === 'feed') return `feed:${source.kind}:${source.tag ?? ''}`;
  if (source.type === 'mine') return 'me:feed';
  if (source.type === 'reading') return 'me:reading';
  return `search:${source.q}`;
}

async function load(source: FeedSource, page: number, signal: AbortSignal) {
  if (source.type === 'feed') return fetchFeed({ kind: source.kind, tag: source.tag, page }, signal);
  if (source.type === 'search') return searchArticles(source.q, page, signal);
  if (source.type === 'reading') return fetchReadingList(source.apiKey, page, signal);
  const tags = await getFollowedTags(source.apiKey);
  return fetchMyFeed(tags.slice(0, MY_FEED_TAGS).map((t) => t.name), signal);
}

// My feed is already a merge of several requests, so it has no next page.
const pages = (source: FeedSource, data: Article[]) => source.type !== 'mine' && data.length >= PER_PAGE;

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError('http', 'Something went wrong loading posts.');
}

const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

export function useFeed(source: FeedSource, hiddenTags: string[]) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<ApiError | null>(null);
  // Set when a refresh failed but cached posts are still on screen.
  const [staleError, setStaleError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<ApiError | null>(null);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const controller = useRef<AbortController | null>(null);

  const key = sourceKey(source);

  useEffect(() => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    const force = reloadToken > 0;

    setError(null);
    setStaleError(null);
    setMoreError(null);
    setLoadingMore(false);
    setPage(1);

    (async () => {
      let shown = false;
      if (source.type !== 'search') {
        const hit = await readCache<Article[]>(key);
        if (ctrl.signal.aborted) return;
        if (hit) {
          setArticles(hit.data);
          setHasMore(pages(source, hit.data));
          setCachedAt(hit.at);
          setStatus('ready');
          shown = true;
          if (hit.fresh && !force) return;
        }
      }
      if (!shown) {
        setArticles([]);
        setCachedAt(null);
        setStatus('loading');
      }
      try {
        const data = await load(source, 1, ctrl.signal);
        if (ctrl.signal.aborted) return;
        setArticles(data);
        setHasMore(pages(source, data));
        setCachedAt(null);
        setStatus('ready');
        if (source.type !== 'search') await writeCache(key, data);
      } catch (err) {
        if (isAbort(err) || ctrl.signal.aborted) return;
        if (shown) setStaleError(toApiError(err));
        else {
          setError(toApiError(err));
          setStatus('error');
        }
      }
    })();

    return () => ctrl.abort();
    // `key` captures everything about `source` that matters.
  }, [key, reloadToken]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const ctrl = controller.current;
    if (!ctrl) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const next = page + 1;
      const data = await load(source, next, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setArticles((prev) => dedupe(prev, data));
      setHasMore(data.length >= PER_PAGE);
      setPage(next);
    } catch (err) {
      if (!isAbort(err)) setMoreError(toApiError(err));
    } finally {
      if (!ctrl.signal.aborted) setLoadingMore(false);
    }
  }, [key, page, hasMore, loadingMore]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  const visible = useMemo(() => hideTagged(articles, hiddenTags), [articles, hiddenTags]);

  return { articles: visible, status, error, staleError, cachedAt, hasMore, loadingMore, moreError, loadMore, reload };
}
