/* Member of the Month and the HR to MCIT publication handoff (hr_member_month, W048, S037, S038, blueprint §7 and §12): a panel
   shortlists and decides from finalized cycles, never from task counts; the member approves what is published; MCIT records
   the actual announcement. The decision and the announcement are separate steps. From divisions/div-hr-sng.js. */
import { go } from '@/app/router/navigation';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { D, iso, nowStamp } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import { hrLead, isBoard, isTop } from '@/lib/roles';
import { rank } from '@/lib/access';
import type { DateStr, EntityRef, Person, PersonId, Workspace } from '@/types/workspace';
import { hrDraft, hrOf, monthName, type HrCycle, type HrPacket, type HrRound, type PacketState } from './hr-data';
import { cycleCounts } from './monitoring';

type Def = [label: string, icon: string, tone: 'ink2' | 'green' | 'mute' | 'warn'];
export const RDS: Record<string, Def> = {
  open: ['Collecting evidence', 'edit', 'ink2'],
  decided: ['Decided', 'check', 'green'],
  noaward: ['No award this month', 'minus', 'mute'],
};
export const rdsDef = (s: string): Def => RDS[s] ?? ['Collecting evidence', 'edit', 'ink2'];
export const PKS: Record<PacketState, Def> = {
  draft: ['Draft', 'edit', 'mute'],
  requested: ['Requested', 'upload', 'ink2'],
  accepted: ['Accepted', 'check', 'green'],
  returned: ['Returned', 'undo', 'warn'],
  fulfilled: ['Announced', 'globe', 'green'],
  cancelled: ['Canceled', 'close', 'mute'],
};
export const CONSENT: Record<string, Def> = {
  asked: ['Waiting for the member', 'clock', 'warn'],
  given: ['Member approved', 'check', 'green'],
  declined: ['Member declined', 'close', 'mute'],
};

export const rdOf = (db: Workspace, id: string) => hrOf(db)?.rounds.find((x) => x.id === id);
export const pkOf = (db: Workspace, id: string | null | undefined) => hrOf(db)?.packets.find((x) => x.id === id);
export const rdName = (rd: HrRound) => t('Member of the Month, {m}', { m: monthName(rd.month) });
export const onPanel = (m: Person | undefined, rd: HrRound) =>
  !!m && rd.panel.includes(m.id) && !rd.recused.some((x) => x.p === m.id);
export const canSeeRound = (m: Person | undefined, rd: HrRound) =>
  !!m && !isBoard(m) && (rd.panel.includes(m.id) || hrLead(m) || isTop(m));
export const mcitReceiver = (m: Person | undefined, pk: HrPacket) =>
  !!m && (pk.receiver === m.id || (m.div === 'mcit' && rank(m) >= 2));

/** Every included cycle must be finalized with no open correction request before the shortlist counts as complete (S037). */
export function coverage(db: Workspace, rd: HrRound) {
  const cycles = rd.cycles.map((id) => hrOf(db)?.cycles.find((c) => c.id === id)).filter((c): c is HrCycle => !!c);
  return cycles.map((c) => {
    const k = cycleCounts(db, c);
    const done = ['final', 'closed'].includes(c.state);
    return { c, done, open: k.corr, ok: done && !k.corr };
  });
}
export const eligibleFor = (db: Workspace, rd: HrRound): PersonId[] => [
  ...new Set(
    rd.cycles
      .map((id) => hrOf(db)?.cycles.find((c) => c.id === id))
      .filter((c): c is HrCycle => !!c)
      .flatMap((c) => c.roster.filter((x) => !x.exempt).map((x) => x.p)),
  ),
];

const rdLink = (rd: HrRound): EntityRef => ({ type: 'link', id: rd.id, name: rdName(rd), h: `recognition/${rd.id}` });
const upd = (
  db: Parameters<typeof notify>[0],
  to: PersonId | null | undefined,
  type: string,
  title: string,
  h: string,
) => {
  notify(db, to, type, { type: 'link', id: h, h, name: title });
};
const rd$ = (db: Parameters<typeof hrDraft>[0], id: string) => hrDraft(db).rounds.find((x) => x.id === id);
const pk$ = (db: Parameters<typeof hrDraft>[0], id: string) => hrDraft(db).packets.find((x) => x.id === id);

