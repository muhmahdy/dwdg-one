/* Initiatives: the board (Now, Next, Later) or list of Strategy & Growth work, and one initiative from problem and evidence to
   decision, delivery project, dependencies and outcome review. Now, Next and Later are planning choices, not predictions.
   From divisions/div-hr-sng.js initiativesPage, initiativePage, depCard, INSP['sng-new'] and INSP['sng-src']. */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { PersonLink } from '@/components/shared/PersonLink';
import { ProjectObject } from '@/components/shared/art/objects';
import { Chip, DivCrumb, Hint, Locked, td, th, tblClass, tblScroll, trLink } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, Segmented, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Stage, TaskStatusMark } from '@/components/ui/StatusBadge';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { canCreateProject, visibleDivs } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openResource, openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { addDays, dShort, fmtD, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf, taskOf } from '@/features/work/services/selectors';
import type { DivisionId } from '@/types/workspace';
import { PacketVersions } from './PacketVersions';
import {
  DEPS,
  HZ,
  NEXT,
  OUTC,
  STG,
  initiativeOf,
  latestPacket,
  packetsOf,
  sngOf,
  type Horizon,
  type Initiative,
  type OutcomeState,
  type SngDep,
  type SngSource,
} from '../services/sng-data';
import {
  addInvestigationTask,
  addSource,
  answerDependency,
  askUnit,
  canEditInitiative,
  canSeeSource,
  canSng,
  createDeliveryProject,
  createInitiative,
  linkProject,
  recordObservation,
  recordOutcome,
  setHorizon,
  setStage,
} from '../services/strategy';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function InitiativesCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const i = route.id ? initiativeOf(db, route.id) : undefined;
  if (i && m && !canSng(m) && i.deps.some((d) => d.to === m.id))
    return <DivCrumb d="sng" parts={[['', t('Request to your unit')]]} />;
  if (i)
    return (
      <DivCrumb
        d="sng"
        parts={[
          ['initiatives', t('Initiatives')],
          ['', i.title],
        ]}
      />
    );
  return <DivCrumb d="sng" parts={[['initiatives', t('Initiatives')]]} />;
}

const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);
const Acts = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 flex flex-wrap gap-2">{children}</div>
);
const AddBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <Button
    small
    variant="ghost"
    className="float-right -mt-1.5 max-[760px]:float-none max-[760px]:mt-1.5 max-[760px]:flex"
    onClick={onClick}
  >
    <Icon name="plus" />
    {children}
  </Button>
);

