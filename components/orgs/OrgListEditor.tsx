import { useId, useState, type FormEvent } from 'react';
import { LoaderCircle, Plus, X } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { fetchOrg, normalizeOrg } from '@/lib/api/orgs';
import type { Organization } from '@/lib/api/types';
import '@/components/tags/tags.css';
import '@/components/ui/chips.css';

interface Props {
  orgs: Organization[];
  onChange: (orgs: Organization[]) => void;
}

// Adding an org looks it up on DEV first, so typos and personal accounts get caught here.
export function OrgListEditor({ orgs, onChange }: Props) {
  const [draft, setDraft] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const hintId = useId();
  const username = normalizeOrg(draft);
  const duplicate = username !== '' && orgs.some((o) => o.username === username);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!username || duplicate || checking) return;
    setChecking(true);
    setError(null);
    try {
      const org = await fetchOrg(username);
      onChange([...orgs, org]);
      setDraft('');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? `No DEV organization called "${username}".`
          : err instanceof ApiError
            ? err.message
            : "Couldn't check that org.",
      );
    } finally {
      setChecking(false);
    }
  }

  const hint = duplicate ? `${username} is already in the list.` : error;

  return (
    <div className="tag-editor">
      {orgs.length > 0 ? (
        <ul className="tag-editor-list" aria-label="Your orgs">
          {orgs.map((org) => (
            <li key={org.username} className="chip chip-static">
              <img className="chip-avatar" src={org.profile_image} alt="" width={18} height={18} loading="lazy" />
              <span className="chip-label">{org.name}</span>
              <button
                type="button"
                className="chip-remove"
                aria-label={`Remove ${org.name}`}
                title={`Remove ${org.name}`}
                onClick={() => onChange(orgs.filter((o) => o.username !== org.username))}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="tag-editor-empty">No orgs yet.</p>
      )}

      <form className="tag-editor-form" onSubmit={submit}>
        <label htmlFor={inputId} className="sr-only">
          Add an org by username or DEV link
        </label>
        <input
          id={inputId}
          className="text-input"
          placeholder="Username or dev.to link"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          aria-invalid={Boolean(hint) || undefined}
          aria-describedby={hint ? hintId : undefined}
        />
        <button type="submit" className="btn" disabled={!username || duplicate || checking}>
          {checking ? <LoaderCircle size={15} className="spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
          {checking ? 'Checking' : 'Add'}
        </button>
      </form>
      {hint && (
        <p id={hintId} className="tag-editor-hint" role={error ? 'alert' : undefined}>
          {hint}
        </p>
      )}
    </div>
  );
}
