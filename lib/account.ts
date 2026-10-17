import { storage } from 'wxt/utils/storage';
import { fetchMe } from './api/user';
import type { Account } from './api/types';

// The key stays in local storage only. Never sync, never log it.
export const apiKeyItem = storage.defineItem<string | null>('local:apiKey', { fallback: null });
export const accountItem = storage.defineItem<Account | null>('local:account', { fallback: null });

// Personal responses are cached under this prefix so removing the key can
// clear all of them at once.
export const PERSONAL_CACHE_PREFIX = 'cache:me:';

// Firefox treats the key as authentication info, which needs the user's OK
// before it's sent anywhere. The manifest lists it as optional data
// collection, so Firefox asks when a key is first connected. Other browsers
// have no such prompt.
const KEY_CONSENT = { data_collection: ['authenticationInfo'] } as never;

// Has to be the first thing a click or submit handler awaits, or Firefox
// won't show the prompt.
export async function requestKeyConsent(): Promise<boolean> {
  if (!import.meta.env.FIREFOX) return true;
  return browser.permissions.request(KEY_CONSENT);
}

export async function hasKeyConsent(): Promise<boolean> {
  if (!import.meta.env.FIREFOX) return true;
  const all = (await browser.permissions.getAll()) as { data_collection?: string[] };
  return !all.data_collection || all.data_collection.includes('authenticationInfo');
}

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
