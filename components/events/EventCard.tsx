import { CalendarClock, Radio, Trophy } from 'lucide-react';
import type { DevEvent } from '@/lib/api/types';
import type { EventStatus } from '@/lib/api/events';
import type { Density } from '@/lib/settings';
import { eventWhen, timeAgo } from '@/lib/format';

interface Props {
  event: DevEvent;
  status: EventStatus;
  density: Density;
}

const KIND_LABEL = { live_stream: 'Live stream', challenge: 'Challenge' } as const;

function statusText(event: DevEvent, status: EventStatus): string {
  if (status === 'live') return event.kind === 'live_stream' ? 'Live now' : 'Open now';
  // timeAgo gives "in 3 hours" for the next week, and a plain date after that.
  return `Starts ${timeAgo(event.start)}`;
}

export function EventCard({ event, status, density }: Props) {
  const KindIcon = event.kind === 'live_stream' ? Radio : Trophy;
  const showMedia = density === 'comfortable';

  return (
    <article className="card event-card" data-status={status}>
      {showMedia && (
        <div className="card-media">
          {event.cover ? (
            <img src={event.cover} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="card-media-empty" aria-hidden="true">
              {KIND_LABEL[event.kind]}
            </div>
          )}
        </div>
      )}

      <div className="card-body">
        <div className="card-meta">
          <KindIcon size={15} aria-hidden="true" />
          <span>{KIND_LABEL[event.kind]}</span>
          <span aria-hidden="true">·</span>
          <span className="event-status">{statusText(event, status)}</span>
        </div>

        <h2 className="card-title">
          <a className="card-link" href={event.url} data-card-link>
            {event.title}
          </a>
        </h2>

        {showMedia && event.description && <p className="card-desc">{event.description}</p>}

        <div className="card-stats">
          <span>
            <CalendarClock size={14} aria-hidden="true" />
            <time dateTime={event.start}>{eventWhen(event.kind, event.start, event.end)}</time>
          </span>
        </div>
      </div>
    </article>
  );
}
