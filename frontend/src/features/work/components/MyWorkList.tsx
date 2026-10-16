/* My Work list (owner: too much room, too far apart): one dense list in date groups (Overdue, Today, Later this week, Later,
   No date, Completed) and a rail for what waits on you. A routine shows only its next run (+n later). From screens/work.js mwList. */
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { look, setSession } from '@/lib/session';
import { addDays, today, weekStart } from '@/lib/time';
import { useSession } from '@/lib/workspace/hooks';
import type { Task } from '@/types/workspace';
import { isDone } from '../services/selectors';
import { MyWorkRow } from './TaskRows';

type GroupKey = 'overdue' | 'today' | 'week' | 'later' | 'nodate' | 'done';
const byDue = (a: Task, b: Task) => (a.due ?? '9').localeCompare(b.due ?? '9') || (a.time ?? 1e4) - (b.time ?? 1e4);

/** Groups the open tasks by date and folds later runs of one routine into its next run. */
export function groupTasks(mine: Task[]) {
  const td = today();
  const open = mine.filter((x) => !isDone(x)).sort(byDue);
  const seen: Record<string, Task> = {};
  const more: Record<string, number> = {};
  const rows: Task[] = [];
  for (const x of open) {
    if (x.routine) {
      const f = seen[x.routine];
      if (f) {
        more[f.id] = (more[f.id] ?? 0) + 1;
        continue;
      }
      seen[x.routine] = x;
    }
    rows.push(x);
  }
  const we = addDays(weekStart(td), 6);
  const done = mine.filter(isDone).sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? ''));
  const groups: [GroupKey, string, Task[]][] = [
    ['overdue', 'Overdue', rows.filter((x) => !!x.due && x.due < td)],
    ['today', 'Today', rows.filter((x) => x.due === td)],
    ['week', 'Later this week', rows.filter((x) => !!x.due && x.due > td && x.due <= we)],
    ['later', 'Later', rows.filter((x) => !!x.due && x.due > we)],
    ['nodate', 'No date', rows.filter((x) => !x.due)],
  ];
  return { rows, more, groups, done };
}

const useCollapsed = () => useSession((s) => (s.mwCol as Record<string, boolean> | undefined) ?? { done: true });
const toggleGroup = (k: GroupKey) =>
  setSession((s) => {
    const c = (s.mwCol as Record<string, boolean> | undefined) ?? { done: true };
    return { ...s, mwCol: { ...c, [k]: !c[k] } };
  });

function Group({
  k,
  label,
  tasks,
  count,
  more,
  comfortable,
}: {
  k: GroupKey;
  label: string;
  tasks: Task[];
  count?: number;
  more: Record<string, number>;
  comfortable: boolean;
}) {
  const col = useCollapsed();
  const closed = !!col[k];
  return (
    <div className={cn(comfortable ? 'm-0 p-0' : 'pt-0.5 pb-2 [&+&]:border-t [&+&]:border-line [&+&]:pt-1.5')}>
      <button
        type="button"
        className={cn(
          'group/gh relative flex w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent text-left focus-visible:outline-offset-[-2px]',
          comfortable
            ? 'h-[30px] px-4 pt-3.5 pb-1 font-sans text-[14px] leading-[normal] font-medium text-mute'
            : 'h-[30px] px-2 text-ink-2',
          'phone:roomy:after:absolute phone:roomy:after:inset-x-0 phone:roomy:after:-inset-y-[7px] phone:roomy:after:content-[""]',
        )}
        aria-expanded={!closed}
        onClick={() => toggleGroup(k)}
      >
        <Icon
          name={closed ? 'chevron' : 'chevron-down'}
          size="xs"
          className={cn(
            'text-mute',
            comfortable &&
              'order-3 size-3.5 opacity-0 transition-opacity duration-[var(--d-hover)] group-hover/gh:opacity-100',
            comfortable && closed && 'opacity-100',
          )}
        />
        <b
          className={cn(
            comfortable ? 'font-medium text-mute' : 'text-d12h font-[650]',
            k === 'overdue' && 'text-danger',
          )}
        >
          {t(label)}
        </b>
        <span
          className={cn(
            comfortable ? 'text-[14px] text-mute' : 'text-d11h text-faint type-num',
            !comfortable && k === 'overdue' && 'text-danger',
          )}
        >
          {count ?? tasks.length}
        </span>
      </button>
      {!closed && tasks.map((x) => <MyWorkRow key={x.id} task={x} more={more[x.id]} />)}
    </div>
  );
}

export function TaskGroups({ mine }: { mine: Task[] }) {
  const lk = useSession((s) => look(s));
  const comfortable = lk === 'comfortable';
  const { groups, done, more } = groupTasks(mine);
  const out: ReactNode[] = [];
  for (const [k, l, ts] of groups) {
    if (ts.length) out.push(<Group key={k} k={k} label={l} tasks={ts} more={more} comfortable={comfortable} />);
    else if (k === 'today')
      out.push(
        <div key="today" className={comfortable ? '' : 'pt-0.5 pb-2'}>
          <div
            className={cn(
              'flex items-center gap-1.5',
              comfortable
                ? 'h-[30px] px-4 pt-3.5 pb-1 text-[14px] leading-[normal] font-medium text-mute'
                : 'h-[30px] pr-2 pl-[26px] text-ink-2',
            )}
          >
            <b className={comfortable ? 'font-medium' : 'text-d12h font-[650]'}>{t('Today')}</b>
            <span className={comfortable ? '' : 'text-d11h text-faint type-num'}>0</span>
          </div>
          <p
            className={
              comfortable ? 'mx-4 mt-0.5 mb-2.5 text-[15px] text-mute' : 'mt-0 mr-2 mb-1.5 ml-[26px] text-d13 text-mute'
            }
          >
            {t('Nothing due today.')}
          </p>
        </div>,
      );
  }
  if (done.length)
    out.push(
      <Group
        key="done"
        k="done"
        label="Completed"
        tasks={done.slice(0, 20)}
        count={done.length}
        more={more}
        comfortable={comfortable}
      />,
    );
  return <>{out}</>;
}
