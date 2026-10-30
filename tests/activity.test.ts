import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { accountItem, apiKeyItem, disconnectAccount } from '@/lib/account';
import {
  activityItem,
  changedPosts,
  combineReactions,
  describe as describeItem,
  mergeItems,
  newComments,
  newFollowers,
  reactionItem,
  snapshotPosts,
  unreadCount,
  type ActivityItem,
} from '@/lib/activity';
import type { RawComment } from '@/lib/api/comments';
import type { Follower, MyArticle } from '@/lib/api/dashboard';
import { notificationFor, urlForNotification } from '@/lib/notify';

beforeEach(() => {
  fakeBrowser.reset();
});

const post = (id: number, comments: number, reactions: number, published = true): MyArticle => ({
  id,
  title: `Post ${id}`,
  published,
  published_at: published ? '2026-10-01T00:00:00Z' : null,
  path: `/me/post-${id}`,
  url: `https://dev.to/me/post-${id}`,
  comments_count: comments,
  public_reactions_count: reactions,
  page_views_count: 0,
});

const comment = (id: string, createdAt: string, username: string, children: RawComment[] = []): RawComment => ({
  id_code: id,
  created_at: createdAt,
  body_html: `<p>hi from ${username}</p>`,
  user: { name: username.toUpperCase(), username, profile_image_90: `https://x/${username}.png` },
  children,
});

const item = (id: string, foundAt: number, at = '2026-10-20T00:00:00Z'): ActivityItem => ({
  id,
  kind: 'comment',
  at,
  foundAt,
  url: `https://dev.to/x/comment/${id}`,
});

describe('changedPosts', () => {
  it('finds posts with more comments or reactions and skips drafts', () => {
    const prev = snapshotPosts([post(1, 2, 10), post(2, 0, 3)]);
    const changes = changedPosts(prev, [post(1, 3, 10), post(2, 0, 7), post(3, 1, 1), post(4, 5, 5, false)]);
    expect(changes.commented.map((a) => a.id)).toEqual([1, 3]);
    expect(changes.reacted.map((r) => [r.article.id, r.delta])).toEqual([
      [2, 4],
      [3, 1],
    ]);
  });

  it('ignores counts that went down', () => {
    const changes = changedPosts(snapshotPosts([post(1, 5, 5)]), [post(1, 4, 2)]);
    expect(changes.commented).toEqual([]);
    expect(changes.reacted).toEqual([]);
  });
});

describe('newComments', () => {
  const since = '2026-10-10T00:00:00Z';
  const tree = [
    comment('old', '2026-10-09T00:00:00Z', 'ada', [comment('r1', '2026-10-11T00:00:00Z', 'me', [comment('r2', '2026-10-12T00:00:00Z', 'bob')])]),
    comment('mine', '2026-10-11T00:00:00Z', 'me', [comment('r3', '2026-10-12T00:00:00Z', 'cat')]),
    comment('top', '2026-10-13T00:00:00Z', 'dan'),
  ];

  it('keeps new comments by other people from the whole tree', () => {
    const found = newComments(tree, post(1, 6, 0), 'me', since, 5);
    expect(found.map((c) => c.id)).toEqual(['comment:r2', 'comment:r3', 'comment:top']);
  });

  it('marks replies to your own comments', () => {
    const found = newComments(tree, post(1, 6, 0), 'me', since, 5);
    expect(found.map((c) => c.kind)).toEqual(['reply', 'reply', 'comment']);
    expect(found[2]).toMatchObject({
      url: 'https://dev.to/dan/comment/top',
      postTitle: 'Post 1',
      excerpt: 'hi from dan',
      actor: { name: 'DAN', username: 'dan' },
      foundAt: 5,
    });
  });

  it('skips deleted comments but still walks their replies', () => {
    const deleted: RawComment = { id_code: 'gone', created_at: '2026-10-11T00:00:00Z', body_html: '', user: {}, children: [comment('r4', '2026-10-12T00:00:00Z', 'eve')] };
    expect(newComments([deleted], post(1, 2, 0), 'me', since, 5).map((c) => c.id)).toEqual(['comment:r4']);
  });
});

