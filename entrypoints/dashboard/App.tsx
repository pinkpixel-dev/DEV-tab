import { useState } from 'react';
import { ArrowLeft, CloudOff, KeyRound, RefreshCw, SquarePen, TriangleAlert } from 'lucide-react';
import { FollowersPanel, ReactionsPanel, ReferrersPanel, SupportersPanel } from '@/components/dashboard/Panels';
import { PostsTable } from '@/components/dashboard/PostsTable';
import { StatTiles } from '@/components/dashboard/StatTiles';
import { ViewsChart } from '@/components/dashboard/ViewsChart';
import { Banner, StatusMessage } from '@/components/ui/StatusMessage';
import { useAccount } from '@/hooks/useAccount';
import { usePersonalData } from '@/hooks/usePersonalData';
import {
  dailyViews,
  fetchDashboard,
  fetchFollowers,
  fetchMyArticles,
  RANGES,
  sumDays,
  type RangeDays,
} from '@/lib/api/dashboard';
import type { Account } from '@/lib/api/types';

export default function App() {
  const { apiKey, account, ready } = useAccount();
  if (!ready) return null;
  if (!apiKey || !account) {
    return (
      <div className="dash">
        <StatusMessage
          icon={KeyRound}
          title="Connect your DEV account"
          detail="The dashboard needs a DEV API key."
          action={{ label: 'Open settings', onClick: () => browser.runtime.openOptionsPage() }}
        />
      </div>
    );
  }
  // Remount on a key change so nothing from the old account sticks around.
  return <Dashboard key={apiKey} apiKey={apiKey} account={account} />;
}

function Dashboard({ apiKey, account }: { apiKey: string; account: Account }) {
  const [days, setDays] = useState<RangeDays>(30);
  const stats = usePersonalData(`dashboard:${days}`, (s) => fetchDashboard(apiKey, days, s));
  const posts = usePersonalData('articles', (s) => fetchMyArticles(apiKey, s));
  const followers = usePersonalData('followers', (s) => fetchFollowers(apiKey, s));

  const loading = [stats, posts, followers].some((r) => r.status === 'loading');
  const totals = stats.data ? sumDays(stats.data.historical) : null;

  function reloadAll() {
    stats.reload();
    posts.reload();
    followers.reload();
  }

  // Only a banner when cached data is still showing. A section with nothing
  // to show gets its own error state instead.
  const staleError = [stats, posts, followers].find((r) => r.error && r.data)?.error;

  return (
    <div className="dash">
      <header className="dash-head">
        <a className="btn icon-btn" href="/newtab.html" aria-label="Back to feed" title="Back to feed">
          <ArrowLeft size={16} aria-hidden="true" />
        </a>
        <a className="dash-who" href={`https://dev.to/${account.username}`} title="Your DEV profile">
          {account.image && <img src={account.image} alt="" width={40} height={40} />}
          <span>
            <span className="dash-name">{account.name}</span>
            <span className="dash-handle">@{account.username}</span>
          </span>
        </a>

        <div className="dash-actions">
          <div className="segmented" role="radiogroup" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={days === r}
                className="segment"
                onClick={() => setDays(r)}
              >
                {r} days
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn icon-btn"
            onClick={reloadAll}
            aria-label="Refresh"
            title="Refresh"
            disabled={loading}
          >
            <RefreshCw size={16} aria-hidden="true" className={loading ? 'spin' : undefined} />
          </button>
          <a className="btn btn-primary" href="https://dev.to/new" title="Write a new post on DEV">
            <SquarePen size={16} aria-hidden="true" />
            New post
          </a>
        </div>
      </header>

      {staleError && (
        <Banner icon={CloudOff} action={{ label: 'Retry', onClick: reloadAll }}>
          {staleError.kind === 'rate-limited'
            ? 'DEV is rate limiting requests, so some numbers are from earlier.'
            : "Couldn't refresh everything, so some numbers are from earlier."}
        </Banner>
      )}

      {stats.status === 'error' && stats.error ? (
        <StatusMessage
          icon={TriangleAlert}
          tone="danger"
          title="Couldn't load your stats"
          detail={stats.error.message}
          action={{ label: 'Try again', onClick: stats.reload }}
        />
      ) : (
        <>
          <StatTiles totals={totals} engagement={stats.data?.follower_engagement ?? null} days={days} />
          <ViewsChart points={stats.data ? dailyViews(stats.data.historical) : null} />
        </>
      )}

      <div className="dash-columns">
        <PostsTable posts={posts.data} status={posts.status} error={posts.error} onRetry={posts.reload} />
        <aside className="dash-side">
          <FollowersPanel
            followers={followers.data}
            total={stats.data?.follower_engagement.total_followers ?? null}
            failed={followers.status === 'error'}
          />
          <ReactionsPanel totals={totals} />
          <SupportersPanel contributors={stats.data?.top_contributors ?? null} />
          <ReferrersPanel domains={stats.data?.referrers.domains ?? null} />
        </aside>
      </div>
    </div>
  );
}
