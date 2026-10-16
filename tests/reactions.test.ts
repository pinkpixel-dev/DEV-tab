import { describe, expect, it } from 'vitest';
import { REACTIONS, toReactionCounts } from '@/lib/api/reactions';

describe('toReactionCounts', () => {
  it('reads the counts from a live-shaped response', () => {
    // Captured from dev.to/reactions?article_id= on 2026-10-15.
    const raw = {
      current_user: { id: null },
      reactions: [],
      article_reaction_counts: [
        { category: 'like', count: 9 },
        { category: 'unicorn', count: 2 },
        { category: 'exploding_head', count: 2 },
        { category: 'raised_hands', count: 3 },
        { category: 'fire', count: 2 },
        { category: 'readinglist', count: 16 },
      ],
    };
    expect(toReactionCounts(raw)).toEqual({ like: 9, unicorn: 2, exploding_head: 2, raised_hands: 3, fire: 2 });
  });

  it('fills in zeros for missing or malformed entries', () => {
    const raw = { article_reaction_counts: [{ category: 'fire', count: 4 }, { category: 'like', count: '7' }, null] };
    expect(toReactionCounts(raw)).toEqual({ like: 0, unicorn: 0, exploding_head: 0, raised_hands: 0, fire: 4 });
    expect(toReactionCounts(null)).toEqual({ like: 0, unicorn: 0, exploding_head: 0, raised_hands: 0, fire: 0 });
  });

  it('keeps DEV picker order', () => {
    expect(REACTIONS.map((r) => r.category)).toEqual(['like', 'unicorn', 'exploding_head', 'raised_hands', 'fire']);
  });
});
