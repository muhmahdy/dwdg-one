/* A phase or summary task has no status of its own: its dates and progress come from its parts (work_wbs). */
import { Link } from 'react-router';
import { closeInspector } from '@/components/shared/Inspector';
import { Notice } from '@/components/ui/Notice';
import { plural, t } from '@/lib/i18n';
import { rollup } from '@/features/projects/services/wbs';
import type { Task, Workspace } from '@/types/workspace';
import { rangeTxt } from '../../services/task-actions';

export function wbsSummaryNote(db: Workspace, task: Task) {
  const ru = rollup(db, task);
  return (
    <Notice
      tone="info"
      icon="list"
      title={
        <b>
          {task.phase ? t('Phase') : t('Summary')}: {plural(ru.total, '{n} work package', '{n} work packages')},{' '}
          {ru.done} {t('done')}
        </b>
      }
    >
      <p>
        {ru.s
          ? t('Its dates come from its parts: {d}.', { d: rangeTxt({ s: ru.s, e: ru.e }) })
          : t('Its dates will come from its parts.')}{' '}
        <Link className="underline" to={`/projects/${task.project ?? ''}/wbs`} onClick={closeInspector}>
          {t('Edit the parts in the WBS')}
        </Link>
      </p>
    </Notice>
  );
}
