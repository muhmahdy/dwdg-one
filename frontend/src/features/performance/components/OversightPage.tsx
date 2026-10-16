/* The Board landing (#/oversight): a read-only view of every division (D29, access_board_scope, S081). Blockers, decisions and
   milestones are listed from the same records each division uses; nothing is typed in for the Board. From screens/perf.js. */
import { useNavigate } from 'react-router';
import { DIVS } from '@/app/config/org';
import { Avatar } from '@/components/shared/Avatar';
import { ProjectObject } from '@/components/shared/art/objects';
import { BrandIcon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { State } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openDecision, openMilestone, openTask } from '@/lib/open';
import { isBoard, isTopOrAdmin } from '@/lib/roles';
import { setSession } from '@/lib/session';
import { addDays, daysBetween, dShort, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { MsState } from '@/features/projects/components/Cells';
import { ENDED, nextMs } from '@/features/projects/services/project-rules';
import { msLate } from '@/features/projects/services/wbs';
import { SevTag } from '@/features/work/components/task-panel/parts';
import { projOf, taskDiv, taskOf } from '@/features/work/services/selectors';
import type { DivisionId } from '@/types/workspace';
import { activePeople } from '../services/scope';
import { Chip, Foot } from './PerfParts';
import { PerfCrumb } from './TeamPage';

export const OversightCrumb = () => <PerfCrumb parts={[['', t('Oversight')]]} />;

const DST: Record<string, [string, string, 'warn' | 'green' | 'mute' | 'hold']> = {
  awaiting: ['Waiting for decision', 'clock', 'warn'],
  approved: ['Approved', 'check', 'green'],
  rejected: ['Rejected', 'close', 'mute'],
  hold: ['On hold', 'hand', 'hold'],
};

const DST_FALLBACK: [string, string, 'warn'] = ['Waiting for decision', 'clock', 'warn'];

const th = 'h-8 px-2.5 text-left font-medium whitespace-nowrap text-mute type-caption';
const td = 'h-11 px-2.5 whitespace-nowrap first:rounded-l-ctl last:rounded-r-ctl group-hover/tr:bg-hover';

const Count = ({ n }: { n: number }) =>
  n ? <State label={String(n)} icon="warning" tone="danger" /> : <span className="text-mute">0</span>;

export function OversightPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  if (!m || (!isBoard(m) && !isTopOrAdmin(m)))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const soon = addDays(today(), 30);
  const first = (id: string) => db.people.find((p) => p.id === id)?.first ?? t('Someone');
  const rows = DIVS.map((d) => {
    const ps = db.projects.filter((p) => p.div === d.id && !ENDED.includes(p.stage) && p.stage !== 'draft');
    const dir = activePeople(db).find((p) => p.div === d.id && p.role === 'director');
    const nx = ps
      .map((p) => nextMs(db, p))
      .filter((x) => !!x)
      .sort((a, b) => a.target.localeCompare(b.target))[0];
    return {
      d,
      dir,
      nx,
      open: ps.length,
      late: db.milestones.filter((x) => ps.some((p) => p.id === x.project) && msLate(x)).length,
      bk: db.blockers.filter((b) => {
        const tk = taskOf(db, b.task);
        return b.state === 'open' && !!tk && taskDiv(db, tk) === d.id;
      }).length,
      dc: db.decisions.filter((x) => x.state === 'awaiting' && projOf(db, x.project)?.div === d.id).length,
    };
  });
  const blk = db.blockers.filter((b) => b.state === 'open');
  const decs = db.decisions
    .filter((d) => d.state === 'awaiting' || (d.decidedAt && daysBetween(d.decidedAt.slice(0, 10), today()) <= 30))
    .sort((a, b) => (b.decidedAt ?? b.createdAt).localeCompare(a.decidedAt ?? a.createdAt));
  const ms = db.milestones
    .filter((x) => {
      const p = projOf(db, x.project);
      return (
        !!p &&
        !ENDED.includes(p.stage) &&
        !['achieved', 'cancelled'].includes(x.state) &&
        !!x.target &&
        x.target <= soon
      );
    })
    .sort((a, b) => a.target.localeCompare(b.target));
  const goDiv = (id: DivisionId) => {
    setSession({ ws: id });
    void navigate('/projects');
  };
  return (
    <Page wide>
      <PageHeader
        title={t('Oversight')}
        sub={isBoard(m) ? t('Board of Supervisors, read-only') : t('This is what Board of Supervisors accounts see')}
      />
      <Notice icon="shield" title={<b>{t('Read-only account')}</b>}>
        <p>
          {t(
            'Board accounts open every division’s projects, milestones, blockers and decisions. They can’t create, edit, approve or receive task offers, and never appear in pickers. Individual HR assessments, private notes, candidate data and restricted finance or legal fields stay hidden.',
          )}
        </p>
      </Notice>
      <SectionHeading as="h2" count={DIVS.length}>
        {t('Divisions')}
      </SectionHeading>
      <div className="-mx-2.5 overflow-x-auto max-[760px]:mx-0">
        <table className="w-full border-separate border-spacing-y-[3px] text-[length:13.5px]">
          <thead>
            <tr>
              <th className={th}>{t('Division')}</th>
              <th className={th}>{t('Director')}</th>
              <th className={cn(th, 'text-right')}>{t('Open projects')}</th>
              <th className={th}>{t('Next milestone')}</th>
              <th className={cn(th, 'text-right')}>{t('Overdue milestones')}</th>
              <th className={cn(th, 'text-right')}>{t('Open blockers')}</th>
              <th className={cn(th, 'text-right')}>{t('Decisions waiting')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.d.id}
                className="group/tr cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
                tabIndex={0}
                role="link"
                onClick={() => {
                  goDiv(r.d.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goDiv(r.d.id);
                }}
              >
                <td className={td}>
                  <span className="inline-flex min-w-0 items-center gap-2.5">
                    <BrandIcon id={r.d.icon} label={false} className="size-[18px]" />
                    <b className="font-semibold">{r.d.name}</b>
                  </span>
                </td>
                <td className={td}>
                  {r.dir ? (
                    <span className="inline-flex min-w-0 items-center gap-2.5">
                      <Avatar id={r.dir.id} size="xs" />
                      {first(r.dir.id)}
                    </span>
                  ) : (
                    <span className="text-mute">{t('Not named')}</span>
                  )}
                </td>
                <td className={cn(td, 'text-right type-num')}>{r.open}</td>
                <td className={td}>
                  {r.nx ? (
                    <>
                      {r.nx.title}{' '}
                      <small className="text-mute type-num">{r.nx.target ? dShort(r.nx.target) : ''}</small>
                    </>
                  ) : (
                    <span className="text-mute">{t('None')}</span>
                  )}
                </td>
                <td className={cn(td, 'text-right')}>
                  <Count n={r.late} />
                </td>
                <td className={cn(td, 'text-right')}>
                  <Count n={r.bk} />
                </td>
                <td className={cn(td, 'text-right type-num')}>{r.dc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 mb-0 text-mute type-small">
        {t('Open a division to read its projects, Operations, Resources and Changes.')}{' '}
        <a
          className="cursor-pointer"
          onClick={() => {
            void navigate('/performance');
          }}
        >
          {t('Division performance')}
        </a>
      </p>
      <SectionHeading as="h2" count={blk.length}>
        {t('Open blockers')}
      </SectionHeading>
      {blk.length ? (
        <Rows>
          {blk.map((b) => (
            <Row
              key={b.id}
              onOpen={() => {
                openTask(b.task);
              }}
            >
              <Avatar id={b.owner} size="sm" />
              <RowText
                title={<b>{b.text}</b>}
                sub={`${taskOf(db, b.task)?.title ?? ''}, ${t('{who} can unblock it', { who: first(b.owner) })}, ${t('raised by {who} {d}', { who: first(b.openedBy), d: dShort(b.openedAt.slice(0, 10)) })}`}
              />
              <SevTag severity={b.severity} />
            </Row>
          ))}
        </Rows>
      ) : (
        <EmptyLine>{t('No open blockers.')}</EmptyLine>
      )}
      <SectionHeading as="h2">
        {t('Decisions')} <span className="text-mute type-num">{decs.length}</span>
        <span className="ml-[9px] font-normal text-mute type-small">
          {t('Waiting, and decided in the last 30 days')}
        </span>
      </SectionHeading>
      {decs.length ? (
        <Rows>
          {decs.map((d) => {
            const p = projOf(db, d.project);
            return (
              <Row
                key={d.id}
                onOpen={() => {
                  openDecision(d.id);
                }}
              >
                <Avatar id={d.approver} size="sm" />
                <RowText
                  title={<b>{d.question}</b>}
                  sub={`${p ? `${p.name}, ${DIVS.find((x) => x.id === p.div)?.short ?? ''}, ` : ''}${t('{who} decides', { who: first(d.approver) })}`}
                />
                <Chip def={DST[d.state] ?? DST_FALLBACK} />
              </Row>
            );
          })}
        </Rows>
      ) : (
        <EmptyLine>{t('No decisions in this period.')}</EmptyLine>
      )}
      <SectionHeading as="h2" count={ms.length}>
        {t('Milestones in the next 30 days')}
      </SectionHeading>
      {ms.length ? (
        <Rows>
          {ms.map((x) => {
            const p = projOf(db, x.project);
            return (
              <Row
                key={x.id}
                onOpen={() => {
                  openMilestone(x.id);
                }}
              >
                {p && <ProjectObject project={p} size="sm" />}
                <RowText
                  title={<b>{x.title}</b>}
                  sub={`${p?.name ?? ''}, ${DIVS.find((d) => d.id === p?.div)?.short ?? ''}`}
                />
                <span className="whitespace-nowrap text-mute type-num">{dShort(x.target)}</span>
                <MsState m={x} />
              </Row>
            );
          })}
        </Rows>
      ) : (
        <EmptyLine>{t('No milestones due.')}</EmptyLine>
      )}
      <Foot>
        {t(
          'Built from the same records each division uses. Nothing here is typed in for the Board, and there is no health score.',
        )}
      </Foot>
    </Page>
  );
}
