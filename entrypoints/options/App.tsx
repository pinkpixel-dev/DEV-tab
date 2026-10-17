import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { KeyForm } from '@/components/account/KeyForm';
import { EXTRA_LABELS, FEED_LABELS, PERSONAL_LABELS } from '@/components/feed/FeedTabs';
import { OrgListEditor } from '@/components/orgs/OrgListEditor';
import { TagListEditor } from '@/components/tags/TagListEditor';
import { useAccount } from '@/hooks/useAccount';
import { useCachedData } from '@/hooks/useCachedData';
import { useSettings } from '@/hooks/useSettings';
import { fetchPopularTags } from '@/lib/api/tags';
import type { ExtraTab, FeedKind, FeedTab, PersonalTab } from '@/lib/api/types';
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
  const { apiKey, account, ready } = useAccount();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  // Autocomplete for the tag lists. They still work as plain inputs if this fails.
  const popularTags = useCachedData('tags:popular', fetchPopularTags).data ?? undefined;

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 1800);
    return () => clearTimeout(t);
  }, [savedAt]);

  if (!settings || !ready) return null;

  async function save(patch: Partial<Settings>) {
    await update(patch);
    setSavedAt(Date.now());
  }

  return (
    <div className="options">
      <header className="options-head">
        {/* Settings opens in its own tab with no history, so this links to the feed instead of going back. */}
        <a className="btn icon-btn" href="/newtab.html" aria-label="Back to feed" title="Back to feed">
          <ArrowLeft size={16} aria-hidden="true" />
        </a>
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
          onChange={(e) => save({ defaultFeed: e.target.value as FeedTab })}
          aria-label="Default feed"
        >
          {apiKey &&
            (Object.keys(PERSONAL_LABELS) as PersonalTab[]).map((tab) => (
              <option key={tab} value={tab}>
                {PERSONAL_LABELS[tab]}
              </option>
            ))}
          {(Object.keys(FEED_LABELS) as FeedKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {FEED_LABELS[kind]}
            </option>
          ))}
          {(Object.keys(EXTRA_LABELS) as ExtraTab[]).map((tab) => (
            <option key={tab} value={tab}>
              {EXTRA_LABELS[tab]}
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

      <Row
        title="Your tags"
        hint={apiKey ? 'Your followed DEV tags are used instead while a key is connected.' : 'Shown as quick filters above the feed.'}
      >
        <TagListEditor
          label="Your tags"
          tags={settings.savedTags}
          onChange={(savedTags) => save({ savedTags })}
          emptyText="No tags yet."
          suggestions={popularTags}
        />
      </Row>

      <Row title="Hidden tags" hint="Posts with any of these tags never show up.">
        <TagListEditor
          label="Hidden tags"
          tags={settings.hiddenTags}
          onChange={(hiddenTags) => save({ hiddenTags })}
          emptyText="Nothing hidden."
          suggestions={popularTags}
        />
      </Row>

      <Row title="Orgs" hint="Their posts show up on the Orgs tab.">
        <OrgListEditor orgs={settings.orgs} onChange={(orgs) => save({ orgs })} />
      </Row>

      <Row title="DEV account" hint="Optional. Adds your followed tags, reading list and a stats dashboard.">
        <KeyForm account={account} />
        {!account && (
          <p className="row-note">
            Create a key under{' '}
            <a href="https://dev.to/settings/extensions" target="_blank" rel="noreferrer">
              DEV API Keys
            </a>{' '}
            in your DEV settings. It stays in this browser.
          </p>
        )}
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
