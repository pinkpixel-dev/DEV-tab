import { apiGet } from './client';

// GET /comments?a_id= returns the whole tree, top-level comments oldest
// first, each with its replies under `children`. Deleted and hidden comments
// keep their place but come back with an empty `user`. There's no score, so
// "top comments" isn't possible.
export interface RawComment {
  id_code: string;
  created_at: string;
  body_html: string;
  user: { name?: string; username?: string; profile_image_90?: string };
  children?: RawComment[];
}

export interface CommentPreview {
  id: string;
  name: string;
  username: string;
  avatar: string;
  createdAt: string;
  text: string;
  url: string;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

// Comments are shown as plain text, so DEV's HTML never reaches the page.
export function htmlToText(html: string): string {
  return html
    .replace(/<(br|\/p|\/li|\/h\d|\/pre|\/blockquote)\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
      if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? m;
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

// The newest top-level comments that still have an author and some text.
export function toPreviews(raw: RawComment[], limit = 3): CommentPreview[] {
  return raw
    .filter((c) => c.user?.username)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0))
    .map((c) => {
      const username = c.user.username as string;
      return {
        id: c.id_code,
        name: c.user.name || username,
        username,
        avatar: c.user.profile_image_90 ?? '',
        createdAt: c.created_at,
        text: htmlToText(c.body_html),
        url: `https://dev.to/${username}/comment/${c.id_code}`,
      };
    })
    .filter((c) => c.text)
    .slice(0, limit);
}

const loaded = new Map<number, CommentPreview[]>();

export function cachedPreviews(articleId: number): CommentPreview[] | null {
  return loaded.get(articleId) ?? null;
}

// Public, so no key. Kept in memory for the life of the tab.
export async function fetchPreviews(articleId: number, signal?: AbortSignal): Promise<CommentPreview[]> {
  const hit = loaded.get(articleId);
  if (hit) return hit;
  const previews = toPreviews(await apiGet<RawComment[]>('/comments', { a_id: articleId }, signal));
  loaded.set(articleId, previews);
  return previews;
}
