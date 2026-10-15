import { describe, expect, it } from 'vitest';
import { currentEvents, eventStatus, eventUrl, toDevEvent } from '@/lib/api/events';
import { normalizeOrg } from '@/lib/api/orgs';
import type { DevEvent } from '@/lib/api/types';
import { eventWhen, timeAgo } from '@/lib/format';

describe('normalizeOrg', () => {
  it('accepts usernames, @handles and dev.to links', () => {
    expect(normalizeOrg('github')).toBe('github');
    expect(normalizeOrg('  @GitHub ')).toBe('github');
    expect(normalizeOrg('https://dev.to/github')).toBe('github');
    expect(normalizeOrg('https://dev.to/github/?utm=x#top')).toBe('github');
    expect(normalizeOrg('dev.to/the_practical_dev')).toBe('the_practical_dev');
    expect(normalizeOrg('https://dev.to/github/speed-up-your-cicd-21g8')).toBe('github');
  });

  it('returns empty for input with no usable characters', () => {
    expect(normalizeOrg('   ')).toBe('');
    expect(normalizeOrg('https://dev.to/')).toBe('');
  });
});

const NOW = Date.parse('2026-10-14T16:00:00Z');

function event(id: number, start: string, end: string | null, kind: DevEvent['kind'] = 'live_stream'): DevEvent {
  return { id, title: `Event ${id}`, description: '', kind, start, end, url: '', cover: null };
}

describe('eventStatus', () => {
  it('splits events into live, upcoming and ended', () => {
    expect(eventStatus(event(1, '2026-10-14T15:00:00Z', '2026-10-14T17:00:00Z'), NOW)).toBe('live');
    expect(eventStatus(event(2, '2026-10-15T15:00:00Z', '2026-10-15T16:00:00Z'), NOW)).toBe('upcoming');
    expect(eventStatus(event(3, '2026-10-13T15:00:00Z', '2026-10-13T16:00:00Z'), NOW)).toBe('ended');
    expect(eventStatus(event(4, '2026-10-13T15:00:00Z', null), NOW)).toBe('live');
  });
});

describe('currentEvents', () => {
  it('drops ended events, then lists live (ending soonest) before upcoming (starting soonest)', () => {
    const events = [
      event(1, '2026-10-20T00:00:00Z', '2026-10-21T00:00:00Z'),
      event(2, '2026-10-10T00:00:00Z', '2026-10-19T00:00:00Z', 'challenge'),
      event(3, '2026-10-01T00:00:00Z', '2026-10-02T00:00:00Z'),
      event(4, '2026-10-15T00:00:00Z', '2026-10-15T01:00:00Z'),
      event(5, '2026-10-14T15:30:00Z', '2026-10-14T16:30:00Z'),
    ];
    expect(currentEvents(events, NOW).map((e) => e.id)).toEqual([5, 2, 4, 1]);
  });
});

describe('toDevEvent', () => {
  const raw = {
    id: 82,
    title: ' Hacktoberfest Week 4 ',
    description: null,
    type_of: 'challenge',
    published: true,
    start_time: '2026-10-26T16:00:00.000Z',
    end_time: '2026-10-31T06:59:00.000Z',
    event_name_slug: 'challenges',
    event_variation_slug: 'hacktoberfest-week4-2026-10-26',
    cover_image: { url: null },
  };

  it('trims the response and builds the dev.to link', () => {
    expect(toDevEvent(raw)).toEqual({
      id: 82,
      title: 'Hacktoberfest Week 4',
      description: '',
      kind: 'challenge',
      start: raw.start_time,
      end: raw.end_time,
      url: 'https://dev.to/events/challenges/hacktoberfest-week4-2026-10-26',
      cover: null,
    });
    expect(eventUrl('a b', 'c')).toBe('https://dev.to/events/a%20b/c');
  });

  it('skips unpublished events and unknown kinds', () => {
    expect(toDevEvent({ ...raw, published: false })).toBeNull();
    expect(toDevEvent({ ...raw, type_of: 'meetup' })).toBeNull();
  });
});

describe('eventWhen', () => {
  it('shows a range for challenges and a start time for streams', () => {
    expect(eventWhen('challenge', '2026-10-12T19:00:00Z', '2026-10-19T06:59:00Z')).toMatch(/Oct 1[23].*1[89]/);
    expect(eventWhen('live_stream', '2026-10-15T17:00:00Z', '2026-10-15T18:00:00Z')).toMatch(/Oct 15/);
  });
});

describe('timeAgo', () => {
  it('adds the year to older dates only when it differs from now', () => {
    expect(timeAgo('2026-09-18T12:00:00Z', NOW)).toBe('Sep 18');
    expect(timeAgo('2024-10-04T12:00:00Z', NOW)).toBe('Oct 4, 2024');
    expect(timeAgo('2026-10-13T16:00:00Z', NOW)).toBe('yesterday');
  });
});
