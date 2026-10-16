/* Small pieces the External Engagement pages and panels share: the person-or-"not named" cell, last interaction and due cells,
   follow-up rows, the interaction list, linked legal requests, and the handoff card. From divisions/div-ee-cons.js helpers. */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/shared/Avatar';
import { PersonLink } from '@/components/shared/PersonLink';
import { InspectorHead } from '@/components/shared/Inspector';
import { Chip, Tag, td } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { State } from '@/components/ui/StatusBadge';
import { Steps } from '@/components/ui/Steps';
import { Empty, Row, RowText } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { openPanel, openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dShort, fmtD } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { canSeeProject } from '@/features/projects/services/access';
import { dueLabel } from '@/features/work/services/due';
import { isDone, projOf, taskOf } from '@/features/work/services/selectors';
import type { Task, Workspace } from '@/types/workspace';
import {
  CHANNEL,
  HO,
  KIND,
  OUT,
  canStage,
  attempts,
  eeOf,
  oppOf,
  orgOf,
  staleHo,
  type FollowupLink,
  type Handoff,
  type Interaction,
  type Opp,
  type Org,
} from '../services/ee-data';
import { orgIx } from '../services/ee-data';
import { prepareHandoff } from '../services/external';

export const WhoOr = ({ id, label }: { id: string | null | undefined; label: string }) =>
  id ? <PersonLink id={id} avatarClass="size-[22px]" /> : <Tag unknown>{t(label)}</Tag>;

/** Table cells: the quiet second line is 12px at base, so it scales with density. */
export const eeTd = cn(td, '[&_small]:text-d12');

export const Ctx = ({ children, pill = false }: { children: ReactNode; pill?: boolean }) => (
  <span
    className={cn(
      'flex-none text-d13 whitespace-nowrap text-mute',
      pill && 'inline-flex h-6 items-center rounded-chip bg-fill px-2 text-ink-2',
    )}
  >
    {children}
  </span>
);

export const Kinds = ({ kinds }: { kinds: Org['kinds'] }) => (
  <span className="inline-flex gap-1">
    {kinds.map((k) => (
      <Tag key={k}>{t(KIND[k])}</Tag>
    ))}
  </span>
);

/** "None recorded", or the date, channel and outcome of the latest recorded interaction. Never inferred from a stage or task. */
export function LastIxCell({ orgId }: { orgId: string }) {
  const db = useWorkspace((w) => w);
  const i = orgIx(db, orgId)[0];
  if (!i) return <span className="text-mute">{t('None recorded')}</span>;
  return (
    <span>
      <span className="type-num">{dShort(i.date)}</span>
      <small className="block text-mute">{`${t(CHANNEL[i.channel])}, ${t(OUT[i.outcome][0]).toLowerCase()}`}</small>
    </span>
  );
}

export function DueCell({ task }: { task: Task | undefined }) {
  if (!task) return <span className="text-mute">{t('None')}</span>;
  const d = dueLabel(task);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      {task.due ? (
        <span className={cn('type-num', d.cls === 'late' && 'text-danger')}>{d.txt}</span>
      ) : (
        <Tag unknown>{t('No date')}</Tag>
      )}
      {d.cls === 'late' && <State label={t('Overdue')} icon="clock" tone="warn" />}
    </span>
  );
}

/** A record another module owns (FnL legal requests): its state comes from that module's store when present. */
export const foreign = (db: Workspace, id: string) => {
  const s = db.fnl as Record<string, unknown> | undefined;
  if (!s) return null;
  for (const k of Object.keys(s)) {
    const arr = s[k];
    if (Array.isArray(arr)) {
      const r = (arr as { id?: string }[]).find((x) => x.id === id);
      if (r) return r as { id: string; title?: string; name?: string; state?: unknown };
    }
  }
  return null;
};

