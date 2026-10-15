import { apiGet } from './client';
import type { Article } from './types';

// Shapes checked against live /analytics/dashboard, /articles/me/all and
// /followers/users responses on 2026-10-14. The spec documents none of the
// analytics responses.

export interface DayStats {
  comments: { total: number };
  follows: { total: number };
  reactions: {
    total: number;
    like: number;
    readinglist: number;
    unicorn: number;
    exploding_head: number;
    raised_hands: number;
    fire: number;
    unique_reactors: number;
  };
  page_views: { total: number; average_read_time_in_seconds: number; total_read_time_in_seconds: number };
}

export interface Contributor {
  user_id: number;
  username: string;
  name: string;
  profile_image: string;
  reactions_count: number;
  comments_count: number;
  score: number;
}

export interface DashboardBundle {
  historical: Record<string, DayStats>;
  totals: DayStats;
  referrers: { domains: { domain: string; count: number }[] };
  top_contributors: Contributor[];
  follower_engagement: { total_followers: number; engaged_followers: number; ratio: number };
  start_date_floor: string;
}

export interface MyArticle {
  id: number;
  title: string;
  published: boolean;
  published_at: string | null;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  page_views_count: number;
}

export interface Follower {
  id: number;
  user_id: number;
  name: string;
  username: string;
  path: string;
  profile_image: string;
  created_at: string;
}

export const RANGES = [7, 30, 90] as const;
export type RangeDays = (typeof RANGES)[number];

// `start` for the analytics endpoints, as YYYY-MM-DD in UTC.
export function rangeStart(days: number, now = Date.now()): string {
  return new Date(now - (days - 1) * 86_400_000).toISOString().slice(0, 10);
}

export function fetchDashboard(apiKey: string, days: RangeDays, signal?: AbortSignal) {
  return apiGet<DashboardBundle>('/analytics/dashboard', { start: rangeStart(days) }, signal, apiKey);
}

// Published and drafts together, drafts first.
export function fetchMyArticles(apiKey: string, signal?: AbortSignal) {
  return apiGet<MyArticle[]>('/articles/me/all', { per_page: 100 }, signal, apiKey);
}

export function fetchFollowers(apiKey: string, signal?: AbortSignal) {
  return apiGet<Follower[]>('/followers/users', { per_page: 12, sort: '-created_at' }, signal, apiKey);
}

export interface RangeTotals {
  views: number;
  reactions: number;
  comments: number;
  follows: number;
  readSeconds: number;
  byReaction: Record<'like' | 'unicorn' | 'exploding_head' | 'raised_hands' | 'fire' | 'readinglist', number>;
}

// Sums the daily history so every number on screen covers the same range.
export function sumDays(historical: Record<string, DayStats>): RangeTotals {
  const out: RangeTotals = {
    views: 0,
    reactions: 0,
    comments: 0,
    follows: 0,
    readSeconds: 0,
    byReaction: { like: 0, unicorn: 0, exploding_head: 0, raised_hands: 0, fire: 0, readinglist: 0 },
  };
  for (const day of Object.values(historical)) {
    out.views += day.page_views.total;
    out.readSeconds += day.page_views.total_read_time_in_seconds;
    out.reactions += day.reactions.total;
    out.comments += day.comments.total;
    out.follows += day.follows.total;
    for (const k of Object.keys(out.byReaction) as (keyof RangeTotals['byReaction'])[]) {
      out.byReaction[k] += day.reactions[k] ?? 0;
    }
  }
  return out;
}

export interface DayPoint {
  date: string;
  views: number;
}

// Oldest first. The keys are ISO dates, so a string sort is a date sort.
export function dailyViews(historical: Record<string, DayStats>): DayPoint[] {
  return Object.entries(historical)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, day]) => ({ date, views: day.page_views.total }));
}

// DEV's editor lives at the post path plus /edit. Drafts can carry a preview
// query string, which has to come off first.
export function editUrl(article: Pick<MyArticle, 'path'>): string {
  return `https://dev.to${article.path.split('?')[0]}/edit`;
}

// Reading list entries wrap the post, and its tags come as one string.
export interface ReadingListItem {
  id: number;
  article: Omit<Article, 'tag_list'> & { tags?: string; tag_list?: string[] };
}

export function fromReadingList(items: ReadingListItem[]): Article[] {
  return items.map(({ article }) => ({
    ...article,
    tag_list: article.tag_list ?? (article.tags ?? '').split(/[\s,]+/).filter(Boolean),
  }));
}
