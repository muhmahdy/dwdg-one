/* The External Engagement side panels: new relationship (with possible matches), contact, opportunity, interaction, follow-up,
   postpone, proposal version, the gated stage change, and the two edit forms. From divisions/div-ee-cons.js INSP['ec-*']. */
import { useState } from 'react';
import { Link } from 'react-router';
import type { InspectorRef } from '@/app/ui-state';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Chip } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { openPanel } from '@/lib/open';
import { addDays, nowStamp, today } from '@/lib/time';
import { showToast } from '@/lib/workspace/transaction';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { taskOf } from '@/features/work/services/selectors';
import {
  CHANNEL,
  EE,
  KIND,
  OPP,
  OUT,
  REL,
  activeIds,
  branchOf,
  canConf,
  canStage,
  eeAuthorities,
  eeMember,
  eeOf,
  fuOf,
  oppDef,
  oppOf,
  orgOf,
  type Channel,
  type IxOutcome,
  type Kind,
  type OppStage,
  type RelStage,
} from '../services/ee-data';
import {
  addContact,
  addProposal,
  changeStage,
  createFollowup,
  createOpp,
  createOrg,
  logInteraction,
  postponeFollowup,
  updateOpp,
  updateOrg,
  type StageKind,
} from '../services/external';
import { CheckRow, DeniedPanel, isUrl, openFollowups, useFieldErrors } from './ext-parts';

const Title = ({ children }: { children: string }) => <h2 className="mt-3 mb-2.5 type-h2">{children}</h2>;
const Hint = ({ children }: { children: React.ReactNode }) => <p className="my-2 text-mute type-small">{children}</p>;
const Acts = ({ children }: { children: React.ReactNode }) => <div className="mt-1 flex gap-2">{children}</div>;

const eePeople = (db: Parameters<typeof activeIds>[0]) =>
  activeIds(db, (p) => p.div === EE).map((id) => ({
    value: id,
    label: db.people.find((p) => p.id === id)?.name ?? id,
  }));
const channelChoices = () => Object.entries(CHANNEL).map(([k, v]) => ({ value: k, label: t(v) }));
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['uii', 'the', 'and'].includes(w));

