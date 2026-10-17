import { describe, expect, it } from 'vitest';
import { htmlToText, toPreviews, type RawComment } from '@/lib/api/comments';

const comment = (id: string, createdAt: string, body: string, username?: string, children: RawComment[] = []): RawComment => ({
  id_code: id,
  created_at: createdAt,
  body_html: body,
  user: username ? { name: username.toUpperCase(), username, profile_image_90: `https://x/${username}.png` } : {},
  children,
});

describe('htmlToText', () => {
  it('strips tags and decodes entities into one line', () => {
    expect(htmlToText('<p>Nice &amp; <strong>tidy</strong></p>\n<p>Uses <code>&lt;div&gt;</code> &#8212; ok&#x21;</p>')).toBe(
      'Nice & tidy Uses <div> — ok!',
    );
  });

  it('keeps words apart across line breaks and paragraphs', () => {
    expect(htmlToText('<p>one<br>two</p><p>three</p>')).toBe('one two three');
  });

  it('leaves unknown entities alone', () => {
    expect(htmlToText('a &bogus; b')).toBe('a &bogus; b');
  });
});

describe('toPreviews', () => {
  const tree = [
    comment('a1', '2026-10-01T10:00:00Z', '<p>first</p>', 'ada', [comment('r1', '2026-10-09T10:00:00Z', '<p>reply</p>', 'bob')]),
    comment('a2', '2026-10-02T10:00:00Z', '<p>Comment deleted</p>'),
    comment('a3', '2026-10-03T10:00:00Z', '<p>third</p>', 'cy'),
    comment('a4', '2026-10-04T10:00:00Z', '<p>fourth</p>', 'di'),
    comment('a5', '2026-10-05T10:00:00Z', '<p><img src="x.png"></p>', 'ed'),
  ];

  it('returns the newest top-level comments with an author and text', () => {
    expect(toPreviews(tree).map((c) => c.id)).toEqual(['a4', 'a3', 'a1']);
  });

  it('links each preview to the comment on DEV', () => {
    expect(toPreviews(tree, 1)[0]).toEqual({
      id: 'a4',
      name: 'DI',
      username: 'di',
      avatar: 'https://x/di.png',
      createdAt: '2026-10-04T10:00:00Z',
      text: 'fourth',
      url: 'https://dev.to/di/comment/a4',
    });
  });

  it('handles a post with no comments', () => {
    expect(toPreviews([])).toEqual([]);
  });
});
