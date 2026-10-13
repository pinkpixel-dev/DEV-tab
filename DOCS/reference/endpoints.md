# Forem API V1 endpoint list

Generated from `forem-api-v1.openapi.json` (pulled from `forem/forem` main on 2026-10-11). Base URL for DEV is `https://dev.to`. Parameter details and response schemas are in the JSON spec.

## agent_sessions

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/agent_sessions` | list the authenticated user's agent sessions |  |
| POST | `/api/agent_sessions` | upload a new agent session |  |
| GET | `/api/agent_sessions/{id}` | show details for an agent session | `id` |
| POST | `/api/agent_sessions/presign` | request a presigned URL to upload raw session transcript to S3 |  |
| GET | `/api/agent_sessions/{id}/raw_url` | request a presigned S3 GET URL to download the raw session transcript | `id` |

## analytics

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/analytics/totals` | Retrieve analytics totals | `article_id`, `organization_id` |
| GET | `/api/analytics/historical` | Retrieve historical analytics | `start`, `end`, `article_id`, `organization_id` |
| GET | `/api/analytics/past_day` | Retrieve analytics for the past day | `article_id`, `organization_id` |
| GET | `/api/analytics/referrers` | Retrieve referrer analytics | `start`, `end`, `article_id`, `organization_id` |
| GET | `/api/analytics/top_contributors` | Retrieve top contributors analytics | `start`, `end`, `article_id`, `organization_id` |
| GET | `/api/analytics/follower_engagement` | Retrieve follower engagement analytics | `start`, `end` |
| GET | `/api/analytics/dashboard` | Retrieve dashboard analytics bundle | `start`, `end`, `article_id`, `organization_id` |
| GET | `/api/analytics/heatmap` | Retrieve heatmap activity | `end` |

## articles

| Method | Path | Summary | Params |
|---|---|---|---|
| POST | `/api/articles` | Publish article |  |
| GET | `/api/articles` | Published articles | `page`, `per_page`, `tag`, `tags`, `tags_exclude`, `username`, `state`, `top`, `collection_id` |
| GET | `/api/articles/search` | Search for articles | `q`, `top`, `page`, `per_page` |
| GET | `/api/articles/latest` | Published articles sorted by published date | `page`, `per_page` |
| GET | `/api/articles/{id}` | Published article by id | `id` |
| PUT | `/api/articles/{id}` | Update an article by id | `id` |
| GET | `/api/articles/{username}/{slug}` | Published article by path | `username`, `slug` |
| GET | `/api/articles/me` | User's articles | `page`, `per_page` |
| GET | `/api/articles/me/published` | User's published articles | `page`, `per_page` |
| GET | `/api/articles/me/unpublished` | User's unpublished articles | `page`, `per_page` |
| GET | `/api/articles/me/all` | User's all articles | `page`, `per_page` |
| PUT | `/api/articles/{id}/unpublish` | Unpublish an article | `id`, `note` |
| GET | `/api/articles/semantic_search` | Perform a semantic fuzzy search on articles | `q`, `per_page`, `page`, `threshold` |

## badge_achievements

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/badge_achievements` | Retrieve all badge achievements | `page` |
| POST | `/api/badge_achievements` | Create a badge achievement |  |
| GET | `/api/badge_achievements/{id}` | Retrieve a badge achievement's details | `id` |
| DELETE | `/api/badge_achievements/{id}` | Delete a badge achievement | `id` |

## badges

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/badges` | Retrieve all badges | `page` |
| POST | `/api/badges` | Create a badge |  |
| GET | `/api/badges/{id}` | Retrieve a badge's details | `id` |
| PATCH | `/api/badges/{id}` | Update a badge | `id` |
| DELETE | `/api/badges/{id}` | Delete a badge | `id` |

## billboards

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/billboards` | Billboards |  |
| POST | `/api/billboards` | Create a billboard |  |
| GET | `/api/billboards/{id}` | A billboard (by id) | `id` |
| PUT | `/api/billboards/{id}` | Update a billboard by ID | `id` |
| PUT | `/api/billboards/{id}/unpublish` | Unpublish a billboard | `id` |

## comments

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/comments` | Comments | `page`, `per_page`, `a_id`, `p_id`, `page` |
| GET | `/api/comments/{id}` | Comment by id | `id` |

