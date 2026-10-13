import { storage } from 'wxt/utils/storage';
import type { FeedKind } from './api/types';

export type Density = 'comfortable' | 'compact';

export interface Settings {
  defaultFeed: FeedKind;
  density: Density;
  savedTags: string[];
  hiddenTags: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  defaultFeed: 'top-day',
  density: 'comfortable',
  savedTags: ['webdev', 'javascript', 'programming', 'ai', 'beginners'],
  hiddenTags: [],
};

export const settingsItem = storage.defineItem<Settings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
});

export async function getSettings(): Promise<Settings> {
  // Spread over defaults so settings saved by older versions pick up new fields.
  return { ...DEFAULT_SETTINGS, ...(await settingsItem.getValue()) };
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await settingsItem.setValue(next);
  return next;
}

// DEV tags are lowercase letters and numbers only.
export function normalizeTag(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function addTag(list: string[], input: string): string[] {
  const tag = normalizeTag(input);
  return tag && !list.includes(tag) ? [...list, tag] : list;
}
