import { storage } from 'wxt/utils/storage';
import { apiGet } from './api/client';
import { htmlToText, type RawComment } from './api/comments';
import { fetchFollowers, fetchMyArticles, type Follower, type MyArticle } from './api/dashboard';

// DEV's API has no notifications endpoint, so activity is worked out by
// comparing your posts and followers against the last check. It covers
// comments and replies on your own posts, new reactions and new followers.
// Replies to your comments on other people's posts can't be found, because
// nothing lists the comments you've written.

export type ActivityKind = 'comment' | 'reply' | 'reactions' | 'follower';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  // When it happened on DEV, as an ISO string.
  at: string;
  // When a check found it. Unread and notified are based on this, so a
  // comment from before a slow check still counts as new.
  foundAt: number;
  url: string;
  actor?: { name: string; username: string; avatar: string };
  postTitle?: string;
  // Comment text, flattened and trimmed.
  excerpt?: string;
  // New reactions since the last check.
  count?: number;
}

interface PostSnapshot {
  comments: number;
  reactions: number;
}

export interface ActivityState {
  checkedAt: number;
  posts: Record<string, PostSnapshot>;
  items: ActivityItem[];
  // Items found after this show as unread on the bell.
  seenAt: number;
  // Items found after this haven't had a desktop notification yet.
  notifiedAt: number;
}

export const activityItem = storage.defineItem<ActivityState | null>('local:activity', { fallback: null });

// Checks closer together than this reuse the last result, so a burst of new
// tabs doesn't turn into a burst of requests.
export const ACTIVITY_MIN_GAP_MS = 5 * 60 * 1000;
const MAX_ITEMS = 50;
// Comment trees fetched per check. Anything past this waits for the next one.
const MAX_COMMENT_FETCHES = 6;
const EXCERPT_LENGTH = 140;

export function snapshotPosts(articles: MyArticle[]): Record<string, PostSnapshot> {
  const out: Record<string, PostSnapshot> = {};
  for (const a of articles) {
    if (a.published) out[a.id] = { comments: a.comments_count, reactions: a.public_reactions_count };
  }
  return out;
}

export interface PostChanges {
  commented: MyArticle[];
  reacted: { article: MyArticle; delta: number }[];
}

// Posts that weren't in the last snapshot are new, so they start from zero.
export function changedPosts(prev: Record<string, PostSnapshot>, articles: MyArticle[]): PostChanges {
  const out: PostChanges = { commented: [], reacted: [] };
  for (const a of articles) {
    if (!a.published) continue;
    const before = prev[a.id] ?? { comments: 0, reactions: 0 };
    if (a.comments_count > before.comments) out.commented.push(a);
    const delta = a.public_reactions_count - before.reactions;
    if (delta > 0) out.reacted.push({ article: a, delta });
  }
  return out;
}

function excerpt(html: string): string {
  const text = htmlToText(html);
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH - 1).trimEnd()}…` : text;
}

// Walks the whole tree. A comment is a reply when its parent is yours, so a
// reply between two other people on your post still counts as a comment.
export function newComments(tree: RawComment[], article: MyArticle, me: string, since: string, foundAt: number): ActivityItem[] {
  const out: ActivityItem[] = [];
  const walk = (list: RawComment[], parent: RawComment | null) => {
    for (const c of list) {
      const username = c.user?.username;
      if (username && username !== me && c.created_at > since) {
        const text = excerpt(c.body_html);
        out.push({
          id: `comment:${c.id_code}`,
          kind: parent?.user?.username === me ? 'reply' : 'comment',
          at: c.created_at,
          foundAt,
          url: `https://dev.to/${username}/comment/${c.id_code}`,
          actor: { name: c.user.name || username, username, avatar: c.user.profile_image_90 ?? '' },
          postTitle: article.title,
          excerpt: text || undefined,
        });
      }
      if (c.children?.length) walk(c.children, c);
    }
  };
  walk(tree, null);
  return out;
}

export function reactionItem(article: MyArticle, delta: number, foundAt: number): ActivityItem {
  return {
    // The total is in the id, so a later batch on the same post is a new item.
    id: `reactions:${article.id}:${article.public_reactions_count}`,
    kind: 'reactions',
    at: new Date(foundAt).toISOString(),
    foundAt,
    url: article.url,
    postTitle: article.title,
    count: delta,
  };
}

