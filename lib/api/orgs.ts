import { mergeNewest, PER_PAGE } from './articles';
import { apiGet } from './client';
import type { Article, Organization } from './types';

// The All view merges this many orgs, ten posts each. More than that in one go
// runs into DEV's rate limit. Every org still has its own chip.
export const ORG_FEED_MAX = 10;
export const ORG_FEED_PER_ORG = 10;

// Accepts a username, @username, or any dev.to link to the org or one of its posts.
export function normalizeOrg(input: string): string {
  const path = input.trim().split(/[?#]/)[0]!.replace(/^(https?:\/\/)?(www\.)?dev\.to(\/|$)/i, '');
  const first = path.split('/').find(Boolean) ?? '';
  return first.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export async function fetchOrg(username: string, signal?: AbortSignal): Promise<Organization> {
  const org = await apiGet<Organization>(`/organizations/${encodeURIComponent(username)}`, undefined, signal);
  return { username: org.username, name: org.name, profile_image: org.profile_image };
}

export function fetchOrgArticles(username: string, page: number, signal?: AbortSignal) {
  return apiGet<Article[]>(`/organizations/${encodeURIComponent(username)}/articles`, { page, per_page: PER_PAGE }, signal);
}

// One request per org, merged newest first. Orgs that fail are skipped.
// It only throws if every org failed.
export async function fetchOrgsFeed(usernames: string[], signal?: AbortSignal): Promise<Article[]> {
  const results = await Promise.allSettled(
    usernames.map((u) =>
      apiGet<Article[]>(`/organizations/${encodeURIComponent(u)}/articles`, { per_page: ORG_FEED_PER_ORG }, signal),
    ),
  );
  const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  if (ok.length === 0 && results.length > 0) throw (results[0] as PromiseRejectedResult).reason;
  return mergeNewest(ok);
}
