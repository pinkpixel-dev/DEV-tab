import { describe, expect, it } from 'vitest';
import { dedupe, feedRequest, hideTagged, PER_PAGE } from '@/lib/api/articles';
import { ApiError, buildUrl, parseResponse } from '@/lib/api/client';
import type { Article } from '@/lib/api/types';

function article(id: number, tags: string[] = []): Article {
  return {
    id,
    title: `Post ${id}`,
    description: '',
    url: `https://dev.to/someone/post-${id}`,
    cover_image: null,
    tag_list: tags,
    reading_time_minutes: 3,
    public_reactions_count: 0,
    comments_count: 0,
    published_at: '2026-10-11T12:00:00Z',
    readable_publish_date: 'Oct 11',
    user: { name: 'Someone', username: 'someone', profile_image_90: '' },
  };
}

describe('feedRequest', () => {
  it('maps each feed to the right endpoint and params', () => {
    expect(feedRequest({ kind: 'top-day', page: 1 })).toEqual({
      path: '/articles',
      params: { page: 1, per_page: PER_PAGE, tag: undefined, top: 1 },
    });
    expect(feedRequest({ kind: 'top-week', page: 2 }).params).toMatchObject({ top: 7, page: 2 });
    expect(feedRequest({ kind: 'rising', page: 1 }).params).toMatchObject({ state: 'rising' });
    expect(feedRequest({ kind: 'latest', page: 1 }).path).toBe('/articles/latest');
  });

  it('passes a tag through as the singular tag param', () => {
    expect(feedRequest({ kind: 'rising', page: 1, tag: 'rust' }).params).toMatchObject({ tag: 'rust' });
  });
});

describe('buildUrl', () => {
  it('skips empty and undefined params', () => {
    expect(buildUrl('/articles', { top: 7, tag: undefined, q: '' })).toBe('https://dev.to/api/articles?top=7');
  });

  it('encodes search text', () => {
    expect(buildUrl('/articles/search', { q: 'react hooks' })).toBe(
      'https://dev.to/api/articles/search?q=react+hooks',
    );
  });
});

describe('parseResponse', () => {
  it('returns JSON for ok responses', async () => {
    const res = new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    await expect(parseResponse(res)).resolves.toEqual([{ id: 1 }]);
  });

  it('turns 429 into a rate-limited error', async () => {
    const err = await parseResponse<never>(new Response('', { status: 429 })).catch((e: ApiError) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.kind).toBe('rate-limited');
  });

  it('turns other failures into http errors with the status', async () => {
    const err = await parseResponse<never>(new Response('', { status: 503 })).catch((e: ApiError) => e);
    expect(err.kind).toBe('http');
    expect(err.status).toBe(503);
  });
});

describe('hideTagged', () => {
  it('drops posts with any hidden tag', () => {
    const posts = [article(1, ['ai', 'webdev']), article(2, ['rust']), article(3, [])];
    expect(hideTagged(posts, ['ai']).map((a) => a.id)).toEqual([2, 3]);
  });

  it('returns the same list when nothing is hidden', () => {
    const posts = [article(1, ['ai'])];
    expect(hideTagged(posts, [])).toBe(posts);
  });
});

describe('dedupe', () => {
  it('appends only posts that are not already loaded', () => {
    const merged = dedupe([article(1), article(2)], [article(2), article(3)]);
    expect(merged.map((a) => a.id)).toEqual([1, 2, 3]);
  });
});
