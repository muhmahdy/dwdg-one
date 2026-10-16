/* The task panel shows where a Consulting revision task comes from: the deliverable and the review that asked for it. Closing
   the task never approves anything (consulting_revision). */
import { Link } from 'react-router';
import { SectionHeading } from '@/components/ui/Headings';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { registerTaskPanelSection } from '@/features/work/components/task-panel/extras';
import { projOf } from '@/features/work/services/selectors';
import type { Task } from '@/types/workspace';
import { consOf } from '../services/cons-data';
import { canSeeEng } from '../services/cons-rules';

function RevisionSection({ task }: { task: Task }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const d = consOf(db).dlv.find((z) => z.versions.some((v) => v.review?.task === task.id));
  const p = d && projOf(db, d.project);
  if (!d || !p || !m || !canSeeEng(db, p, m)) return null;
  const v = d.versions.find((z) => z.review?.task === task.id);
  if (!v?.review) return null;
  const [pre = '', post = ''] = t('Requested on {t}, version {v}', { t: '@@', v: v.v }).split('@@');
  return (
    <>
      <SectionHeading>{t('Revision')}</SectionHeading>
      <p className="my-2 type-small">
        {pre}
        <Link to={`/engagements/${d.project}/${d.id}`}>{d.title}</Link>
        {post}
      </p>
      {v.review.note && <p className="my-3 rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">{v.review.note}</p>}
      <p className="my-2 text-mute type-small">
        {t('Closing this task does not approve anything. Submit a new version for review.')}
      </p>
    </>
  );
}

registerTaskPanelSection(RevisionSection);
