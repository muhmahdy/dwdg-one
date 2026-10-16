/* Who is signed in, and the demo persona picker (decision M9). Ports core/app.js pick/signout and their extensions in
   screens/accounts.js (paused or ended accounts) and screens/perf.js (the Board of Supervisors demo account). */
import { env } from '@/app/config/env';
import { go } from '@/app/router/navigation';
import { inShip } from '@/app/router/routes';
import { sessionStore, setSession } from '@/lib/session';
import { act, setUi, workspaceStore } from '@/lib/workspace/transaction';
import { acctOf, needsWelcome } from '@/features/accounts/services/acct-data';
import type { Person, Workspace } from '@/types/workspace';
import { signOutEverywhere } from './auth';

export const BLOCKED = ['suspended', 'left', 'alumni', 'declined'];
export const isBlocked = (status: string) => BLOCKED.includes(status);

export const BLOCKED_TEXT: Record<string, [string, string]> = {
  suspended: [
    'Your access is paused',
    'An authorized leader paused this account. Ask your Director or HR if you think this is a mistake.',
  ],
  left: [
    'Your membership has ended',
    'Your work stays in DWDG UII under your name. This account can no longer open the workspace.',
  ],
  alumni: [
    'Your term has ended',
    'Thank you for your work. Alumni access is not set up yet, so this account can’t open the workspace.',
  ],
  declined: [
    'Your membership was not approved',
    'Ask the person who invited you. Nothing from the organization is shown to this account.',
  ],
};

/* The demo Board of Supervisors account (D29, access_board_scope). It never appears in pickers or mentions, so the
   prototype adds the record only while signed out or while it is the signed-in account. */
const BOARD: Person = {
  id: 'board-hadi',
  name: 'Hadi Santoso',
  first: 'Hadi',
  div: null,
  role: 'board',
  photo: null,
  title: 'Board of Supervisors',
  admin: false,
  hasSchedule: false,
  gcal: false,
  status: 'active',
  board: true,
  joined: '2026-09-01',
  linkedin: null,
  phone: null,
  hidePhone: true,
};

// Demo accounts, in the prototype's order: twelve core personas, then the ones each division added for its walkthroughs.
const PERSONAS = [
  'mahdy',
  'salsa',
  'raka',
  'fadhil',
  'kirana',
  'rani',
  'galih',
  'daniel',
  'reza',
  'citra',
  'dimas',
  'sekar',
  'arief',
  'rafi',
  'hana',
  'zahra',
];

export function demoPersonas(db: Workspace, preview: boolean | undefined): Person[] {
  const byId = new Map(db.people.map((p) => [p.id, p]));
  const list = PERSONAS.map((id) => byId.get(id)).filter((p): p is Person => !!p);
  // people who joined through an invitation in this demo are accounts too (except Sekar, already listed)
  for (const i of acctOf(db).invites) {
    const p = i.person ? byId.get(i.person) : undefined;
    if (p && !list.includes(p)) list.push(p);
  }
  if (inShip('oversight', preview)) list.push(BOARD);
  return list;
}

export const isBoard = (p: Person | undefined) => !!p && (p.role === 'board' || !!p.board);

/** Demo only: act as a persona. A pending persona sees the waiting screen; a paused or ended one sees why. */
export function pickPersona(id: string) {
  const db = workspaceStore.get();
  const p = id === BOARD.id ? BOARD : db?.people.find((x) => x.id === id);
  if (!p) return;
  if (isBlocked(p.status)) {
    setSession({ blocked: id, picking: false });
    return;
  }
  if (p.status === 'pending') {
    setSession({ waiting: id });
    return;
  }
  void syncBoard(p.id).then(() => {
    setSession({ me: id, ws: p.div ?? 'sng', picking: false });
    const w = workspaceStore.get();
    go(isBoard(p) ? 'oversight' : w && needsWelcome(w, p) ? 'welcome' : 'work', {
      replace: true,
    });
  });
}

/** Keeps the demo Board record in the workspace exactly while the Board account is signed in. */
export function syncBoard(meId: string | undefined) {
  if (!env.demo) return Promise.resolve(true);
  const present = workspaceStore.get()?.people.some((p) => p.id === BOARD.id) ?? false;
  const want = meId === BOARD.id;
  if (present === want) return Promise.resolve(true);
  return act(
    ({ db }) => {
      if (want) db.people.push({ ...BOARD });
      else db.people = db.people.filter((p) => p.id !== BOARD.id);
    },
    { system: true },
  );
}

export async function signOut() {
  const s = sessionStore.get();
  setSession(() => ({ ...(s.theme ? { theme: s.theme } : {}), ...(s.lang ? { lang: s.lang } : {}) }));
  setUi((ui) => {
    ui.insp = null;
    ui.menu = null;
  });
  go('work', { replace: true });
  if (env.demo) await syncBoard(undefined);
  else await signOutEverywhere();
}
