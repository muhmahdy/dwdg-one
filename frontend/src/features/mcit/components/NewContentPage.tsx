/* New content: one item with its own executor, reviewer and dates per channel; optionally made from an accepted brief.
   From divisions/div-fnl-mcit.js newContentPage and ACT['mc-c-create']. */
import { useState } from 'react';
import { Link } from 'react-router';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { buttonClass, Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SelectField } from '@/components/ui/SelectField';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { addDays, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { useFieldErrors } from '@/features/external/components/ext-parts';
import { showToast } from '@/lib/workspace/transaction';
import { okDate, safeUrl } from '@/features/fnl/services/fnl-data';
import { createContent, okTime } from '../services/content';
import { CH, MC, brOf, canMakeContent, mcitOf, type ChannelId } from '../services/mcit-data';

export function NewContentPage({ fromBrief }: { fromBrief: string | undefined }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  useDivisionWorkspace(MC);
  const b = fromBrief ? brOf(db, fromBrief) : undefined;
  const s = mcitOf(db);
  const desired = b?.desired ?? addDays(today(), 7);
  const [title, setTitle] = useState(b?.title ?? '');
  const [kind, setKind] = useState(b?.deliverable ?? '');
  const [cmp, setCmp] = useState('');
  const [chs, setChs] = useState<ChannelId[]>(b ? [b.channel] : ['instagram']);
  const [plan, setPlan] = useState(desired);
  const [time, setTime] = useState('19:00');
  const [exec, setExec] = useState('');
  const [rev, setRev] = useState(s.grants.review[0] ?? '');
  const [due, setDue] = useState(addDays(desired, -3));
  const [brief, setBrief] = useState(
    b ? `${b.purpose}\n${t('Audience')}: ${b.audience}\n${t('Sources')}: ${b.sources}` : '',
  );
  const [asset, setAsset] = useState('');
  const fe = useFieldErrors();
  if (!canMakeContent(db, m)) {
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  }
  const mcPeople = db.people.filter((p) => p.status === 'active' && p.div === MC);
  const submit = () => {
    if (!title.trim()) return fe.fail('title', t('Give the content a title.'));
    if (!chs.length) {
      showToast(t('Choose at least one channel.'));
      return;
    }
    if (!okDate(plan)) return fe.fail('plan', t('Choose the planned publication date.'));
    if (!okTime(time)) return fe.fail('time', t('Use HH:MM, for example 19:00.'));
    if (!exec) return fe.fail('exec', t('Choose the executor.'));
    if (!okDate(due)) return fe.fail('due', t('Choose the internal due date.'));
    if (asset && !safeUrl(asset)) return fe.fail('asset', t('Links must start with https://.'));
    if (exec === rev) return fe.fail('rev', t('The reviewer must be someone other than the executor.'));
    void createContent({
      title: title.trim(),
      channels: chs,
      plan,
      time,
      exec,
      rev,
      due,
      asset: asset.trim(),
      campaign: cmp || null,
      kind: kind.trim(),
      brief,
      fromBrief: b?.id ?? null,
    });
  };
  const names = (ids: string[]) =>
    ids.map((id) => ({ value: id, label: db.people.find((p) => p.id === id)?.name ?? id }));
  return (
    <Page>
      <PageHeader
        title={t('New content')}
        sub={
          b
            ? t('From the brief "{t}" sent by {who}.', {
                t: b.title,
                who: db.people.find((p) => p.id === b.requester)?.name ?? '',
              })
            : t('One content item, with its own executor, reviewer and dates per channel.')
        }
      />
      <div className="mt-[18px] grid max-w-[720px] gap-3.5">
        <Field label={t('Title')} htmlFor="mc-n-title" required help={fe.help('title')} error={fe.bad('title')}>
          <input
            id="mc-n-title"
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
        <Grid2>
          <Field label={t('Format')} htmlFor="mc-n-kind">
            <input
              id="mc-n-kind"
              className={inputClass}
              value={kind}
              placeholder="Carousel post"
              autoComplete="off"
              onChange={(e) => {
                setKind(e.target.value);
              }}
            />
          </Field>
          <Field label={t('Campaign')} htmlFor="mc-n-cmp" help={t('Optional. A routine post needs none.')}>
            <SelectField
              id="mc-n-cmp"
              value={cmp}
              onChange={setCmp}
              options={[
                { value: '', label: t('No campaign') },
                ...s.campaigns.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </Field>
        </Grid2>
        <Field label={t('Channels')} required help={t('Each channel gets its own publication record.')}>
          <div className="flex flex-wrap gap-x-[18px] gap-y-1">
            {(Object.keys(CH) as ChannelId[]).map((k) => (
              <label key={k} className="inline-flex min-h-[var(--ctl-h)] cursor-pointer items-center gap-2 text-d13">
                <input
                  type="checkbox"
                  className="size-4 accent-ink"
                  checked={chs.includes(k)}
                  onChange={(e) => {
                    setChs(e.target.checked ? [...chs, k] : chs.filter((x) => x !== k));
                  }}
                />{' '}
                {CH[k]}
              </label>
            ))}
          </div>
        </Field>
        <Grid2>
          <Field
            label={t('Planned publication')}
            htmlFor="mc-n-plan"
            required
            help={fe.help('plan', t('Planned only. Publishing is recorded separately.'))}
            error={fe.bad('plan')}
          >
            <DateField
              id="mc-n-plan"
              value={plan}
              onChange={(v) => {
                setPlan(v);
                fe.clear();
              }}
            />
          </Field>
          <Field label={t('Time')} htmlFor="mc-n-time" help={fe.help('time')} error={fe.bad('time')}>
            <input
              id="mc-n-time"
              className={cn(inputClass, fe.bad('time') && invalidClass)}
              value={time}
              inputMode="numeric"
              autoComplete="off"
              onChange={(e) => {
                setTime(e.target.value);
                fe.clear();
              }}
            />
          </Field>
        </Grid2>
        <Grid2>
          <Field
            label={t('Executor')}
            htmlFor="mc-n-exec"
            required
            help={fe.help('exec', t('An offer outside MCIT needs the person to accept first.'))}
            error={fe.bad('exec')}
          >
            <SelectField
              id="mc-n-exec"
              people
              value={exec}
              onChange={(v) => {
                setExec(v);
                fe.clear();
              }}
              options={[{ value: '', label: t('Choose') }, ...names(mcPeople.map((p) => p.id))]}
            />
          </Field>
          <Field label={t('Reviewer')} htmlFor="mc-n-rev" required help={fe.help('rev')} error={fe.bad('rev')}>
            <SelectField
              id="mc-n-rev"
              people
              value={rev}
              onChange={(v) => {
                setRev(v);
                fe.clear();
              }}
              options={names(s.grants.review)}
            />
          </Field>
        </Grid2>
        <Field
          label={t('Internal due date')}
          htmlFor="mc-n-due"
          required
          help={fe.help(
            'due',
            t('When the executor sends a version for review. Usually before the planned publication.'),
          )}
          error={fe.bad('due')}
        >
          <DateField
            id="mc-n-due"
            value={due}
            onChange={(v) => {
              setDue(v);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Brief')} htmlFor="mc-n-brief">
          <textarea
            id="mc-n-brief"
            className={cn(textareaClass, 'min-h-16')}
            value={brief}
            onChange={(e) => {
              setBrief(e.target.value);
            }}
          />
        </Field>
        <Field
          label={t('Asset or brand link')}
          htmlFor="mc-n-asset"
          help={fe.help('asset', t('A link is not a copy. Access stays with the file owner.'))}
          error={fe.bad('asset')}
        >
          <input
            id="mc-n-asset"
            className={cn(inputClass, fe.bad('asset') && invalidClass)}
            placeholder="https://"
            value={asset}
            autoComplete="off"
            onChange={(e) => {
              setAsset(e.target.value);
              fe.clear();
            }}
          />
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={submit}>
          {t('Create content')}
        </Button>
        <Link className={buttonClass('ghost', false, 'no-underline')} to="/content">
          {t('Cancel')}
        </Link>
      </div>
    </Page>
  );
}
