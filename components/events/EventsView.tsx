import { forwardRef } from 'react';
import { CalendarX, CloudOff, TriangleAlert } from 'lucide-react';
import { Banner, StatusMessage } from '@/components/ui/StatusMessage';
import type { ApiError } from '@/lib/api/client';
import type { DevEvent } from '@/lib/api/types';
import type { Density } from '@/lib/settings';
import { EventGrid } from './EventGrid';

interface Props {
  events: DevEvent[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: ApiError | null;
  density: Density;
  onRetry: () => void;
}

export const EventsView = forwardRef<HTMLDivElement, Props>(function EventsView(
  { events, status, error, density, onRetry },
  ref,
) {
  if (status === 'error' && error) {
    return (
      <StatusMessage
        icon={error.kind === 'offline' ? CloudOff : TriangleAlert}
        tone="danger"
        title={error.kind === 'rate-limited' ? 'DEV needs a breather' : "Couldn't load events"}
        detail={error.message}
        action={{ label: 'Try again', onClick: onRetry }}
      />
    );
  }

  if (status === 'ready' && events.length === 0) {
    return <StatusMessage icon={CalendarX} title="Nothing coming up" detail="New streams and challenges show up here when DEV announces them." />;
  }

  return (
    <>
      {error && (
        <Banner icon={CloudOff} action={{ label: 'Retry', onClick: onRetry }}>
          Couldn't refresh events. These are saved ones.
        </Banner>
      )}
      <EventGrid ref={ref} events={events} density={density} loading={status !== 'ready'} />
    </>
  );
});
