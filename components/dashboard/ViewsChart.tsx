import { useState } from 'react';
import type { DayPoint } from '@/lib/api/dashboard';
import { formatCount } from '@/lib/format';

const day = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });

// One series, so the title names it and there's no legend. Every bar has a
// hover and focus tooltip, and the numbers are also in a hidden table.
export function ViewsChart({ points }: { points: DayPoint[] | null }) {
  const [active, setActive] = useState<number | null>(null);
  const max = points ? Math.max(1, ...points.map((p) => p.views)) : 1;
  const first = points?.[0];
  const last = points?.[points.length - 1];
  const hovered = active !== null ? points?.[active] : undefined;

  return (
    <section className="panel chart" aria-labelledby="views-title">
      <div className="panel-head">
        <h2 id="views-title">Daily views</h2>
        {hovered ? (
          <p className="chart-readout">
            <strong>{formatCount(hovered.views)}</strong> views on {day(hovered.date)}
          </p>
        ) : (
          <p className="chart-readout chart-readout-idle">Peak {formatCount(max)}</p>
        )}
      </div>

      {!points ? (
        <div className="chart-plot dash-sk" aria-hidden="true" />
      ) : (
        <>
          <div className="chart-plot" onMouseLeave={() => setActive(null)} aria-hidden="true">
            {points.map((p, i) => (
              <div
                key={p.date}
                className="chart-col"
                data-active={active === i || undefined}
                onMouseEnter={() => setActive(i)}
              >
                <div className="chart-bar" style={{ height: `${(p.views / max) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="chart-axis" aria-hidden="true">
            <span>{first && day(first.date)}</span>
            <span>{last && day(last.date)}</span>
          </div>
          <table className="sr-only">
            <caption>Daily views</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Views</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.date}>
                  <td>{day(p.date)}</td>
                  <td>{p.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
