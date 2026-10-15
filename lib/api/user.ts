import { apiGet } from './client';
import type { Account, FollowedTag } from './types';

// The spec's MyUser shape hasn't been checked against a live response yet,
// so this only trusts the fields it needs and tolerates the image under
// either name.
export function toAccount(raw: Record<string, unknown>): Account {
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const username = str(raw.username);
  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    username,
    name: str(raw.name) || username,
    image: str(raw.profile_image) || str(raw.profile_image_90),
  };
}

export async function fetchMe(apiKey: string, signal?: AbortSignal): Promise<Account> {
  const raw = await apiGet<Record<string, unknown>>('/users/me', undefined, signal, apiKey);
  return toAccount(raw);
}

export function fetchFollowedTags(apiKey: string, signal?: AbortSignal): Promise<FollowedTag[]> {
  return apiGet<FollowedTag[]>('/follows/tags', undefined, signal, apiKey);
}

// Heaviest tags first. Ties keep DEV's order.
export function byWeight(tags: FollowedTag[]): FollowedTag[] {
  return [...tags].sort((a, b) => b.points - a.points);
}