export const addNomination = (roundId: string, person: PersonId, why: string) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const rd = rd$(db, roundId);
    if (!rd || !m) return;
    const s = { p: person, by: m.id, at: nowStamp(), why };
    rd.shortlist.push(s);
    ui.form = null;
    logChange(db, 'hr', 'added a nomination to', rdLink(rd));
    toast(t('Nomination added'), ({ db: u }) => {
      const x = rd$(u, roundId);
      if (x) x.shortlist = x.shortlist.filter((v) => !(v.p === person && v.at === s.at));
    });
  });
};

export const recordDecision = (roundId: string, winner: PersonId | null, rationale: string) => {
  const m = getMe();
  return act(({ db, toast }) => {
    const rd = rd$(db, roundId);
    if (!rd || !m || !onPanel(m, rd) || !coverage(db as Workspace, rd).every((x) => x.ok)) return;
    const prev = { state: rd.state, decision: rd.decision ? { ...rd.decision } : null };
    rd.decision = {
      winner,
      joint: null,
      rationale,
      by: m.id,
      at: nowStamp(),
      version: (rd.decision?.version ?? 0) + 1,
      noAward: winner === null,
    };
    rd.state = winner === null ? 'noaward' : 'decided';
    logChange(db, 'hr', 'recorded the decision for', rdLink(rd));
    toast(t('Decision recorded. Nothing is announced until MCIT records it.'), ({ db: u }) => {
      const x = rd$(u, roundId);
      if (x) Object.assign(x, prev);
    });
  });
};

/** A panel member confirms the decision or reopens it after a review flag; the earlier decision stays in the history. */
export const resolveFlag = (roundId: string, flagId: string, how: 'confirmed' | 'reopened') => {
  const m = getMe();
  return act(({ db, toast }) => {
    const rd = rd$(db, roundId);
    const f = rd?.flags.find((x) => x.id === flagId);
    if (!rd || !f || !onPanel(m, rd) || !m) return;
    f.state = how;
    f.by = m.id;
    f.resolvedAt = nowStamp();
    if (how === 'reopened') {
      (rd.history ??= []).push(rd.decision);
      rd.decision = null;
      rd.state = 'open';
    }
    logChange(
      db,
      'hr',
      how === 'confirmed' ? 'confirmed the decision after a review flag on' : 'reopened the decision on',
      rdLink(rd),
    );
    toast(
      how === 'confirmed'
        ? t('Decision confirmed')
        : t('Decision reopened. The earlier decision stays in the history.'),
    );
  });
};

export interface NewPacket {
  round: string;
  summary: string;
  photo: boolean;
  receiver: PersonId;
  neededBy: DateStr | null;
}

export const createPacket = (f: NewPacket) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const rd = rd$(db, f.round);
    if (!rd?.decision?.winner || rd.packet || !m) return;
    const pk: HrPacket = {
      id: uid('pk'),
      round: rd.id,
      person: rd.decision.winner,
      title: rdName(rd),
      summary: f.summary,
      photo: f.photo,
      consent: { state: 'asked', at: nowStamp() },
      receiver: f.receiver,
      state: 'draft',
      requestedAt: null,
      neededBy: f.neededBy,
      agreedDate: null,
      acceptedAt: null,
      returnNote: '',
      announcement: null,
      version: 1,
      createdBy: m.id,
      createdAt: nowStamp(),
    };
    hrDraft(db).packets.push(pk);
    rd.packet = pk.id;
    ui.form = null;
    upd(db, pk.person, 'hr-packet', pk.title, 'recognition');
    logChange(db, 'hr', 'prepared the publication packet for', rdLink(rd));
    toast(t('{who} was asked to approve the packet', { who: db.people.find((p) => p.id === pk.person)?.first ?? '' }));
  });
};

export const answerConsent = (packetId: string, v: 'given' | 'declined') =>
  act(({ db, toast }) => {
    const pk = pk$(db, packetId);
    if (!pk || pk.person !== getMe()?.id) return;
    pk.consent = { state: v, at: nowStamp() };
    upd(db, pk.createdBy, 'hr-packet-reply', pk.title, `recognition/${pk.round}`);
    toast(v === 'given' ? t('Thanks. HR can now send it to MCIT.') : t('HR will not send it for publication.'));
  });

