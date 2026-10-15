import { useId, useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { addTag, normalizeTag } from '@/lib/settings';
import './tags.css';

interface Props {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  emptyText: string;
  // Popular DEV tags, offered as autocomplete while typing.
  suggestions?: string[];
}

export function TagListEditor({ label, tags, onChange, emptyText, suggestions }: Props) {
  const [draft, setDraft] = useState('');
  const inputId = useId();
  const listId = useId();
  const normalized = normalizeTag(draft);
  const duplicate = normalized !== '' && tags.includes(normalized);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!normalized || duplicate) return;
    onChange(addTag(tags, normalized));
    setDraft('');
  }

  return (
    <div className="tag-editor">
      {tags.length > 0 ? (
        <ul className="tag-editor-list" aria-label={label}>
          {tags.map((tag) => (
            <li key={tag} className="chip chip-static">
              #{tag}
              <button
                type="button"
                className="chip-remove"
                aria-label={`Remove #${tag}`}
                title={`Remove #${tag}`}
                onClick={() => onChange(tags.filter((t) => t !== tag))}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="tag-editor-empty">{emptyText}</p>
      )}

      <form className="tag-editor-form" onSubmit={submit}>
        <label htmlFor={inputId} className="sr-only">
          Add a tag to {label.toLowerCase()}
        </label>
        <input
          id={inputId}
          className="text-input"
          placeholder="Add a tag"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-invalid={duplicate || undefined}
          list={suggestions ? listId : undefined}
          autoComplete="off"
        />
        {suggestions && (
          <datalist id={listId}>
            {suggestions.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        )}
        <button type="submit" className="btn" disabled={!normalized || duplicate}>
          <Plus size={15} aria-hidden="true" />
          Add
        </button>
      </form>
      {duplicate && <p className="tag-editor-hint">#{normalized} is already in the list.</p>}
    </div>
  );
}
