import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import { heatLevel, toWeeks, type HeatDay, type HeatSummary } from '@/lib/api/heatmap';
import { formatCount } from '@/lib/format';
import './heatmap.css';

interface Props {
  summary: HeatSummary | null;
  failed: boolean;
  onRetry: () => void;
  label: string;
  onOlder: (() => void) | null;
  onNewer: (() => void) | null;
}

type Cell = HeatSummary['days'][number];

const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const LEVELS = [0, 1, 2, 3, 4] as const;

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const monthName = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en', { month: 'short', timeZone: 'UTC' });
const plural = (n: number, word: string) => `${formatCount(n)} ${word}${n === 1 ? '' : 's'}`;

function breakdown(d: Pick<HeatDay, 'articles' | 'comments' | 'reactions'>): string {
  const parts = [
    d.articles && plural(d.articles, 'post'),
    d.comments && plural(d.comments, 'comment'),
    d.reactions && plural(d.reactions, 'reaction'),
  ].filter(Boolean);
  return parts.join(', ');
}

function cellLabel(d: Cell): string {
  if (d.missing) return `${longDate(d.date)}: no data`;
  if (!d.total) return `${longDate(d.date)}: no activity`;
  return `${longDate(d.date)}: ${plural(d.total, 'contribution')} (${breakdown(d)})`;
}

// A month label goes on the week its first day falls in. The opening week
// only gets one when the next label is far enough away not to collide.
function monthLabels(weeks: (Cell | null)[][]): (string | null)[] {
  const labels = weeks.map((w) => {
    const first = w.find((d) => d?.date.endsWith('-01'));
    return first ? monthName(first.date) : null;
  });
  const start = weeks[0]?.find(Boolean);
  if (start && !labels.slice(0, 3).some(Boolean)) labels[0] = monthName(start.date);
  return labels;
}

/**
 * Your posts, comments and reactions given, one square per day. Hover or
 * focus a day for its breakdown. Arrow keys move around the grid.
 */
export function ActivityHeatmap({ summary, failed, onRetry, label, onOlder, onNewer }: Props) {
  const weeks = useMemo(() => (summary ? toWeeks(summary.days) : []), [summary]);
  const months = useMemo(() => monthLabels(weeks), [weeks]);
  const lastDate = summary?.days[summary.days.length - 1]?.date ?? null;
  const [hover, setHover] = useState<Cell | null>(null);
  const [focused, setFocused] = useState<Cell | null>(null);
  const [tabDate, setTabDate] = useState<string | null>(lastDate);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const active = hover ?? focused;

  // New data starts on its latest week, which is the part that overflows on
  // narrow screens.
  useEffect(() => {
    setTabDate(lastDate);
    setHover(null);
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [summary, lastDate]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-date]');
    if (!cell) return;
    let c = Number(cell.dataset.c);
    let r = Number(cell.dataset.r);
    if (e.key === 'ArrowLeft') c -= 1;
    else if (e.key === 'ArrowRight') c += 1;
    else if (e.key === 'ArrowUp') r -= 1;
    else if (e.key === 'ArrowDown') r += 1;
    else if (e.key === 'Home' || e.key === 'End') {
      const target = e.key === 'Home' ? summary?.days[0] : summary?.days[summary.days.length - 1];
      if (!target) return;
      e.preventDefault();
      gridRef.current?.querySelector<HTMLElement>(`[data-date="${target.date}"]`)?.focus();
      return;
    } else return;
    e.preventDefault();
    const next = weeks[c]?.[r];
    if (next) gridRef.current?.querySelector<HTMLElement>(`[data-date="${next.date}"]`)?.focus();
  }

  return (
    <section className="panel heat" aria-labelledby="heat-title">
      <div className="panel-head">
        <h2 id="heat-title">Activity</h2>
        <div className="heat-nav">
          <button
            type="button"
            className="btn icon-btn heat-step"
            onClick={onOlder ?? undefined}
            disabled={!onOlder}
            aria-label="Earlier year"
            title="Earlier year"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className="heat-label" aria-live="polite">
            {label}
          </span>
          <button
            type="button"
            className="btn icon-btn heat-step"
            onClick={onNewer ?? undefined}
            disabled={!onNewer}
            aria-label="Later year"
            title="Later year"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className="chart-readout heat-readout">
        {active && !active.missing ? (
          <>
            <strong>{formatCount(active.total)}</strong> on {longDate(active.date)}
            {active.total > 0 && <span className="heat-breakdown"> · {breakdown(active)}</span>}
          </>
        ) : summary ? (
          <>
            <strong>{formatCount(summary.totals.total)}</strong> contributions
            {summary.totals.total > 0 && <span className="heat-breakdown"> · {breakdown(summary.totals)}</span>}
          </>
        ) : (
          ' '
        )}
      </p>

      {failed && !summary ? (
        <p className="panel-empty">
          <TriangleAlert size={16} aria-hidden="true" />
          Couldn't load your activity.
          <button type="button" className="btn heat-retry" onClick={onRetry}>
            Try again
          </button>
        </p>
      ) : !summary ? (
        <div className="heat-sk dash-sk" aria-hidden="true" />
      ) : (
        <div className="heat-scroll" ref={scrollRef}>
          <div className="heat-days" aria-hidden="true">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="heat-body">
            <div className="heat-months" aria-hidden="true">
              {months.map((m, i) => (
                <span key={i}>{m && <span className="heat-month">{m}</span>}</span>
              ))}
            </div>
            <div
              ref={gridRef}
              className="heat-grid"
              role="grid"
              aria-label={`Activity, ${label}`}
              onKeyDown={onKeyDown}
              onMouseLeave={() => setHover(null)}
            >
              {Array.from({ length: 7 }, (_, r) => (
                <div key={r} className="heat-row" role="row">
                  {weeks.map((w, c) => {
                    const d = w[r];
                    if (!d) return <span key={c} className="heat-cell" role="gridcell" data-pad="" />;
                    return (
                      <span
                        key={d.date}
                        className="heat-cell"
                        role="gridcell"
                        tabIndex={d.date === tabDate ? 0 : -1}
                        aria-label={cellLabel(d)}
                        data-date={d.date}
                        data-c={c}
                        data-r={r}
                        data-level={d.missing ? undefined : heatLevel(d.total, summary.max)}
                        data-missing={d.missing ? '' : undefined}
                        onMouseEnter={() => setHover(d)}
                        onFocus={() => {
                          setFocused(d);
                          setTabDate(d.date);
                        }}
                        onBlur={() => setFocused(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="heat-foot">
        <span>Posts, comments and reactions you gave</span>
        <span className="heat-legend" aria-hidden="true">
          Less
          {LEVELS.map((l) => (
            <span key={l} className="heat-cell" data-level={l} />
          ))}
          More
        </span>
      </div>
    </section>
  );
}
