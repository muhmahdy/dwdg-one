/* Staffing with consent (consulting_project_associates, access_member_scope, S010, S054): a request names a role and a period,
   people from any division are offered it, and nobody is staffed until they accept. Offers reuse the shared offer record. */
import { go } from '@/app/router/navigation';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { dShort, nowStamp } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { CONS } from '@/features/external/services/ee-data';
import { projOf } from '@/features/work/services/selectors';
import type { DateStr, EntityRef, PersonId } from '@/types/workspace';
import { consDraft, type Staffing } from './cons-data';
import { canRunEng, canStaff, staffOf } from './cons-rules';

const staffLink = (s: { id: string; role: string }, who = ''): EntityRef => ({
  type: 'cons',
  id: s.id,
  name: who ? `${s.role}, ${who}` : s.role,
  h: `staffing/${s.id}`,
});

export async function createStaffRequest(f: {
  project: string;
  role: string;
  skills: string;
  from: DateStr;
  to: DateStr;
}) {
  const m = getMe();
  const db0 = getDb();
  const p0 = projOf(db0, f.project);
  if (!m || !p0 || !canRunEng(p0, m)) return;
  const x: Staffing = {
    id: uid('st-'),
    project: f.project,
    role: f.role,
    skills: f.skills,
    from: f.from,
    to: f.to,
    reviewer: false,
    by: m.id,
    at: nowStamp(),
    state: 'open',
    offers: [],
  };
  const ok = await act(({ db, ui, toast }) => {
    const p = projOf(db, f.project);
    if (!p) return;
    consDraft(db).staff.push(x);
    logChange(db, CONS, 'asked for staffing on', { type: 'cons', id: p.id, name: p.name, h: `engagements/${p.id}` });
    ui.insp = null;
    toast(t('Staffing request created'), ({ db: u }) => {
      const s = consDraft(u);
      s.staff = s.staff.filter((z) => z.id !== x.id);
      go('staffing');
    });
  });
  if (ok) go(`staffing/${x.id}`);
}

/** Sends an offer; the shared offer record lets the member accept, ask for changes or decline in My Work or here. */
export function offerStaffing(sid: string, to: PersonId) {
  const m = getMe();
  const db0 = getDb();
  const s0 = staffOf(db0, sid);
  const p0 = s0 && projOf(db0, s0.project);
  if (!m || !s0 || !p0 || !canStaff(db0, s0, m)) return Promise.resolve(false);
  const offerId = uid('o');
  return act(({ db, toast }) => {
    const s = consDraft(db).staff.find((z) => z.id === sid);
    if (!s) return;
    db.offers.push({
      id: offerId,
      from: m.id,
      to,
      title: `${s.role}: ${p0.name}`,
      result: t('Take the role {r} from {a} to {b}', { r: s.role, a: dShort(s.from), b: dShort(s.to) }),
      due: s.to,
      project: p0.id,
      state: 'pending',
      note: t('Your division and role stay as they are.'),
      task: null,
      at: nowStamp(),
      answeredAt: null,
    });
    s.offers.push(offerId);
    notify(db, to, 'offer', { type: 'offer', id: offerId });
    const first = db.people.find((p) => p.id === to)?.first ?? '';
    logChange(db, CONS, 'offered a staffing role to', staffLink(s, first));
    toast(t('Offer sent to {who}', { who: first }), ({ db: u }) => {
      const o = u.offers.find((z) => z.id === offerId);
      if (o) {
        o.state = 'withdrawn';
        o.answeredAt = nowStamp();
      }
      logChange(u, CONS, 'withdrew a staffing offer to', staffLink(s, first));
    });
  });
}

export function fillStaffing(sid: string) {
  const m = getMe();
  const db0 = getDb();
  const s0 = staffOf(db0, sid);
  if (!s0 || !canStaff(db0, s0, m)) return Promise.resolve(false);
  return act(({ db, toast }) => {
    const s = consDraft(db).staff.find((z) => z.id === sid);
    if (!s) return;
    s.state = 'filled';
    logChange(db, CONS, 'marked a staffing request filled', staffLink(s));
    toast(t('Marked filled'), ({ db: u }) => {
      const x = consDraft(u).staff.find((z) => z.id === sid);
      if (x) x.state = 'open';
    });
  });
}
