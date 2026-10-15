import type { FeedKind, FeedTab } from '@/lib/api/types';

export const FEED_LABELS: Record<FeedKind, string> = {
  'top-day': 'Today',
  'top-week': 'This week',
  rising: 'Rising',
  latest: 'Latest',
};

export const MY_FEED_LABEL = 'My feed';

interface Props {
  active: FeedTab | null;
  showMine: boolean;
  onChange: (tab: FeedTab) => void;
}

export function FeedTabs({ active, showMine, onChange }: Props) {
  const tabs: [FeedTab, string][] = [
    ...(showMine ? [['mine', MY_FEED_LABEL] as [FeedTab, string]] : []),
    ...(Object.entries(FEED_LABELS) as [FeedKind, string][]),
  ];

  return (
    <nav className="feed-tabs" aria-label="Feed">
      {tabs.map(([tab, label]) => (
        <button
          key={tab}
          type="button"
          className="feed-tab"
          aria-pressed={active === tab}
          onClick={() => onChange(tab)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
