import { useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Building2,
  CloudOff,
  Inbox,
  LayoutDashboard,
  RefreshCw,
  SearchX,
  Settings as SettingsIcon,
  SquarePen,
  TriangleAlert,
} from 'lucide-react';
import { UserBadge } from '@/components/account/UserBadge';
import { EventsView } from '@/components/events/EventsView';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { FeedTabs } from '@/components/feed/FeedTabs';
import { LoadMore } from '@/components/feed/LoadMore';
import { EventBar, OrgBar, TrendBar } from '@/components/feed/ViewBars';
import { SearchBox } from '@/components/search/SearchBox';
import { TagFilter } from '@/components/tags/TagFilter';
import { Banner, StatusMessage } from '@/components/ui/StatusMessage';
import { useAccount } from '@/hooks/useAccount';
import { useCachedData } from '@/hooks/useCachedData';
import { useFeed, type FeedSource } from '@/hooks/useFeed';
import { useFollowedTags } from '@/hooks/useFollowedTags';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { useSavedIds } from '@/hooks/useSavedIds';
import { useSettings } from '@/hooks/useSettings';
import type { ApiError } from '@/lib/api/client';
import { currentEvents, fetchEvents } from '@/lib/api/events';
import { ORG_FEED_MAX } from '@/lib/api/orgs';
import { fetchTrends } from '@/lib/api/trends';
import { isExtraTab, isPersonalTab, type Account, type DevEvent, type FeedTab } from '@/lib/api/types';
import { APP_NAME } from '@/lib/app-info';
import { timeAgo } from '@/lib/format';
import type { Settings } from '@/lib/settings';

export default function App() {
  const { settings } = useSettings();
  const { apiKey, account, ready } = useAccount();
  // Wait for settings and the key so the first fetch uses the right default feed.
  if (!settings || !ready) return null;
  // Key added or removed in another tab: remount so the tabs and default feed reset cleanly.
  return <FeedPage key={apiKey ?? 'public'} settings={settings} apiKey={apiKey} account={account} />;
}

function staleMessage(error: ApiError, cachedAt: number | null): string {
  const age = cachedAt ? ` from ${timeAgo(new Date(cachedAt).toISOString())}` : '';
  if (error.kind === 'offline') return `You're offline, so these are saved posts${age}.`;
  if (error.kind === 'rate-limited') return `DEV is rate limiting requests, so these are saved posts${age}.`;
  return `Couldn't refresh. These are saved posts${age}.`;
}

interface FeedPageProps {
  settings: Settings;
  apiKey: string | null;
  account: Account | null;
}

