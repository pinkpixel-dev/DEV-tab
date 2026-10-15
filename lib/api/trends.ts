import { PER_PAGE } from './articles';
import { apiGet } from './client';
import type { Article, Trend } from './types';

const TRENDS_SHOWN = 12;

export async function fetchTrends(signal?: AbortSignal): Promise<Trend[]> {
  const trends = await apiGet<Trend[]>('/trends', { per_page: TRENDS_SHOWN }, signal);
  // DEV sometimes lists the same trend twice under different slugs. The first one has the higher score.
  const seen = new Set<string>();
  const unique = trends.filter((t) => !seen.has(t.name) && seen.add(t.name));
  // The response also carries key questions, scores and timestamps. Only keep what the chips show.
  return unique.map(({ id, name, slug, description, articles_count }) => ({ id, name, slug, description, articles_count }));
}

export function fetchTrendArticles(slug: string, page: number, signal?: AbortSignal) {
  return apiGet<Article[]>(`/trends/${encodeURIComponent(slug)}/articles`, { page, per_page: PER_PAGE }, signal);
}
