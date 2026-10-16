/* The engagement side panels: start decision, project roles, scope change, new deliverable, client update, risk, raising a
   risk as a blocker, closure and export. From divisions/div-ee-cons.js INSP['cons-*']. */
import { useState } from 'react';
import type { InspectorRef } from '@/app/ui-state';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, Segmented, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { addDays, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi, showToast } from '@/lib/workspace/transaction';
import { CHANNEL, CONS, activeIds, director, type Channel } from '@/features/external/services/ee-data';
import { CheckRow, DeniedPanel, useFieldErrors } from '@/features/external/components/ext-parts';
import { projOf } from '@/features/work/services/selectors';
import type { Level } from '../services/cons-data';
import {
  DLV,
  LEVEL,
  canRunEng,
  consCD,
  dlvState,
  engOf,
  gaps,
  isPL,
  projBlk,
  projDlv,
  projOpenTasks,
  scopeNow,
} from '../services/cons-rules';
import {
  addClientUpdate,
  addDeliverable,
  addRisk,
  closeEngagement,
  exportText,
  markClientReportReviewed,
  proposeScope,
  raiseBlocker,
  recordStart,
  saveRoles,
} from '../services/engagements';

const pick = (v: string, fallback: string | undefined) => (v !== '' ? v : (fallback ?? ''));
const Title = ({ children }: { children: string }) => <h2 className="mt-3 mb-2.5 type-h2">{children}</h2>;
const Hint = ({ children }: { children: React.ReactNode }) => <p className="my-2 text-mute type-small">{children}</p>;
const Acts = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-1 flex flex-wrap gap-2">{children}</div>
);
const Cancel = () => (
  <Button variant="ghost" onClick={closeInspector}>
    {t('Cancel')}
  </Button>
);
const people = (db: Parameters<typeof activeIds>[0], ids: string[]) =>
  ids.map((id) => ({ value: id, label: db.people.find((p) => p.id === id)?.name ?? id }));
const optionalPeople = (db: Parameters<typeof activeIds>[0], ids: string[], blank: string) => [
  { value: '', label: blank },
  ...people(db, ids),
];
const channelChoices = () => Object.entries(CHANNEL).map(([k, v]) => ({ value: k, label: t(v) }));

