/* The division's Activity: a log of changes to tasks, projects, meetings and resources, newest first, grouped by day
   (changes-scope, changes-location, measure-changes). History is never erased; Undo adds a new entry. Private items such as
   your own unavailable time are not listed. From screens/plan.js changesFeed / chgRow. */
import { Link } from 'react-router';
import { Avatar } from '@/components/shared/Avatar';
import { Segmented } from '@/components/ui/forms';
import { Empty } from '@/components/ui/page';
import { SelectField } from '@/components/ui/SelectField';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openMeeting, openResource, openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { addDays, dLong, today } from '@/lib/time';
import { useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { go } from '@/app/router/navigation';
import type { Change, Workspace } from '@/types/workspace';

const TYPES: [string, string][] = [
  ['all', 'All'],
  ['task', 'Tasks'],
  ['project', 'Projects'],
  ['meeting', 'Meetings'],
  ['resource', 'Resources'],
];

export const dayLabel = (d: string) =>
  d === today() ? t('Today') : d === addDays(today(), -1) ? t('Yesterday') : dLong(d);

/** Whether a change belongs to a project: the project itself, or a task, meeting or resource inside it. */
function inProject(db: Workspace, c: Change, projectId: string) {
  const { type, id } = c.target;
  if (type === 'project') return id === projectId;
  const x =
    type === 'task'
      ? db.tasks.find((v) => v.id === id)
      : type === 'meeting'
        ? db.meetings.find((v) => v.id === id)
        : type === 'resource'
          ? db.resources.find((v) => v.id === id)
          : undefined;
  return !!x && x.project === projectId;
}

export function ChangeRow({ c, flat = false }: { c: Change; flat?: boolean }) {
  const who = useWho();
  const target = c.target;
  const exists = useWorkspace((db) => {
    const { type, id } = target;
    return !!(type === 'task'
      ? db.tasks.find((v) => v.id === id)
      : type === 'project'
        ? db.projects.find((v) => v.id === id)
        : type === 'meeting'
          ? db.meetings.find((v) => v.id === id)
          : type === 'resource'
            ? db.resources.find((v) => v.id === id)
            : undefined);
  });
  const open = { task: openTask, meeting: openMeeting, resource: openResource }[target.type];
  const name = target.name ?? '';
  return (
    <div
      className={cn(
        "chg relative grid grid-cols-[24px_1fr_auto] items-center gap-3 px-4 py-3 text-d13h leading-[21px] [.chg+&]:before:absolute [.chg+&]:before:inset-x-4 [.chg+&]:before:-top-0.5 [.chg+&]:before:h-px [.chg+&]:before:bg-line [.chg+&]:before:content-['']",
        !flat && 'min-h-16 rounded-ctl hover:bg-hover',
      )}
    >
      <Avatar id={c.actor} size="sm" />
      <div className="min-w-0 [&_b]:font-semibold">
        <b>{who.name(c.actor)}</b> {t(c.verb)}{' '}
        {!exists ? (
          <span className="text-mute">
            {name} ({t('removed')})
          </span>
        ) : target.type === 'project' ? (
          <Link className="font-[550] text-ink no-underline hover:underline" to={`/projects/${target.id}`}>
            {name}
          </Link>
        ) : (
          <a
            className="cursor-pointer font-[550] text-ink no-underline hover:underline"
            onClick={() => {
              open?.(target.id);
            }}
          >
            {name}
          </a>
        )}
        {(!!c.from || !!c.to) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {c.from && (
              <span className="inline-flex h-6 items-center rounded-chip px-2 text-d12 font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
                {t(c.from)}
              </span>
            )}
            <span className="text-d12 text-mute">→</span>
            {c.to && (
              <span className="inline-flex h-6 items-center rounded-chip bg-fill px-2 text-d12 font-semibold text-ink-2">
                {t(c.to)}
              </span>
            )}
          </div>
        )}
      </div>
      <time className="whitespace-nowrap text-mute type-num">{c.at.slice(11, 16)}</time>
    </div>
  );
}

export function ChangesFeed({ projectId }: { projectId?: string | undefined }) {
  const ws = useWs();
  const type = useUi((u) => (u.chgType as string | undefined) ?? 'all');
  const limit = useUi((u) => (u.chgLimit as number | undefined) ?? 50);
  const db = useWorkspace((w) => w);
  const pid = projectId && db.projects.find((p) => p.id === projectId)?.div === ws ? projectId : '';
  const list = db.changes
    .filter((c) => c.ws === ws && (!pid || inProject(db, c, pid)) && (type === 'all' || c.target.type === type))
    .sort((a, b) => b.at.localeCompare(a.at));
  const shown = list.slice(0, limit);
  const days = [...new Set(shown.map((c) => c.at.slice(0, 10)))];
  return (
    <>
      <div className="mt-4 mb-2.5 flex flex-wrap items-center gap-2">
        <SelectField
          small
          label={t('Project')}
          value={pid}
          options={[
            { value: '', label: t('All projects') },
            ...db.projects.filter((p) => p.div === ws).map((p) => ({ value: p.id, label: p.name })),
          ]}
          onChange={(v) => {
            go(`updates/activity${v ? `/${v}` : ''}`);
          }}
        />
        <Segmented
          value={type}
          label={t('Type')}
          options={TYPES.map(([k, label]) => [k, t(label)])}
          onChange={(k) => {
            setUi((u) => {
              u.chgType = k;
              u.chgLimit = 50;
            });
          }}
        />
      </div>
      {shown.length ? (
        <>
          <div className="grid gap-[3px]">
            {days.map((d) => (
              <div key={d} className="grid gap-[3px]">
                <h2 className="mt-5 mb-1 border-t border-line-strong pt-3.5 pl-4 text-mute type-caption">
                  {dayLabel(d)}
                </h2>
                {shown
                  .filter((c) => c.at.startsWith(d))
                  .map((c) => (
                    <ChangeRow key={c.id} c={c} />
                  ))}
              </div>
            ))}
          </div>
          {list.length > limit && (
            <button
              type="button"
              className="mt-3.5 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-0 py-1 text-d13 text-mute"
              onClick={() => {
                setUi((u) => {
                  u.chgLimit = limit + 50;
                });
              }}
            >
              {t('Show older')}
            </button>
          )}
        </>
      ) : (
        <Empty title={t('No changes recorded')}>
          {t('Edits to tasks, projects, meetings and resources in this workspace appear here.')}
        </Empty>
      )}
      <p className="mt-3.5 text-mute type-small">
        {t('Private items such as your own unavailable time are not listed here.')}
      </p>
    </>
  );
}
