/* Per-device preferences and the signed-in person (decision M10). Kept in localStorage under the prototype's key, so the
   look, theme and language a member chose survive reloads. Records never live here. */
import { createStore } from '@/lib/store';
import type { DivisionId, PersonId } from '@/types/workspace';

export type Look = 'simple' | 'comfortable' | 'compact';
export type Theme = 'light' | 'dark' | 'system';

export interface Session {
  /** The person this browser acts as. Production: the person linked to the Google account. Demo: the picked persona. */
  me?: PersonId;
  /** The workspace (division) being viewed. */
  ws?: DivisionId;
  lang?: 'en' | 'id';
  theme?: Theme;
  look?: Look;
  /** Older "Text and spacing" choice; `compact` maps to the Compact look. */
  density?: 'comfortable' | 'compact';
  /** The "More tools" / workspace-tools group: open or closed, once the member chose. */
  navMore?: boolean;
  /** Collapsible sections the member opened or closed (D55), by key. */
  fdisc?: Record<string, boolean>;
  /** Release preview (D58): an Admin shows the pages planned for later releases. */
  preview?: boolean;
  /** Demo sign-in: the persona list is showing. */
  picking?: boolean;
  /** A pending member waiting for approval. */
  waiting?: PersonId;
  [key: string]: unknown;
}

const KEY = 'dwdg-one-proto-session';

function load(): Session {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return typeof parsed === 'object' && parsed !== null ? (parsed as Session) : {};
  } catch {
    return {};
  }
}

export const sessionStore = createStore<Session>(load());

/** Changes preferences and remembers them on this device. Returns false when the browser refused to store them. */
export function setSession(patch: Partial<Session> | ((s: Session) => Session)): boolean {
  const cur = sessionStore.get();
  const next = typeof patch === 'function' ? patch(cur) : { ...cur, ...patch };
  sessionStore.set(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export const look = (s: Session = sessionStore.get()): Look =>
  s.look === 'simple' || s.look === 'comfortable' || s.look === 'compact'
    ? s.look
    : s.density === 'compact'
      ? 'compact'
      : 'comfortable';
export const density = (s: Session = sessionStore.get()) => (look(s) === 'compact' ? 'compact' : 'comfortable');
