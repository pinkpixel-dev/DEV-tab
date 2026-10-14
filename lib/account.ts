import { storage } from 'wxt/utils/storage';
import { fetchMe } from './api/user';
import type { Account } from './api/types';

// The key stays in local storage only. Never sync, never log it.
export const apiKeyItem = storage.defineItem<string | null>('local:apiKey', { fallback: null });
export const accountItem = storage.defineItem<Account | null>('local:account', { fallback: null });

// Personal responses are cached under this prefix so removing the key can
// clear all of them at once.
export const PERSONAL_CACHE_PREFIX = 'cache:me:';

export async function connectAccount(apiKey: string): Promise<Account> {
  const key = apiKey.trim();
  const account = await fetchMe(key);
  await storage.setItems([
    { key: 'local:apiKey', value: key },
    { key: 'local:account', value: account },
  ]);
  return account;
}

export async function disconnectAccount(): Promise<void> {
  const all = await browser.storage.local.get(null);
  const personal = Object.keys(all).filter((k) => k.startsWith(PERSONAL_CACHE_PREFIX));
  await browser.storage.local.remove(['apiKey', 'account', ...personal]);
}
