/* People: the roster, batch membership and onboarding (hr_person, hr_onboarding, hr_exports, flow-hr-onboarding, W049). One
   person record; applicant and private review data never appear here. From divisions/div-hr-sng.js peoplePage, INSP['hr-export']
   and INSP['hr-ob']. */
import { useState } from 'react';
import { Link } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar, roleLabel } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { PersonLink } from '@/components/shared/PersonLink';
import { Button, buttonClass } from '@/components/ui/Button';
import { Field, Grid2 } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { rank } from '@/lib/access';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { openPerson, openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { hrLead } from '@/lib/roles';
import { addDays, dShort, fmtD, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { isDone } from '@/features/work/services/selectors';
import type { DivisionId, Person } from '@/types/workspace';
import { hrOf } from '../services/hr-data';
import {
  EXPORT_IN,
  EXPORT_OUT,
  applyChecklist,
  canPeople,
  exportRoster,
  itemOwner,
  itemTasks,
  obInst,
  obTpl,
  startOnboarding,
} from '../services/onboarding';
import { Chip, DivCrumb, Hint, td, th, tblClass, tblScroll, trLink } from './HrParts';

export const HrPeopleCrumb = () => <DivCrumb d="hr" parts={[['hr-people', t('People')]]} />;

type Tab = 'roster' | 'onboarding' | 'changes';
const TABS: [Tab, string][] = [
  ['roster', 'Roster'],
  ['onboarding', 'Onboarding'],
  ['changes', 'Membership changes'],
];

const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);

const openExport = () => {
  setUi((u) => {
    u.insp = { type: 'hr-export', id: 'roster' };
  });
};

function Roster({ div, setDiv }: { div: string; setDiv: (v: string) => void }) {
  const db = useWorkspace((w) => w);
  const ppl = db.people
    .filter((p) => (p.status === 'active' || p.status === 'pending') && (!div || p.div === div))
    .sort((a, b) => (a.div ?? '').localeCompare(b.div ?? '') || rank(b) - rank(a));
  return (
    <>
      <div className="mt-4 mb-2.5 flex flex-wrap items-center gap-2">
        <SelectField
          small
          label={t('Division')}
          value={div}
          onChange={setDiv}
          options={[{ value: '', label: t('All divisions') }, ...DIVS.map((d) => ({ value: d.id, label: d.name }))]}
        />
        <span className="text-mute type-small">{plural(ppl.length, '{n} person', '{n} people')}</span>
        <span className="flex-1" />
        <Button small onClick={openExport}>
          <Icon name="download" />
          {t('Export roster')}
        </Button>
      </div>
      <div className={tblScroll}>
        <table className={tblClass}>
          <thead>
            <tr>
              <th className={th}>{t('Member')}</th>
              <th className={th}>{t('Division')}</th>
              <th className={th}>{t('Role')}</th>
              <th className={th}>{t('Term')}</th>
              <th className={th}>{t('Date joined')}</th>
              <th className={th}>{t('Account')}</th>
            </tr>
          </thead>
          <tbody>
            {ppl.map((p: Person) => (
              <tr
                key={p.id}
                className={trLink}
                tabIndex={0}
                onClick={() => {
                  openPerson(p.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openPerson(p.id);
                }}
              >
                <td className={td}>
                  <PersonLink id={p.id} full />
                </td>
                <td className={td}>{p.div ? divisionOf(p.div)?.short : t('Organization')}</td>
                <td className={td}>{roleLabel(p)}</td>
                <td className={td}>{t('Batch 2026')}</td>
                <td className={cn(td, 'type-num')}>
                  {p.joined ? fmtD(p.joined) : <span className="text-mute">{t('Not recorded')}</span>}
                </td>
                <td className={td}>
                  {p.status === 'pending' ? (
                    <Chip def={['Waiting for approval', 'clock', 'warn']} pill="pill-o" />
                  ) : (
                    <Chip def={['Active', 'check', 'green']} pill="pill-o" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Hint>
        {t(
          'One person record; the batch membership holds division, role and dates. Moving to another team next batch adds a membership, never a second profile.',
        )}
      </Hint>
    </>
  );
}

function NewOnboarding({ onDone }: { onDone: () => void }) {
  const db = useWorkspace((w) => w);
  const h = hrOf(db);
  const cands = db.people.filter(
    (p) => p.div && !h?.onboarding.instances.some((x) => x.person === p.id) && ['active', 'pending'].includes(p.status),
  );
  const buddies = db.people.filter((p) => p.status === 'active' && !!p.div);
  const [p, setP] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const person = p ?? cands[0]?.id ?? '';
  const buddy = b ?? buddies[0]?.id ?? '';
  return (
    <SubForm>
      <Grid2>
        <Field label={t('Member')} htmlFor="hr-ob-p">
          <SelectField
            id="hr-ob-p"
            people
            value={person}
            onChange={setP}
            options={cands.map((x) => ({ value: x.id, label: x.name }))}
          />
        </Field>
        <Field label={t('Buddy')} htmlFor="hr-ob-b">
          <SelectField
            id="hr-ob-b"
            people
            value={buddy}
            onChange={setB}
            options={buddies.map((x) => ({ value: x.id, label: x.name }))}
          />
        </Field>
      </Grid2>
      <div className="flex gap-2">
        <Button
          small
          variant="primary"
          onClick={() => {
            if (!person || !buddy) return;
            void startOnboarding(person, buddy).then(onDone);
          }}
        >
          {t('Start onboarding')}
        </Button>
        <Button small variant="ghost" onClick={onDone}>
          {t('Cancel')}
        </Button>
      </div>
    </SubForm>
  );
}

function Onboarding() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const [adding, setAdding] = useState(false);
  const h = hrOf(db);
  const tpl = h?.onboarding.templates[0];
  if (!h || !tpl) return null;
  return (
    <>
      <SectionHeading as="h2">{t('Template')}</SectionHeading>
      <div className="max-w-[760px] rounded-sheet bg-surface-2 px-4 py-3.5">
        <b>
          {tpl.name} v{tpl.version}
        </b>
        <ol className="my-2 grid list-decimal gap-1 pl-5 text-[length:13.5px]">
          {tpl.items.map((i) => (
            <li key={i.title}>
              {i.title.replace('{name}', t('the new member'))}{' '}
              <small className="text-mute">
                {t(({ member: 'New member', buddy: 'Buddy', hr: 'HR owner' } as const)[i.owner])},{' '}
                {plural(i.days, 'within {n} day', 'within {n} days')}
              </small>
            </li>
          ))}
        </ol>
        <p className="m-0 text-mute type-small">
          {t(
            'Applying creates real tasks with owners and due dates. Editing the template later never rewrites a member’s history.',
          )}
        </p>
      </div>
      <SectionHeading as="h2" count={h.onboarding.instances.length}>
        {t('New members')}
      </SectionHeading>
      <div className="grid gap-3">
        {h.onboarding.instances.map((x) => {
          const p = db.people.find((v) => v.id === x.person);
          const ts = itemTasks(db, x);
          const done = ts.filter((tk) => !!tk && isDone(tk)).length;
          const pend = !!p && p.status !== 'active';
          const t0 = obTpl(db, x.template);
          return (
            <div key={x.id} className="grid max-w-[760px] gap-2.5 rounded-sheet bg-surface p-4 shadow-sheet">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2.5">
                  <Avatar id={x.person} size="sm" />
                  <b>{who.name(x.person)}</b>
                </span>
                {pend ? (
                  <Chip def={['Waiting for approval', 'clock', 'warn']} pill="pill" />
                ) : !x.appliedAt ? (
                  <Chip def={['Ready to apply', 'circle', 'ink2']} pill="pill" />
                ) : (
                  <Chip
                    def={[
                      t('{d} of {n} done', { d: done, n: ts.length }),
                      done === ts.length && ts.length ? 'check' : 'clock',
                      done === ts.length && ts.length ? 'green' : 'ink2',
                    ]}
                    pill="pill"
                  />
                )}
              </div>
              <Meta className="m-0 grid-cols-[140px_1fr]">
                <MetaRow label={t('Checklist')}>
                  {t0?.name} v{x.version}
                </MetaRow>
                <MetaRow label={t('Buddy')}>
                  <PersonLink id={x.buddy} />
                </MetaRow>
                <MetaRow label={t('HR owner')}>
                  <PersonLink id={x.hrOwner} />
                </MetaRow>
                <MetaRow label={t('Applied')}>
                  {x.appliedAt && x.appliedBy ? (
                    who.stamp(x.appliedBy, x.appliedAt)
                  ) : (
                    <span className="text-mute">{t('Not yet')}</span>
                  )}
                </MetaRow>
                <MetaRow label={t('Created by')}>{who.stamp(x.createdBy, x.createdAt)}</MetaRow>
              </Meta>
              {ts.length > 0 && (
                <>
                  <Rows>
                    {ts.map(
                      (tk) =>
                        tk && (
                          <Row
                            key={tk.id}
                            onOpen={() => {
                              openTask(tk.id);
                            }}
                          >
                            <Avatar id={tk.owner} size="sm" />
                            <RowText
                              title={<b>{tk.title}</b>}
                              sub={t('Due {d}', { d: tk.due ? dShort(tk.due) : t('No date') })}
                            />
                            <Chip
                              def={
                                isDone(tk)
                                  ? ['Completed', 'check', 'green']
                                  : tk.status === 'doing'
                                    ? ['In progress', 'clock', 'ink']
                                    : ['Not started', 'circle', 'mute']
                              }
                              pill="pill-o"
                            />
                          </Row>
                        ),
                    )}
                  </Rows>
                  <p className="m-0 text-mute type-small">
                    {t('Progress counts saved task states only. Missing evidence keeps an item open.')}
                  </p>
                </>
              )}
              {pend ? (
                <p className="m-0 text-mute type-small">
                  {t('An admin approves the membership first. HR never activates an account from here.')}
                </p>
              ) : (
                <div className="flex gap-2">
                  <Button
                    small
                    variant={x.appliedAt ? 'default' : 'primary'}
                    onClick={() => {
                      setUi((u) => {
                        u.insp = { type: 'hr-ob', id: x.id };
                      });
                    }}
                  >
                    {x.appliedAt ? t('Apply again') : t('Apply checklist')}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {hrLead(m) &&
        (adding ? (
          <NewOnboarding
            onDone={() => {
              setAdding(false);
            }}
          />
        ) : (
          <div className="mt-3 flex gap-2">
            <Button
              small
              onClick={() => {
                setAdding(true);
              }}
            >
              <Icon name="plus" />
              {t('Start onboarding for a member')}
            </Button>
          </div>
        ))}
    </>
  );
}

function Changes() {
  return (
    <div className="mt-3">
      <Notice
        icon="people"
        title={<b>{t('Transfers, leave and alumni run in Members')}</b>}
        actions={
          <Link className={buttonClass('default', true, 'no-underline')} to="/members">
            {t('Open Members')}
          </Link>
        }
      >
        <p>
          {t(
            'Before a change takes effect, Members previews open tasks, reviews and custody so every duty is reassigned or left visibly unresolved.',
          )}
        </p>
      </Notice>
      <Notice
        icon="lock"
        title={<b>{t('Candidate records are off')}</b>}
        actions={
          <Link className={buttonClass('default', true, 'no-underline')} to="/projects/p-oprec">
            {t('Open recruitment 2026')}
          </Link>
        }
      >
        <p>
          {t(
            'Recruitment stays a project until HR adopts the candidate fields, retention and reviewer access. Accepting a candidate never activates an account.',
          )}
        </p>
      </Notice>
    </div>
  );
}

export function HrPeoplePage() {
  const m = useMe();
  const [tab, setTab] = useState<Tab>('roster');
  const div = useUi((u) => (typeof u.hrPeopleDiv === 'string' ? u.hrPeopleDiv : ''));
  const setDiv = (v: string) => {
    setUi((u) => {
      u.hrPeopleDiv = v;
    });
  };
  useDivisionWorkspace('hr');
  if (!m || !canPeople(m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  return (
    <Page wide>
      <PageHeader
        title={t('People')}
        sub={t('Roster, batch membership and onboarding. Applicant and private review data never appear here.')}
      />
      <div className="mt-[18px] mb-1.5 flex gap-6 shadow-[inset_0_-1px_0_var(--line)]" role="tablist">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={cn(
              'relative inline-flex h-10 flex-none cursor-pointer items-center border-0 bg-transparent p-0 font-[550] whitespace-nowrap text-mute',
              tab === k &&
                "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-[2px] after:bg-ink after:content-['']",
            )}
            onClick={() => {
              setTab(k);
            }}
          >
            {t(l)}
          </button>
        ))}
      </div>
      {tab === 'roster' ? <Roster div={div} setDiv={setDiv} /> : tab === 'onboarding' ? <Onboarding /> : <Changes />}
    </Page>
  );
}

function ExportPanel() {
  const div = useUi((u) => (typeof u.hrPeopleDiv === 'string' ? u.hrPeopleDiv : ''));
  const db = useWorkspace((w) => w);
  const n = db.people.filter((p) => p.status === 'active' && (!div || p.div === div)).length;
  const dv = divisionOf(div);
  return (
    <>
      <InspectorHead>{t('Export roster')}</InspectorHead>
      <h2 className="mt-3 mb-1 type-h2">{t('Roster export')}</h2>
      <p className="text-mute type-small">
        {dv ? dv.name : t('All divisions')}, {plural(n, '{n} person', '{n} people')}
      </p>
      <SectionHeading count={EXPORT_IN.length}>{t('Included')}</SectionHeading>
      <ul className="my-1 mb-3 grid list-none gap-1.5 p-0 text-[length:13.5px]">
        {EXPORT_IN.map((x) => (
          <li key={x} className="flex items-center gap-2">
            <Icon name="check" size="sm" className="flex-none text-mute" />
            {t(x)}
          </li>
        ))}
      </ul>
      <SectionHeading count={EXPORT_OUT.length}>{t('Never included')}</SectionHeading>
      <ul className="my-1 mb-3 grid list-none gap-1.5 p-0 text-[length:13.5px]">
        {EXPORT_OUT.map((x) => (
          <li key={x} className="flex items-center gap-2">
            <Icon name="lock" size="sm" className="flex-none text-mute" />
            {t(x)}
          </li>
        ))}
      </ul>
      <p className="text-mute type-small">
        {t('Assessment, attendance reasons and recognition deliberation each have their own export scope.')}
      </p>
      <div className="mt-3">
        <Button
          variant="primary"
          onClick={() => {
            exportRoster(div as DivisionId | '');
          }}
        >
          <Icon name="download" />
          {t('Download CSV')}
        </Button>
      </div>
    </>
  );
}

function ObPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const i = obInst(db, String(insp.id));
  const tpl = i && obTpl(db, i.template);
  const p = i && db.people.find((v) => v.id === i.person);
  if (!i || !tpl || !p) return <InspectorHead>{t('Onboarding')}</InspectorHead>;
  const have = itemTasks(db, i);
  const todo = tpl.items.map((it, n) => ({ it, n })).filter(({ n }) => !have.some((v) => v?.obItem === n));
  return (
    <>
      <InspectorHead>{t('Onboarding')}</InspectorHead>
      <h2 className="mt-3 mb-1 type-h2">{t('Apply {t} for {who}', { t: tpl.name, who: who.name(i.person) })}</h2>
      {todo.length ? (
        <>
          <p>{plural(todo.length, 'This creates {n} task:', 'This creates {n} tasks:')}</p>
          <ul className="my-1 mb-3 grid list-none gap-1.5 p-0 text-[length:13.5px]">
            {todo.map(({ it }) => {
              const o = itemOwner(i, it.owner);
              return (
                <li key={it.title} className="flex items-center gap-2">
                  <Avatar id={o} size="xs" />
                  <span>
                    {it.title.replace('{name}', p.first)}{' '}
                    <small className="text-mute">
                      {who.first(o)}, {t('due {d}', { d: dShort(addDays(today(), it.days)) })}
                    </small>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <Notice icon="check" tone="done" title={<b>{t('Already applied')}</b>}>
          <p>{t('Every item already has its task. Applying again creates 0 new tasks.')}</p>
        </Notice>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            void applyChecklist(i.id);
          }}
        >
          {todo.length ? plural(todo.length, 'Create {n} task', 'Create {n} tasks') : t('Apply anyway')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

PANELS['hr-export'] = ExportPanel;
PANELS['hr-ob'] = (p) => <ObPanel key={String(p.insp.id)} {...p} />;
