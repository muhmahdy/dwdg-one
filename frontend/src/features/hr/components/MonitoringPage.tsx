/* Monitoring and development, every 14 days: the list of cycles and what is waiting for you, one cycle with its roster and
   reconciliation, and one member's assessment (report, scoring, HR check, response, versions, support actions).
   From divisions/div-hr-sng.js monitoringPage, cyclePage and assessPage. */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { PersonLink } from '@/components/shared/PersonLink';
import { Button } from '@/components/ui/Button';
import { Field, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { State } from '@/components/ui/StatusBadge';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { rank } from '@/lib/access';
import { hrLead, hrStaff, isBoard, isTop } from '@/lib/roles';
import { addDays, ago, daysBetween, dShort, fmtD, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { isSummary, joinedOf, projOf, taskDiv, taskOf } from '@/features/work/services/selectors';
import type { Person, Task, Workspace } from '@/types/workspace';
import { RUBRIC, hrOf, type HrAction, type HrAssessment, type HrCycle, type HrScores } from '../services/hr-data';
import {
  EXEMPT,
  acknowledgeResult,
  answerClarification,
  asDef,
  asLevel,
  asOf,
  asRoute,
  asState,
  askClarification,
  askCorrection,
  canHrCheck,
  canSubmit,
  cyLabel,
  cyName,
  cyOf,
  cycleCounts,
  cysDef,
  declineCorrection,
  finalizeAssessment,
  missingOf,
  planNextCycle,
  returnToReviewer,
  rosterOf,
  saveCorrectedVersion,
  scoreCriterion,
  sendToHrCheck,
  setRationale,
  setReviewer,
  stepCycle,
  submitReport,
  totalOf,
  unitLead,
} from '../services/monitoring';
import { Chip, DivCrumb, Hint, SmallNote, td, th, tblClass, tblScroll, trLink } from './HrParts';
import { openAction } from './MonitoringPanels';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function MonitoringCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const c = route.id ? cyOf(db, route.id) : undefined;
  const who = useWho();
  if (c && route.sub)
    return (
      <DivCrumb
        d="hr"
        parts={[
          ['monitoring', t('Monitoring')],
          [`monitoring/${c.id}`, cyLabel(c)],
          ['', who.name(route.sub)],
        ]}
      />
    );
  if (c)
    return (
      <DivCrumb
        d="hr"
        parts={[
          ['monitoring', t('Monitoring')],
          ['', cyLabel(c)],
        ]}
      />
    );
  return <DivCrumb d="hr" parts={[['monitoring', t('Monitoring')]]} />;
}

// ---------- the rubric ----------
/** The four criteria with a 1 to 5 scale each, and the weighted result below. Editable only for the reviewer. */
function ScoreTable({
  scores,
  edit,
  onScore,
  onWhy,
}: {
  scores: HrScores | null | undefined;
  edit?: boolean;
  onScore?: (k: string, v: number) => void;
  onWhy?: (k: string, why: string) => void;
}) {
  const total = totalOf(scores);
  const miss = missingOf(scores);
  return (
    <>
      <div className="grid gap-px">
        {RUBRIC.criteria.map((k) => {
          const x = scores?.[k.k];
          const v = x?.v ?? null;
          return (
            <div
              key={k.k}
              className="grid grid-cols-[minmax(0,1fr)_170px_44px_92px] items-center gap-3 px-2.5 py-2.5 max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:[grid-template-areas:'t_t'_'s_w']"
            >
              <div className="min-w-0 max-[760px]:[grid-area:t]">
                <b className="block font-semibold">{t(k.name)}</b>
                <small className="block text-d12h text-mute">{t(k.desc)}</small>
                {edit ? (
                  <input
                    className={cn(inputClass, 'mt-1.5 h-8 text-d13 roomy:h-8')}
                    defaultValue={x?.why ?? ''}
                    placeholder={t('Rationale from the evidence')}
                    aria-label={t('Rationale for {c}', { c: t(k.name) })}
                    onBlur={(e) => {
                      if (e.target.value.trim() !== (x?.why ?? '')) onWhy?.(k.k, e.target.value);
                    }}
                  />
                ) : (
                  x?.why && (
                    <small className="mt-1 block text-[length:12.5px] whitespace-normal text-ink-2">{x.why}</small>
                  )
                )}
              </div>
              <div className="flex max-[760px]:[grid-area:s]" role="radiogroup" aria-label={t(k.name)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={v === n}
                    disabled={!edit}
                    tabIndex={edit ? 0 : -1}
                    className={cn(
                      'size-7 rounded-ctl border-0 bg-fill text-d13 font-semibold text-ink-2 enabled:cursor-pointer enabled:hover:bg-hover',
                      v === n && 'bg-ink text-on-ink enabled:hover:bg-ink',
                    )}
                    onClick={() => {
                      onScore?.(k.k, n);
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span className="text-mute type-num max-[760px]:hidden">{k.w}%</span>
              <span className="max-[760px]:justify-self-end max-[760px]:[grid-area:w]">
                {v == null ? (
                  <Chip def={['Not scored', 'circle', 'mute']} />
                ) : (
                  <span className="text-mute type-num">
                    {v} / {RUBRIC.max}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mx-2.5 mt-2.5 mb-0 flex flex-wrap items-baseline gap-2">
        {total == null ? (
          <>
            <Chip def={['Incomplete', 'warning', 'warn']} pill="pill" />
            <span className="text-mute type-small">
              {plural(
                miss.length,
                '{n} criterion has no score. The result stays Incomplete; it is never counted as zero.',
                '{n} criteria have no score. The result stays Incomplete; they are never counted as zero.',
              )}
            </span>
          </>
        ) : (
          <>
            <b className="text-[length:22px]! type-num">{total.toFixed(1)}</b>
            <span className="text-mute type-small">
              {t('of 100. Each criterion counts raw score ÷ {max} × weight, rounded to one decimal.', {
                max: RUBRIC.max,
              })}
            </span>
          </>
        )}
      </p>
    </>
  );
}

// ---------- support actions ----------
export function ActionRow({ x }: { x: HrAction }) {
  const dueLate = x.due < today();
  return (
    <Row
      onOpen={() => {
        openAction(x.id);
      }}
    >
      <Avatar id={x.owner} />
      <RowText title={<b className="whitespace-nowrap">{x.goal}</b>} sub={<ActionSub x={x} />} />
      {x.task && (
        <span className="inline-flex items-center gap-1 text-d12h text-mute">
          <Icon name="tasks" size="xs" />
          {t('Task')}
        </span>
      )}
      <Chip
        def={
          x.state === 'open'
            ? dueLate
              ? ['Overdue', 'clock', 'danger']
              : ['Open', 'circle', 'ink2']
            : ['Done', 'check', 'green']
        }
        pill="pill-o"
      />
    </Row>
  );
}
function ActionSub({ x }: { x: HrAction }) {
  const who = useWho();
  return (
    <>
      {t('Owner {who}, due {d}', { who: who.first(x.owner), d: dShort(x.due) })}
      {x.tnd ? `, ${t('TnD referral')}` : ''}
    </>
  );
}

// ---------- the list ----------
function MonitoringList({ m }: { m: Person }) {
  const db = useWorkspace((w) => w);
  const navigate = useNavigate();
  const h = hrOf(db);
  const cys = [...(h?.cycles ?? [])].sort((a, b) => b.start.localeCompare(a.start));
  const mine = cys.filter((c) => rosterOf(c, m.id));
  const toReview: { c: HrCycle; p: string; st: string | null; a: HrAssessment | undefined }[] = [];
  const toCheck: { c: HrCycle; p: string; st: string | null; a: HrAssessment | undefined }[] = [];
  for (const c of cys)
    for (const x of c.roster) {
      const st = asState(db, c, x.p);
      const a = asOf(db, c, x.p);
      if (
        x.reviewer === m.id &&
        !x.exempt &&
        c.state !== 'planned' &&
        (['submitted', 'draft', 'clarify'].includes(st ?? '') || a?.corr?.state === 'open')
      )
        toReview.push({ c, p: x.p, st, a });
      if (st === 'reviewed' && canHrCheck(db, m, c, x.p)) toCheck.push({ c, p: x.p, st, a });
    }
  const seeAll = hrLead(m) || isTop(m) || hrStaff(m);
  const acts = (h?.actions ?? []).filter((x) => hrLead(m) || x.owner === m.id || x.person === m.id);
  const counts = (c: HrCycle) => {
    const k = cycleCounts(db, c);
    return `${k.eligible} ${t('eligible')}, ${k.final} ${t('finalized')}${k.incomplete ? `, ${k.incomplete} ${t('incomplete')}` : ''}`;
  };
  const myRow = (c: HrCycle) => {
    const st = asState(db, c, m.id) ?? 'none';
    const a = asOf(db, c, m.id);
    const hint =
      c.state === 'planned'
        ? t('HR is still setting this cycle up')
        : st === 'none' && canSubmit(c)
          ? t('Report due {d}', { d: dShort(c.reportDue) })
          : st === 'clarify'
            ? t('Your reviewer asked a question')
            : st === 'final' && !a?.ack && today() <= c.correctionUntil
              ? t('Acknowledge or ask for a correction by {d}', { d: dShort(c.correctionUntil) })
              : '';
    return (
      <Row
        key={c.id}
        onOpen={() => {
          void navigate(`/${asRoute(c, m.id)}`);
        }}
        className="gap-2.5"
      >
        <RowText title={<b>{cyName(c)}</b>} sub={hint || t(cysDef(c.state)[0])} />
        {a?.corr?.state === 'open' && <Chip def={['Correction requested', 'undo', 'warn']} pill="pill-o" />}
        {a?.ack && <Chip def={['Acknowledged', 'check', 'mute']} pill="pill-o" />}
        <Chip def={c.state === 'planned' ? cysDef('planned') : asDef(st)} pill="pill-o" />
      </Row>
    );
  };
  const qRow = (x: (typeof toReview)[number], key: string) => (
    <Row
      key={key}
      className="gap-2.5"
      onOpen={() => {
        void navigate(`/${asRoute(x.c, x.p)}`);
      }}
    >
      <Avatar id={x.p} />
      <RowText title={<QName id={x.p} />} sub={cyName(x.c)} />
      {x.a?.corr?.state === 'open' ? (
        <Chip def={['Correction requested', 'undo', 'warn']} pill="pill-o" />
      ) : (
        <Chip def={asDef(x.st ?? 'none')} pill="pill-o" />
      )}
    </Row>
  );
  return (
    <Page wide>
      <PageHeader
        title={t('Monitoring and development')}
        sub={t('One cycle every 14 days. Reports, reviewed scores, feedback and support actions.')}
      >
        {hrLead(m) && (
          <Button
            onClick={() => {
              void planNextCycle();
            }}
          >
            <Icon name="plus" />
            {t('Plan next cycle')}
          </Button>
        )}
      </PageHeader>
      {mine.length > 0 ? (
        <>
          <SectionHeading as="h2" count={mine.length}>
            {t('Your cycles')}
          </SectionHeading>
          <Rows>{mine.map(myRow)}</Rows>
        </>
      ) : (
        !seeAll && (
          <Empty title={t('You are not in a monitoring cycle yet')}>
            {t('HR adds members to a cycle before it opens. Your reports and feedback will appear here.')}
          </Empty>
        )
      )}
      {toReview.length > 0 && (
        <>
          <SectionHeading as="h2" count={toReview.length}>
            {t('Assigned to you for review')}
          </SectionHeading>
          <Rows>{toReview.map((x) => qRow(x, `r${x.c.id}${x.p}`))}</Rows>
        </>
      )}
      {toCheck.length > 0 && (
        <>
          <SectionHeading as="h2" count={toCheck.length}>
            {t('Waiting for your HR check')}
          </SectionHeading>
          <Rows>{toCheck.map((x) => qRow({ ...x, st: 'reviewed' }, `c${x.c.id}${x.p}`))}</Rows>
        </>
      )}
      {seeAll && (
        <>
          <SectionHeading as="h2" count={cys.length}>
            {t('Cycles')}
          </SectionHeading>
          <div className={tblScroll}>
            <table className={tblClass}>
              <thead>
                <tr>
                  <th className={th}>{t('Window')}</th>
                  <th className={th}>{t('Units')}</th>
                  <th className={th}>{t('Report due')}</th>
                  <th className={th}>{t('Review due')}</th>
                  <th className={th}>{t('Members')}</th>
                  <th className={th}>{t('State')}</th>
                </tr>
              </thead>
              <tbody>
                {cys.map((c) => (
                  <tr
                    key={c.id}
                    className={trLink}
                    tabIndex={0}
                    role="link"
                    onClick={() => {
                      void navigate(`/monitoring/${c.id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void navigate(`/monitoring/${c.id}`);
                    }}
                  >
                    <td className={td}>
                      <b className="type-num">{cyLabel(c)}</b>
                    </td>
                    <td className={td}>
                      {c.units.length === DIVS.length
                        ? t('All divisions')
                        : c.units.map((u) => divisionOf(u)?.short).join(', ')}
                    </td>
                    <td className={cn(td, 'type-num')}>{dShort(c.reportDue)}</td>
                    <td className={cn(td, 'type-num')}>{dShort(c.reviewDue)}</td>
                    <td className={cn(td, 'type-small')}>{counts(c)}</td>
                    <td className={td}>
                      <Chip def={cysDef(c.state)} pill="pill-o" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {acts.length > 0 && (
        <>
          <SectionHeading as="h2" count={acts.length}>
            {t('Support actions')}
          </SectionHeading>
          <Rows>
            {acts.map((x) => (
              <ActionRow key={x.id} x={x} />
            ))}
          </Rows>
          <Hint>{t('Support is help, not discipline. Closing a cycle never completes an action.')}</Hint>
        </>
      )}
      <SectionHeading as="h2">{t('Rubric')}</SectionHeading>
      <div className="rounded-sheet bg-surface-2 p-3.5">
        <Notice icon="info" title={<b>{t('Proposed rubric {v}', { v: RUBRIC.version })}</b>} className="shadow-none">
          <p>
            {t('Scale, weights and anchors are open until HR adopts them. Scores are never inferred from task counts.')}
          </p>
        </Notice>
        <div className="mb-2 grid grid-cols-4 gap-2 max-[1100px]:grid-cols-2 max-[760px]:grid-cols-1">
          {RUBRIC.criteria.map((k) => (
            <div
              key={k.k}
              className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-0.5 rounded-ctl bg-surface px-3 py-2.5 text-d13"
            >
              <b>{t(k.name)}</b>
              <span className="type-num">{k.w}%</span>
              <small className="col-span-full text-d12h text-mute">{t(k.desc)}</small>
            </div>
          ))}
        </div>
        <p className="m-0 text-mute type-small">
          {t('Worked example: scores 4, 4, 5 and 3 give 24 + 24 + 20 + 12 = 80.0 of 100.')}
        </p>
      </div>
    </Page>
  );
}

function QName({ id }: { id: string }) {
  const who = useWho();
  return <b>{who.name(id)}</b>;
}

// ---------- one cycle ----------
function CyclePage({ c, m }: { c: HrCycle; m: Person }) {
  const db = useWorkspace((w) => w);
  const navigate = useNavigate();
  const who = useWho();
  const h = hrOf(db);
  const full = hrLead(m) || isTop(m) || hrStaff(m);
  const mineR = rosterOf(c, m.id);
  const revOf = c.roster.filter((x) => x.reviewer === m.id);
  if (!full && !mineR && !revOf.length && !c.roster.some((x) => unitLead(m, x.unit))) return <Unavailable />;
  const list = full ? c.roster : c.roster.filter((x) => x.p === m.id || x.reviewer === m.id || unitLead(m, x.unit));
  const prev = h?.cycles.find((x) => x.end === addDays(c.start, -1));
  const len = daysBetween(c.start, c.end) + 1;
  const k = cycleCounts(db, c);
  const gaps = c.roster.filter((x) => !x.reviewer && !x.exempt);
  const lead = hrLead(m);
  const plan = c.state === 'planned';
  const step = (to: 'open' | 'review' | 'final' | 'closed', label: string, primary = false, disabled = false) => (
    <Button
      variant={primary ? 'primary' : 'default'}
      disabled={disabled}
      onClick={() => {
        void stepCycle(c.id, to);
      }}
    >
      {label}
    </Button>
  );
  const actsBtn = !lead
    ? null
    : plan
      ? step('open', t('Open cycle'), true, gaps.length > 0)
      : c.state === 'open'
        ? step('review', t('Start review'))
        : c.state === 'review'
          ? step('final', t('Release results'), true)
          : c.state === 'final'
            ? step('closed', t('Close cycle'))
            : null;
  const reviewers = db.people.filter((p) => p.status === 'active' && rank(p) >= 2);
  const openActs = (h?.actions ?? []).filter(
    (x) => x.state === 'open' && c.roster.some((y) => y.p === x.person) && asOf(db, c, x.person)?.id === x.assessment,
  );
  const recon: [keyof typeof k, string][] = [
    ['eligible', 'Eligible'],
    ['exempt', 'Exempt'],
    ['none', 'Not submitted'],
    ['submitted', 'Submitted'],
    ['reviewing', 'Being reviewed'],
    ['final', 'Finalized'],
    ['incomplete', 'Incomplete'],
    ['corr', 'Correction pending'],
  ];
  const stamp = (id: string | null, at: string | null) => (id && at ? who.stamp(id, at) : '');
  return (
    <Page wide>
      <PageHeader
        title={cyName(c)}
        sub={`${c.units.length === DIVS.length ? t('All divisions') : c.units.map((u) => divisionOf(u)?.name).join(', ')}. ${t('Rubric {v} (proposed)', { v: c.rubric })}`}
      >
        <Chip def={cysDef(c.state)} pill="pill" />
        {actsBtn}
      </PageHeader>
      <Meta className="mt-4 mb-1.5 max-w-[720px] grid-cols-[140px_1fr] max-[760px]:grid-cols-[110px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('Window')}>
          {fmtD(c.start)} – {fmtD(c.end)} <small>{plural(len, '{n} day', '{n} days')}</small>
        </MetaRow>
        <MetaRow label={t('Sequence')}>
          {prev
            ? t('Follows {p} with no gap or overlap', { p: cyLabel(prev) })
            : t('First cycle, anchored on {d}', { d: fmtD(c.start) })}
        </MetaRow>
        <MetaRow label={t('Report due')}>{fmtD(c.reportDue)}</MetaRow>
        <MetaRow label={t('Review due')}>{fmtD(c.reviewDue)}</MetaRow>
        <MetaRow label={t('Corrections until')}>{fmtD(c.correctionUntil)}</MetaRow>
        <MetaRow label={t('Opened by')}>
          {c.openedBy ? stamp(c.openedBy, c.openedAt) : <span className="text-mute">{t('Not opened yet')}</span>}
        </MetaRow>
        <MetaRow label={t('Created by')}>{stamp(c.createdBy, c.createdAt)}</MetaRow>
      </Meta>
      {plan &&
        (gaps.length ? (
          <Notice
            icon="warning"
            tone="warn"
            title={<b>{plural(gaps.length, '{n} member has no reviewer', '{n} members have no reviewer')}</b>}
          >
            <p>{t('Every member needs a reviewer before the cycle can open. Choose one in the table.')}</p>
          </Notice>
        ) : (
          <Notice icon="check" tone="done" title={<b>{t('Every member has a reviewer')}</b>}>
            <p>{t('The cycle can open. Members then see the criteria and the report deadline.')}</p>
          </Notice>
        ))}
      {full && !plan && (
        <>
          <SectionHeading as="h2">{t('Reconciliation')}</SectionHeading>
          <div className="my-1 mb-2 grid grid-cols-8 gap-[3px] max-[1100px]:grid-cols-4 max-[760px]:grid-cols-2">
            {recon.map(([key, l]) => (
              <div
                key={key}
                className={cn('grid gap-1 rounded-ctl bg-surface-2 px-3 py-3', key === 'eligible' && 'bg-fill')}
              >
                <b className="text-[length:20px]! leading-6 type-num">{k[key]}</b>
                <small className="text-d13h text-mute">{t(l)}</small>
              </div>
            ))}
          </div>
          <SmallNote>
            {t(
              '{e} eligible = {x} exempt + {n} not submitted + {s} submitted + {r} being reviewed + {f} finalized + {i} incomplete.',
              {
                e: k.eligible,
                x: k.exempt,
                n: k.none,
                s: k.submitted,
                r: k.reviewing,
                f: k.final,
                i: k.incomplete,
              },
            )}
          </SmallNote>
        </>
      )}
      {c.state === 'final' && lead && (
        <Notice icon="info" title={<b>{t('Closing keeps every open item')}</b>}>
          <p>
            {plural(
              openActs.length,
              'Members without a report become Incomplete. Correction requests stay visible and {n} support action stays open.',
              'Members without a report become Incomplete. Correction requests stay visible and {n} support actions stay open.',
            )}
          </p>
        </Notice>
      )}
      <SectionHeading as="h2" count={list.length}>
        {full ? t('Roster at this period') : t('Your part of this cycle')}
      </SectionHeading>
      <div className={tblScroll}>
        <table className={tblClass}>
          <thead>
            <tr>
              <th className={th}>{t('Member')}</th>
              <th className={th}>{t('Unit')}</th>
              <th className={th}>{t('Reviewer')}</th>
              <th className={th}>{t('Report sent')}</th>
              <th className={th}>{t('Assessment')}</th>
              <th className={th}>{t('Member response')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((x) => {
              const st = asState(db, c, x.p) ?? 'none';
              const a = asOf(db, c, x.p);
              const lv = asLevel(db, m, c, x.p);
              return (
                <tr
                  key={x.p}
                  className={lv ? trLink : 'group/tr'}
                  {...(lv
                    ? {
                        tabIndex: 0,
                        role: 'link',
                        onClick: () => {
                          void navigate(`/${asRoute(c, x.p)}`);
                        },
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === 'Enter') void navigate(`/${asRoute(c, x.p)}`);
                        },
                      }
                    : {})}
                >
                  <td className={td}>
                    <PersonLink id={x.p} full />
                  </td>
                  <td className={td}>{divisionOf(x.unit)?.short}</td>
                  <td
                    className={td}
                    onClick={(e) => {
                      if (plan && lead) e.stopPropagation();
                    }}
                  >
                    {plan && lead ? (
                      <SelectField
                        small
                        className="min-w-40"
                        people
                        label={t('Reviewer for {who}', { who: who.name(x.p) })}
                        value={x.reviewer ?? ''}
                        onChange={(v) => {
                          void setReviewer(c.id, x.p, v || null);
                        }}
                        options={[
                          { value: '', label: t('No reviewer') },
                          ...reviewers.filter((p) => p.id !== x.p).map((p) => ({ value: p.id, label: p.name })),
                        ]}
                      />
                    ) : x.reviewer ? (
                      <PersonLink id={x.reviewer} />
                    ) : (
                      <Chip def={['No reviewer', 'warning', 'danger']} pill="pill-o" />
                    )}
                  </td>
                  <td className={td}>
                    {x.exempt ? (
                      <Chip def={asDef('exempt')} pill="pill-o" />
                    ) : plan ? (
                      <span className="text-mute">-</span>
                    ) : a?.report ? (
                      <span className="type-num type-small">{dShort(a.report.at.slice(0, 10))}</span>
                    ) : (
                      <span className="text-mute type-small">{t('No report')}</span>
                    )}
                  </td>
                  <td className={td}>
                    {plan ? <span className="text-mute">-</span> : <Chip def={asDef(st)} pill="pill-o" />}
                  </td>
                  <td className={td}>
                    {a?.corr?.state === 'open' ? (
                      <Chip def={['Correction requested', 'undo', 'warn']} pill="pill-o" />
                    ) : a?.ack ? (
                      <Chip def={['Acknowledged', 'check', 'mute']} pill="pill-o" />
                    ) : (
                      <span className="text-mute">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Hint>
        {t(
          'Names and states only. Scores open on each assessment for the people allowed to see them; there is no ranking.',
        )}
      </Hint>
    </Page>
  );
}

// ---------- one assessment ----------
type Form = 'hr-clar' | 'hr-ret' | 'hr-corr' | 'hr-corr-no' | null;

const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);
const Acts = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 flex flex-wrap gap-2">{children}</div>
);

function TextForm({
  id,
  label,
  help,
  button,
  danger,
  onSend,
  onCancel,
  invalid,
}: {
  id: string;
  label: string;
  help?: string;
  button: string;
  danger?: boolean;
  onSend: (text: string) => void;
  onCancel: () => void;
  invalid: string;
}) {
  const [text, setText] = useState('');
  const [err, setErr] = useState(false);
  return (
    <SubForm>
      <Field label={label} htmlFor={id} help={err ? invalid : help} error={err}>
        <textarea
          id={id}
          className={cn(textareaClass, 'min-h-16', err && invalidClass)}
          value={text}
          autoFocus
          onChange={(e) => {
            setText(e.target.value);
            setErr(false);
          }}
        />
      </Field>
      <div className="flex gap-2">
        <Button
          small
          variant={danger ? 'danger' : 'primary'}
          onClick={() => {
            if (!text.trim()) {
              setErr(true);
              return;
            }
            onSend(text.trim());
          }}
        >
          {button}
        </Button>
        <Button small variant="ghost" onClick={onCancel}>
          {t('Cancel')}
        </Button>
      </div>
    </SubForm>
  );
}

function ReportView({ db, a, p }: { db: Workspace; a: HrAssessment; p: string }) {
  const who = useWho();
  const rep = a.report;
  if (!rep) return null;
  const nl = (s: string) => <span className="whitespace-pre-line">{s}</span>;
  const field = (label: string, v: string, emptyTxt?: string) => (
    <div>
      <small className="mb-0.5 block text-mute type-caption">{label}</small>
      {v ? <p className="m-0 mb-0.5">{nl(v)}</p> : <p className="m-0 text-mute">{emptyTxt ?? t('Not provided')}</p>}
    </div>
  );
  const tlink = (id: string) => {
    const tk = taskOf(db, id);
    return tk ? (
      <a
        key={id}
        className="inline-flex max-w-full cursor-pointer items-center gap-1 overflow-hidden rounded-chip bg-fill px-2 py-1 text-ellipsis text-ink no-underline hover:bg-hover"
        onClick={() => {
          openTask(tk.id);
        }}
      >
        <Icon name="tasks" size="xs" />
        {tk.title}
      </a>
    ) : (
      <span key={id} className="text-mute">
        {t('Removed task')}
      </span>
    );
  };
  return (
    <div className="my-1.5 mb-1 grid gap-3.5">
      {field(t('Achievements'), rep.achievements)}
      <div>
        <small className="mb-0.5 block text-mute type-caption">{t('Division function')}</small>
        {rep.div.length ? (
          <div className="my-1.5 flex flex-wrap gap-1.5">{rep.div.map(tlink)}</div>
        ) : (
          <p className="m-0 text-mute">{t('No division tasks linked')}</p>
        )}
      </div>
      <div>
        <small className="mb-0.5 block text-mute type-caption">{t('Consultant function')}</small>
        {rep.cons.length > 0 && <div className="my-1.5 flex flex-wrap gap-1.5">{rep.cons.map(tlink)}</div>}
        {rep.consNote ? (
          <p className="m-0">{nl(rep.consNote)}</p>
        ) : (
          !rep.cons.length && <p className="m-0 text-mute">{t('No consultant work linked')}</p>
        )}
      </div>
      {field(t('Blockers and support needed'), [rep.blockers, rep.support].filter(Boolean).join('\n'))}
      {field(t('Next commitments'), rep.next)}
      <div>
        <small className="mb-0.5 block text-mute type-caption">{t('Evidence links')}</small>
        {rep.links.length ? (
          rep.links.map((u) => (
            <p key={u} className="m-0 mb-0.5">
              <a className="break-all" href={u} target="_blank" rel="noopener noreferrer">
                {u}
              </a>
            </p>
          ))
        ) : (
          <p className="m-0 text-mute">{t('No evidence links. Missing evidence stays visible to the reviewer.')}</p>
        )}
      </div>
      <p className="m-0 mb-3.5 text-mute type-small">{t('Submitted {when}', { when: who.stamp(p, rep.at) })}</p>
    </div>
  );
}

function ReportForm({
  c,
  a,
  divTasks,
  consTasks,
  onDone,
}: {
  c: HrCycle;
  a: HrAssessment | undefined;
  divTasks: Task[];
  consTasks: Task[];
  onDone: () => void;
}) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const r = a?.report;
  const unit = m ? rosterOf(c, m.id)?.unit : undefined;
  const [ach, setAch] = useState(r?.achievements ?? '');
  const [divSel, setDivSel] = useState<string[]>(r?.div ?? []);
  const [consSel, setConsSel] = useState<string[]>(r?.cons ?? []);
  const [consNote, setConsNote] = useState(r?.consNote ?? '');
  const [blk, setBlk] = useState(r?.blockers ?? '');
  const [sup, setSup] = useState(r?.support ?? '');
  const [next, setNext] = useState(r?.next ?? '');
  const [links, setLinks] = useState((r?.links ?? []).join('\n'));
  const [err, setErr] = useState<{ f: 'a' | 'l'; text: string } | null>(null);
  const toggle = (set: (v: string[]) => void, cur: string[], id: string) => {
    set(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };
  const pick = (ts: Task[], sel: string[], set: (v: string[]) => void) =>
    ts.length ? (
      <div className="grid gap-[3px]">
        {ts.map((tk) => (
          <label
            key={tk.id}
            className="grid min-h-10 cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 rounded-ctl bg-surface-2 px-2.5 py-1 text-[length:13px] hover:bg-hover max-[760px]:grid-cols-[20px_minmax(0,1fr)]"
          >
            <input
              type="checkbox"
              className="m-0 size-4 accent-ink"
              checked={sel.includes(tk.id)}
              onChange={() => {
                toggle(set, sel, tk.id);
              }}
            />
            <span>{tk.title}</span>
            <small className="max-w-[180px] overflow-hidden text-[length:12px] text-ellipsis whitespace-nowrap text-mute max-[760px]:col-start-2 max-[760px]:max-w-none">
              {projOf(db, tk.project)?.name ?? divisionOf(taskDiv(db, tk))?.short}
            </small>
          </label>
        ))}
      </div>
    ) : (
      <p className="text-mute type-small">
        {t('No tasks found for this function. Describe work done outside the app below.')}
      </p>
    );
  const send = () => {
    if (!ach.trim()) {
      setErr({ f: 'a', text: t('Describe at least one achievement.') });
      return;
    }
    const ls = links
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (ls.some((u) => !u.startsWith('https://'))) {
      setErr({ f: 'l', text: t('Links must start with https://') });
      return;
    }
    setErr(null);
    void submitReport(c.id, {
      achievements: ach.trim(),
      div: divSel,
      cons: consSel,
      consNote: consNote.trim(),
      blockers: blk.trim(),
      support: sup.trim(),
      next: next.trim(),
      links: ls,
    }).then((ok) => {
      if (ok) onDone();
    });
  };
  return (
    <div className="grid gap-1">
      <Notice icon="info" title={<b>{t('Report due {d}', { d: fmtD(c.reportDue) })}</b>} className="mt-0">
        <p>{t('Link real tasks once. The same task is never copied; your reviewer opens it from here.')}</p>
      </Notice>
      <Field
        label={t('Achievements this cycle')}
        htmlFor="hr-r-a"
        required
        help={err?.f === 'a' ? err.text : undefined}
        error={err?.f === 'a'}
      >
        <textarea
          id="hr-r-a"
          className={cn(textareaClass, err?.f === 'a' && invalidClass)}
          value={ach}
          onChange={(e) => {
            setAch(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Division function: tasks in {d}', { d: divisionOf(unit)?.short ?? '' })}>
        {pick(divTasks, divSel, setDivSel)}
      </Field>
      <Field label={t('Consultant function: Consulting tasks')}>
        {pick(consTasks, consSel, setConsSel)}
        <textarea
          className={cn(textareaClass, 'mt-1.5 min-h-16')}
          placeholder={t('Consultant work outside the app, or say there was none')}
          value={consNote}
          onChange={(e) => {
            setConsNote(e.target.value);
          }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
        <Field label={t('Blockers')} htmlFor="hr-r-b" optional>
          <textarea
            id="hr-r-b"
            className={cn(textareaClass, 'min-h-16')}
            value={blk}
            onChange={(e) => {
              setBlk(e.target.value);
            }}
          />
        </Field>
        <Field label={t('Support needed')} htmlFor="hr-r-s" optional>
          <textarea
            id="hr-r-s"
            className={cn(textareaClass, 'min-h-16')}
            value={sup}
            onChange={(e) => {
              setSup(e.target.value);
            }}
          />
        </Field>
      </div>
      <Field label={t('Next commitments')} htmlFor="hr-r-n">
        <textarea
          id="hr-r-n"
          className={cn(textareaClass, 'min-h-16')}
          value={next}
          onChange={(e) => {
            setNext(e.target.value);
          }}
        />
      </Field>
      <Field
        label={t('Evidence links, one per line')}
        htmlFor="hr-r-l"
        optional
        help={err?.f === 'l' ? err.text : undefined}
        error={err?.f === 'l'}
      >
        <textarea
          id="hr-r-l"
          className={cn(textareaClass, 'min-h-16', err?.f === 'l' && invalidClass)}
          placeholder="https://"
          value={links}
          onChange={(e) => {
            setLinks(e.target.value);
          }}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="primary" onClick={send}>
          {r ? t('Update report') : t('Submit report')}
        </Button>
        {r && (
          <Button variant="ghost" onClick={onDone}>
            {t('Cancel')}
          </Button>
        )}
      </div>
    </div>
  );
}

function AssessmentPage({ c, p, m }: { c: HrCycle; p: string; m: Person }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const [editRep, setEditRep] = useState(false);
  const [reScores, setReScores] = useState<HrScores | null>(null);
  const [form, setForm] = useState<Form>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [ansErr, setAnsErr] = useState<number | null>(null);
  const r = rosterOf(c, p);
  const lv = asLevel(db, m, c, p);
  if (!r || !lv) return <Unavailable />;
  const a = asOf(db, c, p);
  const st = asState(db, c, p) ?? 'none';
  const self = m.id === p;
  const rev = m.id === r.reviewer;
  const full = lv === 'full';
  const rep = a?.report ?? null;
  const submitOpen = self && canSubmit(c) && (st === 'none' || (st === 'submitted' && editRep));
  const tasksOf = (pred: (tk: Task) => boolean) =>
    db.tasks.filter(
      (tk) => !tk.trashed && !isSummary(db, tk) && (tk.owner === p || joinedOf(tk).includes(p)) && pred(tk),
    );
  const divTasks = tasksOf((tk) => taskDiv(db, tk) === r.unit);
  const consTasks = tasksOf((tk) => taskDiv(db, tk) === 'cons' && r.unit !== 'cons');
  const first = who.first(p);
  const scoring = rev && !!a && ['submitted', 'draft', 'clarify'].includes(st);
  const reScoring = rev && !!a && reScores !== null;
  const closeForm = () => {
    setForm(null);
  };
  const exemptBox = r.exempt ? (
    <Notice icon="minus" title={<b>{t('Exempt from this cycle')}</b>}>
      <p>{hrLead(m) || self ? t(EXEMPT[r.exempt] ?? 'Other') : t('The reason is restricted.')}</p>
    </Notice>
  ) : null;
  const notIn =
    !a && !r.exempt ? (
      c.state === 'planned' ? (
        <Notice icon="settings" title={<b>{t('HR is still setting this cycle up')}</b>}>
          <p>{t('The report opens when HR opens the cycle.')}</p>
        </Notice>
      ) : !canSubmit(c) || !self ? (
        <Notice icon="warning" tone="warn" title={<b>{t('No report submitted')}</b>}>
          <p>
            {c.state === 'closed' || c.state === 'final'
              ? t('This stays Incomplete. A missing report is never scored as zero.')
              : t('The report is due {d}.', { d: fmtD(c.reportDue) })}
          </p>
        </Notice>
      ) : null
    ) : null;
  const corrReview =
    rev && a?.corr?.state === 'open' && !reScoring ? (
      <>
        <Notice
          icon="undo"
          tone="warn"
          title={<b>{t('{who} asked for a correction', { who: first })}</b>}
          actions={
            <>
              <Button
                small
                variant="primary"
                onClick={() => {
                  setReScores(JSON.parse(JSON.stringify(a.scores ?? {})) as HrScores);
                  setForm(null);
                }}
              >
                {t('Correct the scores')}
              </Button>
              <Button
                small
                onClick={() => {
                  setForm('hr-corr-no');
                }}
              >
                {t('Keep the result')}
              </Button>
            </>
          }
        >
          <p>{a.corr.reason}</p>
        </Notice>
        {form === 'hr-corr-no' && (
          <TextForm
            id="hr-corr-no"
            label={t('Why does the result stay?')}
            button={t('Send answer')}
            invalid={t('Give a reason.')}
            onCancel={closeForm}
            onSend={(text) => {
              void declineCorrection(a.id, text).then(closeForm);
            }}
          />
        )}
      </>
    ) : null;
  const clar =
    a && a.clar.length > 0 && full ? (
      <>
        <SectionHeading as="h2" count={a.clar.length}>
          {t('Clarifications')}
        </SectionHeading>
        <div className="grid gap-2">
          {a.clar.map((q, i) => (
            <div key={`${q.at}${i}`} className="rounded-ctl bg-surface-2 px-3.5 py-3 text-[length:13.5px]">
              <p className="m-0 mb-1">
                <b>{who.first(q.by)}</b> <span className="text-mute type-small">{ago(q.at)}</span>
              </p>
              <p className="m-0 mb-1 whitespace-pre-line">{q.q}</p>
              {q.a ? (
                q.a === '-' ? null : (
                  <p className="m-0 mt-2 border-t border-line pt-2">
                    <b>{first}</b> <span className="text-mute type-small">{q.aAt ? ago(q.aAt) : ''}</span>
                    <br />
                    <span className="whitespace-pre-line">{q.a}</span>
                  </p>
                )
              ) : self ? (
                <>
                  <Field
                    label={t('Your answer')}
                    htmlFor={`hr-ans-${i}`}
                    help={ansErr === i ? t('Write your answer.') : undefined}
                    error={ansErr === i}
                  >
                    <textarea
                      id={`hr-ans-${i}`}
                      className={cn(textareaClass, 'min-h-16', ansErr === i && invalidClass)}
                      value={answers[i] ?? ''}
                      onChange={(e) => {
                        setAnswers({ ...answers, [i]: e.target.value });
                        setAnsErr(null);
                      }}
                    />
                  </Field>
                  <Button
                    small
                    variant="primary"
                    onClick={() => {
                      const txt = (answers[i] ?? '').trim();
                      if (!txt) {
                        setAnsErr(i);
                        return;
                      }
                      void answerClarification(a.id, i, txt);
                    }}
                  >
                    {t('Send answer')}
                  </Button>
                </>
              ) : (
                <p className="m-0 text-mute type-small">{t('Waiting for {who} to answer.', { who: first })}</p>
              )}
            </div>
          ))}
        </div>
      </>
    ) : null;
  const scoreBlock = scoring ? (
    <>
      <SectionHeading as="h2">{t('Score against rubric {v}', { v: RUBRIC.version })}</SectionHeading>
      <ScoreTable
        scores={a.scores}
        edit
        onScore={(k, v) => {
          void scoreCriterion(a.id, k, v);
        }}
        onWhy={(k, why) => {
          void setRationale(a.id, k, why);
        }}
      />
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            void sendToHrCheck(a.id);
          }}
        >
          {missingOf(a.scores).length
            ? plural(
                missingOf(a.scores).length,
                'Send to HR check with {n} missing',
                'Send to HR check with {n} missing',
              )
            : t('Send to HR check')}
        </Button>
        <Button
          onClick={() => {
            setForm('hr-clar');
          }}
        >
          {t('Ask for clarification')}
        </Button>
      </Acts>
      {form === 'hr-clar' && (
        <TextForm
          id="hr-clar-q"
          label={t('Question for {who}', { who: first })}
          button={t('Send question')}
          invalid={t('Write the question.')}
          onCancel={closeForm}
          onSend={(text) => {
            void askClarification(a.id, text).then(closeForm);
          }}
        />
      )}
    </>
  ) : reScoring ? (
    <>
      <SectionHeading as="h2">{t('Corrected version {v}', { v: a.version + 1 })}</SectionHeading>
      <ScoreTable
        scores={reScores}
        edit
        onScore={(k, v) => {
          setReScores({ ...reScores, [k]: { v, why: reScores[k]?.why ?? '' } });
        }}
        onWhy={(k, why) => {
          setReScores({ ...reScores, [k]: { v: reScores[k]?.v ?? (null as unknown as number), why: why.trim() } });
        }}
      />
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            void saveCorrectedVersion(a.id, reScores).then((ok) => {
              if (ok) setReScores(null);
            });
          }}
        >
          {t('Save corrected version')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setReScores(null);
          }}
        >
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  ) : a?.scores && ['reviewed', 'final', 'incomplete'].includes(st) && (full || st === 'final') ? (
    <>
      <SectionHeading as="h2">
        {st === 'final'
          ? t('Result, version {v}', { v: a.version })
          : st === 'incomplete'
            ? t('Recorded scores')
            : t('Draft scores')}
      </SectionHeading>
      <ScoreTable scores={a.scores} />
    </>
  ) : null;
  const checks =
    a && st === 'reviewed' && canHrCheck(db, m, c, p)
      ? (() => {
          const miss = missingOf(a.scores);
          const nLinks = rep?.links.length ?? 0;
          const noWhy = RUBRIC.criteria.filter((k) => a.scores?.[k.k] && !a.scores[k.k]?.why);
          const line = (ok: boolean, txt: string) => (
            <li className="flex items-center gap-2.5 text-[length:13.5px]" key={txt}>
              <span className="min-w-[72px] flex-none">
                {ok ? (
                  <State label={t('Done')} icon="check" tone="green" />
                ) : (
                  <State label={t('Check')} icon="warning" tone="warn" />
                )}
              </span>
              <span>{txt}</span>
            </li>
          );
          return (
            <>
              <SectionHeading as="h2">{t('HR completeness check')}</SectionHeading>
              <ul className="m-0 grid list-none gap-1.5 p-0">
                {line(!!rep, rep ? t('Report submitted') : t('No report. Record an exception before finalizing.'))}
                {line(
                  !miss.length,
                  miss.length
                    ? t('Not scored: {c}', { c: miss.map((x) => t(x.name)).join(', ') })
                    : t('Every criterion scored'),
                )}
                {line(
                  !noWhy.length,
                  noWhy.length
                    ? t('Missing rationale: {c}', { c: noWhy.map((x) => t(x.name)).join(', ') })
                    : t('Every score has a rationale'),
                )}
                {line(r.reviewer !== p, t('Reviewer is not the member'))}
                {line(
                  nLinks > 0,
                  nLinks ? plural(nLinks, '{n} evidence link', '{n} evidence links') : t('No evidence links'),
                )}
              </ul>
              <Acts>
                <Button
                  variant="primary"
                  onClick={() => {
                    void finalizeAssessment(a.id);
                  }}
                >
                  {miss.length ? t('Finalize as Incomplete') : t('Finalize')}
                </Button>
                <Button
                  onClick={() => {
                    setForm('hr-ret');
                  }}
                >
                  {t('Return to reviewer')}
                </Button>
              </Acts>
              {form === 'hr-ret' && (
                <TextForm
                  id="hr-ret-why"
                  label={t('What should the reviewer check?')}
                  button={t('Return')}
                  invalid={t('Say what the reviewer should check.')}
                  onCancel={closeForm}
                  onSend={(text) => {
                    void returnToReviewer(a.id, text).then(closeForm);
                  }}
                />
              )}
            </>
          );
        })()
      : null;
  const feedback =
    self && a && st === 'final'
      ? (() => {
          const can = today() <= c.correctionUntil;
          if (a.corr?.state === 'open')
            return (
              <Notice
                icon="undo"
                tone="warn"
                title={<b>{t('Correction requested {when}', { when: who.stamp(a.corr.by, a.corr.at) })}</b>}
              >
                <p>{a.corr.reason}</p>
              </Notice>
            );
          return (
            <>
              <SectionHeading as="h2">{t('Your response')}</SectionHeading>
              {a.ack && (
                <Notice
                  icon="check"
                  tone="done"
                  title={<b>{t('You acknowledged this result {when}', { when: ago(a.ack) })}</b>}
                >
                  {can && <p>{t('You can still ask for a correction until {d}.', { d: fmtD(c.correctionUntil) })}</p>}
                </Notice>
              )}
              {can ? (
                form === 'hr-corr' ? (
                  <TextForm
                    id="hr-corr-r"
                    label={t('What should be corrected, and why?')}
                    help={t('The original score, reviewer and reason stay on record.')}
                    button={t('Send correction request')}
                    invalid={t('Say what should change and why.')}
                    onCancel={closeForm}
                    onSend={(text) => {
                      void askCorrection(a.id, text).then(closeForm);
                    }}
                  />
                ) : (
                  <Acts>
                    {!a.ack && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          void acknowledgeResult(a.id);
                        }}
                      >
                        <Icon name="check" />
                        {t('Acknowledge')}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setForm('hr-corr');
                      }}
                    >
                      {t('Ask for a correction')}
                    </Button>
                  </Acts>
                )
              ) : (
                <p className="text-mute type-small">
                  {t('The correction window closed on {d}.', { d: fmtD(c.correctionUntil) })}
                </p>
              )}
            </>
          );
        })()
      : null;
  const lineage =
    a && (a.history.length > 0 || a.corr) && (full || st === 'final') ? (
      <>
        <SectionHeading as="h2" count={a.version}>
          {t('Versions')}
        </SectionHeading>
        <div className="grid gap-2">
          <div className="grid grid-cols-[40px_1fr_auto] gap-2.5 rounded-ctl bg-sel-neutral px-2.5 py-2.5">
            <span className="text-mute type-num">v{a.version}</span>
            <div className="min-w-0">
              <b>{totalOf(a.scores) == null ? t('Incomplete') : totalOf(a.scores)?.toFixed(1)}</b>
              <small className="block text-d12h text-mute">
                {a.corr?.state === 'accepted' && a.corr.resolvedBy && a.corr.resolvedAt
                  ? t('Corrected by {who}', { who: who.stamp(a.corr.resolvedBy, a.corr.resolvedAt) })
                  : a.scoredBy && a.scoredAt
                    ? who.stamp(a.scoredBy, a.scoredAt)
                    : ''}
              </small>
              {a.corr && (
                <small className="mt-1 block text-[length:12.5px] text-ink-2">
                  {t('Request from {who}: {r}', { who: who.first(a.corr.by), r: a.corr.reason })}
                </small>
              )}
            </div>
            {a.corr && (
              <Chip
                def={
                  a.corr.state === 'accepted'
                    ? ['Corrected', 'check', 'green']
                    : a.corr.state === 'declined'
                      ? ['Kept', 'minus', 'mute']
                      : ['Correction requested', 'undo', 'warn']
                }
                pill="pill"
              />
            )}
          </div>
          {a.history
            .slice()
            .reverse()
            .map((hh) => (
              <div key={hh.version} className="grid grid-cols-[40px_1fr_auto] gap-2.5 rounded-ctl px-2.5 py-2.5">
                <span className="text-mute type-num">v{hh.version}</span>
                <div className="min-w-0">
                  <b>{totalOf(hh.scores) == null ? t('Incomplete') : totalOf(hh.scores)?.toFixed(1)}</b>
                  <small className="block text-d12h text-mute">{hh.by && hh.at ? who.stamp(hh.by, hh.at) : ''}</small>
                  <small className="mt-1 block text-[length:12.5px] text-ink-2">
                    {RUBRIC.criteria
                      .filter((k) => hh.scores[k.k]?.v !== a.scores?.[k.k]?.v)
                      .map((k) => `${t(k.name)}: ${hh.scores[k.k]?.v ?? '-'} → ${a.scores?.[k.k]?.v ?? '-'}`)
                      .join(', ')}
                  </small>
                </div>
                <Chip def={['Superseded', 'archive', 'mute']} pill="pill" />
              </div>
            ))}
        </div>
        {a.corr?.state === 'declined' && a.corr.note && <p className="type-small">{a.corr.note}</p>}
      </>
    ) : null;
  const acts = full && a ? (hrOf(db)?.actions ?? []).filter((x) => x.assessment === a.id) : [];
  const canAct = (hrLead(m) || rev) && !!a && ['final', 'incomplete', 'reviewed'].includes(st);
  const actBlock = full ? (
    <>
      <SectionHeading as="h2" count={acts.length}>
        {t('Support actions')}
      </SectionHeading>
      {acts.length ? (
        <Rows>
          {acts.map((x) => (
            <ActionRow key={x.id} x={x} />
          ))}
        </Rows>
      ) : (
        <p className="text-mute type-small">{t('No support action agreed for this cycle.')}</p>
      )}
      {canAct && (
        <Acts>
          <Button
            small
            onClick={() => {
              openAction(`new:${a.id}`);
            }}
          >
            <Icon name="plus" />
            {t('Agree a support action')}
          </Button>
        </Acts>
      )}
    </>
  ) : null;
  return (
    <Page wide>
      <div className="flex items-center justify-between gap-3 max-[760px]:flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar id={p} size="lg" />
          <div>
            <h1 className="m-0 type-title">{who.name(p)}</h1>
            <p className="mt-1 mb-0 text-d13h text-mute">
              {cyName(c)}, {divisionOf(r.unit)?.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {a?.ack && <Chip def={['Acknowledged', 'check', 'mute']} pill="pill" />}
          <Chip def={asDef(st)} pill="pill" />
        </div>
      </div>
      <Meta className="mt-4 mb-1.5 max-w-[720px] grid-cols-[140px_1fr] max-[760px]:grid-cols-[110px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('Reviewer')}>
          {r.reviewer ? (
            <PersonLink id={r.reviewer} />
          ) : (
            <Chip def={['No reviewer', 'warning', 'danger']} pill="pill-o" />
          )}
        </MetaRow>
        <MetaRow label={t('HR check')}>
          {a?.hrBy && a.finalAt ? who.stamp(a.hrBy, a.finalAt) : <span className="text-mute">{t('Not yet')}</span>}
        </MetaRow>
        <MetaRow label={t('Rubric')}>{t('{v} (proposed)', { v: c.rubric })}</MetaRow>
        <MetaRow label={t('Report due')}>{fmtD(c.reportDue)}</MetaRow>
        <MetaRow label={t('Corrections until')}>{fmtD(c.correctionUntil)}</MetaRow>
      </Meta>
      {lv === 'result' && (
        <Notice icon="lock" title={<b>{t('You see the finalized result only')}</b>}>
          <p>{t('Reports, clarifications and support actions stay with the member, the reviewer and HR.')}</p>
        </Notice>
      )}
      {exemptBox}
      {notIn}
      {corrReview}
      {full && (submitOpen || rep) && (
        <>
          <SectionHeading as="h2">{t('Member report')}</SectionHeading>
          {submitOpen ? (
            <ReportForm
              c={c}
              a={a}
              divTasks={divTasks}
              consTasks={consTasks}
              onDone={() => {
                setEditRep(false);
              }}
            />
          ) : (
            a && <ReportView db={db} a={a} p={p} />
          )}
          {self && rep && st === 'submitted' && canSubmit(c) && !editRep && (
            <Acts>
              <Button
                small
                onClick={() => {
                  setEditRep(true);
                }}
              >
                <Icon name="edit" />
                {t('Edit report')}
              </Button>
            </Acts>
          )}
        </>
      )}
      {clar}
      {lv === 'result' && st !== 'final' ? (
        <Notice icon="clock" title={<b>{t('No finalized result yet')}</b>}>
          <p>{t('It appears here once HR finalizes it.')}</p>
        </Notice>
      ) : (
        scoreBlock
      )}
      {checks}
      {feedback}
      {lineage}
      {actBlock}
    </Page>
  );
}

export function MonitoringPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  useDivisionWorkspace('hr');
  if (!m) return null;
  if (isBoard(m)) return <Unavailable />;
  if (route.id) {
    const c = cyOf(db, route.id);
    if (!c) return <Unavailable />;
    return route.sub ? <AssessmentPage c={c} p={route.sub} m={m} /> : <CyclePage c={c} m={m} />;
  }
  return <MonitoringList m={m} />;
}
