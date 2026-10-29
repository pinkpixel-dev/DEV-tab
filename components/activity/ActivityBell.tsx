import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { Bell, Heart } from 'lucide-react';
import type { ActivityItem } from '@/lib/activity';
import { NOTIFICATIONS_URL } from '@/lib/notify';
import { timeAgo } from '@/lib/format';
import './activity.css';

interface Props {
  items: ActivityItem[];
  unread: number;
  seenAt: number;
  ready: boolean;
  failed: boolean;
  onClose: () => void;
}

const POP_WIDTH = 380;

const VERBS: Record<ActivityItem['kind'], string> = {
  comment: 'commented on',
  reply: 'replied to you on',
  follower: 'followed you',
  reactions: '',
};

function Line({ item }: { item: ActivityItem }) {
  if (item.kind === 'reactions') {
    const n = item.count ?? 0;
    return (
      <>
        <strong>
          {n} new reaction{n === 1 ? '' : 's'}
        </strong>{' '}
        on {item.postTitle}
      </>
    );
  }
  return (
    <>
      <strong>{item.actor?.name}</strong> {VERBS[item.kind]}
      {item.postTitle && <> {item.postTitle}</>}
    </>
  );
}

/**
 * The bell in the top bar. It lists comments, replies, reactions and
 * followers found since you connected your key, newest first. Things found
 * after you last opened it are marked new, and closing it marks them seen.
 */
export function ActivityBell({ items, unread, seenAt, ready, failed, onClose }: Props) {
  const popId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pop = popRef.current;
    const btn = btnRef.current;
    if (!pop || !btn) return;
    const close = () => pop.hidePopover();

    function onBeforeToggle(e: Event) {
      if ((e as ToggleEvent).newState !== 'open') return;
      // Lined up with the bell's right edge, nudged over when that would push
      // it off the left side. Matches the width in activity.css.
      // clientWidth leaves out the scrollbar, which innerWidth includes.
      const r = btn!.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const width = Math.min(POP_WIDTH, vw - 16);
      const right = Math.min(vw - r.right, vw - width - 8);
      pop!.style.top = `${r.bottom + 6}px`;
      pop!.style.right = `${Math.max(8, right)}px`;
    }

    function onToggle(e: Event) {
      if ((e as ToggleEvent).newState === 'open') {
        window.addEventListener('resize', close);
        pop!.querySelector<HTMLElement>('a')?.focus();
        return;
      }
      window.removeEventListener('resize', close);
      onClose();
    }

    pop.addEventListener('beforetoggle', onBeforeToggle);
    pop.addEventListener('toggle', onToggle);
    return () => {
      pop.removeEventListener('beforetoggle', onBeforeToggle);
      pop.removeEventListener('toggle', onToggle);
      window.removeEventListener('resize', close);
    };
  }, [onClose]);

  // Up and down move through the list. Esc is handled by the popover.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a'));
    const i = links.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'ArrowDown' ? links[(i + 1) % links.length]
      : e.key === 'ArrowUp' ? links[(i - 1 + links.length) % links.length]
      : e.key === 'Home' ? links[0]
      : e.key === 'End' ? links[links.length - 1]
      : null;
    if (!next) return;
    e.preventDefault();
    next.focus();
  }

  const label = unread ? `Activity, ${unread} new` : 'Activity';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="btn icon-btn activity-btn"
        popoverTarget={popId}
        aria-haspopup="dialog"
        aria-label={label}
        title={label}
      >
        <Bell size={16} aria-hidden="true" />
        {unread > 0 && (
          <span className="activity-count" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <div ref={popRef} id={popId} popover="auto" className="activity-pop" role="dialog" aria-label="Activity" onKeyDown={onKeyDown}>
        <div className="activity-head">
          <h2>Activity</h2>
          {unread > 0 && <span className="activity-new-count">{unread} new</span>}
        </div>
        {items.length === 0 ? (
          <p className="activity-empty">
            {failed ? "Couldn't check DEV for activity." : ready ? 'Nothing new yet.' : 'Checking DEV…'}
          </p>
        ) : (
          <ul className="activity-list">
            {items.map((item) => {
              const isNew = item.foundAt > seenAt;
              return (
                <li key={item.id}>
                  <a className="activity-item" href={item.url} data-new={isNew || undefined}>
                    {item.actor?.avatar ? (
                      <img className="activity-avatar" src={item.actor.avatar} alt="" width={32} height={32} loading="lazy" />
                    ) : item.actor ? (
                      <span className="activity-avatar activity-avatar-initial" aria-hidden="true">
                        {item.actor.name.slice(0, 1).toUpperCase()}
                      </span>
                    ) : (
                      <span className="activity-avatar activity-avatar-icon" aria-hidden="true">
                        <Heart size={15} />
                      </span>
                    )}
                    <span className="activity-body">
                      <span className="activity-line">
                        {isNew && <span className="sr-only">New: </span>}
                        <Line item={item} />
                      </span>
                      {item.excerpt && <span className="activity-excerpt">{item.excerpt}</span>}
                      <span className="activity-time">{timeAgo(item.at)}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
        <a className="activity-foot" href={NOTIFICATIONS_URL}>
          All notifications on DEV
        </a>
      </div>
    </>
  );
}