function FeedPage({ settings, apiKey, account }: FeedPageProps) {
  const [kind, setKind] = useState<FeedTab>(
    isPersonalTab(settings.defaultFeed) && !apiKey ? 'top-day' : settings.defaultFeed,
  );
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [org, setOrg] = useState<string | null>(null);
  const [trendSlug, setTrendSlug] = useState<string | null>(null);
  const [eventKind, setEventKind] = useState<DevEvent['kind'] | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const followedTags = useFollowedTags(apiKey);
  const savedIds = useSavedIds(apiKey);
  const chipTags = followedTags ?? settings.savedTags;

  const view = query ? 'search' : kind;
  const trends = useCachedData('trends', fetchTrends, view === 'trends');
  const events = useCachedData('events', fetchEvents, view === 'events');
  const activeTrend = trends.data?.find((t) => t.slug === trendSlug) ?? trends.data?.[0] ?? null;
  // An org removed in settings drops out of the filter.
  const activeOrg = org && settings.orgs.some((o) => o.username === org) ? org : null;
  const shownEvents = useMemo(
    () => currentEvents(events.data ?? []).filter((e) => !eventKind || e.kind === eventKind),
    [events.data, eventKind],
  );

  const source = useMemo<FeedSource | null>(() => {
    if (query) return { type: 'search', q: query, apiKey: apiKey ?? undefined };
    if (kind === 'orgs') {
      if (activeOrg) return { type: 'org', username: activeOrg };
      if (settings.orgs.length === 0) return null;
      return { type: 'orgs', usernames: settings.orgs.slice(0, ORG_FEED_MAX).map((o) => o.username) };
    }
    if (kind === 'trends') return activeTrend ? { type: 'trend', slug: activeTrend.slug } : null;
    if (kind === 'events') return null;
    if (isPersonalTab(kind)) {
      // A tag picked on a personal tab shows that tag's top posts this week,
      // the same way My feed itself is built.
      if (tag || !apiKey) return { type: 'feed', kind: tag ? 'top-week' : 'top-day', tag: tag ?? undefined };
      return { type: kind, apiKey };
    }
    return { type: 'feed', kind, tag: tag ?? undefined };
  }, [query, kind, tag, apiKey, activeOrg, settings.orgs, activeTrend?.slug]);
  const feed = useFeed(source, settings.hiddenTags);
  useKeyboardNav(searchRef, gridRef);

  function pickTag(next: string | null) {
    setQuery(null);
    // Orgs, Trends and Events have their own filters, so a tag from a card opens that tag's week.
    if (next && isExtraTab(kind)) setKind('top-week');
    setTag(next);
    window.scrollTo({ top: 0 });
  }

  function pickKind(next: FeedTab) {
    setQuery(null);
    setKind(next);
  }

  const refreshing = view === 'events' ? events.status === 'loading' : feed.status === 'loading';
  function refresh() {
    if (view === 'events') return events.reload();
    if (view === 'trends') trends.reload();
    feed.reload();
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <img src="/icon/32.png" alt="" width={22} height={22} />
          <span>{APP_NAME}</span>
        </div>
        <FeedTabs active={query ? null : kind} showMine={apiKey !== null} onChange={pickKind} />
        <div className="topbar-actions">
          <a className="btn btn-primary new-post" href="https://dev.to/new" title="Write a new post on DEV">
            <SquarePen size={16} aria-hidden="true" />
            <span className="new-post-label">New post</span>
          </a>
          <SearchBox ref={searchRef} active={query} onSearch={setQuery} onClear={() => setQuery(null)} />
          <button
            type="button"
            className="btn icon-btn"
            onClick={refresh}
            aria-label="Refresh"
            title="Refresh"
            disabled={refreshing}
          >
            <RefreshCw size={16} aria-hidden="true" className={refreshing ? 'spin' : undefined} />
          </button>
          <button
            type="button"
            className="btn icon-btn"
            onClick={() => browser.runtime.openOptionsPage()}
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon size={16} aria-hidden="true" />
          </button>
          {account && (
            <a className="btn icon-btn" href="/dashboard.html" aria-label="Dashboard" title="Dashboard">
              <LayoutDashboard size={16} aria-hidden="true" />
            </a>
          )}
          {account && <UserBadge account={account} />}
        </div>
      </header>

      <div className="subbar">
        {query ? (
          <h1 className="results-heading">
            Results for <span>“{query}”</span>
          </h1>
        ) : kind === 'orgs' ? (
          <OrgBar orgs={settings.orgs} active={activeOrg} onChange={setOrg} />
        ) : kind === 'trends' ? (
          <TrendBar trends={trends.data ?? []} active={activeTrend} onChange={setTrendSlug} />
        ) : kind === 'events' ? (
          <EventBar active={eventKind} onChange={setEventKind} />
        ) : (
          <TagFilter savedTags={chipTags} active={tag} onChange={pickTag} />
        )}
      </div>

      <main>
        {feed.staleError && (
          <Banner icon={CloudOff} action={{ label: 'Retry', onClick: feed.reload }}>
            {staleMessage(feed.staleError, feed.cachedAt)}
          </Banner>
        )}

        {view === 'events' ? (
          <EventsView
            ref={gridRef}
            events={shownEvents}
            status={events.status}
            error={events.error}
            density={settings.density}
            onRetry={events.reload}
          />
        ) : view === 'orgs' && settings.orgs.length === 0 ? (
          <StatusMessage
            icon={Building2}
            title="No orgs yet"
            detail="Add DEV organizations in settings and their posts show up here."
            action={{ label: 'Add orgs', onClick: () => browser.runtime.openOptionsPage() }}
          />
        ) : view === 'trends' && trends.status === 'error' && trends.error ? (
          <StatusMessage
            icon={trends.error.kind === 'offline' ? CloudOff : TriangleAlert}
            tone="danger"
            title="Couldn't load trends"
            detail={trends.error.message}
            action={{ label: 'Try again', onClick: trends.reload }}
          />
        ) : view === 'trends' && trends.status === 'ready' && !activeTrend ? (
          <StatusMessage icon={Inbox} title="No trends right now" />
        ) : feed.status === 'error' && feed.error ? (
          <StatusMessage
            icon={feed.error.kind === 'offline' ? CloudOff : TriangleAlert}
            tone="danger"
            title={feed.error.kind === 'rate-limited' ? 'DEV needs a breather' : "Couldn't load posts"}
            detail={feed.error.message}
            action={{ label: 'Try again', onClick: feed.reload }}
          />
        ) : feed.status === 'ready' && feed.articles.length === 0 ? (
          query ? (
            <StatusMessage icon={SearchX} title={`Nothing matched “${query}”`} detail="Try a different word or a tag." />
          ) : source?.type === 'reading' ? (
            <StatusMessage icon={Bookmark} title="Your reading list is empty" detail="Save posts on DEV and they show up here." />
          ) : (
            <StatusMessage
              icon={Inbox}
              title="No posts here"
              detail={settings.hiddenTags.length ? 'Your hidden tags might be filtering everything out.' : undefined}
            />
          )
        ) : (
          <>
            <FeedGrid
              ref={gridRef}
              articles={feed.articles}
              density={settings.density}
              loading={feed.status === 'loading'}
              savedIds={savedIds}
              onTagClick={pickTag}
            />
            {feed.status === 'ready' && (
              <LoadMore
                hasMore={feed.hasMore}
                loading={feed.loadingMore}
                error={feed.moreError}
                onLoadMore={feed.loadMore}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
