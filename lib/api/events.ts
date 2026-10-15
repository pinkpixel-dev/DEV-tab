import { apiGet } from './client';
import type { DevEvent } from './types';

// The raw /events response, limited to the fields we read. It returns every
// event DEV has listed (past ones too), around 100 at a time.
interface EventResponse {
  id: number;
  title: string;
  description: string | null;
  type_of: string;
  published: boolean;
  start_time: string;
  end_time: string | null;
  event_name_slug: string;
  event_variation_slug: string;
  cover_image: { url: string | null } | null;
}

export type EventStatus = 'live' | 'upcoming' | 'ended';

// dev.to/events/{name}/{variation} works for both kinds. Challenges redirect to their own page.
export const eventUrl = (name: string, variation: string) =>
  `https://dev.to/events/${encodeURIComponent(name)}/${encodeURIComponent(variation)}`;

export function toDevEvent(e: EventResponse): DevEvent | null {
  if (!e.published || (e.type_of !== 'live_stream' && e.type_of !== 'challenge')) return null;
  return {
    id: e.id,
    title: e.title.trim(),
    description: e.description ?? '',
    kind: e.type_of,
    start: e.start_time,
    end: e.end_time,
    url: eventUrl(e.event_name_slug, e.event_variation_slug),
    cover: e.cover_image?.url ?? null,
  };
}

export async function fetchEvents(signal?: AbortSignal): Promise<DevEvent[]> {
  const events = await apiGet<EventResponse[]>('/events', undefined, signal);
  return events.map(toDevEvent).filter((e): e is DevEvent => e !== null);
}

export function eventStatus(e: DevEvent, now = Date.now()): EventStatus {
  const start = Date.parse(e.start);
  const end = e.end ? Date.parse(e.end) : null;
  if (start > now) return 'upcoming';
  return end === null || end > now ? 'live' : 'ended';
}

// What's on now (ending soonest first), then what's coming (starting soonest first).
export function currentEvents(events: DevEvent[], now = Date.now()): DevEvent[] {
  const live = events.filter((e) => eventStatus(e, now) === 'live');
  const upcoming = events.filter((e) => eventStatus(e, now) === 'upcoming');
  const endOf = (e: DevEvent) => (e.end ? Date.parse(e.end) : Infinity);
  live.sort((a, b) => endOf(a) - endOf(b));
  upcoming.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  return [...live, ...upcoming];
}
