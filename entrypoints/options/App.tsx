import { useEffect, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { FEED_LABELS } from '@/components/feed/FeedTabs';
import { TagListEditor } from '@/components/tags/TagListEditor';
import { useSettings } from '@/hooks/useSettings';
import type { FeedKind } from '@/lib/api/types';
import { APP_NAME, APP_VERSION } from '@/lib/app-info';
import type { Density, Settings } from '@/lib/settings';

const DENSITIES: { value: Density; label: string }[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="row">
      <div className="row-label">
        <h2>{title}</h2>
        {hint && <p>{hint}</p>}
      </div>
      <div className="row-control">{children}</div>
    </section>
  );
}

export default function App() {
  const { settings, update } = useSettings();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 1800);
    return () => clearTimeout(t);
  }, [savedAt]);

  if (!settings) return null;

  async function save(patch: Partial<Settings>) {
    await update(patch);
    setSavedAt(Date.now());
  }

  return (
    <div className="options">
      <header className="options-head">
        <h1>{APP_NAME} settings</h1>
        <span className="saved" role="status" data-visible={savedAt !== null}>
          <Check size={15} aria-hidden="true" />
          Saved
        </span>
      </header>

      <Row title="Default feed" hint="What a new tab opens on.">
        <select
          className="select"
          value={settings.defaultFeed}
          onChange={(e) => save({ defaultFeed: e.target.value as FeedKind })}
          aria-label="Default feed"
        >
          {(Object.keys(FEED_LABELS) as FeedKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {FEED_LABELS[kind]}
            </option>
          ))}
        </select>
      </Row>

      <Row title="Card density" hint="Compact hides cover images and descriptions.">
        <div className="segmented" role="radiogroup" aria-label="Card density">
          {DENSITIES.map((d) => (
            <button
              key={d.value}
              type="button"
              role="radio"
              aria-checked={settings.density === d.value}
              className="segment"
              onClick={() => save({ density: d.value })}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Row>

      <Row title="Your tags" hint="Shown as quick filters above the feed.">
        <TagListEditor
          label="Your tags"
          tags={settings.savedTags}
          onChange={(savedTags) => save({ savedTags })}
          emptyText="No tags yet."
        />
      </Row>

      <Row title="Hidden tags" hint="Posts with any of these tags never show up.">
        <TagListEditor
          label="Hidden tags"
          tags={settings.hiddenTags}
          onChange={(hiddenTags) => save({ hiddenTags })}
          emptyText="Nothing hidden."
        />
      </Row>

      <footer className="options-foot">
        {APP_NAME} {APP_VERSION} · Made with 💖 by{' '}
        <a href="https://pinkpixel.dev" target="_blank" rel="noreferrer">
          Pink Pixel
        </a>
      </footer>
    </div>
  );
}
