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
