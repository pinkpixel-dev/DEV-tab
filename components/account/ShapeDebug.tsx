// DEV-ONLY: shows the structure of authenticated responses (field names and
// types, never values) so Phase 2 types can be checked against real data.
// Remove before Phase 2 ships.
import { useState } from 'react';
import { apiGet } from '@/lib/api/client';

const START = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
const ENDPOINTS: [string, Record<string, string | number>][] = [
  ['/users/me', {}],
  ['/followers/users', { per_page: 2 }],
  ['/articles/me/all', { per_page: 2 }],
  ['/readinglist', { per_page: 2 }],
  ['/analytics/totals', {}],
  ['/analytics/past_day', {}],
  ['/analytics/historical', { start: START }],
  ['/analytics/dashboard', { start: START }],
  ['/analytics/follower_engagement', { start: START }],
];

function describe(value: unknown, depth = 0): unknown {
  if (Array.isArray(value)) return value.length ? [`${value.length} items`, describe(value[0], depth + 1)] : '[]';
  if (value && typeof value === 'object') {
    if (depth > 5) return '{…}';
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, describe(v, depth + 1)]));
  }
  return value === null ? 'null' : typeof value;
}

export function ShapeDebug({ apiKey }: { apiKey: string }) {
  const [out, setOut] = useState<string | null>(null);

  async function run() {
    setOut('Loading…');
    const results: Record<string, unknown> = {};
    for (const [path, params] of ENDPOINTS) {
      try {
        results[path] = describe(await apiGet(path, params, undefined, apiKey));
      } catch (err) {
        results[path] = `error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    setOut(JSON.stringify(results, null, 2));
  }

  return (
    <div className="shape-debug">
      <button type="button" className="btn" onClick={run}>
        Inspect API shapes (dev only)
      </button>
      {out && <pre>{out}</pre>}
    </div>
  );
}
