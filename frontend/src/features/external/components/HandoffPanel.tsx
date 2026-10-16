/* The handoff panel: the brief EE sends to a named receiver in Consulting, what the receiver sees, and the actions each side has
   (send, edit, withdraw, accept, return). Accepting records one linked engagement and never signs, invoices or pays anything.
   From divisions/div-ee-cons.js INSP['ec-ho'] (blueprint §12, external_handoff, data_processcontrols). */
import { useState } from 'react';
import type { InspectorRef } from '@/app/ui-state';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Chip } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { consOf } from '@/features/consulting/services/cons-data';
import { Locked } from '@/components/shared/division-ui';
import {
  HO,
  SHARE,
  canAnswerHo,
  canSeeHo,
  canSendHo,
  consReceivers,
  contactOf,
  eeMember,
  hoOf,
  oppOf,
  staleHo,
  type Handoff,
  type ShareKey,
} from '../services/ee-data';
import {
  acceptHandoff,
  cancelHandoff,
  resendHandoff,
  returnHandoff,
  saveHandoff,
  sendHandoff,
} from '../services/external';
import { CheckRow, DeniedPanel, HandoffBody, useFieldErrors } from './ext-parts';

const Hint = ({ children }: { children: React.ReactNode }) => <p className="my-2 text-mute type-small">{children}</p>;
const Acts = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 flex flex-wrap gap-2">{children}</div>
);
const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);
const cancelForm = () => {
  setUi((u) => {
    u.form = null;
  });
};

