/* New request to MCIT: an IT request or a content brief. The draft survives errors and reloads (work_forms); a typed password or
   token is refused before saving. From divisions/div-fnl-mcit.js newItPage and ACT['mc-new-submit']. */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, Segmented, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { rank } from '@/lib/access';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { okDate, safeUrl, isBoardP } from '@/features/fnl/services/fnl-data';
import { useFieldErrors } from '@/features/fnl/components/fnl-parts';
import { saveMcDraft, submitBrief, submitIt } from '../services/it';
import { CH, ITYPE, MC, hasSecret, mcitOf, type ChannelId, type ItRequest, type ItType } from '../services/mcit-data';

type DraftValues = Record<string, unknown>;
const str = (d: DraftValues, k: string, def = '') => (typeof d[k] === 'string' ? d[k] : def);
const SECRET_MSG = 'This looks like a password or code. Remove it; IT never needs it here.';

export function NewRequestPage({ kind: rawKind }: { kind: string | undefined }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  const kind = rawKind === 'brief' ? 'brief' : 'it';
  const saved = (m && mcitOf(db).drafts[m.id]?.[kind]) ?? {};
  const [d, setD] = useState<DraftValues>(saved);
  const fe = useFieldErrors();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useDivisionWorkspace(MC);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );
  // Switching between IT and brief loads that kind's own draft.
  const [shown, setShown] = useState(kind);
  if (shown !== kind) {
    setShown(kind);
    setD((m && mcitOf(db).drafts[m.id]?.[kind]) ?? {});
  }
  if (!m || isBoardP(m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const set = (k: string, v: unknown) => {
    const next = { ...d, [k]: v };
    setD(next);
    fe.clear();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void saveMcDraft(kind, next);
    }, 700);
  };
  const stamp = typeof saved._at === 'string' ? saved._at.slice(11, 16) : '';
  const submit = () => {
    clearTimeout(timer.current);
    if (kind === 'it') {
      const title = str(d, 'title').trim();
      const sym = str(d, 'symptom').trim();
      const exp = str(d, 'expected').trim();
      const ev = str(d, 'evidence').trim();
      const steps = str(d, 'steps').trim();
      if (!title) return fe.fail('title', t('Give the request a title.'));
      if (!sym) return fe.fail('symptom', t('Say what happens.'));
      if (!exp) return fe.fail('expected', t('Say what should happen.'));
      if (ev && !safeUrl(ev)) return fe.fail('evidence', t('Links must start with https://.'));
      if (hasSecret(title, sym, exp, steps)) return fe.fail('symptom', t(SECRET_MSG));
      void submitIt({
        title,
        type: str(d, 'type', 'access') as ItType,
        service: str(d, 'service') || null,
        symptom: sym,
        expected: exp,
        impact: str(d, 'impact', 'one') as ItRequest['impact'],
        steps,
        evidence: ev,
      });
    } else {
      const title = str(d, 'title').trim();
      const purpose = str(d, 'purpose').trim();
      const del = str(d, 'deliverable').trim();
      const date = str(d, 'desired');
      if (!title) return fe.fail('title', t('Give the brief a title.'));
      if (!purpose) return fe.fail('purpose', t('Say what it is for.'));
      if (!del) return fe.fail('deliverable', t('Say what you need delivered.'));
      if (!okDate(date)) return fe.fail('desired', t('Choose the date you would like it by.'));
      void submitBrief({
        title,
        purpose,
        audience: str(d, 'audience'),
        channel: str(d, 'channel', 'instagram') as ChannelId,
        deliverable: del,
        desired: date,
        sources: str(d, 'sources'),
        approver: str(d, 'approver') || null,
      });
    }
  };
  const inp = (k: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      id={`mc-${kind === 'it' ? 'i' : 'b'}-${k}`}
      className={cn(inputClass, fe.bad(k) && invalidClass)}
      value={str(d, k)}
      autoComplete="off"
      onChange={(e) => {
        set(k, e.target.value);
      }}
      {...extra}
    />
  );
  const area = (k: string) => (
    <textarea
      id={`mc-${kind === 'it' ? 'i' : 'b'}-${k}`}
      className={cn(textareaClass, 'min-h-16', fe.bad(k) && invalidClass)}
      value={str(d, k)}
      onChange={(e) => {
        set(k, e.target.value);
      }}
    />
  );
  const accs = mcitOf(db).accounts.filter((a) => !a.hidden);
  const approvers = db.people.filter((p) => p.status === 'active' && p.div === m.div && rank(p) >= 2);
  const id = (k: string) => `mc-${kind === 'it' ? 'i' : 'b'}-${k}`;
  return (
    <Page>
      <PageHeader
        title={kind === 'it' ? t('New IT request') : t('New content brief')}
        sub={
          kind === 'it'
            ? t('IT triages it, names an owner and links the work. You confirm whether it is solved.')
            : t('MCIT checks it is complete, then accepts it as a content item or returns it with a reason.')
        }
      >
        <Segmented<string>
          label={t('Request type')}
          value={kind}
          onChange={(k) => {
            void navigate(`/it-requests/new/${k}`);
          }}
          options={[
            ['it', t('IT')],
            ['brief', t('Content brief')],
          ]}
        />
      </PageHeader>
      {kind === 'it' ? (
        <>
          <Notice
            icon="lock"
            tone="warn"
            className="mt-3 mb-3"
            title={<b>{t('Never type passwords, codes or tokens')}</b>}
          >
            <p>{t('Describe the problem only. If access is the issue, IT routes you to the account custodian.')}</p>
          </Notice>
          <div className="mt-[18px] grid max-w-[720px] gap-3.5">
            <Grid2>
              <Field label={t('Kind of help')} htmlFor={id('type')} required>
                <SelectField
                  id={id('type')}
                  value={str(d, 'type', 'access')}
                  onChange={(v) => {
                    set('type', v);
                  }}
                  options={(Object.keys(ITYPE) as ItType[]).map((k) => ({ value: k, label: t(ITYPE[k]) }))}
                />
              </Field>
              <Field label={t('Service')} htmlFor={id('service')}>
                <SelectField
                  id={id('service')}
                  value={str(d, 'service')}
                  onChange={(v) => {
                    set('service', v);
                  }}
                  options={[
                    { value: '', label: t('Not listed') },
                    ...accs.map((a) => ({ value: a.id, label: a.service })),
                  ]}
                />
              </Field>
            </Grid2>
            <Field label={t('Title')} htmlFor={id('title')} required help={fe.help('title')} error={fe.bad('title')}>
              {inp('title')}
            </Field>
            <Field
              label={t('What happens')}
              htmlFor={id('symptom')}
              required
              help={fe.help('symptom')}
              error={fe.bad('symptom')}
            >
              {area('symptom')}
            </Field>
            <Field
              label={t('What should happen')}
              htmlFor={id('expected')}
              required
              help={fe.help('expected')}
              error={fe.bad('expected')}
            >
              {area('expected')}
            </Field>
            <Grid2>
              <Field label={t('Who is affected')} htmlFor={id('impact')}>
                <SelectField
                  id={id('impact')}
                  value={str(d, 'impact', 'one')}
                  onChange={(v) => {
                    set('impact', v);
                  }}
                  options={[
                    { value: 'one', label: t('Only me') },
                    { value: 'team', label: t('My team') },
                    { value: 'all', label: t('Everyone or the public') },
                  ]}
                />
              </Field>
              <Field
                label={t('Screenshot or evidence link')}
                htmlFor={id('evidence')}
                help={fe.help('evidence', t('A safe screenshot. Crop out personal data.'))}
                error={fe.bad('evidence')}
              >
                {inp('evidence', { placeholder: 'https://' })}
              </Field>
            </Grid2>
            <Field label={t('Steps to see it')} htmlFor={id('steps')}>
              {area('steps')}
            </Field>
          </div>
        </>
      ) : (
        <div className="mt-[18px] grid max-w-[720px] gap-3.5">
          <Field label={t('Title')} htmlFor={id('title')} required help={fe.help('title')} error={fe.bad('title')}>
            {inp('title')}
          </Field>
          <Field
            label={t('Purpose')}
            htmlFor={id('purpose')}
            required
            help={fe.help('purpose')}
            error={fe.bad('purpose')}
          >
            {area('purpose')}
          </Field>
          <Grid2>
            <Field label={t('Audience')} htmlFor={id('audience')}>
              {inp('audience')}
            </Field>
            <Field label={t('Channel')} htmlFor={id('channel')}>
              <SelectField
                id={id('channel')}
                value={str(d, 'channel', 'instagram')}
                onChange={(v) => {
                  set('channel', v);
                }}
                options={(Object.keys(CH) as ChannelId[]).map((k) => ({ value: k, label: CH[k] }))}
              />
            </Field>
          </Grid2>
          <Grid2>
            <Field
              label={t('Deliverable')}
              htmlFor={id('deliverable')}
              required
              help={fe.help('deliverable')}
              error={fe.bad('deliverable')}
            >
              {inp('deliverable', { placeholder: t('One carousel, four slides') })}
            </Field>
            <Field
              label={t('Wanted by')}
              htmlFor={id('desired')}
              required
              help={fe.help('desired', t('A wish, not an agreed date. MCIT confirms when it accepts.'))}
              error={fe.bad('desired')}
            >
              <DateField
                id={id('desired')}
                value={str(d, 'desired')}
                onChange={(v) => {
                  set('desired', v);
                }}
              />
            </Field>
          </Grid2>
          <Field
            label={t('Source material')}
            htmlFor={id('sources')}
            help={t('Facts, photos with consent, approved wording. Links only.')}
          >
            {area('sources')}
          </Field>
          <Field label={t('Approving owner in your unit')} htmlFor={id('approver')}>
            <SelectField
              id={id('approver')}
              people
              value={str(d, 'approver')}
              onChange={(v) => {
                set('approver', v);
              }}
              options={[{ value: '', label: t('Choose') }, ...approvers.map((p) => ({ value: p.id, label: p.name }))]}
            />
          </Field>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={submit}>
          {t('Submit request')}
        </Button>
        <span className="text-mute type-caption">{stamp && t('Draft saved {t}', { t: stamp })}</span>
      </div>
    </Page>
  );
}
