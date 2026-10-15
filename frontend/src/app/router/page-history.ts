/* Back and forward between page states (D45, engineering-routing). A page state is the route plus what the side panel
   shows, so opening or switching the panel is a step too; each state remembers its scroll and gets it back on return.
   Port of core/app.js PH / phGo; the top bar's history buttons use it. */
import { createStore } from '@/lib/store';
import type { InspectorRef } from '@/app/ui-state';

export interface PageState {
  key: string;
  path: string;
  insp: InspectorRef | null;
  scroll: number;
}

interface PH {
  s: PageState[];
  i: number;
  /** Set while Back/Forward restores a state, so the visit is not recorded as a new step. */
  jumping: boolean;
}

export const pageHistory = createStore<PH>({ s: [], i: -1, jumping: false });

const LIMIT = 100;
export const stateKey = (path: string, insp: InspectorRef | null) =>
  `${path}|${insp ? `${insp.type}:${insp.id ?? insp.kind ?? ''}` : ''}`;

/** Records a visit (called after each render of a new page state). */
export function recordVisit(path: string, insp: InspectorRef | null, keptScroll: number) {
  const h = pageHistory.get();
  const key = stateKey(path, insp);
  if (h.jumping) {
    pageHistory.set({ ...h, jumping: false });
    return;
  }
  if (h.s[h.i]?.key === key) return;
  const s = [...h.s.slice(0, h.i + 1), { key, path, insp: insp ? { ...insp } : null, scroll: keptScroll }].slice(
    -LIMIT,
  );
  pageHistory.set({ s, i: s.length - 1, jumping: false });
}

/** Remembers the scroll of the current state before leaving it. */
export function rememberScroll(path: string, insp: InspectorRef | null, scroll: number) {
  const h = pageHistory.get();
  const cur = h.s[h.i];
  if (cur?.key !== stateKey(path, insp) || cur.scroll === scroll) return;
  const s = h.s.slice();
  s[h.i] = { ...cur, scroll };
  pageHistory.set({ ...h, s });
}

/** Moves to entry `i`; returns it so the caller can navigate and restore panel and scroll. */
export function jump(i: number): PageState | null {
  const h = pageHistory.get();
  const e = h.s[i];
  if (!e) return null;
  pageHistory.set({ ...h, i, jumping: true });
  return e;
}