describe('newFollowers', () => {
  it('keeps followers newer than the last check', () => {
    const f = (id: number, at: string): Follower => ({
      id,
      user_id: id * 10,
      name: '',
      username: `u${id}`,
      path: `/u${id}`,
      profile_image: '',
      created_at: at,
    });
    const found = newFollowers([f(1, '2026-10-12T00:00:00Z'), f(2, '2026-10-01T00:00:00Z')], '2026-10-10T00:00:00Z', 5);
    expect(found).toEqual([
      {
        id: 'follower:10',
        kind: 'follower',
        at: '2026-10-12T00:00:00Z',
        foundAt: 5,
        url: 'https://dev.to/u1',
        actor: { name: 'u1', username: 'u1', avatar: '' },
      },
    ]);
  });
});

describe('mergeItems', () => {
  it('drops repeats, keeps the first foundAt and puts the newest first', () => {
    const merged = mergeItems([item('a', 1)], [item('b', 2), item('a', 2)]);
    expect(merged.map((i) => [i.id, i.foundAt])).toEqual([
      ['b', 2],
      ['a', 1],
    ]);
  });

  it('caps the list at 50', () => {
    const fresh = Array.from({ length: 60 }, (_, n) => item(`i${n}`, n));
    const merged = mergeItems([], fresh);
    expect(merged).toHaveLength(50);
    expect(merged[0]?.id).toBe('i59');
  });
});

describe('combineReactions', () => {
  it('adds a new batch to an unseen row on the same post', () => {
    const unseen = reactionItem(post(3, 0, 12), 2, 20);
    const other = reactionItem(post(4, 0, 5), 1, 20);
    const { existing, fresh } = combineReactions([unseen, other], [reactionItem(post(3, 0, 15), 3, 30)], 10);
    expect(existing).toEqual([other]);
    expect(fresh).toMatchObject([{ id: 'reactions:3:15', count: 5, foundAt: 30 }]);
  });

  it('starts a new row once the old one has been seen', () => {
    const seen = reactionItem(post(3, 0, 12), 2, 20);
    const { existing, fresh } = combineReactions([seen], [reactionItem(post(3, 0, 15), 3, 30)], 25);
    expect(existing).toEqual([seen]);
    expect(fresh[0]?.count).toBe(3);
  });
});

describe('unreadCount', () => {
  it('counts items found after the bell was last opened', () => {
    const state = { checkedAt: 0, posts: {}, items: [item('a', 10), item('b', 20)], seenAt: 15, notifiedAt: 0 };
    expect(unreadCount(state)).toBe(1);
    expect(unreadCount(null)).toBe(0);
  });
});

describe('describing items', () => {
  it('writes one line per kind', () => {
    const actor = { name: 'Ada', username: 'ada', avatar: '' };
    expect(describeItem({ ...item('a', 1), actor, postTitle: 'Rust' })).toBe('Ada commented on “Rust”');
    expect(describeItem({ ...item('a', 1), kind: 'reply', actor, postTitle: 'Rust' })).toBe('Ada replied to you on “Rust”');
    expect(describeItem({ ...item('a', 1), kind: 'follower', actor })).toBe('Ada followed you');
    expect(describeItem(reactionItem(post(3, 0, 12), 1, 1))).toBe('1 new reaction on “Post 3”');
    expect(describeItem(reactionItem(post(3, 0, 12), 4, 1))).toBe('4 new reactions on “Post 3”');
  });

  it('gives reaction batches on the same post different ids', () => {
    expect(reactionItem(post(3, 0, 12), 2, 1).id).not.toBe(reactionItem(post(3, 0, 14), 2, 1).id);
  });

  it('puts the excerpt under the line in a notification', () => {
    const n = notificationFor({ ...item('a', 1), kind: 'reply', actor: { name: 'Ada', username: 'ada', avatar: '' }, postTitle: 'Rust', excerpt: 'nice' });
    expect(n).toEqual({ title: 'New reply', message: 'Ada replied to you on “Rust”\nnice' });
  });

  it('finds the link for a clicked notification', () => {
    expect(urlForNotification('a', [item('a', 1)])).toBe('https://dev.to/x/comment/a');
    expect(urlForNotification('activity:summary', [])).toBe('https://dev.to/notifications');
    expect(urlForNotification('missing', [])).toBe('https://dev.to/notifications');
  });
});

describe('disconnectAccount', () => {
  it('clears stored activity along with the key', async () => {
    await apiKeyItem.setValue('secret');
    await accountItem.setValue({ id: 1, username: 'ada', name: 'Ada', image: '' });
    await activityItem.setValue({ checkedAt: 1, posts: {}, items: [item('a', 1)], seenAt: 0, notifiedAt: 0 });

    await disconnectAccount();

    expect(await activityItem.getValue()).toBeNull();
  });
});
