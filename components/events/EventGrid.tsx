import { forwardRef } from 'react';
import { CardSkeleton } from '@/components/feed/ArticleCard';
import { eventStatus } from '@/lib/api/events';
import type { DevEvent } from '@/lib/api/types';
import type { Density } from '@/lib/settings';
import { EventCard } from './EventCard';
import '@/components/feed/feed.css';
import './events.css';

interface Props {
  events: DevEvent[];
  density: Density;
  loading?: boolean;
}

export const EventGrid = forwardRef<HTMLDivElement, Props>(function EventGrid({ events, density, loading }, ref) {
  const now = Date.now();
  return (
    <div ref={ref} className={`grid grid-${density}`} aria-busy={loading || undefined}>
      {loading
        ? Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} density={density} />)
        : events.map((e) => <EventCard key={e.id} event={e} status={eventStatus(e, now)} density={density} />)}
    </div>
  );
});