## concepts

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/concepts` | Retrieve all accessible concepts | `page`, `per_page`, `days` |
| GET | `/api/concepts/{id}` | Retrieve details of a concept | `id`, `days` |
| PATCH | `/api/concepts/{id}` | Update a concept's metadata | `id` |
| GET | `/api/concepts/{id}/articles` | Retrieve articles mapped to a concept | `id`, `sort`, `page`, `per_page` |
| GET | `/api/admin/concepts` | Retrieve all concepts (Admin) | `page`, `per_page` |
| POST | `/api/admin/concepts` | Create a concept (Admin) |  |
| GET | `/api/admin/concepts/{id}` | Retrieve concept detail (Admin) | `id` |
| PATCH | `/api/admin/concepts/{id}` | Update a concept (Admin) | `id` |
| DELETE | `/api/admin/concepts/{id}` | Delete a concept (Admin) | `id` |
| POST | `/api/admin/concepts/{id}/trigger_lookback` | Trigger concept lookback backfill (Admin) | `id` |
| GET | `/api/concepts/search` | Perform a semantic fuzzy search on concepts | `q`, `per_page`, `threshold` |

## events

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/events` | Retrieve events | `type_of` |
| POST | `/api/events` | Create an event |  |
| GET | `/api/events/{id}` | Retrieve an event | `id` |
| PATCH | `/api/events/{id}` | Update an event | `id` |
| DELETE | `/api/events/{id}` | Delete an event | `id` |

## feedback_messages

| Method | Path | Summary | Params |
|---|---|---|---|
| PATCH | `/api/feedback_messages/{id}` | Update a feedback message's status (Admin) | `id` |

## followed_tags

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/follows/tags` | Followed Tags |  |

## followers

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/followers/users` | Followers | `page`, `per_page`, `sort` |

## follows

| Method | Path | Summary | Params |
|---|---|---|---|
| POST | `/api/follows` | Follow users or organizations |  |

## health_checks

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/health_checks/app` | Check app health | `health-check-token` |
| GET | `/api/health_checks/database` | Check database connection | `health-check-token` |
| GET | `/api/health_checks/cache` | Check cache connection | `health-check-token` |

## instance

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/instance` | Retrieve instance configuration details |  |

## openapi

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/v1/openapi.json` | OpenAPI description |  |

## organizations

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/organizations/{username}` | An organization (by username) | `username` |
| GET | `/api/organizations/{organization_id_or_username}/users` | Organization's users | `organization_id_or_username`, `page`, `per_page` |
| GET | `/api/organizations/{organization_id_or_username}/articles` | Organization's Articles | `organization_id_or_username`, `page`, `per_page` |
| GET | `/api/organizations` | Organizations | `page`, `per_page` |
| POST | `/api/organizations` | Create an Organization |  |
| GET | `/api/organizations/{id}` | An organization (by id) | `id` |
| PUT | `/api/organizations/{id}` | Update an organization by id | `id` |
| DELETE | `/api/organizations/{id}` | Delete an Organization by id | `id` |

## pages

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/pages` | show details for all pages |  |
| POST | `/api/pages` | pages |  |
| GET | `/api/pages/{id}` | show details for a page | `id` |
| PUT | `/api/pages/{id}` | update details for a page | `id` |
| DELETE | `/api/pages/{id}` | remove a page | `id` |

## podcast_episodes

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/podcast_episodes` | Podcast Episodes | `page`, `per_page`, `username` |

## profile images

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/profile_images/{username}` | A Users or organizations profile image | `username` |

## reactions

| Method | Path | Summary | Params |
|---|---|---|---|
| POST | `/api/reactions/toggle` | toggle reaction | `category`, `reactable_id`, `reactable_type` |
| POST | `/api/reactions` | create reaction | `category`, `reactable_id`, `reactable_type` |

## readinglist

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/readinglist` | Readinglist | `page`, `per_page` |

## recommended_articles_lists

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/recommended_articles_lists` | Retrieve all recommended articles lists | `page`, `search` |
| POST | `/api/recommended_articles_lists` | Create or update a recommended articles list |  |
| GET | `/api/recommended_articles_lists/{id}` | Retrieve details of a recommended articles list | `id` |
| PATCH | `/api/recommended_articles_lists/{id}` | Update a recommended articles list | `id` |

## request_redirects

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/admin/request_redirects` | Retrieve all request redirects (Admin) | `page`, `per_page` |
| POST | `/api/admin/request_redirects` | Create a request redirect (Admin) |  |
| GET | `/api/admin/request_redirects/{id}` | Retrieve a request redirect's details (Admin) | `id` |
| PATCH | `/api/admin/request_redirects/{id}` | Update a request redirect (Admin) | `id` |
| DELETE | `/api/admin/request_redirects/{id}` | Delete a request redirect (Admin) | `id` |

