import { describe, expect, it } from 'vitest';
import { dailyViews, editUrl, fromReadingList, rangeStart, sumDays, type DayStats, type ReadingListItem } from '@/lib/api/dashboard';

const dayStats = (views: number, reactions: number, likes: number, follows = 0): DayStats => ({
  comments: { total: 1 },
  follows: { total: follows },
  reactions: { total: reactions, like: likes, readinglist: 0, unicorn: reactions - likes, exploding_head: 0, raised_hands: 0, fire: 0, unique_reactors: 1 },
  page_views: { total: views, average_read_time_in_seconds: 30, total_read_time_in_seconds: views * 30 },
});

describe('sumDays', () => {
  it('adds every day in the range together', () => {
    const totals = sumDays({ '2026-10-01': dayStats(10, 3, 2, 1), '2026-10-02': dayStats(5, 1, 1) });
    expect(totals).toMatchObject({ views: 15, reactions: 4, comments: 2, follows: 1, readSeconds: 450 });
    expect(totals.byReaction).toMatchObject({ like: 3, unicorn: 1, fire: 0 });
  });

  it('returns zeros for an empty range', () => {
    expect(sumDays({}).views).toBe(0);
  });
});

describe('dailyViews', () => {
  it('sorts days oldest first', () => {
    const points = dailyViews({ '2026-10-02': dayStats(5, 0, 0), '2026-09-30': dayStats(9, 0, 0), '2026-10-01': dayStats(1, 0, 0) });
    expect(points).toEqual([
      { date: '2026-09-30', views: 9 },
      { date: '2026-10-01', views: 1 },
      { date: '2026-10-02', views: 5 },
    ]);
  });
});

describe('rangeStart', () => {
  it('counts today as the last day of the range', () => {
    const now = Date.parse('2026-10-14T12:00:00Z');
    expect(rangeStart(7, now)).toBe('2026-10-08');
    expect(rangeStart(30, now)).toBe('2026-09-15');
  });
});

describe('editUrl', () => {
  it('drops a draft preview query before adding /edit', () => {
    expect(editUrl({ path: '/ada/my-draft-temp-slug-1?preview=abc' })).toBe('https://dev.to/ada/my-draft-temp-slug-1/edit');
    expect(editUrl({ path: '/ada/hello-1x2' })).toBe('https://dev.to/ada/hello-1x2/edit');
  });
});

describe('fromReadingList', () => {
  it('unwraps the article and splits the tag string', () => {
    const items = [{ id: 1, article: { id: 9, title: 'Hi', tags: 'rust, webdev' } }] as unknown as ReadingListItem[];
    const [article] = fromReadingList(items);
    expect(article).toMatchObject({ id: 9, title: 'Hi', tag_list: ['rust', 'webdev'] });
  });

  it('handles a missing tag string', () => {
    const items = [{ id: 1, article: { id: 9 } }] as unknown as ReadingListItem[];
    expect(fromReadingList(items)[0]?.tag_list).toEqual([]);
  });
});
