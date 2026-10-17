import { forwardRef } from 'react';
import { CloudOff, Inbox, TriangleAlert } from 'lucide-react';
import { CardSkeleton } from '@/components/feed/ArticleCard';
import { Banner, StatusMessage } from '@/components/ui/StatusMessage';
import type { ApiError } from '@/lib/api/client';
import type { MediaItem } from '@/lib/api/media';
import type { Density } from '@/lib/settings';
import { MediaCard } from './MediaCard';
import '@/components/feed/feed.css';
import './media.css';

interface Props {
  kind: 'podcasts' | 'videos';
  items: MediaItem[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: ApiError | null;
  density: Density;
  onRetry: () => void;
}

// The Podcasts and Videos tabs. Same states as the events view.
export const MediaView = forwardRef<HTMLDivElement, Props>(function MediaView(
  { kind, items, status, error, density, onRetry },
  ref,
) {
  if (status === 'error' && error) {
    return (
      <StatusMessage
        icon={error.kind === 'offline' ? CloudOff : TriangleAlert}
        tone="danger"
        title={error.kind === 'rate-limited' ? 'DEV needs a breather' : `Couldn't load ${kind}`}
        detail={error.message}
        action={{ label: 'Try again', onClick: onRetry }}
      />
    );
  }

  if (status === 'ready' && items.length === 0) {
    return <StatusMessage icon={Inbox} title={`No ${kind} right now`} />;
  }

  const loading = status !== 'ready';
  return (
    <>
      {error && (
        <Banner icon={CloudOff} action={{ label: 'Retry', onClick: onRetry }}>
          Couldn't refresh {kind}. These are saved ones.
        </Banner>
      )}
      <div ref={ref} className={`grid grid-${density}`} aria-busy={loading || undefined}>
        {loading
          ? Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} density={density} />)
          : items.map((item) => <MediaCard key={item.id} item={item} density={density} />)}
      </div>
    </>
  );
});
