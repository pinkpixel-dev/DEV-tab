import { describe, expect, it } from 'vitest';
import { heatLevel, heatWindows, summarize, toWeeks, type HeatDay, type HeatmapResponse } from '@/lib/api/heatmap';
import { toAccount } from '@/lib/api/user';

const day = (date: string, articles = 0, comments = 0, reactions = 0): HeatDay => ({
  date,
  articles,
  comments,
  reactions,
  total: articles + comments + reactions,
});

// Builds a response the way Forem does: every date from start to end.
function response(start: string, end: string, busy: Record<string, HeatDay> = {}): HeatmapResponse {
  const days: HeatDay[] = [];
  for (let d = new Date(`${start}T00:00:00Z`); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    days.push(busy[iso] ?? day(iso));
  }
  return { start_date: start, end_date: end, days };
}

describe('summarize', () => {
  it('keeps the rolling window as DEV sends it and adds it up', () => {
    const res = response('2025-10-17', '2026-10-16', {
      '2026-01-05': day('2026-01-05', 1, 2, 3),
      '2026-10-16': day('2026-10-16', 0, 0, 9),
    });
    const s = summarize(res, 'rolling');
    expect(s.days).toHaveLength(365);
    expect(s.totals).toEqual({ articles: 1, comments: 2, reactions: 12, total: 15 });
    expect(s.max).toBe(9);
  });

  it('trims a calendar year to the year and drops activity from the year before', () => {
    const res = response('2025-01-01', '2025-12-31', { '2025-03-01': day('2025-03-01', 1) });
    const s = summarize(response('2024-12-31', '2025-12-30', { '2024-12-31': day('2024-12-31', 5) }), 2025);
    expect(s.days[0]?.date).toBe('2025-01-01');
    expect(s.totals.total).toBe(0);
    expect(summarize(res, 2025).totals.articles).toBe(1);
  });

  it('marks Jan 1 of a leap year as missing instead of counting it as zero', () => {
    const s = summarize(response('2024-01-02', '2024-12-31'), 2024);
    expect(s.days).toHaveLength(366);
    expect(s.days[0]).toMatchObject({ date: '2024-01-01', missing: true });
    expect(s.days[1]?.missing).toBeUndefined();
  });

  it('stops this year at today', () => {
    const s = summarize(response('2025-10-17', '2026-10-16'), 2026);
    expect(s.days[0]?.date).toBe('2026-01-01');
    expect(s.days[s.days.length - 1]?.date).toBe('2026-10-16');
  });
});

describe('toWeeks', () => {
  it('pads to whole Sunday-first weeks', () => {
    // Oct 15, 2026 is a Thursday.
    const weeks = toWeeks([day('2026-10-15'), day('2026-10-16'), day('2026-10-17'), day('2026-10-18')]);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]?.slice(0, 4)).toEqual([null, null, null, null]);
    expect(weeks[0]?.[4]?.date).toBe('2026-10-15');
    expect(weeks[1]?.[0]?.date).toBe('2026-10-18');
    expect(weeks[1]?.slice(1).every((c) => c === null)).toBe(true);
  });

  it('returns nothing for no days', () => {
    expect(toWeeks([])).toEqual([]);
  });
});

describe('heatLevel', () => {
  it('splits into quarters of the busiest day', () => {
    expect([0, 1, 2, 3, 5, 6, 8].map((t) => heatLevel(t, 8))).toEqual([0, 1, 1, 2, 3, 3, 4]);
  });

  it('gives a single contribution the top shade when that is the most there is', () => {
    expect(heatLevel(1, 1)).toBe(4);
    expect(heatLevel(0, 0)).toBe(0);
  });
});

describe('heatWindows', () => {
  it('lists the rolling year, then this year back to the join year', () => {
    expect(heatWindows(2023, new Date('2026-10-16T12:00:00Z'))).toEqual(['rolling', 2026, 2025, 2024, 2023]);
  });

  it('still offers this year when the join year is in the future somehow', () => {
    expect(heatWindows(2030, new Date('2026-10-16T12:00:00Z'))).toEqual(['rolling', 2026]);
  });
});

describe('toAccount joinedYear', () => {
  it('reads the year out of joined_at', () => {
    expect(toAccount({ username: 'ada', joined_at: 'Jun  4, 2023' }).joinedYear).toBe(2023);
  });

  it('leaves it out when joined_at is missing', () => {
    expect(toAccount({ username: 'ada' })).not.toHaveProperty('joinedYear');
  });
});
