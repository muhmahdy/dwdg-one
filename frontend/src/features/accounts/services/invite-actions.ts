/* Invitations (access_invitation, flow-admin-invite, flow-invite-accept, security_auth D2): invite only. The invited Google
   account accepts, then the Admin approves each member. dwdg'ONE does not send email yet; the link is copied and sent by
   hand. From screens/accounts.js. */
import type { Draft } from 'immer';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { addDays, dShort, nowStamp, today } from '@/lib/time';
import { logChange } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import { isAdmin } from '@/lib/roles';
import type { DivisionId, Person, Workspace } from '@/types/workspace';
import { acctDraft, admins, invState, mailOf, type Invite } from './acct-data';
import { alog, memberLink, meId, notifyLink } from './audit';
import { reviewer } from './rules';

export const inviteUrl = (id: string) => `${location.href.split('#')[0]}#/invite/${id}`;
const EMAIL = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/;
export const validEmail = (s: string) => EMAIL.test(s.trim().toLowerCase());

const hist = (i: Draft<Invite>, verb: string, note = '', by = meId()) => {
  i.history.unshift({ at: nowStamp(), by, verb, note });
};

export interface NewInvite {
  name: string;
  email: string;
  div: DivisionId;
  /** Days the link works. */
  days: number;
}

/** What blocks a new invitation, as a field and a message (a duplicate open invitation or an existing member). */
export function inviteProblem(db: Workspace, f: NewInvite): { field: 'name' | 'email'; text: string } | null {
  const email = f.email.trim().toLowerCase();
  if (!f.name.trim()) return { field: 'name', text: t('Write the person’s name.') };
  if (!validEmail(email)) return { field: 'email', text: t('Enter a full Google account address.') };
  const open = (db.acct as { invites?: Invite[] } | undefined)?.invites?.find(
    (i) => i.email.toLowerCase() === email && ['pending', 'accepted'].includes(invState(i)),
  );
  if (open)
    return {
      field: 'email',
      text: t('{who} already has an open invitation for this address. Open it from the list instead.', {
        who: open.name,
      }),
    };
  const member = db.people.find((p) => p.status !== 'declined' && mailOf(p).toLowerCase() === email);
  if (member)
    return {
      field: 'email',
      text: t('{who} is already a member with this account. Use a move or an appointment instead.', {
        who: member.name,
      }),
    };
  return null;
}

/** A person with the same name (not proof of the same person; the creator decides). */
export const sameName = (db: Workspace, name: string) =>
  db.people.find((p) => p.name.toLowerCase() === name.trim().toLowerCase());

/** Creates an invitation and returns its id (null when not saved). Repeated submits never make a second one. */
export async function createInvite(f: NewInvite) {
  const me = getMe();
  if (!me || !reviewer(me)) return null;
  const i: Invite = {
    id: uid('inv-'),
    name: f.name.trim(),
    email: f.email.trim().toLowerCase(),
    div: f.div,
    role: 'member',
    batch: '2026',
    expires: addDays(today(), f.days),
    state: 'pending',
    person: null,
    delivery: null,
    createdBy: me.id,
    createdAt: nowStamp(),
    acceptedAt: null,
    acceptedAs: null,
    approvedBy: null,
    approvedAt: null,
    revokedBy: null,
    revokedAt: null,
    reason: '',
    version: 1,
    history: [{ at: nowStamp(), by: me.id, verb: 'created the invitation', note: '' }],
  };
  const ok = await act(({ db, toast }) => {
    acctDraft(db).invites.push(i);
    alog(db, 'created the invitation', null, { name: i.name, ref: `invites/${i.id}` });
    toast(t('Invitation ready. Copy the link and send it yourself.'), ({ db: u }) => {
      const x = acctDraft(u).invites.find((y) => y.id === i.id);
      if (!x) return;
      Object.assign(x, { state: 'revoked', revokedBy: meId(), revokedAt: nowStamp(), reason: 'Undone' });
      hist(x, 'revoked the invitation', 'Undone');
    });
  });
  return ok ? i.id : null;
}

function change(
  id: string,
  apply: (i: Draft<Invite>, db: Draft<Workspace>) => string | null,
  undo?: (i: Draft<Invite>, db: Draft<Workspace>) => void,
) {
  return act(({ db, ui, toast }) => {
    const i = acctDraft(db).invites.find((x) => x.id === id);
    if (!i) return;
    const prev = JSON.parse(JSON.stringify(i)) as Invite;
    const msg = apply(i, db);
    ui.form = null;
    if (msg)
      toast(msg, ({ db: u }) => {
        const x = acctDraft(u).invites.find((y) => y.id === id);
        if (!x) return;
        Object.assign(x, prev);
        undo?.(x, u);
      });
  });
}

/** Marks the link as shared (nothing is sent by dwdg'ONE). */
export async function copyInviteLink(id: string) {
  try {
    await navigator.clipboard.writeText(inviteUrl(id));
  } catch {
    /* clipboard unavailable: the toast still tells them to send it themselves */
  }
  await act(({ db }) => {
    const i = acctDraft(db).invites.find((x) => x.id === id);
    if (!i) return;
    i.delivery = { by: meId(), at: nowStamp() };
    hist(i, 'copied the invitation link');
  });
  showToast(t('Link copied. dwdg’ONE doesn’t send email yet, so send it yourself.'));
}