// ---------- new relationship ----------
function OrgNewPanel() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const [name, setName] = useState('');
  const [partner, setPartner] = useState(branchOf(m) !== 'client');
  const [client, setClient] = useState(branchOf(m) === 'client');
  const [pic, setPic] = useState(m?.id ?? '');
  const [src, setSrc] = useState('');
  const [sector, setSector] = useState('');
  const fe = useFieldErrors();
  if (!eeMember(m)) return <DeniedPanel head={t('New relationship')} />;
  const q = words(name);
  const hits = q.length
    ? eeOf(db).orgs.filter((o) =>
        [o.name, ...o.aliases].some((n) => words(n).some((w) => q.some((x) => w.startsWith(x) || x.startsWith(w)))),
      )
    : [];
  const submit = () => {
    const kinds: Kind[] = [...(partner ? (['partner'] as const) : []), ...(client ? (['client'] as const) : [])];
    if (!name.trim()) return fe.fail('name', t('Name the organization.'));
    if (!kinds.length) {
      showToast(t('Choose Partner, Client or both.'));
      return;
    }
    void createOrg({
      name: name.trim(),
      kinds,
      sector: sector.trim(),
      pic: pic !== '' ? pic : (m?.id ?? ''),
      source: src.trim(),
    });
  };
  return (
    <>
      <InspectorHead>{t('New relationship')}</InspectorHead>
      <Hint>
        {t(
          'Search first. A similar name may be the same organization, or a different one; nothing is merged automatically.',
        )}
      </Hint>
      <Field label={t('Organization')} htmlFor="ec-o-name" required help={fe.help('name')} error={fe.bad('name')}>
        <input
          id="ec-o-name"
          className={cn(inputClass, fe.bad('name') && invalidClass)}
          value={name}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setName(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      {hits.length > 0 && (
        <Notice icon="warning" tone="warn" title={<b>{t('Possible matches')}</b>}>
          <p>{t('Open one instead, or create a separate record if it is a different organization.')}</p>
          {hits.map((o) => (
            <Link key={o.id} className="mt-1 block" to={`/relationships/${o.id}`}>
              {o.name}
            </Link>
          ))}
        </Notice>
      )}
      <Field label={t('Kind')} required>
        <CheckRow id="ec-o-partner" checked={partner} onChange={setPartner}>
          {t('Partner')}
        </CheckRow>
        <CheckRow id="ec-o-client" checked={client} onChange={setClient}>
          {t('Client')}
        </CheckRow>
      </Field>
      <Field label={t('PIC')} htmlFor="ec-o-pic" required>
        <SelectField id="ec-o-pic" people value={pic} onChange={setPic} options={eePeople(db)} />
      </Field>
      <Field label={t('Source')} htmlFor="ec-o-src" help={t('Where this lead came from.')}>
        <input
          id="ec-o-src"
          className={inputClass}
          value={src}
          autoComplete="off"
          onChange={(e) => {
            setSrc(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Sector')} htmlFor="ec-o-sector">
        <input
          id="ec-o-sector"
          className={inputClass}
          value={sector}
          autoComplete="off"
          onChange={(e) => {
            setSector(e.target.value);
          }}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {t('Create relationship')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

// ---------- contact ----------
function ContactPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = orgOf(db, typeof insp.org === 'string' ? insp.org : undefined);
  const [f, setF] = useState({ name: '', role: '', email: '', phone: '', use: '' });
  const fe = useFieldErrors();
  if (!o || !eeMember(m)) return <DeniedPanel head={t('Add contact')} />;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF({ ...f, [k]: e.target.value });
    fe.clear();
  };
  const submit = () => {
    if (!f.name.trim()) return fe.fail('name', t('Give a name.'));
    if (!f.role.trim()) return fe.fail('role', t('Give their role.'));
    if (!f.use.trim()) return fe.fail('use', t('Say why EE keeps this contact.'));
    void addContact(o.id, {
      name: f.name.trim(),
      role: f.role.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      use: f.use.trim(),
    });
  };
  return (
    <>
      <InspectorHead>{t('Add contact')}</InspectorHead>
      <Hint>{`${o.name}. ${t('Keep only the professional details EE needs. Saving a contact is not consent to promotional messages.')}`}</Hint>
      <Field label={t('Name')} htmlFor="ec-c-name" required help={fe.help('name')} error={fe.bad('name')}>
        <input
          id="ec-c-name"
          className={cn(inputClass, fe.bad('name') && invalidClass)}
          value={f.name}
          autoComplete="off"
          autoFocus
          onChange={set('name')}
        />
      </Field>
      <Field label={t('Role')} htmlFor="ec-c-role" required help={fe.help('role')} error={fe.bad('role')}>
        <input
          id="ec-c-role"
          className={cn(inputClass, fe.bad('role') && invalidClass)}
          value={f.role}
          autoComplete="off"
          onChange={set('role')}
        />
      </Field>
      <Field label={t('Email')} htmlFor="ec-c-email">
        <input
          id="ec-c-email"
          type="email"
          className={inputClass}
          value={f.email}
          autoComplete="off"
          onChange={set('email')}
        />
      </Field>
      <Field label={t('Phone')} htmlFor="ec-c-phone">
        <input
          id="ec-c-phone"
          inputMode="tel"
          className={inputClass}
          value={f.phone}
          autoComplete="off"
          onChange={set('phone')}
        />
      </Field>
      <Field
        label={t('Why EE keeps this contact')}
        htmlFor="ec-c-use"
        required
        help={fe.help('use', t('Shown with the contact.'))}
        error={fe.bad('use')}
      >
        <input
          id="ec-c-use"
          className={cn(inputClass, fe.bad('use') && invalidClass)}
          value={f.use}
          autoComplete="off"
          onChange={set('use')}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {t('Add contact')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

// ---------- new opportunity ----------
function OppNewPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = orgOf(db, typeof insp.org === 'string' ? insp.org : undefined);
  const branch = branchOf(m);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<Kind>(
    o && branch && (branch === 'partner' || branch === 'client') && o.kinds.includes(branch)
      ? branch
      : (o?.kinds[0] ?? 'partner'),
  );
  const [need, setNeed] = useState('');
  const [pic, setPic] = useState(o?.pic ?? m?.id ?? '');
  const [next, setNext] = useState('');
  const [date, setDate] = useState('');
  const [conf, setConf] = useState(false);
  const fe = useFieldErrors();
  if (!o || !eeMember(m)) return <DeniedPanel head={t('New opportunity')} />;
  const submit = () => {
    if (!title.trim()) return fe.fail('title', t('Give a title.'));
    if (!need.trim()) return fe.fail('need', t('Describe the need.'));
    void createOpp({
      org: o.id,
      kind,
      title: title.trim(),
      need: need.trim(),
      pic: pic !== '' ? pic : (m?.id ?? ''),
      nextAction: next.trim(),
      nextDate: date || null,
      confidential: conf,
    });
  };
  return (
    <>
      <InspectorHead>{t('New opportunity')}</InspectorHead>
      <Hint>{o.name}</Hint>
      <Field label={t('Title')} htmlFor="ec-p-title" required help={fe.help('title')} error={fe.bad('title')}>
        <input
          id="ec-p-title"
          className={cn(inputClass, fe.bad('title') && invalidClass)}
          value={title}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setTitle(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Kind')}
        htmlFor="ec-p-kind"
        required
        help={t('Add the other kind on the relationship first if it is missing.')}
      >
        <SelectField
          id="ec-p-kind"
          value={kind}
          onChange={(v) => {
            setKind(v as Kind);
          }}
          options={o.kinds.map((k) => ({ value: k, label: t(KIND[k]) }))}
        />
      </Field>
      <Field
        label={t('Need')}
        htmlFor="ec-p-need"
        required
        help={fe.help('need', t('What they asked for, in their words.'))}
        error={fe.bad('need')}
      >
        <textarea
          id="ec-p-need"
          className={cn(textareaClass, 'min-h-16', fe.bad('need') && invalidClass)}
          rows={2}
          value={need}
          onChange={(e) => {
            setNeed(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('PIC')} htmlFor="ec-p-pic" required>
        <SelectField id="ec-p-pic" people value={pic} onChange={setPic} options={eePeople(db)} />
      </Field>
      <Field label={t('Next action')} htmlFor="ec-p-next">
        <input
          id="ec-p-next"
          className={inputClass}
          value={next}
          autoComplete="off"
          onChange={(e) => {
            setNext(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Next action date')} htmlFor="ec-p-date">
        <DateField id="ec-p-date" value={date} onChange={setDate} />
      </Field>
      <CheckRow id="ec-p-conf" checked={conf} onChange={setConf}>
        {t('Confidential: keep the need and estimate to the branch and EE leads')}
      </CheckRow>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {t('Create opportunity')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

// ---------- log an interaction, or record the outcome of a follow-up ----------
function InteractionPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = orgOf(db, typeof insp.org === 'string' ? insp.org : undefined);
  const task = typeof insp.task === 'string' ? taskOf(db, insp.task) : undefined;
  const link = typeof insp.task === 'string' ? fuOf(db, insp.task) : undefined;
  const optInsp = typeof insp.opp === 'string' ? insp.opp : '';
  const [date, setDate] = useState(today());
  const [time, setTime] = useState('');
  const [channel, setChannel] = useState<Channel>(link?.channel ?? 'whatsapp');
  const [outcome, setOutcome] = useState<IxOutcome>('responded');
  const [opp, setOpp] = useState(optInsp !== '' ? optInsp : (link?.opp ?? ''));
  const [sum, setSum] = useState('');
  const [ev, setEv] = useState('');
  const [wantNext, setWantNext] = useState(!!task);
  const [nTitle, setNTitle] = useState(task?.title ?? '');
  const [nDue, setNDue] = useState(addDays(today(), 3));
  const [nOwner, setNOwner] = useState(task?.owner ?? o?.pic ?? m?.id ?? '');
  const fe = useFieldErrors();
  if (!o || !eeMember(m)) return <DeniedPanel head={t('Log interaction')} />;
  const opps = eeOf(db).opps.filter((v) => v.org === o.id);
  const submit = () => {
    if (!date) return fe.fail('date', t('Choose the date it happened.'));
    if (date > today()) return fe.fail('date', t('An interaction can’t be in the future. Create a follow-up instead.'));
    if (!sum.trim()) return fe.fail('sum', t('Say what happened.'));
    if (!isUrl(ev.trim())) return fe.fail('ev', t('Use an https link.'));
    if (wantNext && !nTitle.trim()) return fe.fail('nt', t('Name the next follow-up, or untick it.'));
    void logInteraction({
      org: o.id,
      task: task?.id ?? null,
      date,
      time: time || null,
      channel,
      outcome,
      opp: opp || null,
      summary: sum.trim(),
      evidence: ev.trim(),
      next: wantNext
        ? { title: nTitle.trim(), due: nDue || null, owner: nOwner !== '' ? nOwner : (m?.id ?? '') }
        : null,
    });
  };
  return (
    <>
      <InspectorHead>{task ? t('Record outcome') : t('Log interaction')}</InspectorHead>
      <Title>{o.name}</Title>
      {task && <p className="my-1 type-small">{t('Follow-up: {t}', { t: task.title })}</p>}
      <Notice icon="info" title={<b>{t('This records what happened')}</b>}>
        <p>{t('It does not send anything. Messages go out from WhatsApp, email or the phone, outside dwdg’ONE.')}</p>
      </Notice>
      <Grid2>
        <Field label={t('Date')} htmlFor="ec-i-date" required help={fe.help('date')} error={fe.bad('date')}>
          <DateField
            id="ec-i-date"
            value={date}
            max={today()}
            onChange={(v) => {
              setDate(v);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Time, if known')} htmlFor="ec-i-time" help={t('Leave empty when unknown.')}>
          <input
            id="ec-i-time"
            type="time"
            className={inputClass}
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
            }}
          />
        </Field>
      </Grid2>
      <Grid2>
        <Field label={t('Channel')} htmlFor="ec-i-ch" required>
          <SelectField
            id="ec-i-ch"
            value={channel}
            onChange={(v) => {
              setChannel(v as Channel);
            }}
            options={channelChoices()}
          />
        </Field>
        <Field label={t('Outcome')} htmlFor="ec-i-out" required>
          <SelectField
            id="ec-i-out"
            value={outcome}
            onChange={(v) => {
              setOutcome(v as IxOutcome);
            }}
            options={Object.entries(OUT).map(([k, v]) => ({ value: k, label: t(v[0]) }))}
          />
        </Field>
      </Grid2>
      <Field label={t('Opportunity')} htmlFor="ec-i-opp">
        <SelectField
          id="ec-i-opp"
          value={opp}
          onChange={setOpp}
          options={[{ value: '', label: t('None') }, ...opps.map((v) => ({ value: v.id, label: v.title }))]}
        />
      </Field>
      <Field
        label={t('What happened')}
        htmlFor="ec-i-sum"
        required
        help={fe.help('sum', t('A short factual summary. No private chat transcripts.'))}
        error={fe.bad('sum')}
      >
        <textarea
          id="ec-i-sum"
          className={cn(textareaClass, 'min-h-16', fe.bad('sum') && invalidClass)}
          rows={3}
          value={sum}
          autoFocus
          onChange={(e) => {
            setSum(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Evidence link')}
        htmlFor="ec-i-ev"
        help={fe.help('ev', t('Optional, for example the sent email.'))}
        error={fe.bad('ev')}
      >
        <input
          id="ec-i-ev"
          className={cn(inputClass, fe.bad('ev') && invalidClass)}
          placeholder="https://"
          value={ev}
          autoComplete="off"
          onChange={(e) => {
            setEv(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">
        <CheckRow id="ec-i-next" checked={wantNext} onChange={setWantNext}>
          {t('Create the next follow-up')}
        </CheckRow>
        <Grid2>
          <Field label={t('Next follow-up')} htmlFor="ec-i-nt" help={fe.help('nt')} error={fe.bad('nt')}>
            <input
              id="ec-i-nt"
              className={cn(inputClass, fe.bad('nt') && invalidClass)}
              value={nTitle}
              autoComplete="off"
              onChange={(e) => {
                setNTitle(e.target.value);
                fe.clear();
              }}
            />
          </Field>
          <Field label={t('Due')} htmlFor="ec-i-nd">
            <DateField id="ec-i-nd" value={nDue} onChange={setNDue} />
          </Field>
        </Grid2>
        <Field label={t('Owner')} htmlFor="ec-i-no">
          <SelectField id="ec-i-no" people value={nOwner} onChange={setNOwner} options={eePeople(db)} />
        </Field>
      </div>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {task ? t('Record outcome') : t('Log interaction')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

// ---------- new follow-up ----------
function FollowupNewPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = orgOf(db, typeof insp.org === 'string' ? insp.org : undefined);
  const [title, setTitle] = useState('');
  const [want, setWant] = useState('');
  const [owner, setOwner] = useState(o?.pic ?? m?.id ?? '');
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [due, setDue] = useState(addDays(today(), 3));
  const [opp, setOpp] = useState(typeof insp.opp === 'string' ? insp.opp : '');
  const fe = useFieldErrors();
  if (!o || !eeMember(m)) return <DeniedPanel head={t('New follow-up')} />;
  const submit = () => {
    if (!title.trim()) return fe.fail('title', t('Name the next action.'));
    void createFollowup({
      org: o.id,
      title: title.trim(),
      outcome: want.trim(),
      owner: owner !== '' ? owner : (m?.id ?? ''),
      channel,
      due: due || null,
      opp: opp || null,
    });
  };
  return (
    <>
      <InspectorHead>{t('New follow-up')}</InspectorHead>
      <Title>{o.name}</Title>
      <Field label={t('Next action')} htmlFor="ec-f-title" required help={fe.help('title')} error={fe.bad('title')}>
        <input
          id="ec-f-title"
          className={cn(inputClass, fe.bad('title') && invalidClass)}
          value={title}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setTitle(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Requested outcome')} htmlFor="ec-f-out" help={t('What a good reply looks like.')}>
        <input
          id="ec-f-out"
          className={inputClass}
          value={want}
          autoComplete="off"
          onChange={(e) => {
            setWant(e.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Owner')} htmlFor="ec-f-owner" required>
          <SelectField id="ec-f-owner" people value={owner} onChange={setOwner} options={eePeople(db)} />
        </Field>
        <Field label={t('Channel')} htmlFor="ec-f-ch">
          <SelectField
            id="ec-f-ch"
            value={channel}
            onChange={(v) => {
              setChannel(v as Channel);
            }}
            options={channelChoices()}
          />
        </Field>
      </Grid2>
      <Field label={t('Due')} htmlFor="ec-f-due" help={t('Leave empty for an explicitly undated follow-up.')}>
        <DateField id="ec-f-due" value={due} onChange={setDue} />
      </Field>
      <Field label={t('Opportunity')} htmlFor="ec-f-opp">
        <SelectField
          id="ec-f-opp"
          value={opp}
          onChange={setOpp}
          options={[
            { value: '', label: t('None') },
            ...eeOf(db)
              .opps.filter((v) => v.org === o.id)
              .map((v) => ({ value: v.id, label: v.title })),
          ]}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {t('Create follow-up')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

// ---------- postpone ----------
function PostponePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const task = taskOf(db, insp.id);
  const [d, setD] = useState(addDays(task?.due && task.due > today() ? task.due : today(), 3));
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  if (!task || !eeMember(m)) return <DeniedPanel head={t('Postpone')} />;
  const submit = () => {
    if (!d) return fe.fail('d', t('Choose the new date.'));
    if (!why.trim()) return fe.fail('why', t('Give the reason.'));
    void postponeFollowup(task.id, d, why.trim());
  };
  return (
    <>
      <InspectorHead>{t('Postpone follow-up')}</InspectorHead>
      <Title>{task.title}</Title>
      <Field label={t('New due date')} htmlFor="ec-pp-d" required help={fe.help('d')} error={fe.bad('d')}>
        <DateField
          id="ec-pp-d"
          value={d}
          onChange={(v) => {
            setD(v);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Reason')}
        htmlFor="ec-pp-why"
        required
        help={fe.help('why', t('Kept in the history. Postponing is not a failed contact.'))}
        error={fe.bad('why')}
      >
        <textarea
          id="ec-pp-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('why') && invalidClass)}
          rows={2}
          value={why}
          autoFocus
          onChange={(e) => {
            setWhy(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {t('Postpone')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

// ---------- proposal version ----------
function ProposalPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = oppOf(db, insp.id);
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const [rev, setRev] = useState('');
  const fe = useFieldErrors();
  if (!o || !canStage(o, m)) return <DeniedPanel head={t('Add version')} />;
  const submit = () => {
    if (!note.trim()) return fe.fail('note', t('Say what changed.'));
    if (!url.trim() || !isUrl(url.trim())) return fe.fail('url', t('Paste the https link to the document.'));
    void addProposal(o.id, { note: note.trim(), url: url.trim(), reviewer: rev || null });
  };
  return (
    <>
      <InspectorHead>{t('New proposal version')}</InspectorHead>
      <Title>{o.title}</Title>
      <Hint>{t('Version {v}. Earlier versions stay as they were.', { v: o.proposals.length + 1 })}</Hint>
      <Field label={t('What changed')} htmlFor="ec-pr-note" required help={fe.help('note')} error={fe.bad('note')}>
        <input
          id="ec-pr-note"
          className={cn(inputClass, fe.bad('note') && invalidClass)}
          value={note}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setNote(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Link to the document')} htmlFor="ec-pr-url" required help={fe.help('url')} error={fe.bad('url')}>
        <input
          id="ec-pr-url"
          className={cn(inputClass, fe.bad('url') && invalidClass)}
          placeholder="https://"
          value={url}
          autoComplete="off"
          onChange={(e) => {
            setUrl(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Reviewed internally by')} htmlFor="ec-pr-rev">
        <SelectField
          id="ec-pr-rev"
          people
          value={rev}
          onChange={setRev}
          options={[
            { value: '', label: t('Not reviewed yet') },
            ...eeAuthorities(db)
              .filter((id) => id !== m?.id)
              .map((id) => ({ value: id, label: db.people.find((p) => p.id === id)?.name ?? id })),
          ]}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {t('Save version')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

// ---------- gated stage change ----------
const NEED_REASON = ['lost', 'withdrawn', 'closed', 'paused', 'hold', 'active'];
function StagePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const kind: StageKind = insp.k === 'opp' ? 'opp' : 'rel';
  const to = typeof insp.to === 'string' ? insp.to : '';
  const isOpp = kind === 'opp';
  const o = isOpp ? oppOf(db, insp.id) : orgOf(db, insp.id);
  const [why, setWhy] = useState('');
  const [rev, setRev] = useState(addDays(today(), 30));
  const [noRev, setNoRev] = useState(false);
  const eeA = eeAuthorities(db);
  const [auth, setAuth] = useState(m && eeA.includes(m.id) ? m.id : (eeA[0] ?? ''));
  const [ev, setEv] = useState('');
  const fe = useFieldErrors();
  if (!o || !canStage(o, m)) return <DeniedPanel head={t('Change stage')} />;
  const orgId = isOpp && 'org' in o ? o.org : o.id;
  const fus = openFollowups(db, (f) => (isOpp ? f.opp === o.id : f.org === o.id));
  const name = 'title' in o ? o.title : o.name;
  const hasIx = eeOf(db).interactions.some((i) =>
    isOpp && 'org' in o ? i.opp === o.id || i.org === o.org : i.org === o.id,
  );
  const from = isOpp && 'kind' in o ? oppDef(o) : REL[o.stage as RelStage];
  const def = isOpp
    ? to === 'active' && 'kind' in o
      ? oppDef({ stage: 'active', kind: o.kind })
      : OPP[to as OppStage]
    : REL[to as RelStage];
  if (to === 'contacted' && !hasIx)
    return (
      <>
        <InspectorHead>{t('Change stage')}</InspectorHead>
        <Title>{name}</Title>
        <Notice
          icon="warning"
          tone="warn"
          title={<b>{t('Record the attempt first')}</b>}
          actions={
            <Button
              small
              variant="primary"
              onClick={() => {
                openPanel('ec-ix', orgId, { org: orgId, opp: isOpp ? o.id : null });
              }}
            >
              {t('Log interaction')}
            </Button>
          }
        >
          <p>{t('Contacted needs a recorded interaction. Choosing a stage alone never creates contact history.')}</p>
        </Notice>
      </>
    );
  const submit = () => {
    if (NEED_REASON.includes(to) && !why.trim())
      return fe.fail('why', to === 'active' ? t('Say what was agreed.') : t('Give the reason.'));
    const extra: Parameters<typeof changeStage>[3] = { reason: why.trim() };
    if (['hold', 'paused'].includes(to)) {
      if (!rev && !noRev) return fe.fail('rev', t('Choose a review date, or tick No review date.'));
      extra.reviewDate = noRev ? null : rev;
    }
    if (to === 'active' && isOpp) {
      if (!isUrl(ev.trim())) return fe.fail('ev', t('Use an https link.'));
      extra.win = { by: m?.id ?? '', at: nowStamp(), auth, note: why.trim(), evidence: ev.trim() };
    }
    void changeStage(kind, o.id, to, extra);
  };
  return (
    <>
      <InspectorHead>{t('Change stage')}</InspectorHead>
      <Title>{name}</Title>
      <p className="my-2 flex items-center gap-1.5">
        <Chip def={from} pill="pill" />
        <Icon name="right" size="xs" />
        <Chip def={def} pill="pill" />
      </p>
      {['lost', 'withdrawn', 'closed', 'paused', 'hold'].includes(to) && (
        <>
          <Field label={t('Reason')} htmlFor="ec-st-why" required help={fe.help('why')} error={fe.bad('why')}>
            <textarea
              id="ec-st-why"
              className={cn(textareaClass, 'min-h-16', fe.bad('why') && invalidClass)}
              rows={3}
              value={why}
              autoFocus
              onChange={(e) => {
                setWhy(e.target.value);
                fe.clear();
              }}
            />
          </Field>
          {['hold', 'paused'].includes(to) && (
            <>
              <Grid2>
                <Field label={t('Review on')} htmlFor="ec-st-rev" help={fe.help('rev')} error={fe.bad('rev')}>
                  <DateField
                    id="ec-st-rev"
                    value={rev}
                    onChange={(v) => {
                      setRev(v);
                      fe.clear();
                    }}
                  />
                </Field>
              </Grid2>
              <CheckRow id="ec-st-norev" checked={noRev} onChange={setNoRev}>
                {t('No review date, on purpose')}
              </CheckRow>
            </>
          )}
          {fus.length > 0 && (
            <Notice
              icon="clock"
              tone="warn"
              title={<b>{plural(fus.length, '{n} open follow-up stays open', '{n} open follow-ups stay open')}</b>}
            >
              <p>{t('Changing the stage never closes them. Record their outcome or postpone them in Follow-ups.')}</p>
            </Notice>
          )}
        </>
      )}
      {isOpp && to === 'active' && 'kind' in o && (
        <>
          <Notice
            icon="info"
            title={
              <b>
                {o.kind === 'partner'
                  ? t('Active partnership is not a signed agreement')
                  : t('Won is not a signed agreement')}
              </b>
            }
          >
            <p>{t('Record who authorized the commitment. The agreement, BAST and any payment stay with FnL.')}</p>
          </Notice>
          <Field
            label={t('Authorized by')}
            htmlFor="ec-st-auth"
            required
            help={t('EE Director or Co-Director (proposed).')}
          >
            <SelectField
              id="ec-st-auth"
              people
              value={auth}
              onChange={setAuth}
              options={eeA.map((id) => ({ value: id, label: db.people.find((p) => p.id === id)?.name ?? id }))}
            />
          </Field>
          <Field label={t('What was agreed')} htmlFor="ec-st-why" required help={fe.help('why')} error={fe.bad('why')}>
            <textarea
              id="ec-st-why"
              className={cn(textareaClass, 'min-h-16', fe.bad('why') && invalidClass)}
              rows={3}
              value={why}
              autoFocus
              onChange={(e) => {
                setWhy(e.target.value);
                fe.clear();
              }}
            />
          </Field>
          <Field
            label={t('Evidence link')}
            htmlFor="ec-st-ev"
            help={fe.help('ev', t('For example the client’s confirmation email.'))}
            error={fe.bad('ev')}
          >
            <input
              id="ec-st-ev"
              className={cn(inputClass, fe.bad('ev') && invalidClass)}
              placeholder="https://"
              value={ev}
              autoComplete="off"
              onChange={(e) => {
                setEv(e.target.value);
                fe.clear();
              }}
            />
          </Field>
        </>
      )}
      <Acts>
        <Button variant="primary" onClick={submit}>
          {t('Change stage')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

// ---------- edits ----------
function OppEditPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = oppOf(db, insp.id);
  const [pic, setPic] = useState(o?.pic ?? '');
  const [bk, setBk] = useState(o?.backup ?? '');
  const [next, setNext] = useState(o?.nextAction ?? '');
  const [date, setDate] = useState(o?.nextDate ?? '');
  const [dec, setDec] = useState(o?.decision ?? '');
  const [svc, setSvc] = useState(o?.service ?? '');
  const [est, setEst] = useState(o?.estimate ?? '');
  const [basis, setBasis] = useState(o?.basis ?? '');
  const [conf, setConf] = useState(o?.confidential ?? false);
  if (!o || !canStage(o, m)) return <DeniedPanel head={t('Edit opportunity')} />;
  const people = eePeople(db);
  const mayConf = canConf(o, m);
  const save = () => {
    void updateOpp(o.id, {
      pic,
      backup: bk || null,
      nextAction: next.trim(),
      nextDate: date || null,
      decision: dec.trim(),
      service: svc.trim(),
      conf: mayConf ? { estimate: est.trim(), basis: basis.trim(), confidential: conf } : null,
    });
  };
  return (
    <>
      <InspectorHead>{t('Edit opportunity')}</InspectorHead>
      <Title>{o.title}</Title>
      <Grid2>
        <Field label={t('PIC')} htmlFor="ec-e-pic" required>
          <SelectField id="ec-e-pic" people value={pic} onChange={setPic} options={people} />
        </Field>
        <Field label={t('Backup')} htmlFor="ec-e-bk">
          <SelectField
            id="ec-e-bk"
            people
            value={bk}
            onChange={setBk}
            options={[{ value: '', label: t('No backup') }, ...people.filter((p) => p.value !== pic)]}
          />
        </Field>
      </Grid2>
      <Hint>{t('A backup is told about the opportunity but stays not accountable until the PIC is changed.')}</Hint>
      <Field label={t('Next action')} htmlFor="ec-e-next">
        <input
          id="ec-e-next"
          className={inputClass}
          value={next}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setNext(e.target.value);
          }}
        />
      </Field>
      <Field
        label={t('Next action date')}
        htmlFor="ec-e-date"
        help={t('Leave empty for an explicitly undated next action.')}
      >
        <DateField id="ec-e-date" value={date} onChange={setDate} />
      </Field>
      <Field label={t('Decision needed')} htmlFor="ec-e-dec">
        <input
          id="ec-e-dec"
          className={inputClass}
          value={dec}
          autoComplete="off"
          onChange={(e) => {
            setDec(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Service')} htmlFor="ec-e-svc">
        <input
          id="ec-e-svc"
          className={inputClass}
          value={svc}
          autoComplete="off"
          onChange={(e) => {
            setSvc(e.target.value);
          }}
        />
      </Field>
      {mayConf && (
        <>
          <Field label={t('Estimate')} htmlFor="ec-e-est" help={t('Optional. Unknown stays unknown.')}>
            <input
              id="ec-e-est"
              className={inputClass}
              value={est}
              autoComplete="off"
              onChange={(e) => {
                setEst(e.target.value);
              }}
            />
          </Field>
          <Field label={t('Basis for the estimate')} htmlFor="ec-e-basis">
            <input
              id="ec-e-basis"
              className={inputClass}
              value={basis}
              autoComplete="off"
              onChange={(e) => {
                setBasis(e.target.value);
              }}
            />
          </Field>
          <CheckRow id="ec-e-conf" checked={conf} onChange={setConf}>
            {t('Confidential: keep the need and estimate to the branch and EE leads')}
          </CheckRow>
        </>
      )}
      <Acts>
        <Button variant="primary" onClick={save}>
          {t('Save changes')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

function OrgEditPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = orgOf(db, insp.id);
  const [pic, setPic] = useState(o?.pic ?? '');
  const [bk, setBk] = useState(o?.backup ?? '');
  const [partner, setPartner] = useState(!!o?.kinds.includes('partner'));
  const [client, setClient] = useState(!!o?.kinds.includes('client'));
  const [al, setAl] = useState(o?.aliases.join(', ') ?? '');
  const [src, setSrc] = useState(o?.source ?? '');
  if (!o || !canStage(o, m)) return <DeniedPanel head={t('Edit relationship')} />;
  const people = eePeople(db);
  const save = () => {
    const kinds: Kind[] = [...(partner ? (['partner'] as const) : []), ...(client ? (['client'] as const) : [])];
    void updateOrg(o.id, {
      pic,
      backup: bk || null,
      kinds,
      aliases: al
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      source: src.trim(),
    });
  };
  return (
    <>
      <InspectorHead>{t('Edit relationship')}</InspectorHead>
      <Title>{o.name}</Title>
      <Grid2>
        <Field label={t('PIC')} htmlFor="ec-oe-pic" required>
          <SelectField id="ec-oe-pic" people value={pic} onChange={setPic} options={people} />
        </Field>
        <Field label={t('Backup')} htmlFor="ec-oe-bk">
          <SelectField
            id="ec-oe-bk"
            people
            value={bk}
            onChange={setBk}
            options={[{ value: '', label: t('No backup') }, ...people.filter((p) => p.value !== pic)]}
          />
        </Field>
      </Grid2>
      <Field label={t('Kind')} help={t('One organization can be both. It stays one record.')}>
        <CheckRow id="ec-oe-partner" checked={partner} onChange={setPartner}>
          {t('Partner')}
        </CheckRow>
        <CheckRow id="ec-oe-client" checked={client} onChange={setClient}>
          {t('Client')}
        </CheckRow>
      </Field>
      <Field label={t('Also known as, comma separated')} htmlFor="ec-oe-al">
        <input
          id="ec-oe-al"
          className={inputClass}
          value={al}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setAl(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Source')} htmlFor="ec-oe-src">
        <input
          id="ec-oe-src"
          className={inputClass}
          value={src}
          autoComplete="off"
          onChange={(e) => {
            setSrc(e.target.value);
          }}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={save}>
          {t('Save changes')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

PANELS['ec-org-new'] = OrgNewPanel;
PANELS['ec-contact'] = ContactPanel;
PANELS['ec-opp-new'] = OppNewPanel;
PANELS['ec-ix'] = (p) => <InteractionPanel key={`${String(p.insp.id)}${String(p.insp.task)}`} insp={p.insp} />;
PANELS['ec-fu-new'] = FollowupNewPanel;
PANELS['ec-post'] = PostponePanel;
PANELS['ec-prop'] = ProposalPanel;
PANELS['ec-stage'] = (p) => <StagePanel key={`${String(p.insp.id)}${String(p.insp.to)}`} insp={p.insp} />;
PANELS['ec-opp-edit'] = OppEditPanel;
PANELS['ec-org-edit'] = OrgEditPanel;
