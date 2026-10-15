import type { ReactNode } from 'react';
import '@/components/tags/tags.css';
import './chips.css';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  image?: string;
  title?: string;
}

interface Props<T extends string> {
  label: string;
  options: ChipOption<T>[];
  active: T | null;
  onChange: (value: T | null) => void;
  // Adds a leading "All" chip that clears the selection.
  allLabel?: string;
  children?: ReactNode;
}

// A row of single-select filter chips (orgs, trends, event types).
export function ChipGroup<T extends string>({ label, options, active, onChange, allLabel, children }: Props<T>) {
  return (
    <div className="tag-filter chip-group" role="group" aria-label={label}>
      {allLabel && (
        <button type="button" className="chip" aria-pressed={active === null} onClick={() => onChange(null)}>
          {allLabel}
        </button>
      )}
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="chip"
          aria-pressed={active === o.value}
          title={o.title ?? o.label}
          onClick={() => onChange(o.value)}
        >
          {o.image && <img className="chip-avatar" src={o.image} alt="" width={18} height={18} loading="lazy" />}
          <span className="chip-label">{o.label}</span>
        </button>
      ))}
      {children}
    </div>
  );
}
