import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { mergeNewest } from '@/lib/api/articles';
import type { Article, FollowedTag } from '@/lib/api/types';
import { byWeight } from '@/lib/api/user';
import { writeCache } from '@/lib/cache';
import { getFollowedTags } from '@/lib/follows';

beforeEach(() => {
  fakeBrowser.reset();
});

const post = (id: number, published_at: string) => ({ id, published_at }) as Article;

describe('mergeNewest', () => {
  it('dedupes posts that came back for two tags and sorts newest first', () => {
    const rust = [post(1, '2026-10-10T10:00:00Z'), post(2, '2026-10-12T10:00:00Z')];
    const go = [post(2, '2026-10-12T10:00:00Z'), post(3, '2026-10-11T10:00:00Z')];
    expect(mergeNewest([rust, go]).map((a) => a.id)).toEqual([2, 3, 1]);
  });

  it('handles no lists', () => {
    expect(mergeNewest([])).toEqual([]);
  });
});

describe('followed tags', () => {
  const tags: FollowedTag[] = [
    { id: 1, name: 'css', points: 1 },
    { id: 2, name: 'rust', points: 5 },
    { id: 3, name: 'go', points: 1 },
  ];

  it('sorts heaviest first and keeps ties in order', () => {
    expect(byWeight(tags).map((t) => t.name)).toEqual(['rust', 'css', 'go']);
  });

  it('serves fresh cached tags without a request', async () => {
    await writeCache('me:follows', tags);
    // A bad key would make a real request fail, so getting data back proves the cache was used.
    expect(await getFollowedTags('not-a-key')).toEqual(tags);
  });
});