function EditForm({ h }: { h: Handoff }) {
  const db = useWorkspace((w) => w);
  const [to, setTo] = useState(h.to ?? '');
  const [out, setOut] = useState(h.outcome);
  const [need, setNeed] = useState(h.neededBy ?? '');
  const [shares, setShares] = useState<ShareKey[]>(h.shares);
  const [unres, setUnres] = useState(h.unresolved);
  const fe = useFieldErrors();
  const submit = () => {
    if (!to) return fe.fail('to', t('Name the receiver.'));
    if (!out.trim()) return fe.fail('out', t('Say what you are asking for.'));
    void saveHandoff(h.id, { to, outcome: out.trim(), neededBy: need || null, unresolved: unres.trim(), shares });
  };
  return (
    <SubForm>
      <Field
        label={t('Named receiver')}
        htmlFor="ec-ho-to"
        required
        help={fe.help('to', t('Consulting Co-Directors and the Director.'))}
        error={fe.bad('to')}
      >
        <SelectField
          id="ec-ho-to"
          people
          value={to}
          onChange={setTo}
          options={consReceivers(db).map((id) => ({
            value: id,
            label: db.people.find((p) => p.id === id)?.name ?? id,
          }))}
        />
      </Field>
      <Field label={t('Requested outcome')} htmlFor="ec-ho-out" required help={fe.help('out')} error={fe.bad('out')}>
        <textarea
          id="ec-ho-out"
          className={cn(textareaClass, 'min-h-16', fe.bad('out') && invalidClass)}
          rows={2}
          value={out}
          autoFocus
          onChange={(e) => {
            setOut(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Needed by')}
        htmlFor="ec-ho-need"
        help={t('A requested date. It becomes agreed only when the receiver accepts.')}
      >
        <DateField id="ec-ho-need" value={need} onChange={setNeed} />
      </Field>
      <Field
        label={t('Share with the receiver')}
        help={t('Share only what Consulting needs. Contact details and the budget stay with EE unless you tick them.')}
      >
        {(Object.keys(SHARE) as ShareKey[]).map((k) => (
          <CheckRow
            key={k}
            id={`ec-sh-${k}`}
            checked={shares.includes(k)}
            onChange={(on) => {
              setShares(on ? [...shares, k] : shares.filter((x) => x !== k));
            }}
          >
            {t(SHARE[k])}
          </CheckRow>
        ))}
      </Field>
      <Field label={t('Unresolved')} htmlFor="ec-ho-unres">
        <textarea
          id="ec-ho-unres"
          className={cn(textareaClass, 'min-h-16')}
          rows={2}
          value={unres}
          onChange={(e) => {
            setUnres(e.target.value);
          }}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {h.state === 'returned' ? t('Save and send again') : t('Save draft')}
        </Button>
        <Button variant="ghost" onClick={cancelForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </SubForm>
  );
}

function AcceptForm({ h }: { h: Handoff }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const eng = consOf(db).eng;
  const cands = db.projects.filter(
    (p) =>
      p.div === h.toUnit &&
      !['completed', 'cancelled', 'archived'].includes(p.stage) &&
      !(eng[p.id]?.handoff && eng[p.id]?.handoff !== h.id) &&
      !p.program,
  );
  const sug = cands.find((p) => eng[p.id]?.opp === h.opp);
  const [proj, setProj] = useState(sug?.id ?? cands[0]?.id ?? 'new');
  const [agreed, setAgreed] = useState(h.neededBy ?? '');
  const [note, setNote] = useState('');
  return (
    <SubForm>
      <Field
        label={t('Engagement')}
        htmlFor="ec-ho-proj"
        required
        help={t('Link an existing project so nothing is duplicated.')}
      >
        <SelectField
          id="ec-ho-proj"
          value={proj}
          onChange={setProj}
          options={[
            ...cands.map((p) => ({ value: p.id, label: p.name })),
            { value: 'new', label: t('Create a new draft engagement') },
          ]}
        />
      </Field>
      <Field label={t('Agreed date')} htmlFor="ec-ho-agreed">
        <DateField id="ec-ho-agreed" value={agreed} onChange={setAgreed} />
      </Field>
      <Field label={t('Note to {who}', { who: who.first(h.from) })} htmlFor="ec-ho-note">
        <textarea
          id="ec-ho-note"
          className={cn(textareaClass, 'min-h-16')}
          rows={2}
          value={note}
          autoFocus
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            void acceptHandoff(h.id, { project: proj, agreed: agreed || null, note: note.trim() });
          }}
        >
          <Icon name="check" />
          {t('Accept handoff')}
        </Button>
        <Button variant="ghost" onClick={cancelForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </SubForm>
  );
}

function ReturnForm({ h }: { h: Handoff }) {
  const who = useWho();
  const [why, setWhy] = useState('');
  const [act, setAct] = useState('');
  const fe = useFieldErrors();
  const submit = () => {
    if (!why.trim()) return fe.fail('why', t('Say what is missing.'));
    if (!act.trim()) return fe.fail('act', t('Say what the sender should do.'));
    void returnHandoff(h.id, why.trim(), act.trim());
  };
  return (
    <SubForm>
      <Field
        label={t('What is missing or wrong?')}
        htmlFor="ec-ho-why"
        required
        help={fe.help('why')}
        error={fe.bad('why')}
      >
        <textarea
          id="ec-ho-why"
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
        label={t('What should the sender do?')}
        htmlFor="ec-ho-act"
        required
        help={fe.help('act')}
        error={fe.bad('act')}
      >
        <textarea
          id="ec-ho-act"
          className={cn(textareaClass, 'min-h-16', fe.bad('act') && invalidClass)}
          rows={2}
          value={act}
          onChange={(e) => {
            setAct(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={submit}>
          {t('Return to {who}', { who: who.first(h.from) })}
        </Button>
        <Button variant="ghost" onClick={cancelForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </SubForm>
  );
}

function HandoffPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const h = hoOf(db, insp.id);
  if (!h || !canSeeHo(h, m)) return <DeniedPanel head={t('Handoff')} />;
  const o = oppOf(db, h.opp);
  const c = o?.contact ? contactOf(db, o.contact) : undefined;
  const sender = canSendHo(db, h, m);
  const recv = canAnswerHo(h, m) && !eeMember(m);
  const stale = staleHo(db, h);
  const open = (f: string) => () => {
    setUi((u) => {
      u.form = f;
    });
  };
  let acts: React.ReactNode = null;
  if (h.state === 'draft' && sender) {
    acts =
      form === 'ho-edit' ? (
        <EditForm h={h} />
      ) : (
        <>
          <Acts>
            <Button
              variant="primary"
              onClick={() => {
                void sendHandoff(h.id);
              }}
            >
              <Icon name="right" />
              {t('Send to {who}', { who: who.first(h.to) })}
            </Button>
            <Button onClick={open('ho-edit')}>{t('Edit')}</Button>
          </Acts>
          {o && o.stage !== 'active' && (
            <Hint>{t('Sending needs the win recorded first. A prospect stage never creates an engagement.')}</Hint>
          )}
        </>
      );
  } else if (h.state === 'requested' && recv) {
    acts =
      form === 'ho-accept' ? (
        <AcceptForm h={h} />
      ) : form === 'ho-return' ? (
        <ReturnForm h={h} />
      ) : (
        <>
          <Acts>
            <Button variant="primary" onClick={open('ho-accept')}>
              <Icon name="check" />
              {t('Accept')}
            </Button>
            <Button onClick={open('ho-return')}>
              <Icon name="undo" />
              {t('Return for information')}
            </Button>
          </Acts>
          <Hint>{t('Silence never accepts. Returning has no penalty.')}</Hint>
        </>
      );
  } else if (h.state === 'requested' && sender) {
    acts = (
      <Acts>
        {stale != null && (
          <Button
            variant="primary"
            onClick={() => {
              void resendHandoff(h.id);
            }}
          >
            {t('Send version {v} for acknowledgment', { v: stale })}
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            void cancelHandoff(h.id);
          }}
        >
          {t('Withdraw')}
        </Button>
      </Acts>
    );
  } else if (h.state === 'returned' && sender) {
    acts =
      form === 'ho-edit' ? (
        <EditForm h={h} />
      ) : (
        <Acts>
          <Button variant="primary" onClick={open('ho-edit')}>
            {t('Update and send again')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              void cancelHandoff(h.id);
            }}
          >
            {t('Cancel handoff')}
          </Button>
        </Acts>
      );
  } else if (h.state === 'accepted' && sender && stale != null) {
    acts = (
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            void resendHandoff(h.id);
          }}
        >
          {t('Send version {v} for acknowledgment', { v: stale })}
        </Button>
      </Acts>
    );
  }
  const shared = (k: ShareKey) => {
    if (!o) return '';
    switch (k) {
      case 'brief': {
        const p = o.proposals.find((y) => y.v === h.briefV);
        return p ? (
          <>
            {p.note}{' '}
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                {t('Open')}
              </a>
            )}
          </>
        ) : (
          ''
        );
      }
      case 'need':
        return (
          <>
            {o.need}
            <br />
            <small className="text-d12">{o.service}</small>
          </>
        );
      case 'decision':
        return (
          <>
            {o.decision}
            <br />
            <small className="text-d12">{o.nextAction}</small>
          </>
        );
      case 'contactRole':
        return c ? `${c.name}, ${c.role}` : t('None');
      case 'contactDetails':
        return c ? [c.email, c.phone].filter(Boolean).join(', ') : t('None');
      case 'estimate':
        return o.estimate || t('None given');
    }
  };
  return (
    <>
      <InspectorHead>{t('Handoff')}</InspectorHead>
      <div className="my-2.5">
        <HandoffBody h={h} full />
      </div>
      {acts}
      <SectionHeading>{t('What the receiver sees')}</SectionHeading>
      <dl className="my-2 grid grid-cols-[150px_1fr] gap-x-2.5 gap-y-3 max-[600px]:grid-cols-[112px_1fr] [&_dd]:m-0 [&_dd]:flex-wrap [&_dt]:text-mute">
        {(Object.keys(SHARE) as ShareKey[]).map((k) => (
          <div key={k} className="contents">
            <dt>{t(SHARE[k])}</dt>
            <dd>{h.shares.includes(k) ? shared(k) : <Locked>{t('Not shared by EE')}</Locked>}</dd>
          </div>
        ))}
      </dl>
      <Hint>
        {t('Accepting gives no access to EE’s interaction log, other opportunities or restricted contact fields.')}
      </Hint>
      <SectionHeading>{t('History')}</SectionHeading>
      <div className="flex flex-col gap-0.5">
        {[...h.history].reverse().map((e, i) => (
          <div key={`${e.at}${String(i)}`} className="flex min-h-9 flex-wrap items-center gap-2 px-2.5 py-1 text-d13">
            <Chip def={HO[e.state]} pill="pill-o" />
            <small className="text-mute">
              {who.stamp(e.by, e.at)}
              {e.note && `. ${e.note}`}
            </small>
          </div>
        ))}
      </div>
      <Hint>{t('Accepting records one linked engagement. It never signs, invoices or pays anything.')}</Hint>
      <Acts>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Close')}
        </Button>
      </Acts>
    </>
  );
}

PANELS['ec-ho'] = (p) => <HandoffPanel key={String(p.insp.id)} insp={p.insp} />;
