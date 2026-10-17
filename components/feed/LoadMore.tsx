import { useEffect, useRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { ApiError } from '@/lib/api/client';

interface Props {
  hasMore: boolean;
  loading: boolean;
  error: ApiError | null;
  onLoadMore: () => void;
}

export function LoadMore({ hasMore, loading, error, onLoadMore }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Fetch the next page as the end of the feed scrolls into view. A fresh
  // observer reports its first state right away, so recreating it after each
  // load keeps going when a short page leaves the end still visible. After an
  // error it waits for the button, so a failing request can't loop.
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || loading || error) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore();
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, error, onLoadMore]);

  if (!hasMore) return <p className="feed-end">That's everything for now.</p>;

  return (
    <div className="load-more" ref={ref}>
      {error && (
        <p className="load-more-error" role="alert">
          {error.message}
        </p>
      )}
      <button type="button" className="btn" onClick={onLoadMore} disabled={loading}>
        {loading && <LoaderCircle size={16} className="spin" aria-hidden="true" />}
        {loading ? 'Loading' : error ? 'Try again' : 'Load more'}
      </button>
    </div>
  );
}