export const sendPacket = (packetId: string) =>
  act(({ db, toast }) => {
    const pk = pk$(db, packetId);
    const rd = pk && rd$(db, pk.round);
    if (!pk || !rd || !hrLead(getMe()) || pk.consent.state !== 'given') return;
    const prev = { state: pk.state, requestedAt: pk.requestedAt, version: pk.version };
    if (pk.state === 'returned') pk.version += 1;
    pk.state = 'requested';
    pk.requestedAt = nowStamp();
    pk.returnNote = '';
    upd(db, pk.receiver, 'hr-packet', pk.title, `recognition/${pk.round}`);
    logChange(db, 'hr', 'sent a publication request to MCIT for', rdLink(rd));
    toast(
      t('Sent to {who} in MCIT', { who: db.people.find((p) => p.id === pk.receiver)?.first ?? '' }),
      ({ db: u }) => {
        const x = pk$(u, packetId);
        if (x) Object.assign(x, prev);
      },
    );
  });

const mcitGuard = (db: Parameters<typeof hrDraft>[0], id: string) => {
  const pk = pk$(db, id);
  const rd = pk && rd$(db, pk.round);
  return pk && rd && mcitReceiver(getMe(), pk) ? { pk, rd } : null;
};

export const acceptPacket = (packetId: string, agreed: DateStr | null) =>
  act(({ db, ui, toast }) => {
    const g = mcitGuard(db, packetId);
    if (!g) return;
    g.pk.state = 'accepted';
    g.pk.acceptedAt = nowStamp();
    g.pk.agreedDate = agreed ?? g.pk.neededBy;
    ui.form = null;
    upd(db, g.pk.createdBy, 'hr-packet-reply', g.pk.title, `recognition/${g.pk.round}`);
    logChange(db, 'hr', 'accepted the publication request for', rdLink(g.rd));
    toast(t('Request accepted'));
  });

export const returnPacket = (packetId: string, why: string) =>
  act(({ db, ui, toast }) => {
    const g = mcitGuard(db, packetId);
    if (!g) return;
    g.pk.state = 'returned';
    g.pk.returnNote = why;
    ui.form = null;
    upd(db, g.pk.createdBy, 'hr-packet-reply', g.pk.title, `recognition/${g.pk.round}`);
    logChange(db, 'hr', 'returned the publication request for', rdLink(g.rd));
    toast(t('Returned to HR'));
  });

/** MCIT records where and when it went out; dwdg'ONE publishes nothing itself. */
export const recordAnnouncement = (packetId: string, url: string, date: DateStr) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const g = mcitGuard(db, packetId);
    if (!g || !m) return;
    g.pk.announcement = { url, date, by: m.id, at: nowStamp() };
    g.pk.state = 'fulfilled';
    ui.form = null;
    upd(db, g.pk.createdBy, 'hr-packet-reply', g.pk.title, `recognition/${g.pk.round}`);
    logChange(db, 'hr', 'recorded the announcement for', rdLink(g.rd));
    toast(t('Announcement recorded'), ({ db: u }) => {
      const x = pk$(u, packetId);
      if (!x) return;
      x.announcement = null;
      x.state = 'accepted';
    });
  });
};

/** Opens the round after the last one; proposed: the cycles that end in that month. */
export async function openNextRound() {
  const m = getMe();
  const h = hrOf(getDb());
  if (!m || !hrLead(m) || !h) return null;
  const last = [...h.rounds].sort((a, b) => b.month.localeCompare(a.month))[0];
  if (!last) return null;
  const d = D(`${last.month}-01`);
  d.setMonth(d.getMonth() + 1);
  const month = iso(d).slice(0, 7);
  if (h.rounds.some((x) => x.month === month)) {
    showToast(t('That round already exists.'));
    return null;
  }
  const rd: HrRound = {
    id: `mom-${month}`,
    month,
    cycles: h.cycles.filter((c) => c.end.slice(0, 7) === month).map((c) => c.id),
    eligibility: 'Members in the cycles that end in this month, excluding exempt members',
    policy: 'Panel nominations with evidence',
    panel: [...last.panel],
    recused: [],
    shortlist: [],
    state: 'open',
    decision: null,
    flags: [],
    packet: null,
    createdBy: m.id,
    createdAt: nowStamp(),
  };
  const ok = await act(({ db, toast }) => {
    hrDraft(db).rounds.push(rd);
    logChange(db, 'hr', 'opened', rdLink(rd));
    toast(t('Round opened'), ({ db: u }) => {
      const hh = hrDraft(u);
      hh.rounds = hh.rounds.filter((v) => v.id !== rd.id);
      go('recognition');
    });
  });
  if (ok) go(`recognition/${rd.id}`);
  return ok ? rd.id : null;
}
