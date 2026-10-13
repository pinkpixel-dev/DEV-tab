import { storage } from 'wxt/utils/storage';

export const CACHE_TTL_MS = 10 * 60 * 1000;

interface Entry<T> {
  at: number;
  data: T;
}

export interface CacheHit<T> {
  data: T;
  at: number;
  fresh: boolean;
}

const keyFor = (key: string) => `local:cache:${key}` as const;

export async function readCache<T>(key: string, now = Date.now()): Promise<CacheHit<T> | null> {
  const entry = await storage.getItem<Entry<T>>(keyFor(key));
  if (!entry) return null;
  return { data: entry.data, at: entry.at, fresh: now - entry.at < CACHE_TTL_MS };
}

export async function writeCache<T>(key: string, data: T, now = Date.now()): Promise<void> {
  await storage.setItem<Entry<T>>(keyFor(key), { at: now, data });
}
