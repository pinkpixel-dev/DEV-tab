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
}

// From GET /follows/tags. `points` is the weight DEV gives each followed tag.
export interface FollowedTag {
  id: number;
  name: string;
  points: number;
}

// A tab on the new tab page: one of the public feeds, or My feed when a key is set.
export type FeedTab = FeedKind | 'mine';