// A new batch on a post that still has an unseen reaction row takes that
// row's place with the two counts added, so one busy post doesn't fill the
// bell. Once the bell has been opened, the next batch starts a new row.
export function combineReactions(existing: ActivityItem[], fresh: ActivityItem[], seenAt: number) {
  const postOf = (i: ActivityItem) => i.id.split(':')[1];
  const unseen = new Map(
    existing.filter((i) => i.kind === 'reactions' && i.foundAt > seenAt).map((i) => [postOf(i), i]),
  );
  const replaced = new Set<string>();
  const combined = fresh.map((i) => {
    const prev = i.kind === 'reactions' ? unseen.get(postOf(i)) : undefined;
    if (!prev) return i;
    replaced.add(prev.id);
    return { ...i, count: (i.count ?? 0) + (prev.count ?? 0) };
  });
  return { existing: existing.filter((i) => !replaced.has(i.id)), fresh: combined };
}

export function newFollowers(followers: Follower[], since: string, foundAt: number): ActivityItem[] {
  return followers
    .filter((f) => f.created_at > since)
    .map((f) => ({
      id: `follower:${f.user_id}`,
      kind: 'follower' as const,
      at: f.created_at,
      foundAt,
      url: `https://dev.to/${f.username}`,
      actor: { name: f.name || f.username, username: f.username, avatar: f.profile_image },
    }));
}

// Newest first, no repeats, capped. Earlier copies win so foundAt stays put.
export function mergeItems(existing: ActivityItem[], fresh: ActivityItem[]): ActivityItem[] {
  const seen = new Set(existing.map((i) => i.id));
  const added = fresh.filter((i) => !seen.has(i.id) && seen.add(i.id));
  return [...added, ...existing]
    .sort((a, b) => b.foundAt - a.foundAt || (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, MAX_ITEMS);
}

export const unreadCount = (state: ActivityState | null) =>
  state ? state.items.filter((i) => i.foundAt > state.seenAt).length : 0;

// One line describing an item, shared by the bell and desktop notifications.
export function describe(item: ActivityItem): string {
  const who = item.actor?.name ?? 'Someone';
  if (item.kind === 'reply') return `${who} replied to you on “${item.postTitle}”`;
  if (item.kind === 'comment') return `${who} commented on “${item.postTitle}”`;
  if (item.kind === 'follower') return `${who} followed you`;
  const n = item.count ?? 0;
  return `${n} new reaction${n === 1 ? '' : 's'} on “${item.postTitle}”`;
}

interface CheckOptions {
  now?: number;
  force?: boolean;
}

/**
 * Compares your posts and followers with the last check and stores whatever
 * is new. The first check only records a starting point, so you don't get
 * your whole history at once. Returns the items this check added.
 */
export async function checkActivity(apiKey: string, username: string, { now = Date.now(), force = false }: CheckOptions = {}) {
  const prev = await activityItem.getValue();
  if (prev && !force && now - prev.checkedAt < ACTIVITY_MIN_GAP_MS) return [];

  const [articles, followers] = await Promise.all([fetchMyArticles(apiKey), fetchFollowers(apiKey)]);
  const posts = snapshotPosts(articles);

  if (!prev) {
    await activityItem.setValue({ checkedAt: now, posts, items: [], seenAt: now, notifiedAt: now });
    return [];
  }

  const since = new Date(prev.checkedAt).toISOString();
  const changes = changedPosts(prev.posts, articles);
  const fresh: ActivityItem[] = [];
  // Keeps the old comment count so this post gets looked at again next time.
  const retryLater = (article: MyArticle) => {
    posts[article.id] = { reactions: article.public_reactions_count, comments: prev.posts[article.id]?.comments ?? 0 };
  };

  // One at a time, since DEV starts returning 429s on quick bursts.
  for (const article of changes.commented.slice(0, MAX_COMMENT_FETCHES)) {
    try {
      const tree = await apiGet<RawComment[]>('/comments', { a_id: article.id });
      fresh.push(...newComments(tree, article, username, since, now));
    } catch {
      retryLater(article);
    }
  }
  changes.commented.slice(MAX_COMMENT_FETCHES).forEach(retryLater);
  for (const { article, delta } of changes.reacted) fresh.push(reactionItem(article, delta, now));
  fresh.push(...newFollowers(followers, since, now));

  // Another page may have checked while this one waited on DEV, so merge
  // into whatever is stored now instead of the copy read at the start.
  const latest = (await activityItem.getValue()) ?? prev;
  const known = new Set(latest.items.map((i) => i.id));
  const combined = combineReactions(latest.items, fresh, latest.seenAt);
  await activityItem.setValue({
    ...latest,
    checkedAt: now,
    posts,
    items: mergeItems(combined.existing, combined.fresh),
  });
  return combined.fresh.filter((i) => !known.has(i.id));
}