## segments

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/segments` | Manually managed audience segments | `per_page` |
| POST | `/api/segments` | Create a manually managed audience segment |  |
| GET | `/api/segments/{id}` | A manually managed audience segment | `id` |
| DELETE | `/api/segments/{id}` | Delete a manually managed audience segment | `id` |
| GET | `/api/segments/{id}/users` | Users in a manually managed audience segment | `id`, `per_page` |
| PUT | `/api/segments/{id}/add_users` | Add users to a manually managed audience segment | `id` |
| PUT | `/api/segments/{id}/remove_users` | Remove users from a manually managed audience segment | `id` |

## subforems

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/subforems` | Retrieve all discoverable subforems |  |

## surveys

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/surveys` | List surveys | `page`, `per_page`, `active` |
| POST | `/api/surveys` | Create a survey |  |
| GET | `/api/surveys/{id_or_slug}` | A survey with polls | `id_or_slug` |
| PATCH | `/api/surveys/{id_or_slug}` | Update a survey | `id_or_slug` |
| DELETE | `/api/surveys/{id_or_slug}` | Delete a survey | `id_or_slug` |
| GET | `/api/surveys/{id_or_slug}/poll_votes` | Survey poll votes | `id_or_slug`, `per_page`, `after` |
| GET | `/api/surveys/{id_or_slug}/poll_text_responses` | Survey poll text responses | `id_or_slug`, `per_page`, `after` |

## tags

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/tags` | Tags | `page`, `per_page` |

## trends

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/trends` | Trends | `page`, `per_page` |
| GET | `/api/trends/{id_or_slug}` | A Trend | `id_or_slug` |
| GET | `/api/trends/{trend_id_or_slug}/articles` | Articles in a Trend | `trend_id_or_slug`, `page`, `per_page` |

## users

| Method | Path | Summary | Params |
|---|---|---|---|
| PUT | `/api/users/{id}/suspend` | Suspend a User | `id` |
| PUT | `/api/users/{id}/limited` | Add limited role for a User | `id` |
| DELETE | `/api/users/{id}/limited` | Remove limited for a User | `id` |
| PUT | `/api/users/{id}/spam` | Add spam role for a User | `id` |
| DELETE | `/api/users/{id}/spam` | Remove spam role from a User | `id` |
| PUT | `/api/users/{id}/trusted` | Add trusted role for a User | `id` |
| DELETE | `/api/users/{id}/trusted` | Remove trusted role from a User | `id` |
| GET | `/api/users/me` | The authenticated user |  |
| GET | `/api/users/{id}` | A User | `id` |
| GET | `/api/users/search` | Search for users | `email` |
| PUT | `/api/users/{id}/unpublish` | Unpublish a User's Articles and Comments | `id` |
| POST | `/api/admin/users` | Invite a User |  |
| GET | `/api/admin/users` | List all users (Admin) | `page`, `per_page`, `email`, `username` |
| GET | `/api/admin/users/{id}` | Get user detail (Admin) | `id` |
| PATCH | `/api/admin/users/{id}` | Update user profile (Admin) | `id` |
| PUT | `/api/admin/users/{id}/email` | Update user email (Admin) | `id` |
| PUT | `/api/admin/users/{id}/status` | Update user moderation status (Admin) | `id` |
| PUT | `/api/admin/users/{id}/notification_settings` | Update user notification settings (Admin) | `id` |
| POST | `/api/admin/users/{id}/merge` | Merge user into another (Admin) | `id` |
| GET | `/api/admin/users/{user_id}/notes` | List notes for a user (Admin) | `user_id` |
| POST | `/api/admin/users/{user_id}/notes` | Add a note to a user (Admin) | `user_id` |
| GET | `/api/admin/users/{user_id}/identities` | List identities for a user (Admin) | `user_id` |
| POST | `/api/admin/users/{user_id}/identities` | Link an identity to a user (Admin) | `user_id` |
| DELETE | `/api/admin/users/{user_id}/identities/{id}` | Unlink an identity from a user (Admin) | `user_id`, `id` |
| POST | `/api/admin/users/identities/bulk` | Bulk link identities (Admin) |  |

## videos

| Method | Path | Summary | Params |
|---|---|---|---|
| GET | `/api/videos` | Articles with a video | `page`, `per_page` |

