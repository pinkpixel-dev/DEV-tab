import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Heart } from 'lucide-react';
import { cachedReactionCounts, fetchReactionCounts, REACTIONS, type ReactionCounts } from '@/lib/api/reactions';
import { formatCount } from '@/lib/format';
import './reactions.css';

interface Props {
  articleId: number;
  url: string;
  total: number;
}

// Wide enough for the five reactions. Used to flip the picker to the left
// when it would run off the right edge.
const POP_WIDTH = 260;

/**
 * The heart on a card. It opens DEV's reaction picker with a count under each
 * emoji. DEV only lets admins react through the API, so each emoji opens the
 * post, where reacting is one click.
 */
export function ReactionPicker({ articleId, url, total }: Props) {
  const popId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<ReactionCounts | null>(() => cachedReactionCounts(articleId));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const pop = popRef.current;
    const btn = btnRef.current;
    if (!pop || !btn) return;
    let ctrl: AbortController | null = null;
    const close = () => pop.hidePopover();

    function onBeforeToggle(e: Event) {
      if ((e as ToggleEvent).newState !== 'open') return;
      // Fixed position under the heart. Popovers sit in the top layer, so the
      // card's overflow can't clip it.
      const r = btn!.getBoundingClientRect();
      const flip = r.left + POP_WIDTH > window.innerWidth - 8;
      pop!.style.top = `${r.bottom + 6}px`;
      pop!.style.left = flip ? 'auto' : `${r.left}px`;
      pop!.style.right = flip ? `${window.innerWidth - r.right}px` : 'auto';
    }

    function onToggle(e: Event) {
      if ((e as ToggleEvent).newState !== 'open') {
        ctrl?.abort();
        window.removeEventListener('scroll', close, true);
        window.removeEventListener('resize', close);
        return;
      }
      // It's pinned to the heart, so it closes instead of drifting away on scroll.
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
      pop!.querySelector<HTMLElement>('a')?.focus();
      if (cachedReactionCounts(articleId)) return;
      ctrl = new AbortController();
      setFailed(false);
      fetchReactionCounts(articleId, ctrl.signal)
        .then(setCounts)
        .catch((err) => {
          if (!(err instanceof DOMException && err.name === 'AbortError')) setFailed(true);
        });
    }

    pop.addEventListener('beforetoggle', onBeforeToggle);
    pop.addEventListener('toggle', onToggle);
    return () => {
      ctrl?.abort();
      pop.removeEventListener('beforetoggle', onBeforeToggle);
      pop.removeEventListener('toggle', onToggle);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [articleId]);

  // Arrow keys, Home and End move between the emoji. Esc is handled by the popover.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a'));
    const i = links.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'ArrowRight' ? links[(i + 1) % links.length]
      : e.key === 'ArrowLeft' ? links[(i - 1 + links.length) % links.length]
      : e.key === 'Home' ? links[0]
      : e.key === 'End' ? links[links.length - 1]
      : null;
    if (!next) return;
    e.preventDefault();
    next.focus();
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="reaction-btn"
        popoverTarget={popId}
        aria-haspopup="dialog"
        title="Reactions"
      >
        <Heart size={14} aria-hidden="true" />
        <span className="sr-only">Reactions: </span>
        {formatCount(total)}
      </button>
      <div ref={popRef} id={popId} popover="auto" className="reaction-pop" role="dialog" aria-label="Reactions" onKeyDown={onKeyDown}>
        <ul className="reaction-list">
          {REACTIONS.map((r) => {
            const count = counts ? formatCount(counts[r.category]) : failed ? '?' : null;
            return (
              <li key={r.category}>
                <a
                  className="reaction-item"
                  href={url}
                  title={`${r.label}. React on DEV`}
                  aria-label={`${r.label}${count ? `, ${count}` : ''}. React on DEV`}
                >
                  <span className="reaction-emoji" aria-hidden="true">
                    {r.emoji}
                  </span>
                  <span className="reaction-count" aria-hidden="true">
                    {count ?? <span className="sk reaction-sk" />}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <p className="reaction-note">{failed ? "Couldn't load counts" : 'Opens the post on DEV'}</p>
      </div>
    </>
  );
}