// ---------- the board and list ----------
function InitiativeCard({ i }: { i: Initiative }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const navigate = useNavigate();
  const pk = latestPacket(db, i);
  const p = projOf(db, i.project);
  return (
    <div
      className="grid cursor-pointer gap-1.5 rounded-[10px] bg-surface px-3 py-2.5 shadow-sheet hover:shadow-[var(--e-sheet),inset_0_0_0_1px_var(--line-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      tabIndex={0}
      role="link"
      onClick={() => {
        void navigate(`/initiatives/${i.id}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') void navigate(`/initiatives/${i.id}`);
      }}
    >
      <b className="text-d13 font-semibold">{i.title}</b>
      <div className="flex flex-wrap gap-x-2.5 gap-y-1">
        <Chip def={STG[i.stage]} />
        {i.outcome && <Chip def={OUTC[i.outcome.state]} />}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-d12 text-mute">
        <Avatar id={i.owner} size="xs" className="size-[22px]" />
        {who.first(i.owner)}
        {p && (
          <span className="inline-flex max-w-[150px] items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-ink-2">
            <Icon name="projects" size="xs" />
            {p.name}
          </span>
        )}
        <span className="ml-auto type-num">
          {i.stage === 'pending' && pk
            ? t('Decision by {who}', { who: who.first(pk.reviewer) })
            : i.reviewDate
              ? t('Review {d}', { d: dShort(i.reviewDate) })
              : ''}
        </span>
      </div>
    </div>
  );
}

function InitiativeList() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const view = useUi((u) => (u.sngView === 'list' ? 'list' : 'board'));
  const navigate = useNavigate();
  const all = sngOf(db).initiatives;
  useDivisionWorkspace('sng');
  if (!m || !canSng(m)) return <Unavailable />;
  return (
    <Page wide>
      <PageHeader
        title={t('Initiatives')}
        sub={t('Now, Next and Later are planning choices, not predictions. Sample records for the walkthrough.')}
      >
        <Segmented<'board' | 'list'>
          label={t('View')}
          value={view}
          onChange={(v) => {
            setUi((u) => {
              u.sngView = v;
            });
          }}
          options={[
            ['board', t('Board')],
            ['list', t('List')],
          ]}
        />
        {(m.div === 'sng' || m.admin) && (
          <Button
            variant="primary"
            onClick={() => {
              setUi((u) => {
                u.insp = { type: 'sng-new', id: 'new' };
              });
            }}
          >
            <Icon name="plus" />
            {t('New initiative')}
          </Button>
        )}
      </PageHeader>
      {view === 'board' ? (
        <div className="mt-4 grid auto-cols-[minmax(260px,1fr)] grid-flow-col items-start gap-3 overflow-x-auto max-[760px]:auto-cols-[82%]">
          {(Object.keys(HZ) as Horizon[]).map((k) => {
            const xs = all.filter((i) => i.horizon === k);
            return (
              <div key={k} className="flex flex-col gap-1.5 rounded-sheet bg-fill p-2">
                <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5 text-d13 font-semibold">
                  {t(HZ[k])}
                  <span className="text-mute type-num">{xs.length}</span>
                </div>
                {xs.length ? (
                  xs.map((i) => <InitiativeCard key={i.id} i={i} />)
                ) : (
                  <p className="m-0 p-1.5 text-mute type-small">{t('Nothing planned here')}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={cn(tblScroll, 'mt-3')}>
          <table className={tblClass}>
            <thead>
              <tr>
                <th className={th}>{t('Initiative')}</th>
                <th className={th}>{t('Horizon')}</th>
                <th className={th}>{t('Stage')}</th>
                <th className={th}>{t('Owner')}</th>
                <th className={th}>{t('Sources')}</th>
                <th className={th}>{t('Delivery project')}</th>
                <th className={th}>{t('Review date')}</th>
              </tr>
            </thead>
            <tbody>
              {all.map((i) => (
                <tr
                  key={i.id}
                  className={trLink}
                  tabIndex={0}
                  role="link"
                  onClick={() => {
                    void navigate(`/initiatives/${i.id}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void navigate(`/initiatives/${i.id}`);
                  }}
                >
                  <td className={td}>
                    <b>{i.title}</b>
                  </td>
                  <td className={td}>{t(HZ[i.horizon])}</td>
                  <td className={td}>
                    <Chip def={STG[i.stage]} pill="pill-o" />
                  </td>
                  <td className={td}>
                    <PersonLink id={i.owner} />
                  </td>
                  <td className={cn(td, 'type-num')}>{i.sources.length}</td>
                  <td className={td}>{projOf(db, i.project)?.name ?? <span className="text-mute">-</span>}</td>
                  <td className={cn(td, 'type-num')}>
                    {i.reviewDate ? dShort(i.reviewDate) : <span className="text-mute">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Hint>
        {t('Approved initiatives link one canonical project. Tasks live in Work; nothing is tracked twice here.')}
      </Hint>
    </Page>
  );
}

// ---------- a dependency request ----------
export function DepCard({ i, d }: { i: Initiative; d: SngDep }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const [form, setForm] = useState(false);
  const [note, setNote] = useState('');
  const [err, setErr] = useState(false);
  const recv = d.to === m?.id;
  const ed = canEditInitiative(m, i);
  const task = d.link?.type === 'task' ? taskOf(db, d.link.id) : undefined;
  const proj = d.link?.type === 'project' ? projOf(db, d.link.id) : undefined;
  const linkEl = d.link ? (
    d.link.type === 'task' ? (
      task ? (
        <a
          className="inline-flex cursor-pointer items-center gap-1 rounded-chip bg-fill px-2 py-1 text-d13 text-ink no-underline hover:bg-hover"
          onClick={() => {
            openTask(task.id);
          }}
        >
          <Icon name="tasks" size="xs" />
          {task.title}
        </a>
      ) : (
        <span className="text-mute">{t('Removed task')}</span>
      )
    ) : proj ? (
      <Link
        className="inline-flex items-center gap-1 rounded-chip bg-fill px-2 py-1 text-d13 text-ink no-underline hover:bg-hover"
        to={`/projects/${proj.id}`}
      >
        <Icon name="projects" size="xs" />
        {proj.name}
      </Link>
    ) : (
      <span className="text-mute">{t('Removed project')}</span>
    )
  ) : (
    <span className="text-mute">{t('Not linked')}</span>
  );
  const end = (label: string, id: string, sub: string) => (
    <div className="rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">
      <small className="block text-d13 text-mute">{label}</small>
      <PersonLink id={id} />
      <small className="block text-d13 text-mute">{sub}</small>
    </div>
  );
  return (
    <div className="grid max-w-[680px] content-start gap-3.5 rounded-sheet bg-surface p-4 shadow-sheet">
      <div>
        <b>{d.action}</b>
        <span className="ml-1 inline-block">
          <Chip def={DEPS[d.state]} pill="pill" />
        </span>
      </div>
      <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-2 max-[760px]:grid-cols-1">
        {end(t('From SnG'), d.by, i.title)}
        <span className="grid place-items-center text-mute max-[760px]:rotate-90">
          <Icon name="right" />
        </span>
        {end(
          t('To {u}', { u: divisionOf(d.unit)?.short ?? '' }),
          d.to,
          d.answeredAt ? t('Answered {d}', { d: dShort(d.answeredAt.slice(0, 10)) }) : t('Not answered yet'),
        )}
      </div>
      <Meta className="mt-4 mb-1.5 grid-cols-[110px_1fr]">
        <MetaRow label={t('Needed by')}>{fmtD(d.neededBy)}</MetaRow>
        <MetaRow label={t('Tracked in')}>{linkEl}</MetaRow>
        {d.note && <MetaRow label={t('Reply')}>{d.note}</MetaRow>}
      </Meta>
      {d.state === 'requested' && recv ? (
        form ? (
          <SubForm>
            <Field
              label={t('What should SnG know?')}
              htmlFor="sng-dep-note"
              help={err ? t('Add a note so SnG knows what to change.') : undefined}
              error={err}
            >
              <textarea
                id="sng-dep-note"
                className={cn(textareaClass, 'min-h-16', err && invalidClass)}
                value={note}
                autoFocus
                onChange={(e) => {
                  setNote(e.target.value);
                  setErr(false);
                }}
              />
            </Field>
            <div className="flex gap-2">
              <Button
                small
                onClick={() => {
                  if (!note.trim()) {
                    setErr(true);
                    return;
                  }
                  void answerDependency(i.id, d.id, 'returned', note.trim()).then(() => {
                    setForm(false);
                  });
                }}
              >
                {t('Return')}
              </Button>
              <Button
                small
                variant="ghost"
                onClick={() => {
                  setForm(false);
                }}
              >
                {t('Cancel')}
              </Button>
            </div>
          </SubForm>
        ) : (
          <>
            <div className="flex flex-wrap">
              <Button
                small
                variant="primary"
                onClick={() => {
                  void answerDependency(i.id, d.id, 'accepted', '');
                }}
              >
                {t('Accept')}
              </Button>
              <Button
                small
                onClick={() => {
                  setForm(true);
                }}
              >
                {t('Return with a note')}
              </Button>
            </div>
            <p className="my-2 text-mute type-small">{t('Silence never accepts. Declining has no penalty.')}</p>
          </>
        )
      ) : (
        d.state === 'accepted' &&
        (recv || ed) && (
          <div className="flex flex-wrap">
            <Button
              small
              onClick={() => {
                void answerDependency(i.id, d.id, 'fulfilled', '');
              }}
            >
              {t('Mark fulfilled')}
            </Button>
          </div>
        )
      )}
    </div>
  );
}

// ---------- one initiative ----------
function SourceRow({ s }: { s: SngSource }) {
  const m = useMe();
  const db = useWorkspace((w) => w);
  const who = useWho();
  if (!canSeeSource(m, s))
    return (
      <div className="grid gap-1.5 rounded-ctl bg-surface-2 px-3.5 py-3 text-[length:13.5px]">
        <Locked>{t('Restricted source')}</Locked>
        <small className="text-mute">
          {t('Ask {who} for access. The finding stays hidden until access is granted.', { who: who.first(s.addedBy) })}
        </small>
      </div>
    );
  const res = s.kind === 'resource' ? db.resources.find((r) => r.id === s.res) : undefined;
  return (
    <div className="grid gap-1.5 rounded-ctl bg-surface-2 px-3.5 py-3 text-d13">
      <div className="flex flex-wrap items-center gap-2">
        <Icon name={s.kind === 'resource' ? 'note' : 'link'} className="size-4 text-mute" />
        {res ? (
          <a
            className="cursor-pointer font-semibold"
            onClick={() => {
              openResource(res.id);
            }}
          >
            {s.title}
          </a>
        ) : (
          <a
            className="font-semibold"
            href={s.url === '' ? undefined : s.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.title}
          </a>
        )}
        {s.observed ? (
          <span className="text-d13 font-medium">{t('Observed {d}', { d: fmtD(s.observed) })}</span>
        ) : (
          <span className="inline-flex h-6 items-center rounded-chip px-2 text-d12 font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
            {t('Date unknown')}
          </span>
        )}
        {s.restricted && (
          <span className="inline-flex h-6 items-center gap-1 rounded-chip px-2 text-d12 font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
            <Icon name="lock" size="xs" />
            {t('SnG only')}
          </span>
        )}
      </div>
      <dl className="m-0 grid grid-cols-[96px_1fr] gap-x-2.5 gap-y-1 max-[760px]:grid-cols-1">
        {s.method && (
          <>
            <dt className="text-d13 text-mute">{t('Method')}</dt>
            <dd className="m-0">{s.method}</dd>
          </>
        )}
        <dt className="text-d13 text-mute">{t('Finding')}</dt>
        <dd className="m-0">{s.finding || <span className="text-mute">{t('Not recorded')}</span>}</dd>
        {s.interpretation && (
          <>
            <dt className="text-d13 text-mute">{t('Our reading')}</dt>
            <dd className="m-0">{s.interpretation}</dd>
          </>
        )}
        {s.uncertainty && (
          <>
            <dt className="text-d13 text-mute">{t('Limits')}</dt>
            <dd className="m-0">{s.uncertainty}</dd>
          </>
        )}
      </dl>
      <small className="text-d13 text-mute">{t('Added by {who}', { who: who.stamp(s.addedBy, s.at) })}</small>
    </div>
  );
}

function InitiativePage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const navigate = useNavigate();
  const form = useUi((u) => (typeof u.form === 'string' ? u.form : null));
  const [task, setTask] = useState('');
  const [taskOwner, setTaskOwner] = useState('');
  const [depTo, setDepTo] = useState('');
  const [depNeed, setDepNeed] = useState(addDays(today(), 7));
  const [depAct, setDepAct] = useState('');
  const [depLink, setDepLink] = useState('');
  const [depErr, setDepErr] = useState(false);
  const [proj, setProj] = useState('');
  const [obs, setObs] = useState({ v: '', d: today(), s: '' });
  const [obsErr, setObsErr] = useState<'v' | 's' | null>(null);
  const [outState, setOutState] = useState<OutcomeState>('inconclusive');
  const [outNote, setOutNote] = useState('');
  const [outNext, setOutNext] = useState('continue');
  const [outErr, setOutErr] = useState(false);
  useDivisionWorkspace('sng');
  const i = initiativeOf(db, id);
  if (!m || !i) return <Unavailable />;
  if (!canSng(m)) {
    const mine = i.deps.filter((d) => d.to === m.id);
    if (!mine.length) return <Unavailable />;
    return (
      <Page>
        <PageHeader
          title={t('Request to your unit')}
          sub={t(
            'Strategy & Growth asked for your commitment. You see this request only; the rest of the initiative stays with SnG.',
          )}
        />
        <div className="grid gap-3">
          {mine.map((d) => (
            <DepCard key={d.id} i={i} d={d} />
          ))}
        </div>
      </Page>
    );
  }
  const ed = canEditInitiative(m, i);
  const pks = packetsOf(db, i);
  const lp = pks[0];
  const p = projOf(db, i.project);
  const tasks = i.tasks.map((x) => taskOf(db, x)).filter((x) => !!x && !x.trashed);
  const sngPeople = db.people.filter((x) => x.status === 'active' && x.div === 'sng');
  const stageActs = !ed ? null : i.stage === 'idea' ? (
    <Button
      onClick={() => {
        void setStage(i.id, 'research');
      }}
    >
      {t('Start research')}
    </Button>
  ) : ['research', 'hold', 'rejected'].includes(i.stage) ? (
    <Button
      variant={i.stage === 'research' ? 'primary' : 'default'}
      onClick={() => {
        void navigate(`/decisions/new/${i.id}`);
      }}
    >
      {i.stage === 'research' ? t('Prepare decision packet') : t('Prepare a new version')}
    </Button>
  ) : null;
  const decisionLink = lp && (
    <Link
      className="inline-flex h-[var(--ctl-h-sm)] items-center rounded-ctl bg-surface px-2.5 text-d13 font-[550] text-ink no-underline shadow-[0_0_0_1px_var(--line-strong)]"
      to={`/decisions/${lp.id}`}
    >
      {t('Open packet')}
    </Link>
  );
  const stageNote =
    i.stage === 'pending' && lp ? (
      <Notice
        icon="clock"
        tone="warn"
        title={<b>{t('Waiting for {who} to decide on version {v}', { who: who.name(lp.reviewer), v: lp.version })}</b>}
        actions={decisionLink}
      >
        <p>{t('Only the designated reviewer decides. A VP title alone does not grant approval.')}</p>
      </Notice>
    ) : i.stage === 'hold' && lp?.decision ? (
      <Notice icon="hand" title={<b>{t('On hold since {d}', { d: fmtD(lp.decision.at.slice(0, 10)) })}</b>}>
        <p>
          {lp.decision.rationale}{' '}
          {lp.decision.reviewDate
            ? t('Next review {d}.', { d: fmtD(lp.decision.reviewDate) })
            : t('No review date was set, on purpose.')}
        </p>
      </Notice>
    ) : i.stage === 'rejected' && lp?.decision ? (
      <Notice icon="close" tone="error" title={<b>{t('Rejected {d}', { d: fmtD(lp.decision.at.slice(0, 10)) })}</b>}>
        <p>
          {lp.decision.rationale} {t('The research stays here and a new version can be submitted later.')}
        </p>
      </Notice>
    ) : null;
  const projects = db.projects.filter((x) => visibleDivs(m).includes(x.div) || x.org);
  const delivery =
    i.stage === 'approved' ? (
      <>
        <SectionHeading as="h2">{t('Delivery')}</SectionHeading>
        {p ? (
          <>
            <div className="flex max-w-[680px] items-center gap-3 rounded-[10px] bg-surface-2 px-3.5 py-3">
              <ProjectObject project={p} size="xs" />
              <div className="min-w-0 flex-1">
                <Link className="no-underline" to={`/projects/${p.id}`}>
                  <b>{p.name}</b>
                </Link>
                <small className="block text-[length:12px] text-mute">
                  {t('Lead {who}', { who: who.first(p.lead ?? p.createdBy) })}, {divisionOf(p.div)?.short}
                </small>
              </div>
              <Stage stage={p.stage} />
            </div>
            <p className="my-2 text-mute type-small">
              {t(
                'The project is the one record for this work. Its start date comes from the project, never from the approval.',
              )}
            </p>
            {ed && (
              <Button
                small
                variant="ghost"
                onClick={() => {
                  setUi((u) => {
                    u.form = 'sng-link';
                  });
                }}
              >
                {t('Change linked project')}
              </Button>
            )}
          </>
        ) : (
          <Notice icon="projects" tone="warn" title={<b>{t('No delivery project linked yet')}</b>}>
            <p>{t('Approval does not create a project. Link an existing one or create one.')}</p>
          </Notice>
        )}
        {ed && (!p || form === 'sng-link') && (
          <SubForm>
            <Field label={t('Link an existing project')} htmlFor="sng-proj">
              <SelectField
                id="sng-proj"
                value={proj || (i.project ?? projects[0]?.id ?? '')}
                onChange={setProj}
                options={projects.map((x) => ({ value: x.id, label: `${x.name} (${divisionOf(x.div)?.short ?? ''})` }))}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                small
                variant="primary"
                onClick={() => {
                  void linkProject(i.id, proj || (i.project ?? projects[0]?.id ?? ''));
                }}
              >
                {t('Link project')}
              </Button>
              {canCreateProject(m, 'sng') ? (
                <Button
                  small
                  onClick={() => {
                    void createDeliveryProject(i.id);
                  }}
                >
                  {t('Create a project instead')}
                </Button>
              ) : (
                <span className="text-mute type-small">{t('Only co-directors and above create projects.')}</span>
              )}
            </div>
          </SubForm>
        )}
      </>
    ) : null;
  const outcome =
    i.stage === 'approved' ? (
      <>
        <SectionHeading as="h2">{t('Outcome review')}</SectionHeading>
        {i.metric ? (
          <Meta className="mb-2 grid-cols-[140px_1fr]">
            <MetaRow label={t('Metric')}>{i.metric.name}</MetaRow>
            <MetaRow label={t('Unit')}>{i.metric.unit}</MetaRow>
            <MetaRow label={t('Source')}>{i.metric.source}</MetaRow>
            <MetaRow label={t('Owner')}>
              <PersonLink id={i.metric.owner} />
            </MetaRow>
            <MetaRow label={t('Review date')}>{i.reviewDate ? fmtD(i.reviewDate) : '-'}</MetaRow>
          </Meta>
        ) : (
          <p className="text-mute type-small">
            {t('No metric defined. Without a source and unit, no trend or score is shown.')}
          </p>
        )}
        {i.observations.length ? (
          <div className={tblScroll}>
            <table className={tblClass}>
              <thead>
                <tr>
                  <th className={th}>{t('Observed')}</th>
                  <th className={cn(th, 'text-right')}>{t('Value')}</th>
                  <th className={th}>{t('Source')}</th>
                  <th className={th}>{t('Recorded by')}</th>
                </tr>
              </thead>
              <tbody>
                {i.observations.map((o) => (
                  <tr key={o.id} className="group/tr">
                    <td className={cn(td, 'type-num')}>{fmtD(o.date)}</td>
                    <td className={cn(td, 'text-right')}>
                      {o.value} <small className="text-mute">{o.unit}</small>
                    </td>
                    <td className={td}>{o.source}</td>
                    <td className={td}>{who.stamp(o.by, o.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-mute type-small">
            {t('No observation recorded yet. Task completion is not proof of impact.')}
          </p>
        )}
        {i.outcome && (
          <Notice
            icon={OUTC[i.outcome.state][1]}
            tone={i.outcome.state === 'observed' ? 'done' : 'info'}
            title={
              <b>
                {t(OUTC[i.outcome.state][0])}: {t(NEXT[i.outcome.next])}
              </b>
            }
          >
            <p>
              {i.outcome.note}
              <br />
              {who.stamp(i.outcome.by, i.outcome.at)}
            </p>
          </Notice>
        )}
        {ed &&
          !i.outcome &&
          (form === 'sng-obs' ? (
            <SubForm>
              <Grid2>
                <Field
                  label={t('Value')}
                  htmlFor="sng-o-v"
                  help={obsErr === 'v' ? t('Enter the observed value.') : undefined}
                  error={obsErr === 'v'}
                >
                  <input
                    id="sng-o-v"
                    className={cn(inputClass, obsErr === 'v' && invalidClass)}
                    value={obs.v}
                    onChange={(e) => {
                      setObs({ ...obs, v: e.target.value });
                      setObsErr(null);
                    }}
                  />
                </Field>
                <Field label={t('Observed on')} htmlFor="sng-o-d">
                  <DateField
                    id="sng-o-d"
                    value={obs.d}
                    onChange={(v) => {
                      setObs({ ...obs, d: v });
                    }}
                  />
                </Field>
              </Grid2>
              <Field
                label={t('Source')}
                htmlFor="sng-o-s"
                required
                help={obsErr === 's' ? t('Name the source; unsourced values are not recorded.') : undefined}
                error={obsErr === 's'}
              >
                <input
                  id="sng-o-s"
                  className={cn(inputClass, obsErr === 's' && invalidClass)}
                  value={obs.s || (i.metric?.source ?? '')}
                  onChange={(e) => {
                    setObs({ ...obs, s: e.target.value });
                    setObsErr(null);
                  }}
                />
              </Field>
              <div className="flex gap-2">
                <Button
                  small
                  variant="primary"
                  onClick={() => {
                    const src = (obs.s || (i.metric?.source ?? '')).trim();
                    if (!obs.v.trim()) {
                      setObsErr('v');
                      return;
                    }
                    if (!src) {
                      setObsErr('s');
                      return;
                    }
                    void recordObservation(i.id, { value: obs.v.trim(), source: src, date: obs.d || today() });
                  }}
                >
                  {t('Save observation')}
                </Button>
                <Button
                  small
                  variant="ghost"
                  onClick={() => {
                    setUi((u) => {
                      u.form = null;
                    });
                  }}
                >
                  {t('Cancel')}
                </Button>
              </div>
            </SubForm>
          ) : form === 'sng-out' ? (
            <SubForm>
              <div className="mb-3">
                <Segmented<OutcomeState>
                  value={outState}
                  onChange={setOutState}
                  options={(Object.keys(OUTC) as OutcomeState[]).map((k) => [k, t(OUTC[k][0])])}
                />
              </div>
              <Field
                label={t('What did you learn?')}
                htmlFor="sng-out-n"
                required
                help={outErr ? t('Write what you learned.') : undefined}
                error={outErr}
              >
                <textarea
                  id="sng-out-n"
                  className={cn(textareaClass, 'min-h-16', outErr && invalidClass)}
                  value={outNote}
                  onChange={(e) => {
                    setOutNote(e.target.value);
                    setOutErr(false);
                  }}
                />
              </Field>
              <Field label={t('Next step')} htmlFor="sng-out-x">
                <SelectField
                  id="sng-out-x"
                  value={outNext}
                  onChange={setOutNext}
                  options={Object.entries(NEXT).map(([k, v]) => ({ value: k, label: t(v) }))}
                />
              </Field>
              <div className="flex gap-2">
                <Button
                  small
                  variant="primary"
                  onClick={() => {
                    if (!outNote.trim()) {
                      setOutErr(true);
                      return;
                    }
                    void recordOutcome(i.id, outState, outNote.trim(), outNext as keyof typeof NEXT);
                  }}
                >
                  {t('Record outcome')}
                </Button>
                <Button
                  small
                  variant="ghost"
                  onClick={() => {
                    setUi((u) => {
                      u.form = null;
                    });
                  }}
                >
                  {t('Cancel')}
                </Button>
              </div>
            </SubForm>
          ) : (
            <Acts>
              <Button
                small
                onClick={() => {
                  setUi((u) => {
                    u.form = 'sng-obs';
                  });
                }}
              >
                {t('Add observation')}
              </Button>
              <Button
                small
                onClick={() => {
                  setUi((u) => {
                    u.form = 'sng-out';
                  });
                }}
              >
                {t('Record outcome or inconclusive')}
              </Button>
            </Acts>
          ))}
      </>
    ) : null;
  const report = (label: string, v: string) => (
    <div>
      <small className="mb-0.5 block text-mute type-caption">{label}</small>
      <p className="m-0 mb-0.5">{v || <span className="text-mute">{t('Not written yet')}</span>}</p>
    </div>
  );
  return (
    <Page wide>
      <PageHeader title={i.title} sub={i.objective}>
        <Chip def={STG[i.stage]} pill="pill" />
        {stageActs}
      </PageHeader>
      <Meta
        className={cn(
          'mt-4 max-w-[720px] grid-cols-[140px_1fr] max-[760px]:grid-cols-[110px_1fr] [&_dd]:flex-wrap',
          stageNote ? 'mb-3' : 'mb-1.5',
        )}
      >
        <MetaRow label={t('Horizon')}>
          {ed ? (
            <Segmented<Horizon>
              label={t('Horizon')}
              buttonClassName="px-2.5!"
              value={i.horizon}
              onChange={(h) => {
                void setHorizon(i.id, h);
              }}
              options={(Object.keys(HZ) as Horizon[]).map((k) => [k, t(HZ[k])])}
            />
          ) : (
            t(HZ[i.horizon])
          )}
        </MetaRow>
        <MetaRow label={t('Owner')}>
          <PersonLink id={i.owner} />
        </MetaRow>
        <MetaRow label={t('Created by')}>{who.stamp(i.createdBy, i.createdAt)}</MetaRow>
        <MetaRow label={t('Affected units')}>
          {i.affected.length ? i.affected.map((u) => divisionOf(u)?.short).join(', ') : t('SnG only')}
        </MetaRow>
        <MetaRow label={t('Review date')}>
          {i.reviewDate ? fmtD(i.reviewDate) : <span className="text-mute">{t('Not set')}</span>}
        </MetaRow>
      </Meta>
      {stageNote}
      <SectionHeading as="h2">{t('Problem and hypothesis')}</SectionHeading>
      <div className="my-1.5 mb-1 grid gap-3.5">
        {report(t('Problem'), i.problem)}
        {report(t('Hypothesis'), i.hypothesis)}
      </div>
      <SectionHeading as="h2" count={i.sources.length}>
        {t('Evidence')}
        {ed && (
          <AddBtn
            onClick={() => {
              setUi((u) => {
                u.insp = { type: 'sng-src', id: i.id };
              });
            }}
          >
            {t('Add source')}
          </AddBtn>
        )}
      </SectionHeading>
      {i.sources.length ? (
        <div className="grid gap-2">
          {i.sources.map((s) => (
            <SourceRow key={s.id} s={s} />
          ))}
        </div>
      ) : (
        <p className="text-mute type-small">
          {t('No sources yet. Until one is added, every claim here is an assumption.')}
        </p>
      )}
      <SectionHeading as="h2" count={tasks.length}>
        {t('Investigation tasks')}
      </SectionHeading>
      {tasks.length ? (
        <Rows>
          {tasks.map(
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
                    sub={tk.due ? t('Due {d}', { d: dShort(tk.due) }) : t('No date')}
                  />
                  <TaskStatusMark status={tk.status} />
                </Row>
              ),
          )}
        </Rows>
      ) : (
        <p className="text-mute type-small">{t('No tasks linked.')}</p>
      )}
      {ed && !['approved', 'rejected'].includes(i.stage) && (
        <form
          className="mt-2 flex items-center gap-2 max-[760px]:flex-wrap"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            if (!task.trim()) return;
            void addInvestigationTask(i.id, task, taskOwner || i.owner).then(() => {
              setTask('');
            });
          }}
        >
          <input
            className={cn(inputClass, 'min-w-0 flex-1 max-[760px]:basis-full')}
            placeholder={t('Add an investigation task')}
            aria-label={t('Task title')}
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
            }}
          />
          <SelectField
            small
            className="max-w-[200px]"
            people
            label={t('Owner')}
            value={taskOwner || i.owner}
            onChange={setTaskOwner}
            options={sngPeople.map((x) => ({ value: x.id, label: x.name }))}
          />
          <Button type="submit" small>
            {t('Add')}
          </Button>
        </form>
      )}
      <SectionHeading as="h2" count={pks.length}>
        {t('Decision packets')}
      </SectionHeading>
      {pks.length ? (
        <PacketVersions packets={pks} submittedBy />
      ) : (
        <p className="text-mute type-small">{t('No packet yet.')}</p>
      )}
      <SectionHeading as="h2" count={i.deps.length}>
        {t('Dependencies on other units')}
        {ed && (
          <AddBtn
            onClick={() => {
              setUi((u) => {
                u.form = 'sng-dep-new';
              });
            }}
          >
            {t('Ask a unit')}
          </AddBtn>
        )}
      </SectionHeading>
      {form === 'sng-dep-new' && ed && (
        <SubForm>
          <Grid2>
            <Field label={t('Named receiver')} htmlFor="sng-d-to">
              <SelectField
                id="sng-d-to"
                people
                value={
                  depTo ||
                  (db.people.find(
                    (x) =>
                      x.status === 'active' && !!x.div && x.div !== 'sng' && x.role !== 'member' && x.role !== 'board',
                  )?.id ??
                    '')
                }
                onChange={setDepTo}
                options={db.people
                  .filter(
                    (x) =>
                      x.status === 'active' && !!x.div && x.div !== 'sng' && x.role !== 'member' && x.role !== 'board',
                  )
                  .map((x) => ({ value: x.id, label: x.name }))}
              />
            </Field>
            <Field label={t('Needed by')} htmlFor="sng-d-need">
              <DateField id="sng-d-need" value={depNeed} onChange={setDepNeed} />
            </Field>
          </Grid2>
          <Field
            label={t('Requested action')}
            htmlFor="sng-d-act"
            required
            help={depErr ? t('Say what you need from them.') : undefined}
            error={depErr}
          >
            <input
              id="sng-d-act"
              className={cn(inputClass, depErr && invalidClass)}
              value={depAct}
              onChange={(e) => {
                setDepAct(e.target.value);
                setDepErr(false);
              }}
            />
          </Field>
          <Field label={t('Tracked in')} htmlFor="sng-d-link" optional>
            <SelectField
              id="sng-d-link"
              value={depLink}
              onChange={setDepLink}
              options={[
                { value: '', label: t('Not linked') },
                ...db.projects
                  .filter((x) => x.div !== 'sng' && (visibleDivs(m).includes(x.div) || x.org))
                  .map((x) => ({ value: x.id, label: x.name })),
              ]}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              small
              variant="primary"
              onClick={() => {
                const to =
                  depTo ||
                  db.people.find(
                    (x) =>
                      x.status === 'active' && !!x.div && x.div !== 'sng' && x.role !== 'member' && x.role !== 'board',
                  )?.id;
                if (!to) return;
                if (!depAct.trim()) {
                  setDepErr(true);
                  return;
                }
                void askUnit(i.id, { to, action: depAct.trim(), neededBy: depNeed, link: depLink }).then(() => {
                  setDepAct('');
                });
              }}
            >
              {t('Send request')}
            </Button>
            <Button
              small
              variant="ghost"
              onClick={() => {
                setUi((u) => {
                  u.form = null;
                });
              }}
            >
              {t('Cancel')}
            </Button>
          </div>
        </SubForm>
      )}
      {i.deps.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3 max-[760px]:grid-cols-1">
          {i.deps.map((d) => (
            <DepCard key={d.id} i={i} d={d} />
          ))}
        </div>
      ) : (
        <p className="text-mute type-small">{t('No commitments asked from other units.')}</p>
      )}
      {delivery}
      {outcome}
    </Page>
  );
}

