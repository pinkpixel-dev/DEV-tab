import type { FeedKind } from '@/lib/api/types';

export const FEED_LABELS: Record<FeedKind, string> = {
  'top-day': 'Today',
  'top-week': 'This week',
  rising: 'Rising',
  latest: 'Latest',
};

interface Props {
  active: FeedKind | null;
  onChange: (kind: FeedKind) => void;
}

export function FeedTabs({ active, onChange }: Props) {
  return (
    <nav className="feed-tabs" aria-label="Feed">
      {(Object.keys(FEED_LABELS) as FeedKind[]).map((kind) => (
        <button
          key={kind}
          type="button"
          className="feed-tab"
          aria-pressed={active === kind}
          onClick={() => onChange(kind)}
        >
          {FEED_LABELS[kind]}
        </button>
      ))}
    </nav>
  );
}
