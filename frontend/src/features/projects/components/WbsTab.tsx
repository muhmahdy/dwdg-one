/* WBS tab (owner, round 10; request R15: a fourth project tab beside Overview). Views: tree top down, tree left to right, and a table
   modelled on the owner's reference. Everything here is the same task records the Work tab and the Timeline show.
   From screens/plan.js wbsTab. */
import { LineGlyph, TaskIcon } from '@/components/shared/art/task-icons';
import { Button, segButtonClass, segClass } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { Empty } from '@/components/ui/page';
import { TaskStatusMark } from '@/components/ui/StatusBadge';
import { plural, t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { setSession } from '@/lib/session';
import { useMe, useSession, useWorkspace } from '@/lib/workspace/hooks';
import { canEditTask, isSummary } from '@/features/work/services/selectors';
import { rangeTxt } from '@/features/work/services/task-actions';
import type { Project } from '@/types/workspace';
import { addMilestoneTo, placeInWbs, sortSibs, unplaced, wbsTree, wbsAdd, type WbsNode } from '../services/wbs';
import { cn } from '@/lib/cn';
import { WbsTable } from './WbsTable';
import { WbsTree } from './WbsTree';

type View = 'v' | 'h' | 'table';
const WBS_IC: Record<View, string> = {
  v: 'M9 3h6v4H9Z M3 16h6v5H3Z M15 16h6v5h-6Z M12 7v5 M6 12h12 M6 12v4 M18 12v4',
  h: 'M3 9.5h5v5H3Z M16 3.5h5v5h-5Z M16 15.5h5v5h-5Z M8 12h4 M12 6v12 M12 6h4 M12 18h4',
  table: 'M3 5h18v14H3Z M3 10h18 M3 14.5h18 M8 5v14',
};
const VIEWS: [View, string][] = [
  ['v', 'Tree, top down'],
  ['h', 'Tree, left to right'],
  ['table', 'Table'],
];

export function WbsTab({ p, edit }: { p: Project; edit: boolean }) {
  const me = useMe();
  const view = useSession((s) => (s.wbsView as View | undefined) ?? 'v');
  const db = useWorkspace((w) => w);
  const tree = wbsTree(db, p);
  const un = unplaced(db, p);
  const flat: WbsNode[] = [];
  const collect = (ns: WbsNode[]) => {
    for (const n of ns) {
      flat.push(n);
      collect(n.kids);
    }
  };
  collect(tree);
  const leaves = flat.filter((n) => !isSummary(db, n.t)).length;
  return (
    <>
      <div className="mt-4 mb-3 flex flex-wrap items-center gap-2">
        <div className={segClass} role="radiogroup" aria-label={t('View')}>
          {VIEWS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={view === k}
              className={cn(segButtonClass(view === k), 'inline-flex items-center gap-1.5 [&_.ic]:size-4')}
              onClick={() => {
                setSession({ wbsView: k });
              }}
            >
              <LineGlyph d={WBS_IC[k]} />
              {t(l)}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <span className="text-mute type-small">
          {plural(tree.length, '{n} phase', '{n} phases')}, {plural(leaves, '{n} work package', '{n} work packages')}
        </span>
        {edit && (
          <>
            <Button
              onClick={() => {
                void addMilestoneTo(p.id, null);
              }}
            >
              <LineGlyph d="M12 3l9 9-9 9-9-9Z" />
              {t('Add milestone')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                void wbsAdd(p.id, 'phase');
              }}
            >
              <Icon name="plus" />
              {t('Add phase')}
            </Button>
          </>
        )}
      </div>
      {!tree.length ? (
        <Empty title={t('No WBS yet')}>
          {t(
            'Break the project into phases, then into the work that delivers each one. Everything you add here appears on the Timeline.',
          )}
          {edit && (
            <div className="mt-3">
              <Button
                variant="primary"
                onClick={() => {
                  void wbsAdd(p.id, 'phase');
                }}
              >
                <Icon name="plus" />
                {t('Add the first phase')}
              </Button>
            </div>
          )}
        </Empty>
      ) : view === 'table' ? (
        <WbsTable p={p} edit={edit} />
      ) : (
        <WbsTree p={p} edit={edit} view={view} />
      )}
      {un.length > 0 && (
        <>
          <SectionHeading as="h2" count={un.length}>
            {t('Work packages not in the WBS yet')}
          </SectionHeading>
          <p className="text-mute type-small">
            {t(
              'Tasks made in the Work tab start here. Place them under a phase or item when you are ready; it is optional.',
            )}
          </p>
          <div className="flex flex-col gap-[3px]">
            {sortSibs([...un]).map((x) => {
              const owner = db.people.find((q) => q.id === x.owner)?.name ?? '';
              const can = edit || (!!me && canEditTask(db, me, x));
              return (
                <div
                  key={x.id}
                  className="flex min-h-[var(--row-h)] items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover"
                >
                  <span aria-hidden="true">
                    <TaskStatusMark status={x.status} bare />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      className="inline-flex cursor-pointer items-center gap-1.5 no-underline"
                      onClick={() => {
                        openTask(x.id);
                      }}
                    >
                      <TaskIcon icon={x.icon} size="xs" />
                      {x.title}
                    </a>
                    <small className="block text-d12h text-mute">
                      {x.due ? rangeTxt({ s: x.start ?? null, e: x.due }) : t('No date')}, {owner}
                    </small>
                  </div>
                  {can && (
                    <SelectField
                      small
                      className="w-[200px] max-[760px]:w-[150px]"
                      value=""
                      label={t('Place under')}
                      onChange={(v) => {
                        if (v) void placeInWbs(x.id, v);
                      }}
                      options={[
                        { value: '', label: t('Place under…') },
                        ...flat.map((n) => ({ value: n.t.id, label: `${n.code} ${n.t.title}` })),
                      ]}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