export const correctInvite = (id: string, f: { name: string; email: string; div: DivisionId }) =>
  change(
    id,
    (i) => {
      if (invState(i) !== 'pending') return null;
      const prevMail = i.email;
      const email = f.email.trim().toLowerCase();
      Object.assign(i, { name: f.name.trim(), email, div: f.div, version: i.version + 1, delivery: null });
      hist(i, 'corrected the invitation', prevMail !== email ? `${prevMail} → ${email}` : '');
      return t('Corrected. The old link no longer works.');
    },
    (i) => {
      hist(i, 'reversed a correction');
    },
  );

export const revokeInvite = (id: string, why: string) =>
  change(
    id,
    (i, db) => {
      Object.assign(i, { state: 'revoked', revokedBy: meId(), revokedAt: nowStamp(), reason: why });
      hist(i, 'revoked the invitation', why);
      alog(db, 'revoked the invitation', null, { name: i.name, reason: why, ref: `invites/${i.id}` });
      return t('Revoked. The link never works again.');
    },
    (i) => {
      i.revokedBy = null;
      hist(i, 'reversed revoking');
    },
  );

export const renewInvite = (id: string) =>
  change(id, (i) => {
    i.expires = addDays(today(), 14);
    i.state = 'pending';
    i.version += 1;
    i.delivery = null;
    hist(i, 'renewed the invitation');
    return t('Renewed until {d}. Copy the new link.', { d: dShort(i.expires) });
  });

/** Records the Admin's answer on an accepted invitation. Also used when Settings approves the same person. */
export function finishApproval(db: Draft<Workspace>, i: Draft<Invite>, ok: boolean, why: string) {
  const p = db.people.find((x) => x.id === i.person);
  const a = acctDraft(db);
  i.state = ok ? 'active' : 'declined';
  i.approvedBy = ok ? meId() : null;
  i.approvedAt = ok ? nowStamp() : null;
  hist(i, ok ? 'approved the member' : 'did not approve the member', why);
  if (p) {
    if (ok) {
      p.joined = p.joined ?? today();
      if (p.div && !a.memberships.some((x) => x.person === p.id && !x.to))
        a.memberships.push({ id: uid('ms'), person: p.id, div: p.div, from: today(), to: null, by: meId() });
      logChange(db, p.div, 'approved the membership of', memberLink(p));
      notifyLink(db, p.id, 'acct-approved', 'welcome', t('Welcome'));
    }
    alog(db, ok ? 'approved the member' : 'did not approve the member', p, { reason: why, ref: `invites/${i.id}` });
  }
}

export const approveInvite = (id: string) =>
  act(({ db, toast }) => {
    const me = getMe();
    const a = acctDraft(db);
    const i = a.invites.find((x) => x.id === id);
    const p = db.people.find((x) => x.id === i?.person);
    if (!me || !isAdmin(me) || !i || !p || invState(i) !== 'accepted') return;
    const prevP = { status: p.status, joined: p.joined };
    p.status = 'active';
    finishApproval(db, i, true, '');
    toast(t('{who} can now sign in', { who: p.name }), ({ db: u }) => {
      const x = u.people.find((y) => y.id === p.id);
      const ix = acctDraft(u).invites.find((y) => y.id === id);
      if (!x || !ix) return;
      Object.assign(x, prevP);
      ix.state = 'accepted';
      ix.approvedBy = null;
      hist(ix, 'reversed the approval');
      logChange(u, x.div, 'reversed an account change for', memberLink(x));
    });
  });

export const declineInvite = (id: string, why: string) =>
  act(({ db, ui, toast }) => {
    const i = acctDraft(db).invites.find((x) => x.id === id);
    const p = db.people.find((x) => x.id === i?.person);
    if (!i || !p || !isAdmin(getMe())) return;
    p.status = 'declined';
    finishApproval(db, i, false, why);
    ui.form = null;
    toast(t('{who} was not approved', { who: p.name }));
  });

/** The invited account accepts (demo: the public link page). A revoke that wins the race leaves no membership. */
export async function acceptInvite(id: string) {
  const db0 = getDb();
  const i0 = (db0.acct as { invites?: Invite[] } | undefined)?.invites?.find((x) => x.id === id);
  if (!i0 || invState(i0) !== 'pending') return false;
  const p: Person = {
    id: uid('m-'),
    name: i0.name,
    first: i0.name.split(' ')[0] ?? i0.name,
    div: i0.div,
    role: i0.role,
    photo: null,
    title: '',
    admin: false,
    hasSchedule: false,
    gcal: false,
    status: 'pending',
    email: i0.email,
    linkedin: null,
    phone: null,
    hidePhone: false,
  };
  const ok = await act(
    ({ db }) => {
      const i = acctDraft(db).invites.find((x) => x.id === id);
      if (!i || invState(i) !== 'pending') return;
      db.people.push(p);
      Object.assign(i, { state: 'accepted', person: p.id, acceptedAt: nowStamp(), acceptedAs: i.email });
      hist(i, 'accepted the invitation', '', p.id);
      alog(db, 'accepted the invitation', p, { actor: p.id, ref: `invites/${i.id}` });
      for (const to of [...admins(db as Workspace).map((x) => x.id), i.createdBy])
        notifyLink(db, to, 'acct-accepted', `invites/${i.id}`, p.name, p.id);
    },
    { system: true },
  );
  return ok ? p.id : null;
}
