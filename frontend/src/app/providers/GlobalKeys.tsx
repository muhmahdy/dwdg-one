/* The keys and clicks that work anywhere once signed in (core/app.js keydown): Ctrl K search, Ctrl , settings, Ctrl Z / Ctrl Y undo and
   redo (while typing, the field keeps its own undo), Escape closes the front-most layer, N adds a task, M starts a meeting, and a
   click on any avatar opens that person's panel (D33). Pickers, menus, links and buttons keep their own clicks. */
import { useEffect } from 'react';
import { openPerson } from '@/lib/open';
import { go } from '@/app/router/navigation';
import { closeInspector } from '@/components/shared/Inspector';
import { openComposer } from '@/features/schedule/services/composer-state';
import { getDb } from '@/lib/workspace/hooks';
import { redoLast, setUi, uiStore, undoLast } from '@/lib/workspace/transaction';

export function GlobalKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el?.closest('input, textarea, select, [contenteditable]');
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && e.key === ',') {
        e.preventDefault();
        setUi((u) => {
          u.menu = null;
        });
        go('settings');
        return;
      }
      if (mod && k === 'k') {
        e.preventDefault();
        setUi((u) => {
          u.menu = null;
          u.palette = true;
        });
        return;
      }
      if (!typing && mod && !e.altKey) {
        if (k === 'z' && !e.shiftKey) {
          e.preventDefault();
          void undoLast();
          return;
        }
        if (k === 'y' || (k === 'z' && e.shiftKey)) {
          e.preventDefault();
          void redoLast();
          return;
        }
      }
      if (e.defaultPrevented) return;
      const ui = uiStore.get();
      if (e.key === 'Escape') {
        if (ui.draft || ui.composer) return;
        if (ui.palette || ui.menu) {
          setUi((u) => {
            u.palette = false;
            u.menu = null;
          });
        } else if (ui.insp) closeInspector();
        return;
      }
      if (!typing && !ui.composer && !mod && !e.altKey && !ui.palette && !ui.menu) {
        if (k === 'n') {
          e.preventDefault();
          go('work');
          setUi((u) => {
            u.focusQuickAdd = Date.now();
          });
        } else if (k === 'm') {
          e.preventDefault();
          openComposer();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  useEffect(() => {
    const SKIP =
      'a, button, label, input, select, textarea, nav, [role=menu], [role=menuitem], [role=menuitemradio], [role=option], [role=listbox], [role=dialog], [role=tab], [data-no-person]';
    const onClick = (e: MouseEvent) => {
      const av = (e.target as HTMLElement | null)?.closest<HTMLElement>('.av:not(.more)');
      if (!av || e.defaultPrevented || av.closest(SKIP)) return;
      const name = av.getAttribute('alt') ?? av.getAttribute('aria-label') ?? av.getAttribute('title');
      const person = name ? getDb().people.find((x) => x.name === name) : undefined;
      if (!person) return;
      e.preventDefault();
      e.stopPropagation();
      openPerson(person.id);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, []);
  return null;
}
