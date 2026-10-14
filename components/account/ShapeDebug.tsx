// DEV-ONLY: shows the structure of authenticated responses (field names and
// types, never values) so Phase 2 types can be checked against real data.
// Remove before Phase 2 ships.
import { useState } from 'react';
import { apiGet } from '@/lib/api/client';

const ENDPOINTS = ['/users/me', '/follows/tags', '/readinglist', '/analytics/totals', '/analytics/past_day'];

function describe(value: unknown, depth = 0): unknown {
  if (Array.isArray(value)) return value.length ? [`${value.length} items`, describe(value[0], depth + 1)] : '[]';
  if (value && typeof value === 'object') {
    if (depth > 3) return '{…}';
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, describe(v, depth + 1)]));
  }
  return value === null ? 'null' : typeof value;
}

export function ShapeDebug({ apiKey }: { apiKey: string }) {
  const [out, setOut] = useState<string | null>(null);

  async function run() {
    setOut('Loading…');
    const results: Record<string, unknown> = {};
    for (const path of ENDPOINTS) {
      try {
        results[path] = describe(await apiGet(path, { per_page: 2 }, undefined, apiKey));
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