export function LegalCell({ ids }: { ids: string[] }) {
  const db = useWorkspace((w) => w);
  if (!ids.length) return <span className="text-mute">{t('None')}</span>;
  return (
    <>
      {ids.map((id) => {
        const r = foreign(db, id);
        return (
          <Link
            key={id}
            to={`/fnl-requests/${id}`}
            className="mr-2.5 inline-flex items-center gap-1.5 font-[550] text-ink"
          >
            <Icon name="file" size="xs" />
            <span>{r ? (r.title ?? r.name ?? id) : id}</span>
            {typeof r?.state === 'string' && <small className="font-normal text-mute">{t(r.state)}</small>}
          </Link>
        );
      })}
    </>
  );
}

// ---------- follow-ups ----------
export interface Followup extends FollowupLink {
  t: Task;
}
export const followupLinks = (db: Workspace, f: (x: FollowupLink, task: Task) => boolean): Followup[] =>
  eeOf(db)
    .fu.map((x) => ({ x, task: taskOf(db, x.task) }))
    .filter((r): r is { x: FollowupLink; task: Task } => !!r.task && !r.task.trashed && f(r.x, r.task))
    .map((r) => ({ ...r.x, t: r.task }));
export const openFollowups = (db: Workspace, f: (x: FollowupLink, task: Task) => boolean) =>
  followupLinks(db, (x, task) => !isDone(task) && f(x, task)).sort((a, b) =>
    (a.t.due ?? '9999').localeCompare(b.t.due ?? '9999'),
  );

export function FollowupRow({ x }: { x: Followup }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = orgOf(db, x.org);
  const op = x.opp ? oppOf(db, x.opp) : undefined;
  const n = attempts(db, x);
  const mayAct = !isDone(x.t) && (x.t.owner === m?.id || canStage(o ?? { pic: null, backup: null }, m));
  return (
    <Row
      className="gap-2.5 max-[600px]:flex-wrap"
      onOpen={() => {
        openTask(x.t.id);
      }}
    >
      <Avatar id={x.t.owner} size="sm" />
      <RowText
        title={<b>{x.t.title}</b>}
        sub={`${o ? o.name : ''}${op ? `, ${op.title}` : ''}${x.outcome ? `. ${t('Wanted: {w}', { w: x.outcome })}` : ''}`}
      />
      {n > 0 && <Tag title={t('Recorded attempts for this follow-up')}>{plural(n, '{n} attempt', '{n} attempts')}</Tag>}
      <Ctx pill>{t(CHANNEL[x.channel])}</Ctx>
      <DueCell task={x.t} />
      {mayAct && (
        <span className="inline-flex flex-none gap-1.5 max-[600px]:w-full max-[600px]:justify-end">
          <Button
            small
            onClick={(e) => {
              e.stopPropagation();
              openPanel('ec-post', x.t.id);
            }}
          >
            {t('Postpone')}
          </Button>
          <Button
            small
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              openPanel('ec-ix', x.org, { org: x.org, opp: x.opp, task: x.t.id });
            }}
          >
            {t('Record outcome')}
          </Button>
        </span>
      )}
    </Row>
  );
}

