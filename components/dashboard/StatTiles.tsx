import type { RangeTotals } from '@/lib/api/dashboard';
import { formatCount } from '@/lib/format';

interface Props {
  totals: RangeTotals | null;
  engagement: { total_followers: number; engaged_followers: number } | null;
  days: number;
}

function minutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${formatCount(m / 60)}h` : `${m}m`;
}

export function StatTiles({ totals, engagement, days }: Props) {
  const tiles: [string, string | null, string?][] = [
    ['Followers', engagement && formatCount(engagement.total_followers), engagement ? `${formatCount(engagement.engaged_followers)} engaged` : undefined],
    ['Views', totals && formatCount(totals.views), `last ${days} days`],
    ['Reactions', totals && formatCount(totals.reactions), `last ${days} days`],
    ['Comments', totals && formatCount(totals.comments), `last ${days} days`],
    ['New followers', totals && formatCount(totals.follows), `last ${days} days`],
    ['Read time', totals && minutes(totals.readSeconds), `last ${days} days`],
  ];

  return (
    <dl className="tiles" aria-busy={!totals || undefined}>
      {tiles.map(([label, value, sub]) => (
        <div key={label} className="tile">
          <dt>{label}</dt>
          <dd className="tile-value">{value ?? <span className="dash-sk sk-num" aria-hidden="true" />}</dd>
          {sub && <dd className="tile-sub">{sub}</dd>}
        </div>
      ))}
    </dl>
  );
}
