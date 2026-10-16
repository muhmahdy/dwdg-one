/* The task panel shows where an EE follow-up comes from, so the PIC sees one record in every view (external_followup). */
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Headings';
import { t } from '@/lib/i18n';
import { openPanel } from '@/lib/open';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { registerTaskPanelSection } from '@/features/work/components/task-panel/extras';
import { isDone } from '@/features/work/services/selectors';
import type { Task } from '@/types/workspace';
import { CHANNEL, EE, attempts, eeMember, fuOf, oppOf, orgOf, seeDiv } from '../services/ee-data';

function EeTaskSection({ task }: { task: Task }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const f = fuOf(db, task.id);
  if (!f || !m || !seeDiv(m, EE)) return null;
  const o = orgOf(db, f.org);
  const op = f.opp ? oppOf(db, f.opp) : undefined;
  return (
    <>
      <SectionHeading plain={false}>{t('External Engagement')}</SectionHeading>
      <Meta className="grid-cols-[96px_1fr]">
        <MetaRow label={t('Relationship')}>{o ? <Link to={`/relationships/${o.id}`}>{o.name}</Link> : '-'}</MetaRow>
        {op && (
          <MetaRow label={t('Opportunity')}>
            <Link to={`/opportunities/${op.id}`}>{op.title}</Link>
          </MetaRow>
        )}
        {f.outcome && <MetaRow label={t('Requested outcome')}>{f.outcome}</MetaRow>}
        <MetaRow label={t('Channel')}>{t(CHANNEL[f.channel])}</MetaRow>
        <MetaRow label={t('Attempts')}>{String(attempts(db, f))}</MetaRow>
      </Meta>
      {!isDone(task) && eeMember(m) && (
        <div className="mt-2 flex gap-2">
          <Button
            small
            variant="primary"
            onClick={() => {
              openPanel('ec-ix', f.org, { org: f.org, opp: f.opp, task: task.id });
            }}
          >
            {t('Record outcome')}
          </Button>
          <Button
            small
            onClick={() => {
              openPanel('ec-post', task.id);
            }}
          >
            {t('Postpone')}
          </Button>
        </div>
      )}
    </>
  );
}

registerTaskPanelSection(EeTaskSection);
