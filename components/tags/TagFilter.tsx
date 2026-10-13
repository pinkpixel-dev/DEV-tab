import { X } from 'lucide-react';
import './tags.css';

interface Props {
  savedTags: string[];
  active: string | null;
  onChange: (tag: string | null) => void;
}

export function TagFilter({ savedTags, active, onChange }: Props) {
  // A tag picked from a card shows up here too, even if it isn't saved.
  const extra = active && !savedTags.includes(active) ? active : null;

  return (
    <div className="tag-filter" role="group" aria-label="Filter by tag">
      <button type="button" className="chip" aria-pressed={active === null} onClick={() => onChange(null)}>
        All
      </button>
      {savedTags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="chip"
          aria-pressed={active === tag}
          onClick={() => onChange(active === tag ? null : tag)}
        >
          #{tag}
        </button>
      ))}
      {extra && (
        <button
          type="button"
          className="chip chip-extra"
          aria-pressed="true"
          title={`Stop filtering by #${extra}`}
          onClick={() => onChange(null)}
        >
          #{extra}
          <X size={13} aria-hidden="true" />
          <span className="sr-only">Remove filter</span>
        </button>
      )}
    </div>
  );
}