export function InitiativesPage({ route }: { route: Route }) {
  return route.id ? <InitiativePage id={route.id} /> : <InitiativeList />;
}

// ---------- side panels ----------
function NewInitiativePanel() {
  const m = useMe();
  const db = useWorkspace((w) => w);
  const [title, setTitle] = useState('');
  const [obj, setObj] = useState('');
  const [problem, setProblem] = useState('');
  const [owner, setOwner] = useState('');
  const [horizon, setH] = useState<Horizon>('later');
  const [units, setUnits] = useState<DivisionId[]>([]);
  const [err, setErr] = useState<'t' | 'o' | null>(null);
  const people = db.people.filter((x) => x.status === 'active' && x.div === 'sng');
  return (
    <>
      <InspectorHead>{t('New initiative')}</InspectorHead>
      <Field
        label={t('Title')}
        htmlFor="sng-n-t"
        className="mb-5"
        required
        help={err === 't' ? t('Give it a title.') : undefined}
        error={err === 't'}
      >
        <input
          id="sng-n-t"
          className={cn(inputClass, err === 't' && invalidClass)}
          value={title}
          autoFocus
          onChange={(e) => {
            setTitle(e.target.value);
            setErr(null);
          }}
        />
      </Field>
      <Field
        label={t('Question or goal')}
        htmlFor="sng-n-o"
        className="mb-5"
        required
        help={err === 'o' ? t('Write the question or goal.') : undefined}
        error={err === 'o'}
      >
        <textarea
          id="sng-n-o"
          className={cn(textareaClass, 'min-h-16', err === 'o' && invalidClass)}
          value={obj}
          onChange={(e) => {
            setObj(e.target.value);
            setErr(null);
          }}
        />
      </Field>
      <Field label={t('Problem')} htmlFor="sng-n-p" optional>
        <textarea
          id="sng-n-p"
          className={cn(textareaClass, 'min-h-16')}
          value={problem}
          onChange={(e) => {
            setProblem(e.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Owner')} htmlFor="sng-n-own">
          <SelectField
            id="sng-n-own"
            people
            value={owner !== '' ? owner : (m?.id ?? '')}
            onChange={setOwner}
            options={people.map((x) => ({ value: x.id, label: x.name }))}
          />
        </Field>
        <Field label={t('Horizon')} htmlFor="sng-n-h">
          <SelectField
            id="sng-n-h"
            value={horizon}
            onChange={(v) => {
              setH(v as Horizon);
            }}
            options={(Object.keys(HZ) as Horizon[]).map((k) => ({ value: k, label: t(HZ[k]) }))}
          />
        </Field>
      </Grid2>
      <Field label={t('Affected units')}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[3px]">
          {DIVS.filter((d) => d.id !== 'sng').map((d) => (
            <label
              key={d.id}
              className="grid min-h-10 cursor-pointer grid-cols-[20px_1fr] items-center gap-2 rounded-ctl bg-surface-2 px-2.5 py-1 text-d13 hover:bg-hover"
            >
              <input
                type="checkbox"
                className="m-0 size-4 accent-ink"
                checked={units.includes(d.id)}
                onChange={(e) => {
                  setUnits(e.target.checked ? [...units, d.id] : units.filter((x) => x !== d.id));
                }}
              />
              <span>{d.name}</span>
            </label>
          ))}
        </div>
      </Field>
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            if (!title.trim()) {
              setErr('t');
              return;
            }
            if (!obj.trim()) {
              setErr('o');
              return;
            }
            void createInitiative({
              title: title.trim(),
              objective: obj.trim(),
              problem: problem.trim(),
              owner: owner !== '' ? owner : (m?.id ?? ''),
              horizon,
              affected: units,
            });
          }}
        >
          {t('Create initiative')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

function SourcePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const i = initiativeOf(db, String(insp.id));
  const [f, setF] = useState({
    res: '',
    url: '',
    title: '',
    obs: '',
    method: '',
    finding: '',
    interp: '',
    unc: '',
    restricted: false,
  });
  const [err, setErr] = useState<'url' | 'finding' | null>(null);
  if (!i) return <InspectorHead>{t('Add source')}</InspectorHead>;
  const set = (k: keyof typeof f, v: string | boolean) => {
    setF({ ...f, [k]: v });
    setErr(null);
  };
  return (
    <>
      <InspectorHead>{t('Add source')}</InspectorHead>
      <h2 className="mt-3 mb-2.5 type-h2">{i.title}</h2>
      <Field label={t('SnG resource')} htmlFor="sng-s-res">
        <SelectField
          id="sng-s-res"
          value={f.res}
          onChange={(v) => {
            set('res', v);
          }}
          options={[
            { value: '', label: t('None, use a link') },
            ...db.resources
              .filter((r) => r.div === 'sng' && !r.archived && r.kind !== 'folder')
              .map((r) => ({ value: r.id, label: r.name })),
          ]}
        />
      </Field>
      <Field
        label={t('Or a link')}
        htmlFor="sng-s-url"
        className="mb-5"
        help={err === 'url' ? t('Choose a resource or paste an https link.') : undefined}
        error={err === 'url'}
      >
        <input
          id="sng-s-url"
          className={cn(inputClass, err === 'url' && invalidClass)}
          placeholder="https://"
          value={f.url}
          onChange={(e) => {
            set('url', e.target.value);
          }}
        />
      </Field>
      <Field label={t('Title')} htmlFor="sng-s-title">
        <input
          id="sng-s-title"
          className={inputClass}
          value={f.title}
          onChange={(e) => {
            set('title', e.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Observed on')} htmlFor="sng-s-obs" optional help={t('Left empty, it shows as Date unknown.')}>
          <DateField
            id="sng-s-obs"
            value={f.obs}
            onChange={(v) => {
              set('obs', v);
            }}
          />
        </Field>
        <Field label={t('Method')} htmlFor="sng-s-m">
          <input
            id="sng-s-m"
            className={inputClass}
            value={f.method}
            onChange={(e) => {
              set('method', e.target.value);
            }}
          />
        </Field>
      </Grid2>
      <Field
        label={t('Finding (what was observed)')}
        htmlFor="sng-s-f"
        className="mb-5"
        required
        help={err === 'finding' ? t('Write what was observed.') : undefined}
        error={err === 'finding'}
      >
        <textarea
          id="sng-s-f"
          className={cn(textareaClass, 'min-h-16', err === 'finding' && invalidClass)}
          value={f.finding}
          onChange={(e) => {
            set('finding', e.target.value);
          }}
        />
      </Field>
      <Field label={t('Our reading (interpretation)')} htmlFor="sng-s-i" optional>
        <textarea
          id="sng-s-i"
          className={cn(textareaClass, 'min-h-16')}
          value={f.interp}
          onChange={(e) => {
            set('interp', e.target.value);
          }}
        />
      </Field>
      <Field label={t('Limits and uncertainty')} htmlFor="sng-s-u" optional>
        <input
          id="sng-s-u"
          className={inputClass}
          value={f.unc}
          onChange={(e) => {
            set('unc', e.target.value);
          }}
        />
      </Field>
      <label className="mt-3 mb-[18px] flex cursor-pointer items-center gap-2 text-d13">
        <input
          type="checkbox"
          className="m-0 size-4 accent-ink"
          checked={f.restricted}
          onChange={(e) => {
            set('restricted', e.target.checked);
          }}
        />
        {t('Raw data stays inside SnG')}
      </label>
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            if (!f.res && !f.url.trim().startsWith('https://')) {
              setErr('url');
              return;
            }
            if (!f.finding.trim()) {
              setErr('finding');
              return;
            }
            void addSource(i.id, {
              res: f.res,
              url: f.url.trim(),
              title: f.title.trim(),
              observed: f.obs || null,
              method: f.method.trim(),
              finding: f.finding.trim(),
              interpretation: f.interp.trim(),
              uncertainty: f.unc.trim(),
              restricted: f.restricted,
            });
          }}
        >
          {t('Add source')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

PANELS['sng-new'] = NewInitiativePanel;
PANELS['sng-src'] = (p) => <SourcePanel key={String(p.insp.id)} {...p} />;
