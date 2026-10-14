import { useId, useState, type FormEvent } from 'react';
import { KeyRound, LoaderCircle, LogOut } from 'lucide-react';
import { connectAccount, disconnectAccount } from '@/lib/account';
import { ApiError } from '@/lib/api/client';
import type { Account } from '@/lib/api/types';
import './account.css';

interface Props {
  account: Account | null;
}

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.kind === 'unauthorized') return "DEV didn't accept that key. Check it and try again.";
    return err.message;
  }
  return 'Something went wrong checking the key.';
}

export function KeyForm({ account }: Props) {
  const [draft, setDraft] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || checking) return;
    setChecking(true);
    setError(null);
    try {
      await connectAccount(draft);
      setDraft('');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setChecking(false);
    }
  }

  if (account) {
    return (
      <div className="account-connected">
        {account.image && <img className="account-avatar" src={account.image} alt="" width={36} height={36} />}
        <div className="account-who">
          <span className="account-name">{account.name}</span>
          <a href={`https://dev.to/${account.username}`} target="_blank" rel="noreferrer">
            @{account.username}
          </a>
        </div>
        <button type="button" className="btn" onClick={disconnectAccount}>
          <LogOut size={15} aria-hidden="true" />
          Remove key
        </button>
      </div>
    );
  }

  return (
    <div className="key-form-wrap">
      <form className="key-form" onSubmit={submit}>
        <label htmlFor={inputId} className="sr-only">
          DEV API key
        </label>
        <input
          id={inputId}
          className="text-input"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste your DEV API key"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button type="submit" className="btn" disabled={!draft.trim() || checking}>
          {checking ? (
            <LoaderCircle size={15} aria-hidden="true" className="spin" />
          ) : (
            <KeyRound size={15} aria-hidden="true" />
          )}
          {checking ? 'Checking' : 'Connect'}
        </button>
      </form>
      {error && (
        <p id={errorId} className="key-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
