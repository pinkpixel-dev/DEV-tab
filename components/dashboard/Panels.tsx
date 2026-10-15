import type { ReactNode } from 'react';
import type { Contributor, Follower, RangeTotals } from '@/lib/api/dashboard';
import { formatCount, timeAgo } from '@/lib/format';

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel side-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const Loading = () => (
  <div aria-hidden="true">
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="dash-sk sk-row" />
    ))}
  </div>
);

interface FollowersProps {
  followers: Follower[] | null;
  total: number | null;
  failed: boolean;
}

export function FollowersPanel({ followers, total, failed }: FollowersProps) {
  return (
    <Panel title={total === null ? 'New followers' : `New followers · ${formatCount(total)} total`}>
      {failed ? (
        <p className="panel-empty">Couldn't load followers.</p>
      ) : !followers ? (
        <Loading />
      ) : followers.length === 0 ? (
        <p className="panel-empty">No followers yet.</p>
      ) : (
        <>
          <ul className="people">
            {followers.map((f) => (
              <li key={f.id}>
                <a href={`https://dev.to${f.path}`} className="person">
                  <img src={f.profile_image} alt="" width={28} height={28} loading="lazy" />
                  <span className="person-name">{f.name}</span>
                  <time className="person-meta" dateTime={f.created_at}>
                    {timeAgo(f.created_at)}
                  </time>
                </a>
              </li>
            ))}
          </ul>
          <a className="panel-link" href="https://dev.to/dashboard/user_followers">
            All followers on DEV
          </a>
        </>
      )}
    </Panel>
  );
}

const REACTIONS: [keyof RangeTotals['byReaction'], string][] = [
  ['like', 'Likes'],
  ['unicorn', 'Unicorns'],
  ['exploding_head', 'Exploding heads'],
  ['raised_hands', 'Raised hands'],
  ['fire', 'Fire'],
  ['readinglist', 'Saves'],
];

export function ReactionsPanel({ totals }: { totals: RangeTotals | null }) {
  return (
    <Panel title="Reactions">
      {!totals ? (
        <Loading />
      ) : (
        <dl className="kv">
          {REACTIONS.map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{formatCount(totals.byReaction[key])}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

export function SupportersPanel({ contributors }: { contributors: Contributor[] | null }) {
  return (
    <Panel title="Top supporters">
      {!contributors ? (
        <Loading />
      ) : contributors.length === 0 ? (
        <p className="panel-empty">Nobody yet in this range.</p>
      ) : (
        <ul className="people">
          {contributors.slice(0, 8).map((c) => (
            <li key={c.user_id}>
              <a href={`https://dev.to/${c.username}`} className="person">
                <img src={c.profile_image} alt="" width={28} height={28} loading="lazy" />
                <span className="person-name">{c.name}</span>
                <span className="person-meta">
                  {formatCount(c.reactions_count)} reactions · {formatCount(c.comments_count)} comments
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function ReferrersPanel({ domains }: { domains: { domain: string; count: number }[] | null }) {
  return (
    <Panel title="Where readers came from">
      {!domains ? (
        <Loading />
      ) : domains.length === 0 ? (
        <p className="panel-empty">No referrers in this range.</p>
      ) : (
        <dl className="kv">
          {domains.slice(0, 8).map((d) => (
            <div key={d.domain}>
              <dt>{d.domain || 'Direct'}</dt>
              <dd>{formatCount(d.count)}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}
