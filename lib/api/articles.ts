import { apiGet } from './client';
import type { Article, FeedKind, FeedQuery } from './types';

export const PER_PAGE = 30;

// Only the single `tag` param filters on live DEV. `tags` and `tags_exclude`
// are in the spec but get ignored, so hidden tags are filtered client-side.
export function feedRequest({ kind, page, tag }: FeedQuery) {
  const base = { page, per_page: PER_PAGE, tag };
  const byKind: Record<FeedKind, { path: string; params: Record<string, string | number | undefined> }> = {
    'top-day': { path: '/articles', params: { ...base, top: 1 } },
    'top-week': { path: '/articles', params: { ...base, top: 7 } },
    rising: { path: '/articles', params: { ...base, state: 'rising' } },
    latest: { path: '/articles/latest', params: base },
  };
  return byKind[kind];
}

export function fetchFeed(query: FeedQuery, signal?: AbortSignal) {
  const { path, params } = feedRequest(query);
  return apiGet<Article[]>(path, params, signal);
}

export function searchArticles(q: string, page: number, signal?: AbortSignal) {
  return apiGet<Article[]>('/articles/search', { q, page, per_page: PER_PAGE }, signal);
}

export function hideTagged(articles: Article[], hiddenTags: string[]): Article[] {
  if (hiddenTags.length === 0) return articles;
  const hidden = new Set(hiddenTags);
  return articles.filter((a) => !a.tag_list.some((t) => hidden.has(t)));
}

export function dedupe(existing: Article[], incoming: Article[]): Article[] {
  const seen = new Set(existing.map((a) => a.id));
  return [...existing, ...incoming.filter((a) => !seen.has(a.id))];
}
