import type { ExtraTab, FeedKind, FeedTab, PersonalTab } from '@/lib/api/types';

export const FEED_LABELS: Record<FeedKind, string> = {
  'top-day': 'Today',
  'top-week': 'This week',
  rising: 'Rising',
  latest: 'Latest',
};

export const PERSONAL_LABELS: Record<PersonalTab, string> = {
  mine: 'My feed',
  reading: 'Reading list',
};

// Listed in tab order. Orgs goes last.
export const EXTRA_LABELS: Record<ExtraTab, string> = {
  trends: 'Trends',
  events: 'Events',
  orgs: 'Orgs',
};

interface Props {
  active: FeedTab | null;
  showMine: boolean;
  onChange: (tab: FeedTab) => void;
}

export function FeedTabs({ active, showMine, onChange }: Props) {
  const tabs: [FeedTab, string][] = [
    ...(showMine ? (Object.entries(PERSONAL_LABELS) as [PersonalTab, string][]) : []),
    ...(Object.entries(FEED_LABELS) as [FeedKind, string][]),
    ...(Object.entries(EXTRA_LABELS) as [ExtraTab, string][]),
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
