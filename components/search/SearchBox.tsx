import { forwardRef, useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  active: string | null;
  onSearch: (q: string) => void;
  onClear: () => void;
}

export const SearchBox = forwardRef<HTMLInputElement, Props>(function SearchBox({ active, onSearch, onClear }, ref) {
  const [value, setValue] = useState(active ?? '');

  useEffect(() => setValue(active ?? ''), [active]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) onSearch(q);
    else if (active) onClear();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Escape') return;
    setValue('');
    if (active) onClear();
    e.currentTarget.blur();
  }

  return (
    <form className="search" role="search" onSubmit={submit}>
      <Search size={16} className="search-icon" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        className="search-input"
        placeholder="Search DEV"
        aria-label="Search DEV posts"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {value || active ? (
        <button
          type="button"
          className="search-clear"
          aria-label="Clear search"
          title="Clear search (Esc)"
          onClick={() => {
            setValue('');
            onClear();
          }}
        >
          <X size={15} aria-hidden="true" />
        </button>
      ) : (
        <kbd className="search-kbd" title="Press / to search">
          /
        </kbd>
      )}
    </form>
  );
});