// ---------- interactions ----------
export function IxList({ ix }: { ix: Interaction[] }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  if (!ix.length)
    return (
      <div className="px-2.5 py-3 text-d13h text-mute">
        {t('No interactions recorded. A stage or a task alone never counts as contact.')}
      </div>
    );
  return (
    <div className="flex flex-col">
      {ix.map((i, n) => {
        const op = i.opp ? oppOf(db, i.opp) : undefined;
        const next = i.followup ? taskOf(db, i.followup) : undefined;
        return (
          <div
            key={i.id}
            className={cn(
              'grid grid-cols-[64px_1fr] gap-3 px-2.5 py-3 max-[600px]:grid-cols-[52px_1fr]',
              n > 0 && 'border-t border-line',
            )}
          >
            <span className="leading-[1.3] text-ink-2 type-num">
              {dShort(i.date)}
              <small className="block font-[inherit] text-d12 text-mute">{i.time ?? t('Time not known')}</small>
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip def={OUT[i.outcome]} pill="pill-o" />
                <Ctx>{t(CHANNEL[i.channel])}</Ctx>
                {op && (
                  <Link className="type-small" to={`/opportunities/${op.id}`}>
                    {op.title}
                  </Link>
                )}
              </div>
              <p className="mt-1.5 mb-1">{i.summary}</p>
              <small className="text-d12 text-mute">
                {t('Recorded by {who}', { who: who.stamp(i.by, i.at) })}
                {i.evidence && (
                  <>
                    {', '}
                    <a href={i.evidence} target="_blank" rel="noopener noreferrer">
                      {t('evidence')}
                    </a>
                  </>
                )}
                {next && (
                  <>
                    {`, ${t('next')}: `}
                    <a
                      className="cursor-pointer underline underline-offset-2"
                      onClick={() => {
                        openTask(next.id);
                      }}
                    >
                      {next.title}
                    </a>
                  </>
                )}
              </small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- the handoff card (blueprint §12) ----------
const HO_ORDER = ['draft', 'requested', 'accepted', 'fulfilled'] as const;
export function HandoffSteps({ h }: { h: Handoff }) {
  const at = h.state === 'returned' ? 1 : h.state === 'cancelled' ? -1 : HO_ORDER.indexOf(h.state);
  return <Steps className="mt-3" labels={HO_ORDER.map((s) => t(HO[s][0]))} current={at} />;
}

const Person = ({ id }: { id: string | null }) => {
  const who = useWho();
  return id ? (
    <span className="mt-1 mb-0.5 inline-flex items-center gap-1.5 font-semibold">
      <Avatar id={id} size="xs" className="size-[22px]" />
      {who.first(id)}
    </span>
  ) : (
    <Tag unknown>{t('No receiver')}</Tag>
  );
};

export function HandoffBody({ h, full = false }: { h: Handoff; full?: boolean }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const p = h.project ? projOf(db, h.project) : undefined;
  const stale = staleHo(db, h);
  const sent =
    h.state === 'draft' ? t('Not sent yet') : h.sentAt ? t('Sent {d}', { d: dShort(h.sentAt.slice(0, 10)) }) : '';
  const answered = h.answeredAt ? dShort(h.answeredAt.slice(0, 10)) : '';
  const recv =
    h.state === 'accepted' || h.state === 'fulfilled'
      ? t('Accepted {d}', { d: answered })
      : h.state === 'returned'
        ? t('Returned {d}', { d: answered })
        : h.state === 'requested'
          ? t('Not answered yet')
          : '';
  return (
    <>
      <div>
        <b>{h.title}</b>
        <span className="ml-1 inline-block">
          <Chip def={HO[h.state]} pill="pill" />
        </span>
      </div>
      <div className="mt-3.5 grid grid-cols-[1fr_28px_1fr] items-center gap-2 max-[600px]:grid-cols-1">
        <div className="rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">
          <small className="block text-d13 text-mute">{t('From EE Client')}</small>
          <Person id={h.from} />
          <small className="block text-d13 text-mute">{`${t('Proposal v{v}', { v: h.briefV })}, ${sent}`}</small>
        </div>
        <Icon name="right" className="justify-self-center text-mute max-[600px]:rotate-90" />
        <div className="rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">
          <small className="block text-d13 text-mute">{t('To Consulting, Project Associates')}</small>
          <Person id={h.to} />
          <small className="block text-d13 text-mute">{recv}</small>
        </div>
      </div>
      {stale != null && (
        <Notice
          icon="warning"
          tone="warn"
          title={<b>{t('Proposal version {v} was saved after this handoff', { v: stale })}</b>}
        >
          <p>
            {t('{who} answered version {o}. The newer version needs its own acknowledgment.', {
              who: who.first(h.to),
              o: h.briefV,
            })}
          </p>
        </Notice>
      )}
      <dl className="my-3 grid grid-cols-[140px_1fr] gap-x-2.5 gap-y-3 text-d13 max-[600px]:grid-cols-[112px_1fr] [&_dd]:m-0 [&_dt]:text-mute">
        <dt>{t('Needed by')}</dt>
        <dd className="type-num">{h.neededBy ? fmtD(h.neededBy) : <Tag unknown>{t('No date')}</Tag>}</dd>
        <dt>{t('Agreed date')}</dt>
        <dd className="type-num">
          {h.agreedDate ? fmtD(h.agreedDate) : <span className="text-mute">{t('Not agreed yet')}</span>}
        </dd>
        {full && (
          <>
            <dt>{t('Requested outcome')}</dt>
            <dd>{h.outcome}</dd>
            <dt>{t('Unresolved')}</dt>
            <dd>{h.unresolved || <span className="text-mute">{t('Nothing listed')}</span>}</dd>
          </>
        )}
        <dt>{t('Engagement')}</dt>
        <dd>
          {p ? (
            m && canSeeProject(db, m, p) ? (
              <Link to={`/engagements/${p.id}`}>{p.name}</Link>
            ) : (
              p.name
            )
          ) : (
            <span className="text-mute">{t('Not linked yet')}</span>
          )}
        </dd>
      </dl>
      {h.state === 'returned' && h.reply && (
        <div className="my-3 rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">
          <b>{t('Returned by {who}', { who: who.first(h.answeredBy) })}</b>
          <br />
          {h.reply}
          {h.action && (
            <>
              <br />
              <small>{t('Asked of the sender: {a}', { a: h.action })}</small>
            </>
          )}
        </div>
      )}
      <HandoffSteps h={h} />
    </>
  );
}

export function HandoffCard({ o, h }: { o: Opp; h: Handoff | undefined }) {
  const m = useMe();
  const sec = (children: ReactNode) => (
    <>
      <SectionHeading as="h2">{t('Handoff to Consulting')}</SectionHeading>
      {children}
    </>
  );
  if (!h)
    return sec(
      <div className="max-w-[760px] rounded-sheet bg-surface p-4 shadow-sheet">
        <Empty title={t('No handoff yet')}>
          {t('After the win is recorded, send the brief to a named receiver in Consulting.')}
        </Empty>
        {canStage(o, m) && (
          <Button
            variant="primary"
            onClick={() => {
              void prepareHandoff(o.id);
            }}
          >
            <Icon name="plus" />
            {t('Prepare handoff')}
          </Button>
        )}
      </div>,
    );
  return sec(
    <div
      className="max-w-[760px] cursor-pointer rounded-sheet bg-surface p-4 shadow-sheet hover:shadow-[var(--e-sheet),inset_0_0_0_1px_var(--line-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      tabIndex={0}
      role="button"
      aria-label={t('Open handoff {t}', { t: h.title })}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a,button')) return;
        openPanel('ec-ho', h.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openPanel('ec-ho', h.id);
      }}
    >
      <HandoffBody h={h} />
    </div>,
  );
}

// ---------- form helpers shared by the panels ----------
/** One field at a time shows its message: `fail('name', text)`; typing anywhere clears it. */
export function useFieldErrors() {
  const [err, setErr] = useState<{ k: string; msg: string } | null>(null);
  return {
    fail: (k: string, msg: string) => {
      setErr({ k, msg });
      return false as const;
    },
    clear: () => {
      setErr(null);
    },
    bad: (k: string) => err?.k === k,
    help: (k: string, fallback?: ReactNode): ReactNode => (err?.k === k ? err.msg : fallback),
  };
}

/** A checkbox with its label (.ec-cb). */
export function CheckRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (on: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2 text-d13h" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="m-0 size-4 accent-ink"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
      <span>{children}</span>
    </label>
  );
}

/** A panel the viewer may not open (pattern 13 for panels). */
export const DeniedPanel = ({ head }: { head: string }) => (
  <>
    <InspectorHead>{head}</InspectorHead>
    <Empty title={t('This is not available to you')}>{t('It may be outside your scope.')}</Empty>
  </>
);

export const isUrl = (s: string) => !s || /^https:\/\/\S+$/.test(s);
