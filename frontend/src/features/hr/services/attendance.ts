/* Weekly attendance (hr_attendance, W044, S029–S031, blueprint §7): one register per actual meeting, one status per person,
   Not yet recorded never reads as absent. After finalizing, a change is a correction with a reason that keeps the earlier
   entry. Absence reasons are restricted to the member and the HR leads. From divisions/div-hr-sng.js. */
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { dShort, nowStamp, span2, today } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { hrLead, hrStaff, isBoard, isTop } from '@/lib/roles';
import { registerUpdateText } from '@/features/updates/services/update-text';
import type { DateStr, Meeting, Person, PersonId, Workspace } from '@/types/workspace';
import { hrDraft, hrOf, meetingOf, regDate, type HrCycle, type HrNotice, type HrRegister, type NoticeOutcome } from './hr-data';

registerUpdateText({
  'hr-cycle-open': '{who} opened a monitoring cycle. Your report is due',
  'hr-result': '{who} released your monitoring result',
  'hr-report': '{who} sent a report for your review',
  'hr-scored': '{who} sent an assessment for the HR check',
  'hr-hrcheck': '{who} sent an assessment for the HR check',
  'hr-clarify': '{who} asked you about your report',
  'hr-clarified': '{who} answered your question',
  'hr-final': '{who} finalized your assessment',
  'hr-returned': '{who} returned an assessment to you',
  'hr-corr': '{who} asked for a correction',
  'hr-corr-done': '{who} answered your correction request',
  'hr-notice': '{who} sent an absence note',
  'hr-notice-done': '{who} decided on your absence note',
  'hr-action': '{who} gave you a support action',
  'hr-packet': '{who} sent a publication request to MCIT',
  'hr-packet-reply': '{who} replied to your publication request',
  'hr-flag': '{who} flagged an award for review',
  'hr-task': '{who} gave you an onboarding task',
});

type Def = [label: string, icon: string, tone: 'green' | 'warn' | 'ink2' | 'danger' | 'mute'];

/** Attendance states as the HR screens word them. */
export const HR_ATT: Record<string, Def> = {
  present: ['Present', 'check', 'green'],
  late: ['Late', 'clock', 'warn'],
  excused: ['Excused', 'info', 'ink2'],
  unexcused: ['Unexcused', 'close', 'danger'],
  notreq: ['Not required', 'minus', 'mute'],
  unknown: ['Not yet recorded', 'circle', 'mute'],
};
export const hrAtt = (s: string): Def => HR_ATT[s] ?? ['Not yet recorded', 'circle', 'mute'];
/** The states an officer can record (Not required is set by the roster). */
export const ATT_CHOICES = ['present', 'late', 'excused', 'unexcused'] as const;

export const NCAT: Record<string, string> = {
  class: 'Class or exam',
  health: 'Health',
  family: 'Family',
  duty: 'Organization duty',
  other: 'Other',
};
export const NOUT: Record<NoticeOutcome, Def> = {
  pending: ['Waiting for HR', 'clock', 'warn'],
  accepted: ['Excuse accepted', 'check', 'green'],
  declined: ['Excuse not accepted', 'close', 'mute'],
};

export const regOf = (db: Workspace, id: string): HrRegister | undefined =>
  hrOf(db)?.registers.find((g) => g.id === id);
export const regMeeting = (db: Workspace, g: HrRegister): Meeting | undefined => meetingOf(db, g.meeting);
export const regWhen = (db: Workspace, g: HrRegister): DateStr => regMeeting(db, g)?.date ?? '';
export const registerTitle = (db: Workspace, g: HrRegister) => {
  const mt = regMeeting(db, g);
  return mt ? `${mt.title}, ${dShort(mt.date)}` : t('Removed meeting');
};
export const inReg = (g: HrRegister, id: PersonId) =>
  g.expected.includes(id) || g.guests.includes(id) || g.notRequired.includes(id);
export const lastEntry = (g: HrRegister, id: PersonId) => g.entries[id]?.at(-1) ?? null;
export const attStatus = (g: HrRegister, id: PersonId): string =>
  g.notRequired.includes(id) ? 'notreq' : (lastEntry(g, id)?.status ?? 'unknown');
export const noticeOf = (db: Workspace, g: HrRegister, id: PersonId): HrNotice | undefined =>
  hrOf(db)
    ?.notices.filter((n) => n.reg === g.id && n.person === id)
    .sort((a, b) => b.at.localeCompare(a.at))[0];

/** Held: the meeting was marked held, or its day has passed without being canceled. */
export const isHeld = (db: Workspace, g: HrRegister) => {
  const mt = regMeeting(db, g);
  return !!mt && (mt.state === 'held' || (mt.state !== 'cancelled' && mt.date < today()));
};

/** HR, the President, VP and Admin see statuses; a unit's Director or Co-Director sees their unit's registers. */
export const canSeeReg = (m: Person | undefined, g: HrRegister) =>
  !!m &&
  !isBoard(m) &&
  (hrStaff(m) || isTop(m) || m.admin || (m.div === g.unit && ['director', 'codirector'].includes(m.role)));
/** The named officer or an HR lead (proposed). */
export const canRecord = (m: Person | undefined, g: HrRegister) => !!m && (hrLead(m) || g.officer === m.id);
/** The member and the HR leads read an absence explanation (access_sensitive_data); Admin is a separate grant. */
export const canReadReason = (m: Person | undefined, n: HrNotice) => !!m && (n.person === m.id || hrLead(m));

