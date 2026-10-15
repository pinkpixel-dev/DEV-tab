import { useMemo, useRef, useState } from 'react';
import {
  Bookmark,
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
import { FeedGrid } from '@/components/feed/FeedGrid';
import { FeedTabs } from '@/components/feed/FeedTabs';
import { LoadMore } from '@/components/feed/LoadMore';
import { SearchBox } from '@/components/search/SearchBox';
import { TagFilter } from '@/components/tags/TagFilter';
import { Banner, StatusMessage } from '@/components/ui/StatusMessage';
import { useAccount } from '@/hooks/useAccount';
import { useFeed, type FeedSource } from '@/hooks/useFeed';
import { useFollowedTags } from '@/hooks/useFollowedTags';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { useSettings } from '@/hooks/useSettings';
import type { ApiError } from '@/lib/api/client';
import { isPersonalTab, type Account, type FeedTab } from '@/lib/api/types';
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
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const followedTags = useFollowedTags(apiKey);
  const chipTags = followedTags ?? settings.savedTags;

  const source = useMemo<FeedSource>(() => {
    if (query) return { type: 'search', q: query };
    if (isPersonalTab(kind)) {
      // A tag picked on a personal tab shows that tag's top posts this week,
      // the same way My feed itself is built.
      if (tag || !apiKey) return { type: 'feed', kind: tag ? 'top-week' : 'top-day', tag: tag ?? undefined };
      return { type: kind, apiKey };
    }
    return { type: 'feed', kind, tag: tag ?? undefined };
  }, [query, kind, tag, apiKey]);
  const feed = useFeed(source, settings.hiddenTags);
  useKeyboardNav(searchRef, gridRef);

  function pickTag(next: string | null) {
    setQuery(null);
    setTag(next);
    window.scrollTo({ top: 0 });
  }

  function pickKind(next: FeedTab) {
    setQuery(null);
    setKind(next);
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
          <a className="btn btn-primary" href="https://dev.to/new" title="Write a new post on DEV">
            <SquarePen size={16} aria-hidden="true" />
            New post
          </a>
          <SearchBox ref={searchRef} active={query} onSearch={setQuery} onClear={() => setQuery(null)} />
          <button
            type="button"
            className="btn icon-btn"
            onClick={feed.reload}
            aria-label="Refresh"
            title="Refresh"
            disabled={feed.status === 'loading'}
          >
            <RefreshCw size={16} aria-hidden="true" className={feed.status === 'loading' ? 'spin' : undefined} />
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

        {feed.status === 'error' && feed.error ? (
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
          ) : source.type === 'reading' ? (
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
