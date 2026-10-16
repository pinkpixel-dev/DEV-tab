import { describe, expect, it } from 'vitest';
import { fromSemanticHit, type SemanticHit } from '@/lib/api/articles';

// Trimmed from a live /articles/semantic_search response on 2026-10-15.
const hit: SemanticHit = {
  id: 3301227,
  title: 'Building Token: A Rust Text Editor with AI Agents',
  description: 'Token is a text editor written in Rust.',
  main_image: null,
  published_at: '2026-02-24T12:00:00.000Z',
  cached_tag_list: 'agents, ai, rust, softwaredevelopment',
  path: '/helgesverre/building-token-a-rust-text-editor-with-ai-agents-26o',
  comments_count: 0,
  public_reactions_count: 3,
  reading_time: 9,
};

describe('fromSemanticHit', () => {
  it('maps the raw fields onto the card article shape', () => {
    const a = fromSemanticHit(hit);
    expect(a.url).toBe('https://dev.to/helgesverre/building-token-a-rust-text-editor-with-ai-agents-26o');
    expect(a.tag_list).toEqual(['agents', 'ai', 'rust', 'softwaredevelopment']);
    expect(a.user).toEqual({ name: '@helgesverre', username: 'helgesverre', profile_image_90: '' });
    expect(a.reading_time_minutes).toBe(9);
    expect(a.cover_image).toBeNull();
    expect(a.readable_publish_date).toBe('Feb 24');
  });

  it('handles empty tags and descriptions', () => {
    const a = fromSemanticHit({ ...hit, cached_tag_list: null, description: null });
    expect(a.tag_list).toEqual([]);
    expect(a.description).toBe('');
  });
});
