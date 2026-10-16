/* Due semantics (work_task_fields, design-time): a date-only due stays a date; a time shows only when one was set. */
import { t } from '@/lib/i18n';
import { D, daysBetween, dShort, mins, today } from '@/lib/time';
import { WD } from '@/lib/i18n';
import type { Task } from '@/types/workspace';
import { isDone } from './selectors';

export interface DueLabel {
  txt: string;
  cls: '' | 'late' | 'none';
}

export function dueLabel(task: Task): DueLabel {
  if (!task.due) return { txt: t('No date'), cls: 'none' };
  if (isDone(task)) return { txt: dShort(task.doneAt ?? task.due), cls: 'none' };
  const diff = daysBetween(today(), task.due);
  if (diff < 0) return { txt: dShort(task.due), cls: 'late' };
  if (diff === 0) return { txt: task.time != null ? mins(task.time) : t('Today'), cls: '' };
  if (diff === 1) return { txt: t('Tomorrow'), cls: '' };
  if (diff < 7) return { txt: WD()[D(task.due).getDay()] ?? '', cls: '' };
  return { txt: dShort(task.due), cls: '' };
}
