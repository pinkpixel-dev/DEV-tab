import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { MessageCircle } from 'lucide-react';
import { cachedPreviews, fetchPreviews, type CommentPreview } from '@/lib/api/comments';
import { formatCount, timeAgo } from '@/lib/format';
import './comments.css';

interface Props {
  articleId: number;
  url: string;
  count: number;
}

const POP_WIDTH = 320;
const EDGE = 8;

/**
 * The comment count on a card. It opens the three newest comments as plain
 * text, each linking to the comment on DEV.
 */
export function CommentPreviews({ articleId, url, count }: Props) {
  const popId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [previews, setPreviews] = useState<CommentPreview[] | null>(() => cachedPreviews(articleId));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const pop = popRef.current;
    const btn = btnRef.current;
    if (!pop || !btn) return;
    let ctrl: AbortController | null = null;
    const close = () => pop.hidePopover();

    function onBeforeToggle(e: Event) {
      if ((e as ToggleEvent).newState !== 'open') return;
      // Fixed under the button, nudged left as far as it needs to stay on
      // screen. On a phone it's as wide as the screen allows.
      const r = btn!.getBoundingClientRect();
      const width = Math.min(POP_WIDTH, window.innerWidth - EDGE * 2);
      pop!.style.width = `${width}px`;
      pop!.style.top = `${r.bottom + 6}px`;
      pop!.style.left = `${Math.max(EDGE, Math.min(r.left, window.innerWidth - width - EDGE))}px`;
    }

    function onToggle(e: Event) {
      if ((e as ToggleEvent).newState !== 'open') {
        ctrl?.abort();
        window.removeEventListener('scroll', close, true);
        window.removeEventListener('resize', close);
        return;
      }
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
      pop!.querySelector<HTMLElement>('a')?.focus();
      if (cachedPreviews(articleId)) return;
      ctrl = new AbortController();
      setFailed(false);
      fetchPreviews(articleId, ctrl.signal)
        .then((p) => {
          setPreviews(p);
          // The first link only exists once the comments are in.
          requestAnimationFrame(() => pop!.querySelector<HTMLElement>('a')?.focus());
        })
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

  // Up and down arrows move between the links. Esc is handled by the popover.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a'));
    const i = links.indexOf(document.activeElement as HTMLElement);
    const next = links[(i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length];
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
        title="Latest comments"
      >
        <MessageCircle size={14} aria-hidden="true" />
        <span className="sr-only">Comments: </span>
        {formatCount(count)}
      </button>
      <div ref={popRef} id={popId} popover="auto" className="comment-pop" role="dialog" aria-label="Latest comments" onKeyDown={onKeyDown}>
        {failed ? (
          <p className="comment-note">Couldn't load comments</p>
        ) : !previews ? (
          <ul className="comment-list" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="comment-sk">
                <span className="sk comment-sk-line" />
                <span className="sk comment-sk-line" />
              </li>
            ))}
          </ul>
        ) : previews.length === 0 ? (
          <p className="comment-note">No comments to show</p>
        ) : (
          <ul className="comment-list">
            {previews.map((c) => (
              <li key={c.id}>
                <a className="comment-item" href={c.url}>
                  <span className="comment-meta">
                    {c.avatar ? (
                      <img className="avatar" src={c.avatar} alt="" width={20} height={20} loading="lazy" />
                    ) : (
                      <span className="avatar avatar-initial" aria-hidden="true">
                        {c.username.charAt(0)}
                      </span>
                    )}
                    <span className="comment-name">{c.name}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={c.createdAt}>{timeAgo(c.createdAt)}</time>
                  </span>
                  <span className="comment-text">{c.text}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <a className="comment-all" href={`${url}#comments`}>
          See all {formatCount(count)} on DEV
        </a>
      </div>
    </>
  );
}
