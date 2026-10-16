/* Task offers (access_delegation, S013–S016): you ask someone to take a task; they accept, ask for changes or decline. Nothing
   is assigned until they accept, and silence never accepts. From screens/work.js INSP['new-offer'] / INSP.offer. */
import { useState } from 'react';
import { Link } from 'react-router';
import { roleText, Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { State } from '@/components/ui/StatusBadge';
import { visibleDivs } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dLong } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { InspectorRef } from '@/app/ui-state';
import type { Offer } from '@/types/workspace';
import { projOf } from '../../services/selectors';
import { answerOffer, resendOffer, sendOffer, withdrawOffer } from '../../services/task-actions';
import { Meta, MetaRow, PeopleSelect } from '../task-panel/parts';

const h2 = 'mt-3 mb-2 type-h2';

export function NewOfferPanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const from = typeof insp.fromTask === 'string' ? db.tasks.find((x) => x.id === insp.fromTask) : undefined;
  const [to, setTo] = useState(typeof insp.to === 'string' ? insp.to : '');
  const [title, setTitle] = useState(from?.title ?? '');
  const [result, setResult] = useState('');
  const [due, setDue] = useState(from?.due ?? '');
  const [project, setProject] = useState(from?.project ?? '');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ to?: string; title?: string }>({});
  if (!me) return null;
  const projects = db.projects.filter(
    (p) => visibleDivs(me).includes(p.div) && !['completed', 'cancelled', 'archived'].includes(p.stage),
  );
  const send = () => {
    const e = {
      to: to ? undefined : t('Choose who you are asking.'),
      title: title.trim() ? undefined : t('Give the task a title.'),
    };
    setErrors(e);
    if (e.to || e.title) return;
    void sendOffer({
      to,
      title: title.trim(),
      result: result.trim(),
      due: due || null,
      project: project || null,
      note: note.trim(),
      fromTask: from?.id ?? null,
    });
  };
  return (
    <>
      <InspectorHead>{t('Task for someone else')}</InspectorHead>
      <h2 className={h2}>{from ? t('Ask someone to take this over') : t('Ask someone to do a task')}</h2>
      <p className="-mt-1 mb-3.5 text-mute type-small">
        {t('They can accept, ask for changes or decline. Nothing is assigned until they accept.')}
      </p>
      <Field label={t('Ask')} htmlFor="of-to" required help={errors.to} error>
        <PeopleSelect
          id="of-to"
          value={to}
          exclude={[me.id]}
          blank={t('Choose a person')}
          className={errors.to ? invalidClass : undefined}
          onChange={setTo}
        />
      </Field>
      <Field label={t('Task')} htmlFor="of-title" required help={errors.title} error>
        <input
          id="of-title"
          className={cn(inputClass, errors.title && invalidClass)}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Expected result')} htmlFor="of-result">
        <input
          id="of-result"
          className={inputClass}
          placeholder={t('What should exist when it is done?')}
          value={result}
          onChange={(e) => {
            setResult(e.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Needed by')} htmlFor="of-due" optional>
          <DateField id="of-due" kind="due" label={t('Needed by')} value={due} onChange={setDue} />
        </Field>
        <Field label={t('Project')} htmlFor="of-proj" optional>
          <SelectField
            id="of-proj"
            value={project}
            onChange={setProject}
            options={[{ value: '', label: t('None') }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          />
        </Field>
      </Grid2>
      <Field label={t('Message')} htmlFor="of-note" optional>
        <textarea
          id="of-note"
          className={textareaClass}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </Field>
      <div className="mt-[18px] flex flex-wrap gap-2">
        <Button variant="primary" onClick={send}>
          {t('Send')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

const OFFER_STATE: Record<string, [string, string, 'ink2' | 'green' | 'mute' | 'warn']> = {
  pending: ['Waiting for an answer', 'clock', 'ink2'],
  accepted: ['Accepted', 'check', 'green'],
  declined: ['Declined', 'close', 'mute'],
  changes: ['Changes requested', 'undo', 'warn'],
  withdrawn: ['Withdrawn', 'close', 'mute'],
};

const quote = 'my-3 rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13h';

function ReviseForm({ offer, done }: { offer: Offer; done: () => void }) {
  const [title, setTitle] = useState(offer.title);
  const [result, setResult] = useState(offer.result);
  const [due, setDue] = useState(offer.due ?? '');
  const [note, setNote] = useState(offer.note);
  const [error, setError] = useState('');
  const send = () => {
    if (!title.trim()) {
      setError(t('Give the task a title.'));
      return;
    }
    void resendOffer(offer.id, { title, result, due: due || null, note });
  };
  return (
    <div>
      <Field label={t('Task')} htmlFor="or-title" help={error} error>
        <input
          id="or-title"
          className={cn(inputClass, error && invalidClass)}
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
        />
      </Field>
      <Field label={t('Expected result')} htmlFor="or-result">
        <textarea
          id="or-result"
          className={cn(textareaClass, 'min-h-16')}
          value={result}
          onChange={(e) => {
            setResult(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Needed by')} htmlFor="or-due">
        <DateField id="or-due" kind="due" label={t('Needed by')} value={due} onChange={setDue} />
      </Field>
      <Field label={t('Note')} htmlFor="or-note">
        <textarea
          id="or-note"
          className={cn(textareaClass, 'min-h-16')}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </Field>
      <div className="mt-[18px] flex flex-wrap gap-2">
        <Button variant="primary" onClick={send}>
          {t('Send again')}
        </Button>
        <Button variant="ghost" onClick={done}>
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

export function OfferPanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const [form, setForm] = useState<'' | 'changes' | 'revise'>('');
  const [reply, setReply] = useState('');
  const offer = db.offers.find((x) => x.id === insp.id);
  if (!offer || !me) return <InspectorHead>{t('Task offer')}</InspectorHead>;
  const project = projOf(db, offer.project);
  const st = OFFER_STATE[offer.state] ?? OFFER_STATE.pending;
  const sender = db.people.find((p) => p.id === offer.from);
  const answer = (r: 'accepted' | 'declined' | 'changes') => {
    void answerOffer(offer.id, r, reply);
  };
  const actions = 'mt-[18px] flex flex-wrap gap-2';
  return (
    <>
      <InspectorHead>{t('Task offer')}</InspectorHead>
      <h2 className={h2}>{offer.title}</h2>
      {st && <State label={t(st[0])} icon={st[1]} tone={st[2]} pill="pill-o" />}
      <div className="mt-3.5">
        <Meta>
          <MetaRow label={t('From')}>
            <Avatar id={offer.from} size="xs" />
            {who.name(offer.from)}
            {sender && <small>{roleText(sender)}</small>}
          </MetaRow>
          <MetaRow label={t('To')}>
            <Avatar id={offer.to} size="xs" />
            {who.name(offer.to)}
          </MetaRow>
          {offer.result && <MetaRow label={t('Expected result')}>{offer.result}</MetaRow>}
          <MetaRow label={t('Needed by')}>
            {offer.due ? dLong(offer.due) : <span className="text-mute">{t('No date')}</span>}
          </MetaRow>
          {project && (
            <MetaRow label={t('Project')}>
              <Link className="underline" to={`/projects/${project.id}`} onClick={closeInspector}>
                {project.name}
              </Link>
            </MetaRow>
          )}
          <MetaRow label={t('Sent')}>{who.stamp(offer.from, offer.at)}</MetaRow>
        </Meta>
      </div>
      {offer.note && <p className={quote}>{offer.note}</p>}
      {offer.reply && (
        <p className={quote}>
          <b>{who.first(offer.to)}:</b> {offer.reply}
        </p>
      )}
      {offer.to === me.id &&
        offer.state === 'pending' &&
        (form === 'changes' ? (
          <>
            <Field label={t('What would you need changed?')} htmlFor="of-reply">
              <textarea
                id="of-reply"
                className={textareaClass}
                autoFocus
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                }}
              />
            </Field>
            <div className={actions}>
              <Button
                variant="primary"
                onClick={() => {
                  answer('changes');
                }}
              >
                {t('Send')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setForm('');
                }}
              >
                {t('Cancel')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={actions}>
              <Button
                variant="primary"
                onClick={() => {
                  answer('accepted');
                }}
              >
                <Icon name="check" />
                {t('Accept')}
              </Button>
              <Button
                onClick={() => {
                  setForm('changes');
                }}
              >
                {t('Ask for changes')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  answer('declined');
                }}
              >
                {t('Decline')}
              </Button>
            </div>
            <p className="mt-2 text-mute type-small">
              {t('Declining has no penalty. {who} will see your answer.', { who: who.first(offer.from) })}
            </p>
          </>
        ))}
      {offer.from === me.id &&
        offer.state === 'changes' &&
        (form === 'revise' ? (
          <ReviseForm
            offer={offer}
            done={() => {
              setForm('');
            }}
          />
        ) : (
          <div className={actions}>
            <Button
              variant="primary"
              onClick={() => {
                setForm('revise');
              }}
            >
              <Icon name="edit" />
              {t('Change and send again')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                void withdrawOffer(offer.id);
              }}
            >
              {t('Withdraw')}
            </Button>
          </div>
        ))}
      {offer.from === me.id && offer.state === 'pending' && (
        <div className={actions}>
          <Button
            variant="ghost"
            onClick={() => {
              void withdrawOffer(offer.id);
            }}
          >
            {t('Withdraw')}
          </Button>
        </div>
      )}
      {offer.state === 'accepted' && offer.task && (
        <div className={actions}>
          <Button
            onClick={() => {
              if (offer.task) openTask(offer.task);
            }}
          >
            {t('Open the task')}
          </Button>
        </div>
      )}
    </>
  );
}

PANELS['new-offer'] = NewOfferPanel;
PANELS.offer = OfferPanel;
