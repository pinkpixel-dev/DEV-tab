import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { accountItem, apiKeyItem, disconnectAccount } from '@/lib/account';
import { ApiError, parseResponse } from '@/lib/api/client';
import { toAccount } from '@/lib/api/user';
import { readCache, writeCache } from '@/lib/cache';

beforeEach(() => {
  fakeBrowser.reset();
});

describe('toAccount', () => {
  it('keeps the fields the UI needs', () => {
    expect(toAccount({ id: 7, username: 'ada', name: 'Ada', profile_image: 'https://x/a.png', email: 'a@b.c' })).toEqual({
      id: 7,
      username: 'ada',
      name: 'Ada',
      image: 'https://x/a.png',
    });
  });

  it('falls back when fields are missing or renamed', () => {
    expect(toAccount({ username: 'ada', profile_image_90: 'https://x/90.png' })).toEqual({
      id: 0,
      username: 'ada',
      name: 'ada',
      image: 'https://x/90.png',
    });
  });
});

describe('401 handling', () => {
  it('maps 401 to an unauthorized error', async () => {
    const err = await parseResponse<never>(new Response('{}', { status: 401 })).catch((e: ApiError) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.kind).toBe('unauthorized');
  });
});

describe('disconnectAccount', () => {
  it('removes the key, the account and personal caches only', async () => {
    await apiKeyItem.setValue('secret');
    await accountItem.setValue({ id: 1, username: 'ada', name: 'Ada', image: '' });
    await writeCache('me:readinglist', [1]);
    await writeCache('feed:top-day:', [2]);

    await disconnectAccount();

    expect(await apiKeyItem.getValue()).toBeNull();
    expect(await accountItem.getValue()).toBeNull();
    expect(await readCache('me:readinglist')).toBeNull();
    expect((await readCache('feed:top-day:'))?.data).toEqual([2]);
  });
});
