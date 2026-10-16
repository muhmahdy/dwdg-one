/* The facts shown on a project row, card and timeline: progress, next milestone, lead, what needs attention, where it comes from,
   and the milestone and decision states. From screens/plan.js progress, attnCell, msCell, leadCell, originTag, msState, decState. */
import { divisionOf } from '@/app/config/org';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { State, type Tone } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { dShort } from '@/lib/time';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { DivisionId, Decision, Milestone, Project } from '@/types/workspace';
import { FaceStack } from '@/features/collaboration/components/Faces';
import { cpFaces } from '@/features/collaboration/services/collaboration';
import { jointIn } from '../services/access';
import { msLateOf, nextMs } from '../services/project-rules';
import { attention, pStats } from '../services/register';

/** A slim progress track (.bar): the ink fills from the left. */
export const Bar = ({ pct, className }: { pct: number; className?: string }) => (
  <span
    className={cn(
      'block h-1 flex-1 overflow-hidden rounded-[2px] bg-fill comfortable:h-[5px] comfortable:rounded-[3px] comfortable:bg-pill',
      className,
    )}
  >
    <i className="block h-full bg-ink comfortable:rounded-[3px]" style={{ width: `${pct}%` }} />
  </span>
);

/** "3/8" with its track, or a quiet "No tasks yet". */
export function Progress({ p, wide = false }: { p: Project; wide?: boolean }) {
  const s = useWorkspace((db) => pStats(db, p));
  if (!s.total) return <span className="text-d12h text-mute">{t('No tasks yet')}</span>;
  return (
    <span className={cn('flex items-center gap-2', wide && 'w-full')}>
      <span
        className={cn('flex max-w-[72px] flex-1', wide && 'max-w-none')}
        role="img"
        aria-label={t('{d} of {n} tasks completed', { d: s.done, n: s.total })}
      >
        <Bar pct={(s.done / s.total) * 100} />
      </span>
      <span className="text-ink-2 type-num">
        {s.done}/{s.total}
      </span>
    </span>
  );
}

/** Needs attention: blockers, late milestones, overdue tasks. Nothing is invented. */
export function AttnCell({ p, className }: { p: Project; className?: string }) {
  const a = useWorkspace((db) => attention(db, p));
  const parts = [
    a.blockers.length > 0 && (
      <span key="b" title={a.blockers.map((x) => x.text).join('\n')}>
        <State label={plural(a.blockers.length, '{n} blocker', '{n} blockers')} icon="warning" tone="danger" />
      </span>
    ),
    a.lateMs > 0 && (
      <State key="m" label={plural(a.lateMs, '{n} milestone late', '{n} milestones late')} icon="flag" tone="danger" />
    ),
    a.lateTasks > 0 && (
      <State key="t" label={plural(a.lateTasks, '{n} task overdue', '{n} tasks overdue')} icon="clock" tone="warn" />
    ),
  ].filter(Boolean);
  return parts.length ? (
    <span className={cn('flex flex-wrap gap-x-2.5 gap-y-1', className)}>{parts}</span>
  ) : (
    <span className="text-mute" title={t('Nothing needs attention')}>
      –
    </span>
  );
}

/** The next milestone with its date; overdue ones say so. */
export function MsCell({ p }: { p: Project }) {
  const x = useWorkspace((db) => nextMs(db, p));
  if (!x) return <span className="text-d12h text-mute">{t('No milestone')}</span>;
  const late = msLateOf(x);
  return (
    <span className="flex min-w-0 items-start gap-1.5">
      <Icon name="flag" size="xs" className="mt-[3px] text-mute" />
      <span className="min-w-0">
        <b className="block truncate text-d13 font-medium">{x.title}</b>
        <small className={cn('block text-mute type-num', late && 'text-danger')}>
          {dShort(x.target)}
          {late ? `, ${t('overdue')}` : ''}
        </small>
      </span>
    </span>
  );
}

export function LeadCell({ p }: { p: Project }) {
  const faces = useWorkspace((db) => cpFaces(db, 'project', p));
  const lead = useWorkspace((db) => db.people.find((q) => q.id === p.lead)?.first);
  const pm = useWorkspace((db) => db.people.find((q) => q.id === p.pm)?.first);
  if (!p.lead) return <span className="text-d12h text-mute">{t('No lead')}</span>;
  return (
    <span className="inline-flex h-auto min-w-0 items-center gap-1.5 align-top">
      <FaceStack ids={faces} n={3} />
      <span className="min-w-0 font-medium">
        {lead}
        {pm && <small className="block text-d12 font-normal text-mute">{t('PM {who}', { who: pm })}</small>}
      </span>
    </span>
  );
}

/** Where a project comes from when it is not simply this workspace's own. */
export function OriginTag({ p, w }: { p: Project; w: DivisionId }) {
  const joint = useWorkspace((db) => jointIn(db, p, w));
  const d = divisionOf(p.div);
  const chip =
    'inline-flex items-center gap-1 rounded-full bg-fill py-px pr-[7px] pl-[5px] align-[1px] text-d11h font-[550] whitespace-nowrap text-ink-2';
  if (p.org)
    return (
      <span className={chip} title={t('Organization-wide, run by {d}', { d: d?.name ?? '' })}>
        <Icon name="globe" size="xs" className="size-[13px]" />
        {p.div === w ? t('Organization-wide') : t('Organization-wide, run by {d}', { d: d?.short ?? '' })}
      </span>
    );
  return (
    <span className={chip} title={d?.name ?? ''}>
      <BrandIcon id={d?.icon ?? ''} label={false} className="size-[13px]" />
      {joint ? t('Joint, run by {d}', { d: d?.short ?? '' }) : d?.short}
    </span>
  );
}

export const MS_ST: Record<string, [string, string, Tone]> = {
  proposed: ['Proposed', 'circle', 'mute'],
  active: ['Active', 'circle', 'ink2'],
  review: ['In review', 'search', 'warn'],
  achieved: ['Achieved', 'check', 'green'],
  cancelled: ['Canceled', 'close', 'mute'],
};

export function MsState({ m }: { m: Milestone }) {
  if (msLateOf(m)) return <State label={t('Overdue')} icon="warning" tone="danger" />;
  const [label, icon, tone] = MS_ST[m.state] ?? MS_ST.active ?? ['Active', 'circle', 'ink2'];
  return <State label={t(label)} icon={icon} tone={tone} />;
}

export const DEC_ST: Record<string, [string, string, Tone]> = {
  awaiting: ['Awaiting decision', 'clock', 'warn'],
  approved: ['Approved', 'check', 'green'],
  rejected: ['Rejected', 'close', 'danger'],
};

export function DecState({ d }: { d: Decision }) {
  const [label, icon, tone] = DEC_ST[d.state] ?? DEC_ST.awaiting ?? ['Awaiting decision', 'clock', 'warn'];
  return <State label={t(label)} icon={icon} tone={tone} />;
}
