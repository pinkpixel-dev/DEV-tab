import { byWeight, fetchFollowedTags } from './api/user';
import type { FollowedTag } from './api/types';
import { readCache, writeCache } from './cache';

const CACHE_KEY = 'me:follows';
let inflight: Promise<FollowedTag[]> | null = null;

// Followed tags, heaviest first. The tag chips and My feed both ask for these
// on load, so a cached copy or a single shared request serves both.
export async function getFollowedTags(apiKey: string): Promise<FollowedTag[]> {
  const hit = await readCache<FollowedTag[]>(CACHE_KEY);
  if (hit?.fresh) return hit.data;
  inflight ??= fetchFollowedTags(apiKey)
    .then(async (tags) => {
      const sorted = byWeight(tags);
      await writeCache(CACHE_KEY, sorted);
      return sorted;
    })
    .finally(() => {
      inflight = null;
    });
  try {
    return await inflight;
  } catch (err) {
    // A stale list beats no list.
    if (hit) return hit.data;
    throw err;
  }
}
