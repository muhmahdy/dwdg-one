/* State words with a mark (components.css .st, .s-*; R016, D20, D61): an icon in the state's colour and the word, no pill
   unless asked. Project stages use the owner's outline marks; task states and notices use solid badges. */
import type { CSSProperties } from 'react';
import { badgeMask, lineMask } from '@/components/ui/icon-data';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import type { ProjectStage, TaskStatus } from '@/types/workspace';

export type Tone = 'ink' | 'ink2' | 'mute' | 'green' | 'warn' | 'danger' | 'hold';
type StageTone =
  'neutral' | 'planned' | 'active' | 'review' | 'completed' | 'hold' | 'cancelled' | 'archived' | 'draft' | 'all';

// --c is the word's colour, --ci the mark's (some states use a stronger mark colour than text).
const TONE: Record<Tone | StageTone, CSSProperties> = {
  ink: { ['--c' as string]: 'var(--ink)' },
  ink2: { ['--c' as string]: 'var(--ink-2)' },
  mute: { ['--c' as string]: 'var(--mute)' },
  green: { ['--c' as string]: 'var(--green-ink)' },
  warn: { ['--c' as string]: 'var(--warning)', ['--ci' as string]: 'var(--warning-mark)' },
  danger: { ['--c' as string]: 'var(--danger)' },
  hold: { ['--c' as string]: 'var(--st-hold)', ['--ci' as string]: 'var(--st-hold-mark)' },
  neutral: { ['--c' as string]: 'var(--st-neutral)' },
  draft: { ['--c' as string]: 'var(--st-neutral)' },
  all: { ['--c' as string]: 'var(--st-neutral)' },
  archived: { ['--c' as string]: 'var(--st-neutral)' },
  planned: { ['--c' as string]: 'var(--st-planned)' },
  active: { ['--c' as string]: 'var(--st-active)' },
  review: { ['--c' as string]: 'var(--st-review)', ['--ci' as string]: 'var(--st-review-mark)' },
  completed: { ['--c' as string]: 'var(--st-completed)' },
  cancelled: { ['--c' as string]: 'var(--st-cancelled)' },
};

export type Pill = '' | 'pill' | 'pill-o';

interface MarkProps {
  label: string;
  tone: Tone | StageTone;
  mask: string;
  small?: boolean;
  pill?: Pill;
  className?: string;
  /** Completed stages shimmer through the finish colours (components.css st-done). */
  shine?: boolean;
}

export function StateMark({ label, tone, mask, small = true, pill = '', className, shine = false }: MarkProps) {
  const shimmer = shine
    ? 'bg-[linear-gradient(100deg,var(--st-completed)_0%,var(--st-finish)_34%,var(--st-shine)_46%,var(--st-finish)_56%,var(--st-completed)_100%)] bg-[length:300%_100%] animate-[st-done_5.4s_ease-in-out_infinite] motion-reduce:animate-none'
    : '';
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold whitespace-nowrap text-[var(--c)] [--ci:var(--c)]',
        small ? 'gap-[7px] text-d12h' : 'gap-2 text-d13h',
        pill && 'h-[26px] gap-1.5 rounded-round pr-2.5 pl-2 text-d13',
        pill === 'pill' && 'bg-fill',
        pill === 'pill-o' && 'bg-surface shadow-[inset_0_0_0_1px_var(--line-strong)]',
        className,
      )}
      style={TONE[tone]}
    >
      <i
        className={cn(
          'flex-none bg-[var(--ci)] mask-icon',
          small ? 'size-4' : 'size-[18px]',
          pill && 'size-[15px]',
          shimmer,
        )}
        style={{ ['--m' as string]: mask }}
      />
      <span className={cn(shine && `${shimmer} bg-clip-text text-transparent [-webkit-text-fill-color:transparent]`)}>
        {label}
      </span>
    </span>
  );
}

/** A state word with a solid badge mark (core/app.js state()). */
export const State = ({
  label,
  icon,
  tone,
  pill = '',
  className,
}: {
  label: string;
  icon: string;
  tone: Tone;
  pill?: Pill;
  className?: string;
}) => <StateMark label={label} tone={tone} mask={badgeMask(icon)} pill={pill} className={className} />;

/** A state word from a [label, icon, tone] definition (the label is translated here). */
export const Chip = ({
  def,
  pill = '',
  className,
}: {
  def: readonly [string, string, Tone];
  pill?: Pill;
  className?: string;
}) => <State label={t(def[0])} icon={def[1]} tone={def[2]} pill={pill} {...(className ? { className } : {})} />;

export const STAGES: Record<ProjectStage | 'all', [string, string]> = {
  all: ['All stages', 'filter'],
  draft: ['Draft', 'edit'],
  planned: ['Planned', 'calendar'],
  active: ['Active', 'circle'],
  review: ['In review', 'search'],
  completed: ['Completed', 'check'],
  hold: ['On hold', 'hand'],
  cancelled: ['Canceled', 'close'],
  archived: ['Archived', 'archive'],
};
export const STAGE_ORDER: ProjectStage[] = [
  'active',
  'review',
  'planned',
  'draft',
  'hold',
  'completed',
  'cancelled',
  'archived',
];

/** A project stage in the owner's outline set (D20, work_project_lifecycle). */
export const Stage = ({
  stage,
  small = true,
  pill = '',
  className,
}: {
  stage: ProjectStage | 'all';
  small?: boolean;
  pill?: Pill;
  className?: string;
}) => (
  <StateMark
    label={t(STAGES[stage][0])}
    tone={stage}
    mask={lineMask(STAGES[stage][1])}
    small={small}
    pill={pill}
    className={className}
    shine={stage === 'completed'}
  />
);

/** Task statuses reuse the colours and marks of the same words on project stages (owner review O7). */
export const TSTAT: Record<TaskStatus, [string, string, StageTone]> = {
  todo: ['Not started', 'circle', 'neutral'],
  doing: ['In progress', 'clock', 'active'],
  review: ['In review', 'search', 'review'],
  done: ['Completed', 'check', 'completed'],
};
export const TASK_ORDER: TaskStatus[] = ['todo', 'doing', 'review', 'done'];

export const TaskStatusMark = ({
  status,
  className,
  bare = false,
}: {
  status: TaskStatus;
  className?: string;
  bare?: boolean;
}) => {
  const [label, icon, tone] = TSTAT[status];
  return (
    <StateMark
      label={bare ? '' : t(label)}
      tone={tone}
      mask={badgeMask(icon)}
      className={className}
      shine={status === 'done'}
    />
  );
};

/** Severity tag for blockers. */
export const SEV = { low: ['Low', 'mute'], medium: ['Medium', 'warn'], high: ['High', 'danger'] } as const;
