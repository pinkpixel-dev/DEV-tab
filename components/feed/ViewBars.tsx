import { Pencil } from 'lucide-react';
import { ChipGroup } from '@/components/ui/ChipGroup';
import type { DevEvent, Organization, Trend } from '@/lib/api/types';
import { formatCount } from '@/lib/format';

const openSettings = () => browser.runtime.openOptionsPage();

export function OrgBar({ orgs, active, onChange }: { orgs: Organization[]; active: string | null; onChange: (u: string | null) => void }) {
  return (
    <ChipGroup
      label="Filter by org"
      allLabel={orgs.length ? 'All' : undefined}
      options={orgs.map((o) => ({ value: o.username, label: o.name, image: o.profile_image }))}
      active={active}
      onChange={onChange}
    >
      {orgs.length > 0 && (
        <button type="button" className="chip chip-link" onClick={openSettings} title="Add or remove orgs in settings">
          <Pencil size={13} aria-hidden="true" />
          Edit orgs
        </button>
      )}
    </ChipGroup>
  );
}

export function TrendBar({ trends, active, onChange }: { trends: Trend[]; active: Trend | null; onChange: (slug: string) => void }) {
  return (
    <>
      <ChipGroup
        label="Trends"
        options={trends.map((t) => ({ value: t.slug, label: t.name }))}
        active={active?.slug ?? null}
        onChange={(slug) => slug && onChange(slug)}
      />
      {active?.description && (
        <p className="subbar-note">
          <span>{formatCount(active.articles_count)} posts ·</span> {active.description}
        </p>
      )}
    </>
  );
}

type EventKind = DevEvent['kind'];

export function EventBar({ active, onChange }: { active: EventKind | null; onChange: (k: EventKind | null) => void }) {
  return (
    <ChipGroup<EventKind>
      label="Event type"
      allLabel="All"
      options={[
        { value: 'live_stream', label: 'Live streams' },
        { value: 'challenge', label: 'Challenges' },
      ]}
      active={active}
      onChange={onChange}
    />
  );
}
