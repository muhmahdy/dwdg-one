/* Where a task belongs (D15: no invented categories): its routine, or its division and project. From screens/work.js ctxChip. */
import { divisionOf } from '@/app/config/org';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { Task } from '@/types/workspace';
import { rtOf } from '@/features/operations/services/routines';
import { projOf, taskDiv } from '../services/selectors';

export function ContextChip({ task }: { task: Task }) {
  const info = useWorkspace((db) => {
    const r = rtOf(db, task.routine);
    if (r) return { rt: true, label: r.name, icon: '' };
    const d = divisionOf(taskDiv(db, task));
    if (!d) return null;
    return { rt: false, label: projOf(db, task.project)?.name ?? d.short, icon: d.icon };
  });
  if (!info) return null;
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-chip bg-fill pr-2 pl-1.5 text-d12 font-medium whitespace-nowrap text-ink-2 [&_.ic]:size-[13px] [&_svg]:size-[13px] max-[760px]:[.row_&]:hidden">
      {info.rt ? <Icon name="routine" /> : <BrandIcon id={info.icon} label={false} />}
      {info.label}
    </span>
  );
}
