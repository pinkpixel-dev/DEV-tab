import { ApiError, parseResponse } from './client';

// The five reactions DEV shows in its picker, in DEV's order.
export const REACTIONS = [
  { category: 'like', emoji: '💖', label: 'Like' },
  { category: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { category: 'exploding_head', emoji: '🤯', label: 'Exploding head' },
  { category: 'raised_hands', emoji: '🙌', label: 'Raised hands' },
  { category: 'fire', emoji: '🔥', label: 'Fire' },
] as const;

export type ReactionCategory = (typeof REACTIONS)[number]['category'];
export type ReactionCounts = Record<ReactionCategory, number>;

// Missing or odd entries count as zero, so a shape change on DEV's side shows
// zeros instead of breaking the picker.
export function toReactionCounts(raw: unknown): ReactionCounts {
  const counts = Object.fromEntries(REACTIONS.map((r) => [r.category, 0])) as ReactionCounts;
  const list = (raw as { article_reaction_counts?: unknown } | null)?.article_reaction_counts;
  if (!Array.isArray(list)) return counts;
  for (const item of list) {
    const { category, count } = (item ?? {}) as { category?: unknown; count?: unknown };
    if (typeof category === 'string' && category in counts && typeof count === 'number') {
      counts[category as ReactionCategory] = count;
    }
  }
  return counts;
}

const loaded = new Map<number, ReactionCounts>();

export function cachedReactionCounts(articleId: number): ReactionCounts | null {
  return loaded.get(articleId) ?? null;
}

// Per-reaction counts come from the endpoint DEV's own article page uses. It's
// public but not part of the documented API. Cookies stay out of it, so it
// never sees your dev.to login.
export async function fetchReactionCounts(articleId: number, signal?: AbortSignal): Promise<ReactionCounts> {
  const hit = loaded.get(articleId);
  if (hit) return hit;
  let res: Response;
  try {
    res = await fetch(`https://dev.to/reactions?article_id=${articleId}`, {
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError('offline', "Couldn't reach DEV.");
  }
  const counts = toReactionCounts(await parseResponse<unknown>(res));
  loaded.set(articleId, counts);
  return counts;
}
