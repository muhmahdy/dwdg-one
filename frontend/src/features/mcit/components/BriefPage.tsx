/* One content brief: MCIT checks it is complete, then accepts it as a content item or returns it with a reason; the requester
   answers a returned brief. The wanted date is a wish, not an agreed date. From divisions/div-fnl-mcit.js briefPage. */
import { useState } from 'react';
import { Link } from 'react-router';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Chip } from '@/components/shared/division-ui';
import { Button, buttonClass } from '@/components/ui/Button';
import { Field, invalidClass, textareaClass } from '@/components/ui/forms';
import { Notice } from '@/components/ui/Notice';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { isBoardP, unitName } from '@/features/fnl/services/fnl-data';
import { Acts, ByAt, NeededTag, Who, useFieldErrors } from '@/features/fnl/components/fnl-parts';
import { resubmitBrief, returnBrief } from '../services/it';
import { BST, CST, MC, brOf, canSeeBrief, chName, ctOf, mcLead, mg } from '../services/mcit-data';

function Reply({
  id,
  label,
  action,
  empty,
  onSubmit,
  help,
}: {
  id: string;
  label: string;
  action: string;
  empty: string;
  help?: string;
  onSubmit: (v: string) => void;
}) {
  const [v, setV] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field label={label} htmlFor={id} required help={fe.help('v', help)} error={fe.bad('v')}>
        <textarea
          id={id}
          className={cn(textareaClass, 'min-h-16', fe.bad('v') && invalidClass)}
          value={v}
          autoFocus
          onChange={(e) => {
            setV(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!v.trim()) return fe.fail('v', empty);
            onSubmit(v.trim());
          }}
        >
          {action}
        </Button>
        {id === 'mc-br-why' && (
          <Button
            variant="ghost"
            onClick={() => {
              setUi((u) => {
                u.form = null;
              });
            }}
          >
            {t('Cancel')}
          </Button>
        )}
      </Acts>
    </>
  );
}

export function BriefPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  useDivisionWorkspace(MC);
  const b = brOf(db, id);
  if (!b || !canSeeBrief(b, m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const lead = (mcLead(m) || mg(db, 'review', m?.id)) && !isBoardP(m);
  const req = b.requester === m?.id;
  const ct = b.content ? ctOf(db, b.content) : undefined;
  return (
    <Page>
      <PageHeader title={b.title} sub={t('Content brief from {u}', { u: unitName(b.unit) })}>
        <Chip def={BST[b.state]} pill="pill-o" />
      </PageHeader>
      {b.state === 'returned' && (
        <Notice icon="undo" tone="warn" className="mt-3 mb-3" title={<b>{t('Returned')}</b>}>
          <p>{b.returnNote}</p>
        </Notice>
      )}
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Created by')}>
          <ByAt id={b.createdBy} at={b.createdAt} />
        </MetaRow>
        <MetaRow label={t('Requester')}>
          <Who id={b.requester} />
        </MetaRow>
        <MetaRow label={t('Approving owner')}>
          <Who id={b.approver} />
        </MetaRow>
        <MetaRow label={t('Purpose')}>
          <span className="whitespace-pre-line">{b.purpose}</span>
        </MetaRow>
        <MetaRow label={t('Audience')}>{b.audience || t('Not given')}</MetaRow>
        <MetaRow label={t('Channel')}>{chName(b.channel)}</MetaRow>
        <MetaRow label={t('Deliverable')}>{b.deliverable}</MetaRow>
        <MetaRow label={t('Wanted by')}>
          <NeededTag d={b.desired} />{' '}
          <span className="text-mute type-small">{t('Not agreed until MCIT accepts.')}</span>
        </MetaRow>
        <MetaRow label={t('Source material')}>
          <span className="whitespace-pre-line">{b.sources || t('Not given')}</span>
        </MetaRow>
        {ct && (
          <MetaRow label={t('Content item')}>
            <Link to={`/content/${ct.id}`}>{ct.title}</Link> <Chip def={CST[ct.stage]} />
          </MetaRow>
        )}
      </Meta>
      {b.state === 'submitted' &&
        lead &&
        (form === 'b-ret' ? (
          <Reply
            id="mc-br-why"
            label={t('What is missing')}
            help={t('Return unclear briefs instead of promising a date.')}
            action={t('Return')}
            empty={t('Say what is missing.')}
            onSubmit={(v) => {
              void returnBrief(b.id, v);
            }}
          />
        ) : (
          <Acts>
            <Link className={buttonClass('primary', false, 'no-underline')} to={`/content/new/${b.id}`}>
              {t('Accept and create content')}
            </Link>
            <Button
              onClick={() => {
                setUi((u) => {
                  u.form = 'b-ret';
                });
              }}
            >
              {t('Return')}
            </Button>
          </Acts>
        ))}
      {b.state === 'returned' && req && (
        <Reply
          id="mc-br-ans"
          label={t('Your answer')}
          action={t('Send again')}
          empty={t('Write your answer.')}
          onSubmit={(v) => {
            void resubmitBrief(b.id, v);
          }}
        />
      )}
    </Page>
  );
}
