/* Follow-ups: each one is a task, so it also shows in My Work and Schedule. Overdue means the date passed, never that the
   contact failed. Recording an outcome closes the task and keeps the attempt in the history. From divisions/div-ee-cons.js
   fuPage (external_followup, external_no_response). */
import { Avatar } from '@/components/shared/Avatar';
import { Chip, DivCrumb, Hint, Tag } from '@/components/shared/division-ui';
import { Segmented } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { addDays, dShort, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { EE, OUT, eeMember, ixFor, orgOf, rk, seeDiv } from '../services/ee-data';
import { FollowupRow, followupLinks, openFollowups, type Followup } from './ext-parts';

export const FollowupsCrumb = () => <DivCrumb d={EE} parts={[['followups', t('Follow-ups')]]} />;

function DoneRow({ x }: { x: Followup }) {
  const db = useWorkspace((w) => w);
  const i = ixFor(db, x.task);
  const o = orgOf(db, x.org);
  return (
    <Row
      className="gap-2.5"
      onOpen={() => {
        openTask(x.task);
      }}
    >
      <Avatar id={x.t.owner} size="sm" />
      <RowText
        title={<b>{x.t.title}</b>}
        sub={`${o ? o.name : ''}. ${i ? i.summary : t('Completed without a recorded outcome')}`}
      />
      {i ? <Chip def={OUT[i.outcome]} pill="pill-o" /> : <Tag unknown>{t('No outcome')}</Tag>}
      <span className="text-mute type-num">{x.t.doneAt ? dShort(x.t.doneAt) : ''}</span>
    </Row>
  );
}

export function FollowupsPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const stored = useUi((u) => (typeof u.ecFuMine === 'boolean' ? u.ecFuMine : null));
  useDivisionWorkspace(EE);
  if (!m || !seeDiv(m, EE))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const mine = stored ?? (eeMember(m) && rk(m) < 2);
  const open = openFollowups(db, (_x, task) => !mine || task.owner === m.id);
  const t0 = today();
  const wk = addDays(t0, 7);
  const groups: [string, (x: Followup) => boolean][] = [
    ['Overdue', (x) => !!x.t.due && x.t.due < t0],
    ['Today', (x) => x.t.due === t0],
    ['Next 7 days', (x) => !!x.t.due && x.t.due > t0 && x.t.due <= wk],
    ['Later', (x) => !!x.t.due && x.t.due > wk],
    ['No date', (x) => !x.t.due],
  ];
  const done = followupLinks(db, (_x, task) => task.status === 'done' && (!mine || task.owner === m.id))
    .sort((a, b) => (b.t.doneAt ?? '').localeCompare(a.t.doneAt ?? ''))
    .slice(0, 8);
  return (
    <Page wide>
      <PageHeader
        title={t('Follow-ups')}
        sub={t(
          'Each follow-up is a task, so it also shows in My Work and Schedule. Overdue means the date passed, never that the contact failed.',
        )}
      >
        <Segmented<'1' | '0'>
          label={t('Whose follow-ups')}
          value={mine ? '1' : '0'}
          onChange={(k) => {
            setUi((u) => {
              u.ecFuMine = k === '1';
            });
          }}
          options={[
            ['1', t('Mine')],
            ['0', t('All of EE')],
          ]}
        />
      </PageHeader>
      {open.length ? (
        groups.map(([g, f]) => {
          const xs = open.filter(f);
          return xs.length ? (
            <div key={g}>
              <SectionHeading as="h2" count={xs.length}>
                {t(g)}
              </SectionHeading>
              <Rows>
                {xs.map((x) => (
                  <FollowupRow key={x.task} x={x} />
                ))}
              </Rows>
            </div>
          ) : null;
        })
      ) : (
        <Empty title={mine ? t('No open follow-ups for you') : t('No open follow-ups')}>
          {t('Create one from a relationship or an opportunity so the next step has an owner.')}
        </Empty>
      )}
      {done.length > 0 && (
        <>
          <SectionHeading as="h2" count={done.length}>
            {t('Recently completed')}
          </SectionHeading>
          <Rows>
            {done.map((x) => (
              <DoneRow key={x.task} x={x} />
            ))}
          </Rows>
        </>
      )}
      <Hint>
        {t(
          'Recording an outcome closes the task and keeps the attempt in the history. The next follow-up is always a separate, explicit task.',
        )}
      </Hint>
    </Page>
  );
}
