/* Side panels of attendance: one person's entry in a register (record, correct, history, the absence note) and the form that
   sends an absence note. From divisions/div-hr-sng.js INSP['hr-entry'] and INSP['hr-note']. */
import { useState } from 'react';
import type { InspectorRef } from '@/app/ui-state';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Button } from '@/components/ui/Button';
import { Field, Segmented, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Empty } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { hrLead } from '@/lib/roles';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import {
  ATT_CHOICES,
  NCAT,
  NOUT,
  attStatus,
  canReadReason,
  canRecord,
  canSeeReg,
  decideAbsenceNote,
  hrAtt,
  isHeld,
  noticeOf,
  regOf,
  registerTitle,
  sendAbsenceNote,
  setAttendance,
} from '../services/attendance';
import { Chip, Locked } from './HrParts';
import { openNote } from './AttendancePage';

const h2 = 'mt-3 mb-1 type-h2';
const quiet = 'text-mute type-small';

function EntryPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const pick = useUi((u) => (typeof u.hrCorr === 'string' ? u.hrCorr : null));
  const [why, setWhy] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [gid = '', p = ''] = String(insp.id).split('|');
  const g = regOf(db, gid);
  if (!m || !g) return <InspectorHead>{t('Attendance')}</InspectorHead>;
  if (!canSeeReg(m, g) && p !== m.id)
    return (
      <>
        <InspectorHead>{t('Attendance')}</InspectorHead>
        <Empty title={t('This record is not available to you')}>{t('It may be outside your workspace.')}</Empty>
      </>
    );
  const es = g.entries[p] ?? [];
  const n = noticeOf(db, g, p);
  const rec = canRecord(m, g) && isHeld(db, g);
  const cur = attStatus(g, p);
  const chosen = pick ?? cur;
  const role = g.guests.includes(p) ? t('guest') : g.notRequired.includes(p) ? t('not required') : t('expected');
  return (
    <>
      <InspectorHead>{t('Attendance')}</InspectorHead>
      <h2 className={h2}>{who.name(p)}</h2>
      <p className={quiet}>
        {registerTitle(db, g)}, {role}
      </p>
      <p>
        <Chip def={hrAtt(cur)} pill="pill" />
      </p>
      {n && (
        <div className="my-3 grid gap-2.5 rounded-[10px] bg-surface-2 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <b>{t('Absence note')}</b>
            <Chip def={NOUT[n.outcome]} pill="pill" />
          </div>
          <Meta className="grid-cols-[96px_1fr]">
            <MetaRow label={t('Sent')}>{who.stamp(n.person, n.at)}</MetaRow>
            <MetaRow label={t('Category')}>
              {canReadReason(m, n) ? t(NCAT[n.category] ?? n.category) : <Locked>{t('Restricted')}</Locked>}
            </MetaRow>
            <MetaRow label={t('Explanation')}>
              {canReadReason(m, n) ? (
                <span className="whitespace-pre-line">
                  {n.explanation || <span className="text-mute">{t('None given')}</span>}
                </span>
              ) : (
                <Locked>{t('Reason restricted')}</Locked>
              )}
            </MetaRow>
            {n.by && n.decidedAt && <MetaRow label={t('Decided by')}>{who.stamp(n.by, n.decidedAt)}</MetaRow>}
          </Meta>
          <p className={quiet}>
            {t('A note is not an excuse by itself. HR decides the excuse; the officer records the actual status.')}
          </p>
          {n.outcome === 'pending' && hrLead(m) && n.person !== m.id ? (
            <div className="flex flex-wrap gap-2">
              <Button
                small
                variant="primary"
                onClick={() => {
                  void decideAbsenceNote(n.id, 'accepted');
                }}
              >
                {t('Accept as excused')}
              </Button>
              <Button
                small
                onClick={() => {
                  void decideAbsenceNote(n.id, 'declined');
                }}
              >
                {t('Do not accept')}
              </Button>
            </div>
          ) : (
            n.outcome === 'pending' && (
              <p className={quiet}>{t('HR Directors and Co-Directors decide excuses (proposed).')}</p>
            )
          )}
        </div>
      )}
      {rec && g.finalAt && (
        <>
          <SectionHeading>{t('Correct this entry')}</SectionHeading>
          <div className="my-1 mb-3">
            <Segmented
              label={t('New status')}
              value={chosen}
              onChange={(s) => {
                setUi((u) => {
                  u.hrCorr = s;
                });
              }}
              options={ATT_CHOICES.map((s) => [s, t(hrAtt(s)[0])])}
            />
          </div>
          <Field
            label={t('Reason for the correction')}
            htmlFor="hr-corr-why"
            required
            help={err ?? t('Kept with the entry. The earlier status, officer and time stay visible.')}
            error={!!err}
          >
            <textarea
              id="hr-corr-why"
              className={cn(textareaClass, err && invalidClass)}
              value={why}
              onChange={(e) => {
                setWhy(e.target.value);
                setErr(null);
              }}
            />
          </Field>
          <Button
            variant="primary"
            onClick={() => {
              if (!why.trim()) {
                setErr(t('Give a reason. Corrections always keep one.'));
                return;
              }
              if (chosen === cur) {
                setErr(t('Choose a different status to correct the entry.'));
                return;
              }
              void setAttendance(g.id, p, chosen, why.trim()).then((ok) => {
                if (!ok) return;
                setWhy('');
                setUi((u) => {
                  u.hrCorr = null;
                });
              });
            }}
          >
            {t('Save correction')}
          </Button>
        </>
      )}
      {rec && !g.finalAt && (
        <>
          <SectionHeading>{t('Record status')}</SectionHeading>
          <div className="grid grid-cols-2 gap-1.5">
            {ATT_CHOICES.map((s) => (
              <button
                key={s}
                type="button"
                className={cn(
                  'flex h-10 cursor-pointer items-center rounded-ctl border-0 bg-surface-2 px-3 hover:bg-hover',
                  cur === s && 'bg-sel-neutral',
                )}
                onClick={() => {
                  void setAttendance(g.id, p, s);
                }}
              >
                <Chip def={hrAtt(s)} />
              </button>
            ))}
          </div>
        </>
      )}
      <SectionHeading count={es.length}>{t('History')}</SectionHeading>
      {es.length ? (
        <div className="grid gap-2.5">
          {es
            .slice()
            .reverse()
            .map((e, i) => (
              <div
                key={`${e.at}${e.status}${i}`}
                className={cn('grid grid-cols-[28px_1fr] gap-2.5 rounded-ctl px-2 py-2', i === 0 && 'bg-sel-neutral')}
              >
                <span className="grid size-6 place-items-center rounded-round bg-fill text-[length:12px] font-semibold type-num">
                  {es.length - i}
                </span>
                <div className="min-w-0">
                  <Chip def={hrAtt(e.status)} pill="pill" />
                  <small className="mt-0.5 block text-d12h text-mute">
                    {who.stamp(e.by, e.at)}
                    {g.finalAt && e.at > g.finalAt ? `, ${t('after finalizing')}` : ''}
                  </small>
                  {e.reason && <small className="mt-1 block text-[length:12.5px] text-ink-2">{e.reason}</small>}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className={quiet}>
          {t('Nothing recorded yet. This stays Not yet recorded until an officer records a status.')}
        </p>
      )}
      {p === m.id && !n && g.expected.includes(p) && !g.finalAt && (
        <div className="mt-3">
          <Button
            onClick={() => {
              openNote(g.id);
            }}
          >
            {t('Send absence note')}
          </Button>
        </div>
      )}
    </>
  );
}

function NotePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const g = regOf(db, String(insp.id));
  const [cat, setCat] = useState('class');
  const [text, setText] = useState('');
  if (!m || !g?.expected.includes(m.id))
    return (
      <>
        <InspectorHead>{t('Absence note')}</InspectorHead>
        <Empty title={t('You are not expected at this meeting')}>
          {t('Only expected members send absence notes.')}
        </Empty>
      </>
    );
  return (
    <>
      <InspectorHead>{t('Absence note')}</InspectorHead>
      <h2 className={h2}>{registerTitle(db, g)}</h2>
      <Field label={t('Reason category')} htmlFor="hr-n-cat">
        <SelectField
          id="hr-n-cat"
          value={cat}
          onChange={setCat}
          options={Object.entries(NCAT).map(([k, v]) => ({ value: k, label: t(v) }))}
        />
      </Field>
      <Field
        label={t('Explanation')}
        htmlFor="hr-n-text"
        optional
        help={t('Only you and the HR leads can read this. It never appears in rosters, minutes or search.')}
      >
        <textarea
          id="hr-n-text"
          className={textareaClass}
          value={text}
          autoFocus
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
      </Field>
      <Notice icon="info" title={<b>{t('A note is not an approved excuse')}</b>}>
        <p>
          {t('HR decides whether the absence is excused. The officer records what actually happened at the meeting.')}
        </p>
      </Notice>
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            void sendAbsenceNote(g.id, cat, text.trim());
          }}
        >
          {t('Send note')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

PANELS['hr-entry'] = (p) => <EntryPanel key={String(p.insp.id)} {...p} />;
PANELS['hr-note'] = (p) => <NotePanel key={String(p.insp.id)} {...p} />;