// ---------- start decision ----------
function StartPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const p = projOf(db, insp.id);
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  if (!p || !consCD(m)) return <DeniedPanel head={t('Start decision')} />;
  const e = engOf(db, p.id);
  const g = e ? gaps(p, e).filter((z) => z !== 'Start decision') : [];
  return (
    <>
      <InspectorHead>{t('Start decision')}</InspectorHead>
      <Title>{p.name}</Title>
      {g.length > 0 && (
        <Notice
          icon="warning"
          tone="warn"
          title={<b>{t('Record these first: {g}', { g: g.map((z) => t(z)).join(', ') })}</b>}
        >
          <p>{t('The start decision needs named roles and an approved scope.')}</p>
        </Notice>
      )}
      <Notice icon="info" title={<b>{t('A start decision is not a client signature')}</b>}>
        <p>{t('Scope approval, the signed agreement and the actual start stay separate records.')}</p>
      </Notice>
      <Field
        label={t('Decision and conditions')}
        htmlFor="cs-st-note"
        required
        help={fe.help('note')}
        error={fe.bad('note')}
      >
        <textarea
          id="cs-st-note"
          className={cn(textareaClass, 'min-h-16', fe.bad('note') && invalidClass)}
          rows={3}
          value={note}
          autoFocus
          onChange={(ev) => {
            setNote(ev.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          disabled={g.length > 0}
          onClick={() => {
            if (!note.trim()) return fe.fail('note', t('Write the decision and its conditions.'));
            void recordStart(p.id, note.trim());
          }}
        >
          {t('Record start decision')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

// ---------- roles ----------
function RolesPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const p = projOf(db, insp.id);
  const e = engOf(db, insp.id);
  const [pl, setPl] = useState(p?.lead ?? '');
  const [pm, setPm] = useState(p?.pm ?? '');
  const [rv, setRv] = useState(e?.reviewer ?? '');
  const [cu, setCu] = useState(e?.clientOwner ?? '');
  const fe = useFieldErrors();
  if (!p || !e || !consCD(m)) return <DeniedPanel head={t('Roles')} />;
  const ppl = optionalPeople(db, activeIds(db), t('Not named'));
  return (
    <>
      <InspectorHead>{t('Roles')}</InspectorHead>
      <Title>{p.name}</Title>
      <Field label={t('Project Leader')} htmlFor="cs-ro-pl" help={t('Owns scope, content and solution review.')}>
        <SelectField id="cs-ro-pl" people value={pl} onChange={setPl} options={ppl} />
      </Field>
      <Field
        label={t('Project Manager')}
        htmlFor="cs-ro-pm"
        help={t('Owns schedule, coordination, risks and client update records.')}
      >
        <SelectField id="cs-ro-pm" people value={pm} onChange={setPm} options={ppl} />
      </Field>
      <Field
        label={t('Reviewer')}
        htmlFor="cs-ro-rev"
        help={fe.help('rv', t('Independent: never the PL, and never reviews their own work.'))}
        error={fe.bad('rv')}
      >
        <SelectField
          id="cs-ro-rev"
          people
          value={rv}
          onChange={(v) => {
            setRv(v);
            fe.clear();
          }}
          options={ppl}
        />
      </Field>
      <Field
        label={t('Client updates by')}
        htmlFor="cs-ro-cu"
        help={t('Records what was sent or presented to the client.')}
      >
        <SelectField id="cs-ro-cu" people value={cu} onChange={setCu} options={ppl} />
      </Field>
      <Notice icon="info" title={<b>{t('Project roles only')}</b>}>
        <p>
          {t(
            'Naming someone here never changes their division, rank or access to other records. People outside Consulting join through a staffing offer they accept.',
          )}
        </p>
      </Notice>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (rv && rv === pl) return fe.fail('rv', t('The reviewer must be someone other than the Project Leader.'));
            void saveRoles(p.id, { pl: pl || null, pm: pm || null, reviewer: rv || null, clientOwner: cu || null });
          }}
        >
          {t('Save roles')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

// ---------- scope change ----------
function ScopePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const p = projOf(db, insp.id);
  const [ch, setCh] = useState('');
  const [rs, setRs] = useState('');
  const [im, setIm] = useState('');
  const [af, setAf] = useState<string[]>([]);
  const fe = useFieldErrors();
  if (!p || !canRunEng(p, m)) return <DeniedPanel head={t('Scope change')} />;
  const ds = projDlv(db, p.id);
  const e = engOf(db, p.id);
  const cur = e ? scopeNow(e) : null;
  const area = (
    k: 'ch' | 'rs' | 'im',
    label: string,
    val: string,
    set: (v: string) => void,
    msg: string,
    focus = false,
  ) => (
    <Field label={label} htmlFor={`cs-sc-${k}`} required help={fe.help(k)} error={fe.bad(k)}>
      <textarea
        id={`cs-sc-${k}`}
        className={cn(textareaClass, 'min-h-16', fe.bad(k) && invalidClass)}
        rows={2}
        value={val}
        {...(focus ? { autoFocus: true } : {})}
        aria-label={msg}
        onChange={(ev) => {
          set(ev.target.value);
          fe.clear();
        }}
      />
    </Field>
  );
  return (
    <>
      <InspectorHead>{t('Propose a scope change')}</InspectorHead>
      <Title>{p.name}</Title>
      <Hint>{cur ? t('Current approved scope: version {v}.', { v: cur.v }) : t('No approved scope yet.')}</Hint>
      {area('ch', t('What changes'), ch, setCh, t('Say what changes.'), true)}
      {area('rs', t('Reason'), rs, setRs, t('Give the reason.'))}
      {area('im', t('Impact on dates, people and deliverables'), im, setIm, t('Describe the impact.'))}
      <Field
        label={t('Deliverables affected')}
        help={t('If approved, their earlier approvals become stale and need a new review.')}
      >
        {ds.map((d) => (
          <CheckRow
            key={d.id}
            id={`cs-af-${d.id}`}
            checked={af.includes(d.id)}
            onChange={(on) => {
              setAf(on ? [...af, d.id] : af.filter((x) => x !== d.id));
            }}
          >
            {d.title}
          </CheckRow>
        ))}
        {!ds.length && <span className="text-mute">{t('No deliverables yet')}</span>}
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!ch.trim()) return fe.fail('ch', t('Say what changes.'));
            if (!rs.trim()) return fe.fail('rs', t('Give the reason.'));
            if (!im.trim()) return fe.fail('im', t('Describe the impact.'));
            void proposeScope(p.id, { change: ch.trim(), reason: rs.trim(), impact: im.trim(), affects: af });
          }}
        >
          {t('Send for decision')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

// ---------- new deliverable ----------
function DeliverableNewPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const p = projOf(db, insp.id);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState(p?.lead ?? m?.id ?? '');
  const [crit, setCrit] = useState('');
  const fe = useFieldErrors();
  if (!p || !canRunEng(p, m)) return <DeniedPanel head={t('Add deliverable')} />;
  const ids = [
    ...new Set(
      [
        p.lead,
        p.pm,
        ...activeIds(db, (z) => z.div === CONS),
        ...db.tasks.filter((x) => x.project === p.id).map((x) => x.owner),
      ].filter((x): x is string => !!x),
    ),
  ];
  return (
    <>
      <InspectorHead>{t('Add deliverable')}</InspectorHead>
      <Title>{p.name}</Title>
      <Field label={t('Title')} htmlFor="cs-dn-t" required help={fe.help('t')} error={fe.bad('t')}>
        <input
          id="cs-dn-t"
          className={cn(inputClass, fe.bad('t') && invalidClass)}
          value={title}
          autoComplete="off"
          autoFocus
          onChange={(ev) => {
            setTitle(ev.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Owner')} htmlFor="cs-dn-o" required>
        <SelectField id="cs-dn-o" people value={owner} onChange={setOwner} options={people(db, ids)} />
      </Field>
      <Field
        label={t('Acceptance criteria, one per line')}
        htmlFor="cs-dn-c"
        required
        help={fe.help('c')}
        error={fe.bad('c')}
      >
        <textarea
          id="cs-dn-c"
          className={cn(textareaClass, 'min-h-16', fe.bad('c') && invalidClass)}
          rows={3}
          value={crit}
          onChange={(ev) => {
            setCrit(ev.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!title.trim()) return fe.fail('t', t('Give a title.'));
            const criteria = crit
              .split('\n')
              .map((z) => z.trim())
              .filter(Boolean);
            if (!criteria.length) return fe.fail('c', t('Write at least one criterion.'));
            void addDeliverable(p.id, { title: title.trim(), owner: pick(owner, m?.id), criteria });
          }}
        >
          {t('Add deliverable')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

// ---------- client update ----------
function ClientUpdatePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const p = projOf(db, insp.id);
  const [date, setDate] = useState(today());
  const [ch, setCh] = useState<Channel>('video');
  const [sum, setSum] = useState('');
  const [ver, setVer] = useState('');
  const [fb, setFb] = useState('');
  const [pend, setPend] = useState('');
  const [nt, setNt] = useState('');
  const [no, setNo] = useState(p?.pm ?? m?.id ?? '');
  const [nd, setNd] = useState(addDays(today(), 3));
  const fe = useFieldErrors();
  if (!p || !canRunEng(p, m)) return <DeniedPanel head={t('Client update')} />;
  const vs = projDlv(db, p.id).flatMap((d) =>
    d.versions
      .filter((v) => v.review?.choice === 'approved')
      .map((v) => ({ value: `${d.title} v${String(v.v)}`, label: `${d.title} v${String(v.v)}` })),
  );
  return (
    <>
      <InspectorHead>{t('Record client update')}</InspectorHead>
      <Title>{p.name}</Title>
      <Notice icon="info" title={<b>{t('This records a conversation that already happened')}</b>}>
        <p>{t('Saving never emails or messages the client.')}</p>
      </Notice>
      <Grid2>
        <Field label={t('Date')} htmlFor="cs-cu-d" required help={fe.help('d')} error={fe.bad('d')}>
          <DateField
            id="cs-cu-d"
            value={date}
            max={today()}
            onChange={(v) => {
              setDate(v);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Channel')} htmlFor="cs-cu-ch">
          <SelectField
            id="cs-cu-ch"
            value={ch}
            onChange={(v) => {
              setCh(v as Channel);
            }}
            options={channelChoices()}
          />
        </Field>
      </Grid2>
      <Field label={t('Summary')} htmlFor="cs-cu-s" required help={fe.help('s')} error={fe.bad('s')}>
        <textarea
          id="cs-cu-s"
          className={cn(textareaClass, 'min-h-16', fe.bad('s') && invalidClass)}
          rows={3}
          value={sum}
          autoFocus
          onChange={(ev) => {
            setSum(ev.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Approved version shared')}
        htmlFor="cs-cu-v"
        help={t('Only internally approved versions can be listed.')}
      >
        <SelectField id="cs-cu-v" value={ver} onChange={setVer} options={[{ value: '', label: t('None') }, ...vs]} />
      </Field>
      <Field label={t('Client feedback')} htmlFor="cs-cu-f">
        <input
          id="cs-cu-f"
          className={inputClass}
          value={fb}
          autoComplete="off"
          onChange={(ev) => {
            setFb(ev.target.value);
          }}
        />
      </Field>
      <Field label={t('Decision pending')} htmlFor="cs-cu-p">
        <input
          id="cs-cu-p"
          className={inputClass}
          value={pend}
          autoComplete="off"
          onChange={(ev) => {
            setPend(ev.target.value);
          }}
        />
      </Field>
      <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">
        <Field label={t('Next follow-up')} htmlFor="cs-cu-nt" help={t('Creates one task.')}>
          <input
            id="cs-cu-nt"
            className={inputClass}
            value={nt}
            autoComplete="off"
            onChange={(ev) => {
              setNt(ev.target.value);
            }}
          />
        </Field>
        <Grid2>
          <Field label={t('Owner')} htmlFor="cs-cu-no">
            <SelectField id="cs-cu-no" people value={no} onChange={setNo} options={people(db, activeIds(db))} />
          </Field>
          <Field label={t('Due')} htmlFor="cs-cu-nd">
            <DateField id="cs-cu-nd" value={nd} onChange={setNd} />
          </Field>
        </Grid2>
      </div>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!date) return fe.fail('d', t('Choose the date.'));
            if (date > today()) return fe.fail('d', t('Record it after it happens.'));
            if (!sum.trim()) return fe.fail('s', t('Write a summary.'));
            void addClientUpdate(p.id, {
              date,
              channel: ch,
              summary: sum.trim(),
              version: ver || null,
              feedback: fb.trim(),
              pending: pend.trim(),
              next: nt.trim() ? { title: nt.trim(), owner: pick(no, m?.id), due: nd || null } : null,
            });
          }}
        >
          {t('Save update')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

// ---------- risk and blocker ----------
function RiskPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const p = projOf(db, insp.id);
  const [title, setTitle] = useState('');
  const [imp, setImp] = useState('');
  const [lik, setLik] = useState('');
  const [mit, setMit] = useState('');
  const [trig, setTrig] = useState('');
  const [owner, setOwner] = useState(p?.pm ?? m?.id ?? '');
  const [rev, setRev] = useState(addDays(today(), 7));
  const fe = useFieldErrors();
  if (!p || !canRunEng(p, m)) return <DeniedPanel head={t('Add risk')} />;
  const lv = [
    { value: '', label: t('Not rated') },
    ...(Object.keys(LEVEL) as Level[]).map((k) => ({ value: k, label: t(LEVEL[k]) })),
  ];
  return (
    <>
      <InspectorHead>{t('Add risk')}</InspectorHead>
      <Title>{p.name}</Title>
      <Field label={t('What might happen')} htmlFor="cs-rk-t" required help={fe.help('t')} error={fe.bad('t')}>
        <input
          id="cs-rk-t"
          className={cn(inputClass, fe.bad('t') && invalidClass)}
          value={title}
          autoComplete="off"
          autoFocus
          onChange={(ev) => {
            setTitle(ev.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Impact')} htmlFor="cs-rk-i">
          <SelectField id="cs-rk-i" value={imp} onChange={setImp} options={lv} />
        </Field>
        <Field label={t('Likelihood')} htmlFor="cs-rk-l">
          <SelectField id="cs-rk-l" value={lik} onChange={setLik} options={lv} />
        </Field>
      </Grid2>
      <Field label={t('Mitigation')} htmlFor="cs-rk-m">
        <input
          id="cs-rk-m"
          className={inputClass}
          value={mit}
          autoComplete="off"
          onChange={(ev) => {
            setMit(ev.target.value);
          }}
        />
      </Field>
      <Field label={t('Trigger')} htmlFor="cs-rk-tr" help={t('What turns it into a blocker.')}>
        <input
          id="cs-rk-tr"
          className={inputClass}
          value={trig}
          autoComplete="off"
          onChange={(ev) => {
            setTrig(ev.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Owner')} htmlFor="cs-rk-o">
          <SelectField id="cs-rk-o" people value={owner} onChange={setOwner} options={people(db, activeIds(db))} />
        </Field>
        <Field label={t('Review on')} htmlFor="cs-rk-r">
          <DateField id="cs-rk-r" value={rev} onChange={setRev} />
        </Field>
      </Grid2>
      <Hint>{t('Ratings are a person’s judgment, not a calculated score.')}</Hint>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!title.trim()) return fe.fail('t', t('Say what might happen.'));
            void addRisk(p.id, {
              title: title.trim(),
              impact: (imp || null) as Level | null,
              likelihood: (lik || null) as Level | null,
              mitigation: mit.trim(),
              owner: pick(owner, m?.id),
              trigger: trig.trim(),
              review: rev || null,
            });
          }}
        >
          {t('Add risk')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

function BlockerPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const [pid = '', rid = ''] = String(insp.id).split('|');
  const p = projOf(db, pid);
  const r = engOf(db, pid)?.risks.find((z) => z.id === rid);
  const ts = p ? projOpenTasks(db, pid) : [];
  const [task, setTask] = useState(ts[0]?.id ?? '');
  const [act, setAct] = useState(r?.mitigation ?? '');
  const fe = useFieldErrors();
  if (!p || !r || !canRunEng(p, m)) return <DeniedPanel head={t('Raise as blocker')} />;
  return (
    <>
      <InspectorHead>{t('Raise as blocker')}</InspectorHead>
      <Title>{r.title}</Title>
      <Hint>{t('The risk happened. Choose the task it blocks; other tasks are not changed.')}</Hint>
      <Field label={t('Blocked task')} htmlFor="cs-bk-t" required help={fe.help('task')} error={fe.bad('task')}>
        <SelectField
          id="cs-bk-t"
          value={task}
          onChange={setTask}
          options={ts.map((x) => ({ value: x.id, label: x.title }))}
        />
      </Field>
      <Field label={t('Action needed')} htmlFor="cs-bk-a" required help={fe.help('act')} error={fe.bad('act')}>
        <input
          id="cs-bk-a"
          className={cn(inputClass, fe.bad('act') && invalidClass)}
          value={act}
          autoComplete="off"
          autoFocus
          onChange={(ev) => {
            setAct(ev.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="danger"
          onClick={() => {
            if (!task) return fe.fail('task', t('Choose the task.'));
            if (!act.trim()) return fe.fail('act', t('Say what action is needed.'));
            void raiseBlocker(pid, rid, { task, action: act.trim() });
          }}
        >
          {t('Raise blocker')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

// ---------- closure (consulting_close, S057) ----------
const Checks = ({ rows }: { rows: [label: string, ok: boolean, why?: string][] }) => (
  <ul className="m-0 mb-2 grid list-none gap-0.5 p-0 text-d13h">
    {rows.map(([label, ok, why]) => (
      <li key={label} className={cn('flex items-start gap-2 px-1 py-1.5 text-ink-2', ok && 'text-ink')}>
        <Icon
          name={ok ? 'check' : 'circle'}
          size="sm"
          className={cn('mt-0.5 flex-none text-mute', ok && 'text-green-ink')}
        />
        <span>
          {label}
          {!ok && why && <small className="block text-d12 text-mute">{why}</small>}
        </span>
      </li>
    ))}
  </ul>
);

function ClosePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const p = projOf(db, insp.id);
  const e = engOf(db, insp.id);
  const [out, setOut] = useState('');
  const [les, setLes] = useState('');
  const [kn, setKn] = useState(true);
  const [duties, setDuties] = useState<Record<string, string>>({});
  const fe = useFieldErrors();
  if (!p || !e || !canRunEng(p, m)) return <DeniedPanel head={t('Close engagement')} />;
  if (e.closure)
    return (
      <>
        <InspectorHead>{t('Close engagement')}</InspectorHead>
        <Notice
          icon="check"
          tone="done"
          title={<b>{t('Closed by {who}', { who: who.stamp(e.closure.by, e.closure.at) })}</b>}
        >
          <p>{e.closure.outcome}</p>
        </Notice>
      </>
    );
  const ds = projDlv(db, p.id);
  const blk = projBlk(db, p.id);
  const notAcc = ds.filter((d) => dlvState(db, d) !== 'accepted');
  const blocked = notAcc.length > 0 || blk.length > 0;
  const fnl = activeIds(db, (z) => z.div === 'fnl');
  return (
    <>
      <InspectorHead>{t('Close engagement')}</InspectorHead>
      <Title>{p.name}</Title>
      <Checks
        rows={[
          [
            t('Every deliverable accepted by the client'),
            !notAcc.length,
            notAcc.map((d) => `${d.title}: ${t(DLV[dlvState(db, d)][0])}`).join('; '),
          ],
          [t('No open blocker'), !blk.length, plural(blk.length, '{n} open', '{n} open')],
        ]}
      />
      <SectionHeading>{t('Legal and finance duties')}</SectionHeading>
      <Hint>{t('Each duty is resolved or handed to a named owner. Closing never makes one disappear.')}</Hint>
      {e.obligations.map((ob) => (
        <Field
          key={ob.id}
          label={ob.label}
          htmlFor={`cs-ob-${ob.id}`}
          help={fe.help(`ob-${ob.id}`)}
          error={fe.bad(`ob-${ob.id}`)}
        >
          <SelectField
            id={`cs-ob-${ob.id}`}
            value={duties[ob.id] ?? ''}
            onChange={(v) => {
              setDuties({ ...duties, [ob.id]: v });
              fe.clear();
            }}
            options={[
              { value: '', label: t('Still open') },
              { value: 'resolved', label: t('Resolved') },
              ...fnl.map((id) => ({ value: `to:${id}`, label: t('Handed over to {who}', { who: who.name(id) }) })),
            ]}
          />
        </Field>
      ))}
      {!e.obligations.length && <p className="text-mute">{t('None linked.')}</p>}
      <Field
        label={t('Outcome')}
        htmlFor="cs-cl-out"
        required
        help={fe.help('out', t('What was delivered and accepted, with the exact versions.'))}
        error={fe.bad('out')}
      >
        <textarea
          id="cs-cl-out"
          className={cn(textareaClass, 'min-h-16', fe.bad('out') && invalidClass)}
          rows={2}
          value={out}
          autoFocus
          onChange={(ev) => {
            setOut(ev.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Lessons for Knowledge')}
        htmlFor="cs-cl-les"
        help={t('Sanitized: no client names, files or links.')}
      >
        <textarea
          id="cs-cl-les"
          className={cn(textareaClass, 'min-h-16')}
          rows={2}
          value={les}
          onChange={(ev) => {
            setLes(ev.target.value);
          }}
        />
      </Field>
      <CheckRow id="cs-cl-kn" checked={kn} onChange={setKn}>
        {t('Send the lessons to Knowledge for review')}
      </CheckRow>
      <Acts>
        <Button
          variant="primary"
          disabled={blocked}
          onClick={() => {
            if (!out.trim()) return fe.fail('out', t('Write the outcome.'));
            for (const ob of e.obligations)
              if (!(duties[ob.id] ?? '')) return fe.fail(`ob-${ob.id}`, t('Resolve it or hand it to a named owner.'));
            void closeEngagement(p.id, { outcome: out.trim(), lessons: les.trim(), toKnowledge: kn, duties });
          }}
        >
          {t('Close engagement')}
        </Button>
        <Cancel />
      </Acts>
      {blocked && (
        <Hint>
          {t(
            'Closing stays unavailable until the items above are done. A delivered but rejected deliverable stays unresolved.',
          )}
        </Hint>
      )}
    </>
  );
}

// ---------- export (consulting_export) ----------
const EXP_FIELDS: [string, 0 | 1, 0 | 1][] = [
  ['Scope and versions', 1, 1],
  ['PL, PM and reviewer', 1, 1],
  ['Deliverables with exact versions', 1, 1],
  ['Client updates and next actions', 1, 1],
  ['Milestones', 1, 1],
  ['Tasks and owners', 1, 0],
  ['Blockers and risks', 1, 0],
  ['Review feedback', 1, 0],
  ['Client contact details', 0, 0],
  ['Budget and finance notes', 0, 0],
  ['Internal notes', 1, 0],
];

function ExportPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const kind = useUi((u) => (u.csExp === 'client' ? 'client' : 'internal'));
  const p = projOf(db, insp.id);
  const e = engOf(db, insp.id);
  if (!p || !e || !canRunEng(p, m)) return <DeniedPanel head={t('Export')} />;
  const i = kind === 'internal' ? 1 : 2;
  const copy = () => {
    const txt = exportText(db, p.id, kind);
    navigator.clipboard.writeText(txt).then(
      () => {
        showToast(t('Copied'));
      },
      () => {
        showToast(t('Could not copy. Select the text in your browser instead.'));
      },
    );
  };
  return (
    <>
      <InspectorHead>{t('Export')}</InspectorHead>
      <Title>{p.name}</Title>
      <Segmented<'internal' | 'client'>
        label={t('Report')}
        value={kind}
        onChange={(k) => {
          setUi((u) => {
            u.csExp = k;
          });
        }}
        options={[
          ['internal', t('Internal summary')],
          ['client', t('Client report')],
        ]}
      />
      <ul className="mt-2 mb-2 grid list-none gap-0.5 p-0 text-d13h">
        {EXP_FIELDS.map((f) => (
          <li key={f[0]} className={cn('flex items-start gap-2 px-1 py-1.5', f[i] ? 'text-ink' : 'text-ink-2')}>
            <Icon
              name={f[i] ? 'check' : 'minus'}
              size="sm"
              className={cn('mt-0.5 flex-none', f[i] ? 'text-green-ink' : 'text-mute')}
            />
            <span className={cn(!f[i] && 'text-mute line-through decoration-line-strong')}>{t(f[0])}</span>
          </li>
        ))}
      </ul>
      {kind === 'client' &&
        (e.report ? (
          <Notice
            icon="check"
            tone="done"
            title={<b>{t('Reviewed by {who}', { who: who.stamp(e.report.by, e.report.at) })}</b>}
          >
            <p>{t('Share it yourself from your own email. dwdg’ONE has no client portal.')}</p>
          </Notice>
        ) : (
          <Notice
            icon="search"
            tone="warn"
            title={<b>{t('Not reviewed yet')}</b>}
            actions={
              isPL(p, m) || director(m, CONS) ? (
                <Button
                  small
                  variant="primary"
                  onClick={() => {
                    void markClientReportReviewed(p.id);
                  }}
                >
                  {t('Mark reviewed')}
                </Button>
              ) : undefined
            }
          >
            <p>
              {t('The Project Leader or the Consulting Director reviews the client report before anyone shares it.')}
            </p>
          </Notice>
        ))}
      <Acts>
        <Button onClick={copy}>
          <Icon name="documents" />
          {t('Copy as text')}
        </Button>
      </Acts>
      <Hint>{t('Copying gives you text to paste. Nothing is sent from here.')}</Hint>
    </>
  );
}

PANELS['cons-start'] = StartPanel;
PANELS['cons-roles'] = RolesPanel;
PANELS['cons-scope'] = ScopePanel;
PANELS['cons-dlv-new'] = DeliverableNewPanel;
PANELS['cons-cu'] = ClientUpdatePanel;
PANELS['cons-risk'] = RiskPanel;
PANELS['cons-blk'] = BlockerPanel;
PANELS['cons-close'] = ClosePanel;
PANELS['cons-export'] = ExportPanel;
