// Shapes taken from real dev.to responses, not just the OpenAPI spec.
// The spec's ArticleIndex schema is missing comments_count, for example.

export interface ArticleUser {
  name: string;
  username: string;
  profile_image_90: string;
}

export interface ArticleOrganization {
  name: string;
  username: string;
  profile_image_90: string;
}

export interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  cover_image: string | null;
  tag_list: string[];
  reading_time_minutes: number;
  public_reactions_count: number;
  comments_count: number;
  published_at: string;
  readable_publish_date: string;
  user: ArticleUser;
  organization?: ArticleOrganization;
}

export type FeedKind = 'top-day' | 'top-week' | 'rising' | 'latest';

export interface FeedQuery {
  kind: FeedKind;
  page: number;
  tag?: string;
}

// The signed-in DEV user, trimmed to what the UI shows.
export interface Account {
  id: number;
  username: string;
  name: string;
  image: string;
  // From `joined_at`. Accounts saved before this was added don't have it.
  joinedYear?: number;
}

// From GET /follows/tags. `points` is the weight DEV gives each followed tag.
export interface FollowedTag {
  id: number;
  name: string;
  points: number;
}

// A DEV organization, trimmed to what the chips and settings show.
export interface Organization {
  username: string;
  name: string;
  profile_image: string;
}

// From GET /trends. Trends are topics DEV groups related posts under.
export interface Trend {
  id: number;
  name: string;
  slug: string;
  description: string;
  articles_count: number;
}

// From GET /events: DEV live streams and challenges.
export interface DevEvent {
  id: number;
  title: string;
  description: string;
  kind: 'live_stream' | 'challenge';
  start: string;
  end: string | null;
  url: string;
  cover: string | null;
}

// A tab on the new tab page: one of the public feeds, a personal tab
// (My feed, Reading list) when a key is set, or one of the extra views.
export type PersonalTab = 'mine' | 'reading';
export type ExtraTab = 'orgs' | 'trends' | 'events' | 'podcasts' | 'videos';
export type FeedTab = FeedKind | PersonalTab | ExtraTab;

export const isPersonalTab = (tab: FeedTab): tab is PersonalTab => tab === 'mine' || tab === 'reading';
export const isExtraTab = (tab: FeedTab): tab is ExtraTab =>
  tab === 'orgs' || tab === 'trends' || tab === 'events' || tab === 'podcasts' || tab === 'videos';