export function regState(db: Workspace, g: HrRegister): Def {
  if (g.finalAt) return ['Finalized', 'check', 'green'];
  if (isHeld(db, g)) return ['Recording', 'edit', 'warn'];
  if (regMeeting(db, g)?.state === 'cancelled') return ['Meeting canceled', 'close', 'mute'];
  return ['Meeting not held yet', 'calendar', 'ink2'];
}

export const regCorrections = (g: HrRegister) =>
  Object.values(g.entries).reduce((n, es) => n + es.filter((e) => g.finalAt && e.at > g.finalAt).length, 0);

export const cycleFor = (db: Workspace, d: DateStr): HrCycle | undefined =>
  hrOf(db)?.cycles.find((c) => c.start <= d && d <= c.end);

const link = (db: Workspace, g: HrRegister) => ({
  type: 'link',
  id: g.id,
  name: registerTitle(db, g),
  h: `attendance/${g.id}`,
});

/** Records one status. After finalizing it is a correction with a reason; Undo appends a reversal so every step stays. */
export function setAttendance(regId: string, person: PersonId, status: string, reason = '') {
  const me = getMe();
  return act(({ db, toast }) => {
    const g = hrDraft(db).registers.find((x) => x.id === regId);
    if (!g || !me || !canRecord(me, g) || !isHeld(db, g)) return;
    const prev = attStatus(g, person);
    if (prev === status) return;
    (g.entries[person] ??= []).push({ status, by: me.id, at: nowStamp(), reason });
    const corr = !!g.finalAt;
    logChange(
      db,
      'hr',
      corr ? 'corrected attendance in' : 'recorded attendance in',
      link(db, g),
      hrAtt(prev)[0],
      hrAtt(status)[0],
    );
    const first = db.people.find((p) => p.id === person)?.first ?? '';
    const cy = corr ? cycleFor(db, regDate(db, g)) : undefined;
    toast(
      cy && cy.state !== 'planned'
        ? t('Correction saved. Monitoring cycle {c} now uses the corrected entry.', { c: span2(cy.start, cy.end) })
        : corr
          ? t('Correction saved for {who}', { who: first })
          : t('{who}: {s}', { who: first, s: t(hrAtt(status)[0]) }),
      ({ db: u }) => {
        const x = hrDraft(u).registers.find((y) => y.id === regId);
        if (!x) return;
        (x.entries[person] ??= []).push({ status: prev, by: me.id, at: nowStamp(), reason: t('Undone') });
        logChange(u, 'hr', 'undid an attendance change in', link(u, x), hrAtt(status)[0], hrAtt(prev)[0]);
      },
    );
  });
}

export const finalizeRegister = (regId: string) => {
  const me = getMe();
  return act(({ db, toast }) => {
    const g = hrDraft(db).registers.find((x) => x.id === regId);
    if (!g || !me || !canRecord(me, g) || g.finalAt) return;
    g.finalBy = me.id;
    g.finalAt = nowStamp();
    logChange(db, 'hr', 'finalized the attendance register for', link(db, g));
    toast(t('Register finalized'), ({ db: u }) => {
      const x = hrDraft(u).registers.find((y) => y.id === regId);
      if (!x) return;
      x.finalBy = null;
      x.finalAt = null;
      logChange(u, 'hr', 'reopened the attendance register for', link(u, x));
    });
  });
};

/** An absence note against the actual meeting (S030). The Changes entry names the meeting only; the reason stays out of the feed. */
export const sendAbsenceNote = (regId: string, category: string, explanation: string) => {
  const me = getMe();
  return act(({ db, ui, toast }) => {
    const g = hrDraft(db).registers.find((x) => x.id === regId);
    if (!g || !me) return;
    const n: HrNotice = {
      id: uid('an'),
      reg: g.id,
      person: me.id,
      category: category || 'other',
      explanation,
      at: nowStamp(),
      outcome: 'pending',
      by: null,
      decidedAt: null,
    };
    hrDraft(db).notices.push(n);
    logChange(db, 'hr', 'sent an absence note for', link(db, g));
    const ref = link(db, g);
    for (const p of db.people.filter((x) => hrLead(x))) notify(db, p.id, 'hr-notice', ref);
    notify(db, g.officer, 'hr-notice', ref);
    ui.insp = null;
    toast(t('Absence note sent to HR'), ({ db: u }) => {
      const h = hrDraft(u);
      h.notices = h.notices.filter((v) => v.id !== n.id);
      logChange(u, 'hr', 'withdrew an absence note for', link(u, g));
    });
  });
};

export const decideAbsenceNote = (noticeId: string, outcome: 'accepted' | 'declined') => {
  const me = getMe();
  return act(({ db, toast }) => {
    const n = hrDraft(db).notices.find((v) => v.id === noticeId);
    if (!n || !me || !hrLead(me) || n.outcome !== 'pending') return;
    const g = hrDraft(db).registers.find((x) => x.id === n.reg);
    if (!g) return;
    n.outcome = outcome;
    n.by = me.id;
    n.decidedAt = nowStamp();
    logChange(
      db,
      'hr',
      outcome === 'accepted' ? 'accepted an absence note for' : 'did not accept an absence note for',
      link(db, g),
    );
    notify(db, n.person, 'hr-notice-done', link(db, g));
    toast(outcome === 'accepted' ? t('Excuse accepted') : t('Excuse not accepted'), ({ db: u }) => {
      const x = hrDraft(u).notices.find((v) => v.id === noticeId);
      if (!x) return;
      x.outcome = 'pending';
      x.by = null;
      x.decidedAt = null;
      logChange(u, 'hr', 'reopened an absence note for', link(u, g));
    });
  });
};
