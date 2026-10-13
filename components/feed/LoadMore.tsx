import { LoaderCircle } from 'lucide-react';
import type { ApiError } from '@/lib/api/client';

interface Props {
  hasMore: boolean;
  loading: boolean;
  error: ApiError | null;
  onLoadMore: () => void;
}

export function LoadMore({ hasMore, loading, error, onLoadMore }: Props) {
  if (!hasMore) return <p className="feed-end">That's everything for now.</p>;

  return (
    <div className="load-more">
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
