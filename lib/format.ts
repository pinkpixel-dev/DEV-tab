const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function formatCount(n: number): string {
  return compact.format(n);
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 7) return rtf.format(Math.round(seconds / 86400), 'day');
  // Only add the year when it isn't this year, so "Oct 4" stays short but old org posts read "Oct 4, 2024".
  const date = new Date(iso);
  const otherYear = date.getFullYear() !== new Date(now).getFullYear();
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: otherYear ? 'numeric' : undefined });
}

const eventTime = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const eventDay = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

// Live streams show when they start. Challenges run for days, so they show the date range.
export function eventWhen(kind: 'live_stream' | 'challenge', start: string, end: string | null): string {
  if (kind === 'live_stream' || !end) return eventTime.format(new Date(start));
  return eventDay.formatRange(new Date(start), new Date(end));
}
