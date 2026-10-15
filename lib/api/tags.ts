import { apiGet } from './client';

// DEV returns tags most popular first, so this is the top 1000.
export async function fetchPopularTags(signal?: AbortSignal): Promise<string[]> {
  const tags = await apiGet<{ name: string }[]>('/tags', { per_page: 1000 }, signal);
  return tags.map((t) => t.name);
}
