import { useEffect, type RefObject } from 'react';

const CARD_LINK = '[data-card-link]';

function isTyping(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

// Cards in the first row share the same top offset, which gives the column count.
function columnCount(links: HTMLElement[]): number {
  const cardTop = (l: HTMLElement) => (l.closest('article') ?? l).getBoundingClientRect().top;
  const first = links[0];
  if (!first) return 1;
  const top = cardTop(first);
  const cols = links.findIndex((l) => cardTop(l) !== top);
  return cols === -1 ? links.length : cols;
}

/**
 * `/` focuses search. Arrow keys move focus between cards in the grid,
 * and Enter opens the focused card because it's a real link.
 */
export function useKeyboardNav(searchRef: RefObject<HTMLInputElement | null>, gridRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/' && !isTyping(document.activeElement)) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!arrows.includes(e.key) || isTyping(document.activeElement) || !gridRef.current) return;

      const links = Array.from(gridRef.current.querySelectorAll<HTMLElement>(CARD_LINK));
      if (links.length === 0) return;

      const current = links.indexOf(document.activeElement as HTMLElement);
      // Focus is on another control (tab, tag chip): leave its arrow keys alone.
      if (current === -1 && document.activeElement !== document.body) return;
      // Nothing focused yet: any arrow key lands on the first card.
      if (current === -1) {
        e.preventDefault();
        links[0]?.focus();
        return;
      }

      const cols = columnCount(links);
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key] ?? 0;
      const next = links[current + step];
      if (next) {
        e.preventDefault();
        next.focus();
        next.scrollIntoView({ block: 'nearest' });
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchRef, gridRef]);
}
