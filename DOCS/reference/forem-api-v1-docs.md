---
title: "Forem API V1 | Forem Docs"
source: "https://developers.forem.com/api/v1"
fetched: "2026-10-11T19:18:15+00:00"
generator: pulpie-mcp
---

# Forem API V1 (1.0.0)

Download OpenAPI specification:[Download](https://developers.forem.com/redocusaurus/plugin-redoc-1.yaml)

Access Forem articles, users and other resources via API. For a real-world example of Forem in action, check out [DEV](https://www.dev.to). All endpoints can be accessed with the 'api-key' header and a accept header, but some of them are accessible publicly without authentication.
    
    
        Dates and date times, unless otherwise specified, must be in
        the [RFC 3339](https://tools.ietf.org/html/rfc3339) format.
    

# agent_sessions

## list the authenticated user's agent sessions 

Retrieve a list of the authenticated user's agent sessions.

### Agent Sessions Overview:

  * Agent sessions represent coding conversation transcripts uploaded from CLI tools (like Claude Code).
  * Used by the developer portal to render interactive walkthroughs or session summaries.
  * Requires authentication.



##### Authorizations:

Production server

https://dev.to/api/agent_sessions

###  Response samples 

## upload a new agent session 

Upload a new agent session.

### S3 Upload Workflow:

  1. Call the S3 presign endpoint to obtain a direct upload URL for the raw session transcript file.
  2. Upload the raw transcript to S3.
  3. Send a POST request to this endpoint with the S3 key (`s3_key`) and the pre-parsed, curated JSON payload (`curated_data`).



##### Authorizations:

##### Request Body schema: application/json

Agent session upload parameters.

title| string Title for the session (auto-generated if omitted)  
---|---  
curated_datarequired| string JSON string of curated session data with messages array and metadata.  
s3_key| string S3 object key from presign endpoint (optional).  
tool_name| string Enum: "claude_code" "codex" "gemini_cli" "github_copilot" "opencode" "pi" Tool that produced the session (e.g. claude_code, codex).  
  
## show details for an agent session 

Retrieve details for a single agent session by unique slug or ID.

### Integration Tip:

  * Returns the complete session structure including parsed message logs, token counts, slices, and tool execution metadata.



##### Authorizations:

##### path Parameters

id| string Example:  my-session-abc123The unique slug or ID of the agent session.  
---|---  
  
# analytics

## Retrieve analytics totals 

Retrieve aggregated lifetime stats (views, reactions, comments) for articles.

### Scope Control:

  * Specify `article_id` to query a single post's metrics.
  * Specify `organization_id` to retrieve metrics across all articles owned by the target organization.



##### Authorizations:

_api-key_

##### query Parameters

article_id| integer Optional ID to limit totals to a single article.  
---|---  
organization_id| integer Optional ID to limit totals to an organization's articles.  
  
Production server

## Retrieve historical analytics 

Retrieve historical analytics data graphed over a time range.

### Time Range Formats:

  * **start** : Start date (e.g. `2024-01-01`). Required.
  * **end** : End date (e.g. `2024-01-31`). Defaults to current date if omitted.



##### Authorizations:

_api-key_

##### query Parameters

startrequired| string Example:  start=2024-01-01Start date (YYYY-MM-DD format).  
---|---  
end| string Example:  end=2024-01-31End date (YYYY-MM-DD format).  
article_id| integer Limit stats to a single article.  
organization_id| integer Limit stats to an organization's articles.  
  
Production server

## Retrieve analytics for the past day 

Retrieve real-time hourly analytics statistics for the last 24 hours. Used for live graphs.

##### Authorizations:

_api-key_

##### query Parameters

article_id| integer  
---|---  
organization_id| integer  
  
### Responses

Production server

## Retrieve referrer analytics 

Retrieve traffic referring domains and URL source tracking metrics for articles.

##### Authorizations:

##### query Parameters

start| string Example:  start=2024-01-01  
---|---  
end| string Example:  end=2024-01-31  
article_id| integer  
organization_id| integer  
  
### Responses

Production server

https://dev.to/api/analytics/referrers

## Retrieve top contributors analytics 

Retrieve top organization contributors ordered by article engagement scores.

##### Authorizations:

##### query Parameters

start| string Example:  start=2024-01-01  
---|---  
end| string Example:  end=2024-01-31  
article_id| integer  
organization_id| integer  
  
### Responses

Production server

## Retrieve follower engagement analytics 

Retrieve stats detailing new follower growth and engagement over time.

##### Authorizations:

This endpoint allows the client to create a new article.

"Articles" are all the posts that users create on DEV/Forem that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but are referred to as articles within the code.

### Body Parameter Tips:

  * **title** : A compelling and descriptive title for the article.
  * **body_markdown** : The main text of the article in Markdown format. You can use standard Markdown as well as Forem-specific Liquid tags (e.g., `{% embed ... %}`). You can also include YAML front matter at the very beginning of the markdown to specify metadata such as tags, series, and cover image.
  * **published** : Set to `true` to immediately publish the article and make it visible in feeds. Set to `false` (default) to save it as a draft.
  * **tags** : A comma-separated list of tags (up to 4 tags). Tags help categorize your post and improve discoverability.
  * **series** : Group articles together by specifying a series name. If the series does not exist, it will be created.
  * **main_image** : Absolute URL of the cover image for the article.
  * **canonical_url** : If this post was originally published elsewhere, specify the canonical URL to maintain SEO integrity.
  * **description** : A short summary of the article used for previews and SEO meta description.



This endpoint allows the client to retrieve a list of articles.

"Articles" are all the posts that users create on DEV/Forem that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but are referred to as articles within the code.

By default it will return featured, published articles ordered by descending popularity.

It supports pagination, each page will contain `30` articles by default.

Using this parameter will retrieve articles that contain the requested tag. Articles will be ordered by descending popularity.This parameter can be used in conjuction with `top`.  
---  
Using this parameter will retrieve articles with any of the comma-separated tags. Articles will be ordered by descending popularity.  
Using this parameter will retrieve articles that do _not_ contain _any_ of comma-separated tags. Articles will be ordered by descending popularity.  
Using this parameter will retrieve articles belonging to a User or Organization ordered by descending publication date. If `state=all` the number of items returned will be `1000` instead of the default `30`. This parameter can be used in conjuction with `state`.  
Using this parameter will allow the client to check which articles are fresh or rising. If `state=fresh` the server will return fresh articles. If `state=rising` the server will return rising articles. This param can be used in conjuction with `username`, only if set to `all`.  
Using this parameter will allow the client to return the most popular articles in the last `N` days. `top` indicates the number of days since publication of the articles returned. This param can be used in conjuction with `tag`.  
Example:  collection_id=99Adding this will allow the client to return the list of articles belonging to the requested collection, ordered by ascending publication date.  
  
## User's published articles 

This endpoint allows the client to retrieve a list of published articles on behalf of an authenticated user.

"Articles" are all the posts that users create on DEV that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but is referred to as article within the code.

Published articles will be in reverse chronological publication order.

This endpoint allows the client to retrieve a list of unpublished articles on behalf of an authenticated user.

"Articles" are all the posts that users create on DEV that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but is referred to as article within the code.

Unpublished articles will be in reverse chronological creation order.

It will return unpublished articles with pagination. By default a page will contain 30 articles.

"Articles" are all the posts that users create on DEV that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but is referred to as article within the code.

Unpublished articles will be at the top of the list in reverse chronological creation order. Published articles will follow in reverse chronological publication order.

The article will be unpublished and will no longer be visible to the public. It will remain in the database and will set back to draft status on the author's posts dashboard. Any notifications associated with the article will be deleted. Any comments on the article will remain.

The ID of the article to unpublish.  
---  
  
Content for the note that's created along with unpublishing  
---  
  
Retrieve a list of articles published by the organization.

The organization's numerical ID or string username.  
---  
  
## Articles with a video 

Retrieve a list of articles that contain uploaded videos.

### Videos Overview:

  * Bypasses authentication (can be accessed publicly).
  * Returns articles that are published and include a video asset.
  * Articles are ordered by descending popularity (views, watch time, and reactions).
  * By default, returns 24 video articles per page.



Pagination page  
---  
  
# users

## User's articles 

This endpoint allows the client to retrieve a list of published articles on behalf of an authenticated user.

"Articles" are all the posts that users create on DEV that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but is referred to as article within the code.

Published articles will be in reverse chronological publication order.

It will return published articles with pagination. By default a page will contain 30 articles.

Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
---  
  
## User's published articles 

This endpoint allows the client to retrieve a list of published articles on behalf of an authenticated user.

"Articles" are all the posts that users create on DEV that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but is referred to as article within the code.

Published articles will be in reverse chronological publication order.

It will return published articles with pagination. By default a page will contain 30 articles.

Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
---  
  
## User's unpublished articles 

This endpoint allows the client to retrieve a list of unpublished articles on behalf of an authenticated user.

"Articles" are all the posts that users create on DEV that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but is referred to as article within the code.

Unpublished articles will be in reverse chronological creation order.

It will return unpublished articles with pagination. By default a page will contain 30 articles.

## User's all articles 

This endpoint allows the client to retrieve a list of all articles on behalf of an authenticated user.

"Articles" are all the posts that users create on DEV that typically show up in the feed. They can be a blog post, a discussion question, a help thread etc. but is referred to as article within the code.

It will return both published and unpublished articles with pagination.

Unpublished articles will be at the top of the list in reverse chronological creation order. Published articles will follow in reverse chronological publication order.

By default a page will contain 30 articles.

## Organization's users 

Retrieve a list of public user profiles associated with the organization.

### Path Parameter Options:

  * **organization_id_or_username** : Supports either the organization's unique numerical ID OR its string username (slug).
  * Ideal for displaying team member directory lists on organization/brand pages.



##### path Parameters

organization_id_or_usernamerequired| string The organization's numerical ID or string username.  
---|---  
  
##### query Parameters

page| integer <int32> >= 1  Default:  1 Pagination page  
---|---  
per_page| integer <int32> [ 1 .. 1000 ]  Default:  30 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
  
## Suspend a User 

Suspend a user's account.

### Suspension Details:

  * The user associated with the API key must have an `admin` or `moderator` role.
  * Assigns the `suspended` role to the user, preventing them from posting new content (articles or comments) while suspended.
  * Existing content is not deleted.
  * Suspended users are not notified in the UI; if you want them to know, you must notify them explicitly.



##### Authorizations:

##### path Parameters

id| integer <int32> >= 1  Example:  1The unique ID of the user to suspend.  
---|---  
  
Production server

https://dev.to/api/users/{id}/suspend

## Add limited role for a User 

Limit a user's account permissions.

### Limited Details:

  * Requires `admin` or `moderator` privileges.
  * Assigns the `limited` role, which rate-limits notifications generated by their actions (such as publishing new posts or comments).
  * Does not restrict content creation or delete content.



##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The ID of the user to limit.  
---|---  
  
User successfully limited

Unknown User ID

Production server

https://dev.to/api/users/{id}/limited

## Remove limited for a User 

Remove the limited role, restoring the user to general privileges. Requires `admin` or `moderator` role.

##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The ID of the user to un-limit.  
---|---  
  
User successfully un-limited

Unknown User ID

Production server

https://dev.to/api/users/{id}/limited

## Add spam role for a User 

Flag a user as spammer.

### Spam Role Details:

  * Requires `admin` or `moderator` privileges.
  * Stops the user from creating new posts or comments, acting as a shadowban or block on activity.
  * Existing content remains but is hidden from search/feeds.



##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The ID of the user to assign the spam role.  
---|---  
  
Spam role assigned to the user successfully

Unknown User ID

Production server

## Remove spam role from a User 

Unflag a user as spammer, restoring general permissions. Requires `admin` or `moderator` role.

##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The ID of the user to remove the spam role from.  
---|---  
  
Successfully removed the spam role from a user

Unknown User ID

Production server

https://dev.to/api/users/{id}/spam

## Add trusted role for a User 

Assign the trusted role to a user.

### Trusted Role Details:

  * Requires `admin` or `moderator` privileges.
  * Trusted users gain privileges like casting flag votes on inappropriate content or participating in priority review queues.
  * Triggers a system notification and an email to the user.



##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The ID of the user to assign the trusted role.  
---|---  
  
Trusted role assigned to the user successfully

Unauthorized

Unknown User ID

Production server

https://dev.to/api/users/{id}/trusted

## Remove trusted role from a User 

Revoke the trusted role, returning the user to general status. Requires `admin` or `moderator` role.

##### Authorizations:

_api-key_

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The ID of the user to remove the trusted role from.  
---|---  
  
Successfully removed the trusted role from a user

Unauthorized

Unknown User ID

Production server

https://dev.to/api/users/{id}/trusted

## The authenticated user 

This endpoint allows the client to retrieve information about the authenticated user.

### Usage Tips:

  * Requires a valid `api-key` header to identify the user.
  * Useful for checking permissions, verifying linking state, or retrieving user-specific profile settings.



##### Authorizations:

_api-key_

Production server

## A User 

This endpoint allows the client to retrieve a single user, either by id or by the user's username.

### Path Parameter Options:

  * **id** : Can be either the user's unique numerical ID (e.g. `123`) OR the user's string username (e.g. `ben`).
  * Note that the returned user object schema (`ExtendedUser`) includes extended profile statistics and social link details.



##### path Parameters

idrequired| string The user's unique numerical ID or string username.  
---|---  
  
Production server

## Search for users 

Search for a user by email address.

### Permissions & Context:

  * Requires administrative privileges (`api-key` of an administrator).
  * Used to verify account existence or map email addresses to platform usernames.



##### Authorizations:

##### query Parameters

emailrequired| string The exact email address of the user to search for.  
---|---  
  
Production server

`

  * "twitter_username": "string",

  * "github_username": "string",

  * "email": "string",

  * "website_url": "string",

  * "joined_at": "string",

  * "profile_image": "string",


`

## Unpublish a User's Articles and Comments 

This endpoint allows the client to unpublish all of the articles and comments created by a user.

### Administrative Action:

  * Requires the authenticated user to be an Administrator.
  * This is a destructive administrative action that immediately unpublishes all posts/comments from public feeds.
  * Ideal for handling spam accounts or cleanup operations.



##### Authorizations:

_api-key_

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The unique numerical ID of the user whose content will be unpublished.  
---|---  
  
User's articles and comments successfully unpublished

Production server

## Invite a User 

Invite a new user to join the platform by email.

### Super Admin Action:

  * Requires Super Admin privileges.
  * Triggers a system invitation flow and sends an invitation email containing a sign-up link.
  * Handy for invite-only platforms or private enterprise instances.



##### Authorizations:

##### Request Body schema: application/json

User invite params

email| string  
---|---  
name| string or null  
  
Production server

## List all users (Admin) 

Retrieve a list of all users registered on the platform.

### Permissions & Filters:

  * Requires Super Admin privileges.
  * Allows filtering by exact `email` or `username`.
  * Returns paginated list of extended user objects containing email addresses, registration dates, roles, and administrative statuses.



##### Authorizations:

##### query Parameters

page| integer Pagination page index.  
---|---  
per_page| integer Number of items to return per page.  
email| string Optional email search filter.  
username| string Optional username search filter.  
  
Production server

## Get user detail (Admin) 

Retrieve details of a single user by numerical ID.

### Super Admin Action:

  * Requires Super Admin privileges.
  * Includes administrative settings, audit notes, email newsletter preferences, and OAuth login identity states.



##### Authorizations:

##### path Parameters

idrequired| integer Unique user numeric ID.  
---|---  
  
Production server

## Update user profile (Admin) 

Update a user's public profile fields (name, location, bio summary, website) on their behalf. Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

idrequired| integer Unique user ID to update.  
---|---  
  
##### Request Body schema: application/json

User profile updated fields.

name| string  
---|---  
username| string  
summary| string  
location| string  
website_url| string  
  
Production server

## Update user email (Admin) 

Update a user's primary registration email address. Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

idrequired| integer Unique user ID to update email for.  
---|---  
  
##### Request Body schema: application/json

Email parameters.

emailrequired| string  
---|---  
  
Production server

## Update user moderation status (Admin) 

Manually update a user's moderation status.

### Status Details:

  * **status** : Allowed target states (e.g. `active`, `suspended`, `banned`).
  * **note** : Required reason text recorded in the user's moderation log audit history.
  * Requires Super Admin privileges.



##### Authorizations:

_api-key_

##### path Parameters

idrequired| integer Unique user ID.  
---|---  
  
##### Request Body schema: application/json

Status parameters.

statusrequired| string  
---|---  
note| string  
  
Production server

## Update user notification settings (Admin) 

Update a user's email notification preferences (e.g., unsubscribing them from the system newsletter). Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

idrequired| integer Unique user ID.  
---|---  
  
##### Request Body schema: application/json

Settings parameters.

required| object  
---|---  
| email_newsletter| boolean  
---|---  
  
Production server

## Merge user into another (Admin) 

Merge a duplicate user account into a target main account.

### Account Merging Behavior:

  * Transfers all comments, articles, reactions, and follows to the target user (`merge_user_id`).
  * Deletes/destroys the source user account once the merge completes successfully.
  * High risk! Action is permanent and irreversible.
  * Requires Super Admin credentials.



##### Authorizations:

##### path Parameters

idrequired| integer The duplicate user ID that will be deleted after contents merge.  
---|---  
  
##### Request Body schema: application/json

Merge parameters containing the target account ID.

merge_user_idrequired| integer  
---|---  
  
Production server

## List notes for a user (Admin) 

Retrieve all moderator/administrator audit log notes appended to a user. Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

user_idrequired| integer User ID to fetch notes for.  
---|---  
  
Production server

## Add a note to a user (Admin) 

Add a new moderation/audit note to a user.

### Audit Logging Guidelines:

  * **content** : Plaintext description of behavior, infraction, or actions taken.
  * **reason** : Categorized classification (e.g. `spam`, `abuse`, `harassment`, `administrative`).
  * Requires Super Admin credentials.



##### Authorizations:

##### path Parameters

user_idrequired| integer User ID to append the note to.  
---|---  
  
##### Request Body schema: application/json

Note attributes.

contentrequired| string  
---|---  
reason| string  
  
Production server

## List identities for a user (Admin) 

##### Authorizations:

##### path Parameters

user_idrequired| integer User ID to fetch linked identities for.  
---|---  
  
Production server

## Link an identity to a user (Admin) 

Manually link an OAuth provider identity to a user. Requires Super Admin credentials.

### Identity Binding:

  * **provider** : The login provider name (e.g. `github`, `twitter`).
  * **uid** : The provider's unique user identifier.
  * **username** : The user's username on the provider's service.



##### Authorizations:

##### path Parameters

user_idrequired| integer User ID to bind identity to.  
---|---  
  
##### Request Body schema: application/json

OAuth credentials and identities.

providerrequired| string  
---|---  
uidrequired| string  
username| string  
  
## Unlink an identity from a user (Admin) 

Unlink a specific OAuth login provider identity from a user by identity ID. Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

user_idrequired| integer User ID.  
---|---  
idrequired| integer Identity ID to unlink.  
  
Production server

## Bulk link identities (Admin) 

Bulk link OAuth identities across multiple users. Requires Super Admin credentials.

##### Authorizations:

##### Request Body schema: application/json

Bulk identity params.

providerrequired| string  
---|---  
required| Array of objects  
  
Production server

# segments

## Manually managed audience segments 

Retrieve a list of manually managed audience segments.

### Audience Segments Overview:

  * Audience Segments are cohorts of users grouped together for targeting announcements, features, or promotional campaign banners (Billboards).
  * This endpoint lists manual cohorts created and maintained by site administrators.
  * Requires administrator privileges.



The endpoint supports pagination, and each page will contain `30` segments by default.

##### Authorizations:

_api-key_

##### query Parameters

per_page| integer <int32> [ 1 .. 1000 ]  Default:  30 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
---|---  
  
A List of manually managed audience segments

Production server

https://dev.to/api/segments

## Create a manually managed audience segment 

Create a new manually managed audience segment.

### Usage Guidance:

  * Used by administrators to define a new target cohort group.
  * Users can be added or removed in bulk later via segment member endpoints.



##### Authorizations:

_api-key_

A manually managed audience segment

Production server

https://dev.to/api/segments

## A manually managed audience segment 

Retrieve details of a single manually-managed audience segment specified by ID.

### Integration Tip:

  * Includes segment type (`manual`), configuration, and metadata.
  * Automatic/system-generated segments cannot be queried or updated via this endpoint.



##### Authorizations:

_api-key_

##### path Parameters

idrequired| integer <int32> >= 1  Unique segment numerical ID.  
---|---  
  
The audience segment

Unauthorized

Audience Segment Not Found

Production server

https://dev.to/api/segments/{id}

application/json

## Delete a manually managed audience segment 

Delete an audience segment specified by ID.

### Constraints:

  * Audience segments cannot be deleted if they are currently assigned to any active or pending Billboards.



##### Authorizations:

_api-key_

##### path Parameters

idrequired| integer <int32> >= 1  Unique segment numerical ID.  
---|---  
  
The deleted audience segment

Unauthorized

Audience Segment Not Found

Audience segment could not be deleted

Production server

https://dev.to/api/segments/{id}

## Users in a manually managed audience segment 

Retrieve a paginated list of users enrolled in the specified manual audience segment.

### Pagination Guidance:

  * Supports standard `page` and `per_page` controls, returning 30 users per page by default.



##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Unique segment numerical ID.  
---|---  
  
##### query Parameters

per_page| integer <int32> [ 1 .. 1000 ]  Default:  30 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
---|---  
  
## Add users to a manually managed audience segment 

Add users in bulk to the specified manual audience segment.

### Bulk Update Behavior:

  * Accepts a JSON array of `user_ids` in the request body.
  * Returns a list of successes and failures. Successful additions include users already present in the segment.



##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Unique segment numerical ID.  
---|---  
  
##### Request Body schema: application/json

Map containing user IDs to enroll in the segment.

user_ids| Array of integers <= 10000 items   
---|---  
  
Result of adding the users to the segment.

Audience Segment Not Found

Production server

## Remove users from a manually managed audience segment 

Remove users in bulk from the specified manual audience segment.

### Bulk Update Behavior:

  * Accepts a JSON array of `user_ids` in the request body.
  * Returns successes (users successfully removed) and failures (users who were not members of the segment).



##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Unique segment numerical ID.  
---|---  
  
##### Request Body schema: application/json

Map containing user IDs to remove from the segment.

user_ids| Array of integers <= 10000 items   
---|---  
  
Result of removing the users to the segment.

Audience Segment Not Found

Unprocessable Entity

Production server

# badge_achievements

## Retrieve all badge achievements 

Retrieve a list of all badge achievements (awarded badges) in the system. Requires administrator privileges.

##### Authorizations:

##### query Parameters

page| integer Pagination page index.  
---|---  
  
Production server

## Create a badge achievement 

Award a badge to a user. Requires administrator privileges.

### Integration Tips:

  * **user_id** : The numeric ID of the user receiving the badge.
  * **badge_id** : The numeric ID of the badge being awarded.
  * **rewarding_context_message_markdown** : Optional personalized message shown in the notification or profile feed to explain why the user was awarded the badge.



##### Authorizations:

##### Request Body schema: application/json

Badge achievement details.

object  
---  
| user_idrequired| integer  
---|---  
badge_idrequired| integer  
rewarding_context_message_markdown| string  
include_default_description| boolean  
  
Production server

## Retrieve a badge achievement's details 

Retrieve details of a specific badge award/achievement by ID.

Badge achievement unique ID.  
---  
  
## Delete a badge achievement 

Revoke a badge award by deleting the badge achievement. Requires administrator privileges.

Badge achievement unique ID to delete.  
---  
  
# badges

## Retrieve all badges 

Retrieve a list of all badges available on the platform.

### Badges Overview:

  * Badges recognize achievements (e.g., "Top Writer", "Beloved Community Member", or anniversary milestones).
  * Publicly visible on user profiles.



Pagination page index.  
---  
  
## Create a badge 

Create a new badge. Requires administrator privileges.

### Body Parameter Guidelines:

  * **title** : Unique name for the badge.
  * **description** : Text explanation of the achievement.
  * **remote_badge_image_url** : Public URL to an image asset (PNG, GIF, or SVG) representing the badge icon.
  * **allow_multiple_awards** : Set to `true` if a user can earn the same badge multiple times (e.g. weekly challenges).



Badge properties to create.

| title| string  
---|---  
description| string  
remote_badge_image_url| string  
  
## Retrieve a badge's details 

Retrieve details of a single badge by unique numeric ID.

Unique badge ID.  
---  
  
Update badge details (title, description, credits awarded, etc.) by unique ID. Requires administrator privileges.

integer Unique badge ID to update.  
---  
  
Badge properties to update.

## Delete a badge 

Delete a badge configuration from the system by ID. Requires administrator privileges.

##### Authorizations:

##### path Parameters

id| integer Unique badge ID to delete.  
---|---  
  
Production server

# billboards

## Billboards 

Retrieve a list of all billboards configured in the system.
    
    
        ### Billboards Overview:
        - Billboards are custom promotional ads, notification banners, or call-to-actions shown on the Forem website.
        - Requires administrative privileges.
        - Returned objects include layout code, scheduling parameters, geo-targeting configurations, and custom target audience segment associations.
    

Production server

## Create a billboard 

Create a new billboard.
    
    
        ### Parameter Options & Tips:
        - **body_markdown**: The HTML/Markdown advertisement copy.
        - **placement_area**: Target region in layouts (e.g. `post_comments` below comments, `sidebar` in sidebars, `home_feed` between posts).
        - **display_to**: Cohort target rules (e.g. `all` for everyone, `logged_in`, `guests`, or customized segments).
        - **target_geolocations**: Comma-separated ISO codes for country/region targeting.
        - **approved** & **published**: Set to `true` to activate billboard rotation instantly.
    

##### Authorizations:

##### Request Body schema: application/json

Billboard parameters.

[$ref]| any  
---|---  
  
A billboard

Production server

## A billboard (by id) 

Retrieve full configurations of a single billboard by ID. Requires admin credentials.

##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  123The ID of the billboard.  
---|---  
  
Unknown Billboard ID

Production server

https://dev.to/api/billboards/{id}

## Update a billboard by ID 

Update an existing billboard's configurations.
    
    
        ### Integration Guidance:
        - Allows changing placement area, geolocations, target segments, or text copy.
        - Updating an active billboard takes effect instantly in the layout delivery cache.
    

##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  123The ID of the billboard to update.  
---|---  
  
##### Request Body schema: application/json

Billboard updated attributes.

[$ref]| any  
---|---  
  
Production server

## Unpublish a billboard 

Remove a billboard from active rotation by unpublishing it.
    
    
        ### Usage:
        - Instantly disables display across all pages while keeping the configuration stored in the database for later reactivations or historical reporting.
    

##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  123The ID of the billboard to unpublish.  
---|---  
  
Production server

# comments

## Comments 

This endpoint allows the client to retrieve all comments belonging to an article or podcast episode as threaded conversations.

### Threaded Structure & Pagination Tips:

  * **Threaded Format** : Comments are returned as a tree structure (nested arrays of replies). Each top-level comment contains its nested child comments recursively.
  * **Query Constraints** : You must provide either `a_id` (Article ID) OR `p_id` (Podcast Episode ID) to fetch comments. Specifying both is not supported.
  * **Pagination** : When paginating, the `page` parameter filters the _top-level_ comments only. All replies to those top-level comments are returned nested inline, regardless of page index.
  * If the `page` parameter is omitted, the response returns the full comment tree in a single payload.



##### query Parameters

page| integer <int32> >= 1  Default:  1 Pagination page  
---|---  
per_page| integer <int32> [ 1 .. 1000 ]  Default:  30 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
a_id| string Example:  a_id=321Article identifier. Provide this to fetch comments belonging to a specific article.  
p_id| string Example:  p_id=321Podcast Episode identifier. Provide this to fetch comments belonging to a specific podcast episode.  
page| string Example:  page=321Pagination page index for top-level comments.  
  
Production server

## Comment by id 

This endpoint allows the client to retrieve a specific comment and all of its nested descendant replies.

### Integration Tip:

  * Handy for linking directly to a deep comment thread or loading individual comment replies on demand.



##### path Parameters

idrequired| string Example:  321Comment identifier (the unique alpha-numeric `id_code` of the comment).  
---|---  
  
Production server

# concepts

## Retrieve all accessible concepts 

Retrieve all accessible concepts in the system.

### Concepts Overview:

  * Concepts are semantic tags generated automatically by analyzing article text using ML embeddings (`gemini-embedding-2`), rather than explicit user tags.
  * Primarily used for advanced semantic categorization, automated feeds, and interest mapping.



##### Authorizations:

##### query Parameters

page| integer Pagination page index.  
---|---  
per_page| integer Number of items to return per page.  
days| integer Number of days of activity to aggregate for computing the concept popularity/trend score (default is 7 days).  
  
## Retrieve details of a concept 

Retrieve details, settings, and popularity metrics of a single concept by ID.

### Integration Tip:

  * Includes the semantic description, similarity thresholds, parent concept mappings, and scores.



##### Authorizations:

##### path Parameters

integer Unique concept numerical ID.  
---  
  
##### query Parameters

days| integer Number of days of activity to aggregate for the concept popularity/trend score.  
---|---  
  
Update concept metadata such as description, similarity threshold, and custom score.

### Parameter Guidelines:

  * **similarity_threshold** : Cosine distance threshold (range 0.0 to 1.0) determining how closely an article's embedding must align with the concept's anchor embedding to be classified under it.



Unique concept numerical ID.  
---  
  
Create a new Concept.

  * **name** : Human readable label for the concept.
  * **description** : Detailed semantic definition used to generate the anchor embedding.
  * **similarity_threshold** : Target similarity threshold for categorizing articles under this concept.
  * **parent_id** : ID of parent concept, if establishing a hierarchy.



## Retrieve all concepts (Admin) 

Retrieve all concepts in the system including system and draft concepts. Admin credentials required.

## Create a concept (Admin) 

Create a new Concept.

### Parameters:

  * **name** : Human readable label for the concept.
  * **description** : Detailed semantic definition used to generate the anchor embedding.
  * **similarity_threshold** : Target similarity threshold for categorizing articles under this concept.
  * **parent_id** : ID of parent concept, if establishing a hierarchy.



##### Authorizations:

##### Request Body schema: application/json

object  
---  
| name| string  
---|---  
description  
parent_id  
similarity_threshold  
score| number  
  
## Update a feedback message's status (Admin) 

Update the status of a user feedback message or report.

### Feedback Messages Overview:

Unique feedback message ID.  
---  
  
Retrieve a list of all request redirects configured on the platform.

## Create a request redirect (Admin) 

Create a new request redirect route. Requires Administrator privileges.

### Body Parameter Guidelines:

  * **original_url** : The source path (e.g. `/old-page`) to intercept.
  * **destination_url** : The target destination (e.g. `https://myforem.com/new-page`) to redirect users to.
  * **request_domain** : The domain scope (e.g. `dev.to`) where this redirect rule applies.



##### Request Body schema: application/json

Redirect routing parameters.

## Retrieve a request redirect's details (Admin) 

Retrieve details of a single request redirect route by ID. Requires Admin credentials.

Unique redirect ID.  
---  
  
## Update a request redirect (Admin) 

Update details (paths or domain scope) of an existing redirect route by ID. Requires Admin credentials.

Unique redirect ID to update.  
---  
  
##### Request Body schema: application/json

Delete a request redirect route, disabling the routing intercept immediately. Requires Admin credentials.

Unique redirect ID to delete.  
---  
  
Invite a new user to join the platform by email.

  * Requires Super Admin privileges.
  * Triggers a system invitation flow and sends an invitation email containing a sign-up link.
  * Handy for invite-only platforms or private enterprise instances.



User invite params

Pagination page index.  
---  
Number of items to return per page.  
Optional email search filter.  
Optional username search filter.  
  
## Get user detail (Admin) 

Retrieve details of a single user by numerical ID.

### Super Admin Action:

  * Requires Super Admin privileges.
  * Includes administrative settings, audit notes, email newsletter preferences, and OAuth login identity states.



Unique user numeric ID.  
---  
  
## Update user profile (Admin) 

Update a user's public profile fields (name, location, bio summary, website) on their behalf. Requires Super Admin credentials.

Unique user ID to update.  
---  
  
##### Request Body schema: application/json

User profile updated fields.

name  
---  
username  
location  
website_url  
  
## Update user email (Admin) 

Update a user's primary registration email address. Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

id| integer Unique user ID to update email for.  
---|---  
  
##### Request Body schema: application/json

Email parameters.

email  
---  
  
## Update user moderation status (Admin) 

Manually update a user's moderation status.

### Status Details:

  * **status** : Allowed target states (e.g. `active`, `suspended`, `banned`).
  * **note** : Required reason text recorded in the user's moderation log audit history.
  * Requires Super Admin privileges.



##### Authorizations:

##### path Parameters

id| integer Unique user ID.  
---|---  
  
##### Request Body schema: application/json

Status parameters.

status  
---  
note  
  
Production server

## Update user notification settings (Admin) 

Update a user's email notification preferences (e.g., unsubscribing them from the system newsletter). Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

Unique user ID.  
---  
  
## Merge user into another (Admin) 

Merge a duplicate user account into a target main account.

### Account Merging Behavior:

  * Transfers all comments, articles, reactions, and follows to the target user (`merge_user_id`).
  * Deletes/destroys the source user account once the merge completes successfully.
  * High risk! Action is permanent and irreversible.
  * Requires Super Admin credentials.



The duplicate user ID that will be deleted after contents merge.  
---  
  
Merge parameters containing the target account ID.

## List notes for a user (Admin) 

Retrieve all moderator/administrator audit log notes appended to a user. Requires Super Admin credentials.

User ID to fetch notes for.  
---  
  
## Add a note to a user (Admin) 

Add a new moderation/audit note to a user.

### Audit Logging Guidelines:

  * **content** : Plaintext description of behavior, infraction, or actions taken.
  * **reason** : Categorized classification (e.g. `spam`, `abuse`, `harassment`, `administrative`).
  * Requires Super Admin credentials.



##### path Parameters

user_id| User ID to append the note to.  
---|---  
  
##### Request Body schema: application/json

Note attributes.

## List identities for a user (Admin) 

Retrieve all linked OAuth identities (e.g., GitHub, Twitter, Apple) for a user. Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

user_id| User ID to fetch linked identities for.  
---|---  
  
## Link an identity to a user (Admin) 

Manually link an OAuth provider identity to a user. Requires Super Admin credentials.

### Identity Binding:

  * **provider** : The login provider name (e.g. `github`, `twitter`).
  * **uid** : The provider's unique user identifier.
  * **username** : The user's username on the provider's service.



##### Authorizations:

##### path Parameters

user_id| User ID to bind identity to.  
---|---  
  
##### Request Body schema: application/json

OAuth credentials and identities.

provider  
---  
uid  
username  
  
## Unlink an identity from a user (Admin) 

Unlink a specific OAuth login provider identity from a user by identity ID. Requires Super Admin credentials.

##### Authorizations:

##### path Parameters

user_id| User ID.  
---|---  
id| Identity ID to unlink.  
  
## Bulk link identities (Admin) 

Bulk link OAuth identities across multiple users. Requires Super Admin credentials.

##### Authorizations:

##### Request Body schema: application/json

Bulk identity params.

provider  
---  
  
## Update a feedback message's status (Admin) 

Update the status of a user feedback message or report.

### Feedback Messages Overview:

  * Feedback messages are submitted by users via support forms or content abuse reporting modals.
  * Requires Administrator privileges.
  * Used to track moderation/resolution workflows (e.g. marking a spam report as `Resolved`, `Spam`, or `Ignored`).



##### Authorizations:

##### path Parameters

id| integer Unique feedback message ID.  
---|---  
  
##### Request Body schema: application/json

Feedback parameters containing the status updates.

object  
---  
  
Production server

# followed_tags

## Followed Tags 

Retrieve the list of tags followed by the authenticated user.
    
    
        ### Integration & Personalization Guidance:
        - Requires authentication.
        - Returns tags in ascending/popularity order based on user interactions.
        - Useful for customizing the home feed interface, constructing personalized sidebar navigation, or displaying a user's customized topic preferences in a dashboard.
    

##### Authorizations:

A List of followed tags

Production server

# tags

## Followed Tags 

Retrieve the list of tags followed by the authenticated user.
    
    
        ### Integration & Personalization Guidance:
        - Requires authentication.
        - Returns tags in ascending/popularity order based on user interactions.
        - Useful for customizing the home feed interface, constructing personalized sidebar navigation, or displaying a user's customized topic preferences in a dashboard.
    

##### Authorizations:

A List of followed tags

Production server

## Tags 

Retrieve a list of tags used on the platform, ordered by popularity.

### Integration Tips:

  * Bypasses authentication (can be accessed publicly).
  * Ordered by overall popularity/usage metrics on the platform.
  * Useful for autocomplete inputs in article editors, tag selection screens in settings, or rendering global navigation/explore lists.



It supports pagination, each page will contain 10 tags by default.

##### query Parameters

page| integer <int32> >= 1  Default:  1 Pagination page  
---|---  
per_page| integer <int32> [ 1 .. 1000 ]  Default:  10 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
  
A List of all tags

Production server

# followers

## Followers 

This endpoint allows the client to retrieve a list of the followers they have.
    
    
        ### Integration & Pagination Guidance:
        - "Followers" are other users registered on the platform who follow the authenticated user.
        - Supports pagination, defaulting to 80 followers per page.
        - The `sort` query parameter determines the sorting order based on when the follow relationship was established.
    

##### Authorizations:

_api-key_

##### query Parameters

page| integer <int32> >= 1  Default:  1 Pagination page  
---|---  
per_page| integer <int32> [ 1 .. 1000 ]  Default:  30 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
sort| string Example:  sort=created_atSpecifies the sort order for the follow relationship created_at field. Use `created_at` for chronological (oldest first) or `-created_at` for reverse chronological (newest first).  
  
A List of followers

Production server

# follows

## Follow users or organizations 

Follow users or organizations in bulk on behalf of the authenticated user.

### Bulk Update Behavior:

  * Accepts arrays of `user_ids` and `organization_ids` in the request body.
  * Performs follow actions for all provided identifiers.
  * Highly efficient for onboarding flows or importing social connections.



##### Authorizations:

_api-key_

##### Request Body schema: application/json

Map containing lists of user and organization IDs to follow.

user_ids| Array of integers  
---|---  
organization_ids| Array of integers  
  
Production server

# health_checks

## Check app health 

Basic application liveness check.

### Usage Guidance:

  * Verifies that the Rails application process is running and responding to requests.
  * Does not check database or cache connectivity.
  * Typically used by load balancers, container orchestrators (like Kubernetes), or uptime checkers to verify container health.



##### header Parameters

health-check-token| string Access token required if token-based security is enabled in settings for health checks.  
---|---  
  
Production server

https://dev.to/api/health_checks/app

## Check database connection 

Database connection health check.

### Usage Guidance:

  * Verifies that the application can successfully query the primary PostgreSQL database.
  * Used to monitor database pool status and connection health.



##### header Parameters

health-check-token| string Access token required if token-based security is enabled in settings for health checks.  
---|---  
  
Production server

https://dev.to/api/health_checks/database

## Check cache connection 

Cache connection health check.

### Usage Guidance:

  * Verifies that the application can successfully ping the Redis cache instance.
  * Used to monitor cache and background worker queue connection health.



##### header Parameters

health-check-token| string Access token required if token-based security is enabled in settings for health checks.  
---|---  
  
Production server

https://dev.to/api/health_checks/cache

# instance

## Retrieve instance configuration details 

Retrieve configuration details for the current Forem instance.

### Instance Metadata:

  * Bypasses authentication.
  * Returns public Forem version, branding parameters, community guidelines references, and supported features configurations.



Production server

# organizations

## An organization (by username) 

Retrieve public profile information for a single organization by its username.

### Integration Tip:

  * Bypasses authentication.
  * Returns details like Tech Stack, Tagline, Story, website URLs, and joined date.



##### path Parameters

usernamerequired| string The unique slugified username of the organization (e.g. `github`).  
---|---  
  
An Organization

Production server

## Organization's users 

Retrieve a list of public user profiles associated with the organization.

### Path Parameter Options:

  * **organization_id_or_username** : Supports either the organization's unique numerical ID OR its string username (slug).
  * Ideal for displaying team member directory lists on organization/brand pages.



##### path Parameters

organization_id_or_usernamerequired| string The organization's numerical ID or string username.  
---|---  
  
##### query Parameters

page| integer <int32> >= 1 Pagination page  
---|---  
per_page| integer <int32> [ 1 .. 1000 ]  Default:  30 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
  
An Organization's users (with ID)

Production server

## Organization's Articles 

Retrieve a list of articles published by the organization.

### Path Parameter Options:

  * **organization_id_or_username** : Supports either the organization's unique numerical ID OR its string username (slug).
  * Returns articles in reverse chronological publication order.
  * Ideal for populating an organization's custom blog feed or publication listing.



##### path Parameters

organization_id_or_usernamerequired| string The organization's numerical ID or string username.  
---|---  
  
##### query Parameters

page| integer <int32> >= 1  Default:  1 Pagination page  
---|---  
per_page| integer <int32> [ 1 .. 1000 ] Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
  
## Organizations 

This endpoint allows the client to retrieve a list of Dev organizations.

It supports pagination, each page will contain 10 tags by default.

##### query Parameters

page| integer <int32> >= 1  Default:  1 Pagination page  
---|---  
per_page| integer <int32> [ 1 .. 1000 ]  Default:  10 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
  
## Create an Organization 

This endpoint allows the client to create an organization with the provided parameters. It requires a token from a user with `admin` privileges.

##### Authorizations:

##### Request Body schema: application/json

Representation of Organization to be created

type_of| string  
---|---  
username| string  
name| string  
summary| string  
twitter_username| string  
github_username| string  
url| string  
location| string  
joined_at| string  
tech_stack| string  
tag_line| string or null  
story| string or null  
  
## An organization (by id) 

This endpoint allows the client to retrieve a single organization by their id

##### path Parameters

idrequired| integer  
---|---  
  
An Organization

Production server

https://dev.to/api/organizations/{id}

## Update an organization by id 

This endpoint allows the client to update an existing organization.

##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  123The ID of the organization to update.  
---|---  
  
##### Request Body schema: application/json

Representation of Organization to be updated

type_of| string  
---|---  
username| string  
name| string  
summary| string  
twitter_username| string  
github_username| string  
url| string  
location| string  
joined_at| string  
tech_stack| string  
tag_line| string or null  
string or null  
  
## Delete an Organization by id 

This endpoint allows the client to delete a single organization, specified by id

##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The ID of the organization.  
---|---  
  
Production server

# pages

## show details for all pages 

Retrieve details for all Page objects in the system.
    
    
        ### Pages Overview:
        - Pages are custom static or dynamic views hosted on the Forem instance.
        - Publicly visible unless restricted.
        - Helpful for building custom menus, rendering site policies, or embedding custom forms.
    

Production server

## pages 

Create a new custom page. Requires administrative privileges.
    
    
        ### Body Parameter Guidelines:
        - **title**: Heading displayed at the top of the page.
        - **slug**: URL path identifier. Must be unique and URL-safe.
        - **body_markdown**: Content written in Markdown format.
        - **body_json**: Optional JSON payload for API-consumed/structured data pages.
        - **is_top_level_path**: Set to `true` to serve the page directly at the root (e.g. `/{slug}`) instead of under the default namespace `/page/{slug}`. Use with caution to avoid namespace collisions with core Forem paths.
        - **template**: Layout styling options (`contained` or custom layouts).
    

##### Authorizations:

##### Request Body schema: application/json

Page parameters.

title| string Title of the page  
---|---  
slug| string Used to link to this page in URLs, must be unique and URL-safe  
description| string For internal use, helps similar pages from one another  
body_markdown| string The text (in markdown) of the page (required)  
body_json| string For JSON pages, the JSON body  
is_top_level_path| boolean If true, the page is available at '/{slug}' instead of '/page/{slug}', use with caution  
template| string Default:  "contained" Enum: "contained" "full_within_layout" "nav_bar_included" "json" "css" "txt" Controls what kind of layout the page is rendered in  
  
## show details for a page 

Retrieve details for a single Page object specified by ID.

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The unique ID of the page.  
---|---  
  
Production server

## update details for a page 

Update an existing page's details by ID. Requires administrative privileges.

##### Authorizations:

##### path Parameters

idrequired| integer <int32> >= 1  Example:  1The ID of the page to update.  
---|---  
  
##### Request Body schema: application/json

Representation of Page to be updated

titlerequired| string Title of the page  
---|---  
slug  
The text (in markdown) of the ad (required)  
  
# podcast_episodes

## Podcast Episodes 

Retrieve a list of podcast episodes published on the platform.
    
    
        ### Integration Guidance:
        - Bypasses authentication (can be accessed publicly).
        - Only returns active episodes belonging to published/reachable podcasts.
        - Episodes are returned in reverse chronological order based on their publication date.
        - The `username` query parameter is the unique slug of the podcast channel (e.g. `codenewbie`).
    
        It supports pagination, each page will contain 30 episodes by default.
    

integer <int32> >= 1 Pagination page  
---  
integer <int32> [ 1 .. 1000 ] Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
Example:  username=codenewbieFilters episodes by the unique slug (username) of the podcast (e.g. 'codenewbie').  
  
# profile images

## A Users or organizations profile image 

Retrieve the profile image URL and configuration for a user or organization by username.
    
    
        ### Integration Details:
        - Bypasses authentication.
        - Convenient for quickly displaying avatars/icons in comments lists, headers, or sidebar elements without requesting the full user profile model.
    

##### Authorizations:

##### path Parameters

username|  Example:  janedoeThe unique username of the target user or organization.  
---|---  
  
An object containing profile image details

Resource Not Found

Production server

# reactions

## toggle reaction 

Toggle a reaction on a target resource (Article, Comment, or User) on behalf of the authenticated user.
    
    
        ### Toggle Logic:
        - **First Request**: Creates a new reaction of the specified category on the reactable target.
        - **Second Request (with same parameters)**: Deletes the existing reaction.
        - Particularly useful for simple, interactive UI buttons like "Like", "Unicorn", or "Save" where clicking toggles the active state.
    

Enum: "like" "unicorn" "exploding_head" "raised_hands" "fire" The type of reaction (e.g. `like` for standard likes, `unicorn` for outstanding posts, `save` for bookmarking to the reading list).  
---  
integer <int32> The unique numerical ID of the target resource (Article, Comment, or User) being reacted to.  
Enum: "Comment" "Article" "User" The class name of the target resource being reacted to (e.g. `Article`, `Comment`, `User`).  
  
## create reaction 

Create a reaction on a target resource (Article, Comment, or User) on behalf of the authenticated user.
    
    
        ### Usage Details:
        - Unlike the toggle endpoint, this endpoint is idempotent: multiple requests to react with the same category to the same target will return the existing reaction without deleting it.
    

The type of reaction (e.g. `like` for standard likes, `unicorn` for outstanding posts, `save` for bookmarking to the reading list).  
---  
The unique numerical ID of the target resource (Article, Comment, or User) being reacted to.  
Enum: "Comment" "Article" "User" The class name of the target resource being reacted to (e.g. `Article`, `Comment`, `User`).  
  
# readinglist

## Readinglist 

Retrieve the list of articles saved to the authenticated user's reading list.
    
    
        ### Integration Guidance:
        - Requires authentication.
        - Under the hood, this endpoint retrieves articles that the user has reacted to with the `"save"` reaction category.
        - Supports pagination, defaulting to 30 articles per page.
        - Returned objects conform to the standard `ArticleIndex` schema.
    

integer <int32> >= 1 Pagination page  
---  
Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
  
# recommended_articles_lists

## Retrieve all recommended articles lists 

Retrieve a list of all recommended articles lists configured in the system.

### Overview:

  * Recommended Articles Lists are curated selections of articles pinned or recommended in layout regions (e.g. `main_feed` or `sidebar`).
  * Supports search by list name and standard query pagination.
  * Requires Administrator privileges.



Pagination page index.  
---  
Search term to match against recommended list names.  
  
# request_redirects

## Retrieve all request redirects (Admin) 

Retrieve a list of all request redirects configured on the platform.

### Redirects Overview:

  * Redirects map incoming HTTP request paths or domains to specific target destination URLs (301 or 302 redirects).
  * Primarily used for managing vanity URLs, legacy path support, or domain migrations.
  * Requires Administrator privileges.



##### Authorizations:

##### query Parameters

Pagination page index.  
---  
Number of items to return per page.  
  
## Create a request redirect (Admin) 

Create a new request redirect route. Requires Administrator privileges.

### Body Parameter Guidelines:

  * **original_url** : The source path (e.g. `/old-page`) to intercept.
  * **destination_url** : The target destination (e.g. `https://myforem.com/new-page`) to redirect users to.
  * **request_domain** : The domain scope (e.g. `dev.to`) where this redirect rule applies.



## Update a request redirect (Admin) 

Update details (paths or domain scope) of an existing redirect route by ID. Requires Admin credentials.

Unique redirect ID to update.  
---  
  
## Delete a request redirect (Admin) 

Delete a request redirect route, disabling the routing intercept immediately. Requires Admin credentials.

Unique redirect ID to delete.  
---  
  
# subforems

## Retrieve all discoverable subforems 

Retrieve a list of all discoverable subforems/communities.

### Subforems Overview:

  * Subforems represent distinct sub-communities or specialized sections hosted within the Forem instance.
  * Bypasses authentication (can be accessed publicly).
  * Returns list of names, slugs, color schemes, and target interests.



# surveys

## List surveys 

Retrieve a list of surveys configured on the platform.

### Surveys Overview:

  * Surveys are admin-defined questionnaires consisting of multiple choice or text polls.
  * Requires Administrator authorization.
  * Supports standard pagination controls and active status filtering.



##### Authorizations:

##### query Parameters

integer <int32> >= 1  Default:  1 Pagination page  
---  
Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
Filter by active status. Omit to return all surveys.  
  
## A survey with polls 

Retrieve a single survey (by ID or slug) with its nested structure.

### Nested Format Details:

  * Returns the target Survey object including all associated Polls, multiple choice options, and configuration states.
  * Requires Administrator authorization.



##### Authorizations:

##### path Parameters

id_or_slugrequired| string Example:  community-pulse-2026The ID or slug of the survey.  
---|---  
  
A survey with nested polls and options

Production server

## Survey poll votes 

Retrieve multiple-choice poll votes for a specific survey.

  * Uses cursor-based pagination to safely stream high volumes of voting records.
  * Specify the `after` query parameter with the last retrieved record ID to get the next page.
  * Requires Administrator authorization.



##### path Parameters

string The ID or slug of the survey.  
---  
  
##### query Parameters

integer <int32> [ 1 .. 1000 ]  Default:  30 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
---  
integer Example:  after=42Return only votes with an ID greater than this value.  
  
## Survey poll text responses 

Retrieve free-text poll responses for a specific survey.

### Integration & Cursor Tip:

  * Fetches written user answers for text-input questions.
  * Uses cursor-based pagination (`after` query param) to stream responses.
  * Requires Administrator authorization.



##### path Parameters

id_or_slug| string The ID or slug of the survey.  
---|---  
  
##### query Parameters

per_page| integer <int32> [ 1 .. 1000 ]  Default:  30 Page size (the number of items to return per page). The default maximum value can be overridden by "API_PER_PAGE_MAX" environment variable.  
---|---  
integer Example:  after=42Return only text responses with an ID greater than this value.  
  
# trends

## Trends 

Retrieve a list of active trends.

### Trends Overview & Score Calculation:

  * Trends represent hot topics or semantic themes currently being heavily discussed in the community.
  * They are computed by clustering semantic concept embeddings of recently published articles.
  * The `score` reflects the volume and engagement (views, comments, reactions) of articles associated with the trend.
  * Returned trends are ordered by score and recency.
  * Publicly accessible without authentication.



It supports pagination, each page will contain 10 trends by default.

##### query Parameters

page| integer <int32> >= 1  Default:  1 Pagination page  
---|---  
  
## A Trend 

Retrieve details of a single trend using either its numeric ID or unique slug.

  * Useful for loading details of a trending topic (description, score, and slug details) to render header sections on trending tag or topic pages.



The ID or slug of the trend to retrieve.  
---  
  
## Articles in a Trend 

Retrieve a list of published articles belonging to a trend.

### Article Ordering & Proximity:

  * Articles are mapped to trends based on their embedding distance to the trend's centroid.
  * Returned articles are ordered by proximity/similarity (distance) first (most relevant posts first), and then by overall article engagement score.
  * Supports pagination, each page will contain 10 articles by default.



trend_id_or_slug|  Example:  ruby-3-4-releaseThe ID or slug of the trend to retrieve articles for.  
---|---  
  
# videos

## Articles with a video 

Retrieve a list of articles that contain uploaded videos.

### Videos Overview:

  * Bypasses authentication (can be accessed publicly).
  * Returns articles that are published and include a video asset.
  * Articles are ordered by descending popularity (views, watch time, and reactions).
  * By default, returns 24 video articles per page.



A List of all articles with videos
