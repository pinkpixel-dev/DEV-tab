import { apiGet } from './client';

// The spec says this endpoint groups by weekday and hour. It doesn't. Forem's
// UserActivityHeatmapService returns one row per day for the 365 days ending
// on `end` (today when it's left out, and clamped to today).
export interface HeatDay {
  date: string;
  articles: number;
  comments: number;
  reactions: number;
  total: number;
}

export interface HeatmapResponse {
  start_date: string;
  end_date: string;
  days: HeatDay[];
}

// The rolling last 365 days, or one calendar year.
export type HeatWindow = 'rolling' | number;

// Used when the account was saved before we kept the join year. DEV's own
// year picker starts at the year you joined.
export const FALLBACK_FIRST_YEAR = 2016;

export function fetchHeatmap(apiKey: string, window: HeatWindow, signal?: AbortSignal) {
  const end = window === 'rolling' ? undefined : `${window}-12-31`;
  return apiGet<HeatmapResponse>('/analytics/heatmap', { end }, signal, apiKey);
}

// Newest first: the rolling year, then this year back to the year you joined.
export function heatWindows(firstYear: number, now = new Date()): HeatWindow[] {
  const out: HeatWindow[] = ['rolling'];
  for (let y = now.getUTCFullYear(); y >= Math.min(firstYear, now.getUTCFullYear()); y--) out.push(y);
  return out;
}

export interface HeatSummary {
  // Every date the grid shows, oldest first. Dates DEV didn't return (Jan 1
  // of a leap year falls outside its 365-day window) are kept but marked.
  days: (HeatDay & { missing?: true })[];
  totals: { articles: number; comments: number; reactions: number; total: number };
  max: number;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};

// A calendar year asks for the 365 days ending Dec 31, which can reach into
// the year before (and for this year, ends today). Trim to the year itself.
export function summarize(res: HeatmapResponse, window: HeatWindow): HeatSummary {
  const byDate = new Map(res.days.map((d) => [d.date, d]));
  const first = window === 'rolling' ? res.start_date : `${window}-01-01`;
  const last = window === 'rolling' ? res.end_date : res.end_date < `${window}-12-31` ? res.end_date : `${window}-12-31`;
  const days: HeatSummary['days'] = [];
  const totals = { articles: 0, comments: 0, reactions: 0, total: 0 };
  let max = 0;
  for (let date = first; date <= last; date = addDays(date, 1)) {
    const day = byDate.get(date);
    if (!day) {
      days.push({ date, articles: 0, comments: 0, reactions: 0, total: 0, missing: true });
      continue;
    }
    days.push(day);
    totals.articles += day.articles;
    totals.comments += day.comments;
    totals.reactions += day.reactions;
    totals.total += day.total;
    max = Math.max(max, day.total);
  }
  return { days, totals, max };
}

// Columns of seven, Sunday on top, like DEV's and GitHub's grids. The first
// and last weeks are padded with nulls.
export function toWeeks<T extends { date: string }>(days: T[]): (T | null)[][] {
  const first = days[0];
  if (!first) return [];
  const lead = new Date(`${first.date}T00:00:00Z`).getUTCDay();
  const cells: (T | null)[] = [...Array<null>(lead).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks: (T | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// Shade 0 to 4, split into quarters of the busiest day the same way DEV does,
// so a quiet year still shows a range of shades.
export function heatLevel(total: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (total <= 0 || max <= 0) return 0;
  if (max === 1) return 4;
  const q1 = Math.max(1, Math.round(max * 0.25));
  const q2 = Math.max(q1 + 1, Math.round(max * 0.5));
  const q3 = Math.max(q2 + 1, Math.round(max * 0.75));
  return total <= q1 ? 1 : total <= q2 ? 2 : total <= q3 ? 3 : 4;
}
