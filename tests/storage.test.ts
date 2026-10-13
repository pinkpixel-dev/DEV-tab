import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { CACHE_TTL_MS, readCache, writeCache } from '@/lib/cache';
import { addTag, DEFAULT_SETTINGS, getSettings, normalizeTag, settingsItem, updateSettings } from '@/lib/settings';

beforeEach(() => {
  fakeBrowser.reset();
});

describe('cache', () => {
  it('returns null when nothing is cached', async () => {
    expect(await readCache('feed:top-day:')).toBeNull();
  });

  it('is fresh inside the TTL and stale after it', async () => {
    const t0 = 1_000_000;
    await writeCache('feed:top-day:', [1, 2, 3], t0);

    const fresh = await readCache<number[]>('feed:top-day:', t0 + CACHE_TTL_MS - 1);
    expect(fresh).toEqual({ data: [1, 2, 3], at: t0, fresh: true });

    const stale = await readCache<number[]>('feed:top-day:', t0 + CACHE_TTL_MS);
    expect(stale?.fresh).toBe(false);
    expect(stale?.data).toEqual([1, 2, 3]);
  });

  it('keeps feeds separate by key', async () => {
    await writeCache('feed:rising:', ['a']);
    expect(await readCache('feed:rising:rust')).toBeNull();
  });
});

describe('settings', () => {
  it('falls back to defaults', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('merges patches and persists them', async () => {
    await updateSettings({ density: 'compact' });
    const next = await updateSettings({ hiddenTags: ['ai'] });
    expect(next).toMatchObject({ density: 'compact', hiddenTags: ['ai'], defaultFeed: 'top-day' });
    expect(await settingsItem.getValue()).toEqual(next);
  });

  it('fills in fields missing from older saved settings', async () => {
    await settingsItem.setValue({ defaultFeed: 'latest' } as never);
    expect(await getSettings()).toEqual({ ...DEFAULT_SETTINGS, defaultFeed: 'latest' });
  });
});

describe('tags', () => {
  it('normalizes to DEV tag format', () => {
    expect(normalizeTag('#Web Dev!')).toBe('webdev');
    expect(normalizeTag('  ')).toBe('');
  });

  it('adds new tags and ignores duplicates or empty input', () => {
    expect(addTag(['rust'], '#Go')).toEqual(['rust', 'go']);
    expect(addTag(['rust'], 'RUST')).toEqual(['rust']);
    expect(addTag(['rust'], '!!')).toEqual(['rust']);
  });
});
