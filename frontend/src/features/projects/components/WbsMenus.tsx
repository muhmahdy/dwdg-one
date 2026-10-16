/* Menus of the WBS: a row or box (reactions, rename, responsible, dates, status, add, move, delete), a milestone, and the responsible
   people picker. From screens/work.js MENUS.wbs, MENUS.wms, MENUS.wresp. */
import { useState } from 'react';
import { divisionOf } from '@/app/config/org';
import type { MenuRef } from '@/app/ui-state';
import { Avatar, IdentityLine } from '@/components/shared/Avatar';
import { MENUS, MenuHeading, MenuItem, MenuRule, Tick, closeMenu } from '@/components/shared/menus';
import { inputClass } from '@/components/ui/forms';
import { TASK_ORDER, TaskStatusMark } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openMilestone, openTask } from '@/lib/open';
import { sessionStore } from '@/lib/session';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { EMO, canIcon, emojiButton, emojiOn, myReaction } from '@/features/work/components/menus';
import { canEditTask, isSummary } from '@/features/work/services/selectors';
import { addAssignee, react, removeAssignee, setStatus } from '@/features/work/services/task-actions';
import { canMsEdit, achieveMilestone, deleteMilestone } from '../services/milestones';
import { addMilestoneTo, moveSib, wbsAdd, wbsDelete, wbsIndent } from '../services/wbs';

/** Starts editing a cell in the table, or opens the task panel when there is no table to edit in. */
const startEdit = (id: string, f: 'title' | 'dur' | 'remarks') => {
  const inTable = sessionStore.get().wbsView === 'table';
  setUi((u) => {
    u.menu = null;
    if (inTable) u.wbsEdit = { id, f };
    else u.insp = { type: 'task', id };
  });
};

function WbsMenu({ menu }: { menu: MenuRef }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const task = db.tasks.find((x) => x.id === menu.id);
  if (!task || !me) return null;
  const sum = isSummary(db, task);
  const top = !task.parent;
  const mine = myReaction(task, me.id);
  const pick = (fn: () => void) => () => {
    closeMenu();
    fn();
  };
  return (
    <>
      <div className="flex gap-0.5 px-1 pb-1" role="group" aria-label={t('React')}>
        {EMO.map((e) => (
          <button
            key={e}
            type="button"
            className={cn(emojiButton, 'size-8 text-d19', mine === e && emojiOn)}
            aria-label={e}
            onClick={() => {
              closeMenu();
              void react('task', task.id, e);
            }}
          >
            {e}
          </button>
        ))}
      </div>
      <MenuHeading>{task.title}</MenuHeading>
      <MenuItem
        icon="edit"
        onSelect={() => {
          startEdit(task.id, 'title');
        }}
      >
        {t('Rename')}
      </MenuItem>
      <MenuItem
        icon="people"
        onSelect={() => {
          setUi((u) => {
            if (u.menu) u.menu = { ...u.menu, type: 'wresp', width: 300, est: 460 };
          });
        }}
      >
        {t('Responsible…')}
      </MenuItem>
      {!sum && (
        <MenuItem
          icon="calendar"
          onSelect={() => {
            setUi((u) => {
              u.menu = null;
              u.insp = { type: 'task', id: task.id };
            });
          }}
        >
          {t('Dates…')}
        </MenuItem>
      )}
      {!sum && (
        <MenuItem
          icon="clock"
          onSelect={() => {
            startEdit(task.id, 'dur');
          }}
        >
          {t('Days')}
        </MenuItem>
      )}
      <MenuItem
        icon="note"
        onSelect={() => {
          startEdit(task.id, 'remarks');
        }}
      >
        {t('Remarks')}
      </MenuItem>
      {canIcon(db, me, 'task', task.id) && (
        <MenuItem
          icon="sparkles"
          onSelect={() => {
            setUi((u) => {
              if (u.menu)
                u.menu = { ...u.menu, type: 'ticon', kind: 'task', id: task.id, more: false, width: 308, est: 430 };
            });
          }}
        >
          {task.icon ? t('Change icon') : t('Add an icon')}
        </MenuItem>
      )}
      {!sum && (
        <div className="flex flex-wrap gap-0.5 px-0.5 py-1">
          {TASK_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              className={cn(
                'cursor-pointer rounded-[7px] border-0 bg-transparent px-1.5 py-1 hover:bg-hover',
                task.status === s && 'bg-sel-neutral',
              )}
              onClick={() => {
                closeMenu();
                void setStatus(task.id, s);
              }}
            >
              <TaskStatusMark status={s} />
            </button>
          ))}
        </div>
      )}
      <MenuRule />
      <MenuItem
        icon="plus"
        onSelect={pick(() => {
          void wbsAdd(task.project ?? '', 'child', task.id);
        })}
      >
        {t('Add a descendant')}
      </MenuItem>
      <MenuItem
        icon="list"
        onSelect={pick(() => {
          void wbsAdd(task.project ?? '', 'below', task.id);
        })}
      >
        {t('Add an item below')}
      </MenuItem>
      <MenuItem
        icon="flag"
        onSelect={pick(() => {
          void addMilestoneTo(task.project ?? '', task.id);
        })}
      >
        {t('Add a milestone here')}
      </MenuItem>
      <MenuRule />
      <MenuItem
        icon="right"
        onSelect={pick(() => {
          void wbsIndent(task.id, 1);
        })}
      >
        {t('Move one level down')}
      </MenuItem>
      {!top && (
        <MenuItem
          icon="left"
          onSelect={pick(() => {
            void wbsIndent(task.id, -1);
          })}
        >
          {t('Move one level up')}
        </MenuItem>
      )}
      <MenuItem
        icon="up"
        onSelect={pick(() => {
          void moveSib(task.id, -1);
        })}
      >
        {t('Move up')}
      </MenuItem>
      <MenuItem
        icon="down"
        onSelect={pick(() => {
          void moveSib(task.id, 1);
        })}
      >
        {t('Move down')}
      </MenuItem>
      <MenuRule />
      <MenuItem
        icon="info"
        onSelect={pick(() => {
          openTask(task.id);
        })}
      >
        {t('Open details')}
      </MenuItem>
      <MenuItem
        icon="trash"
        onSelect={pick(() => {
          void wbsDelete(task.id);
        })}
      >
        {sum ? t('Delete with its parts') : t('Delete')}
      </MenuItem>
    </>
  );
}

function MilestoneMenu({ menu }: { menu: MenuRef }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const m = db.milestones.find((x) => x.id === menu.id);
  if (!m || !me) return null;
  const can = canMsEdit(db, me, m);
  return (
    <>
      <MenuHeading>{m.title}</MenuHeading>
      <MenuItem
        icon="edit"
        onSelect={() => {
          closeMenu();
          openMilestone(m.id);
        }}
      >
        {can ? t('Edit milestone') : t('Open milestone')}
      </MenuItem>
      {can && m.state !== 'achieved' && m.state !== 'cancelled' && (
        <MenuItem
          icon="check"
          onSelect={() => {
            void achieveMilestone(m.id);
          }}
        >
          {t('Record as achieved')}
        </MenuItem>
      )}
      {can && (
        <>
          <MenuRule />
          <MenuItem
            icon="trash"
            onSelect={() => {
              void deleteMilestone(m.id);
            }}
          >
            {t('Delete milestone')}
          </MenuItem>
        </>
      )}
    </>
  );
}

/** Responsible people from a menu: search everyone, tick to add or remove (other divisions are asked first). */
function ResponsibleMenu({ menu }: { menu: MenuRef }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const [q, setQ] = useState('');
  const task = db.tasks.find((x) => x.id === menu.id);
  if (!task || !me) return null;
  const state = (id: string) =>
    id === task.owner ? 'lead' : task.assignees.find((a) => a.id === id && a.state !== 'declined')?.state;
  const ppl = db.people.filter((p) => p.status === 'active' && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
  const on = ppl.filter((p) => state(p.id));
  const off = ppl.filter((p) => !state(p.id)).slice(0, 40);
  const row = (id: string) => {
    const p = db.people.find((x) => x.id === id);
    if (!p) return null;
    const s = state(id);
    return (
      <MenuItem
        key={id}
        role="menuitemradio"
        on={!!s}
        icon={<Avatar id={id} size="sm" />}
        extra={
          <>
            <IdentityLine person={p} />
            {s && <Tick />}
          </>
        }
        onSelect={() => {
          if (id === task.owner) return;
          if (s) {
            if (canEditTask(db, me, task)) void removeAssignee(task.id, id);
          } else void addAssignee(task.id, id);
        }}
      >
        <span>
          {p.name}
          <small className="block text-d12 text-mute">
            {s === 'lead'
              ? t('Lead')
              : s === 'invited'
                ? t('Asked, not answered')
                : s
                  ? t('Responsible')
                  : p.div
                    ? (divisionOf(p.div)?.short ?? '')
                    : t('Presidency')}
          </small>
        </span>
      </MenuItem>
    );
  };
  return (
    <>
      <MenuHeading>{t('Responsible for {t}', { t: task.title })}</MenuHeading>
      <input
        className={cn(inputClass, 'mb-1.5')}
        placeholder={t('Find someone in any division')}
        autoComplete="off"
        autoFocus
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
      />
      <div className="grid max-h-[320px] gap-0.5 overflow-auto">
        {on.map((p) => row(p.id))}
        {on.length > 0 && off.length > 0 && <MenuRule />}
        {off.map((p) => row(p.id))}
      </div>
      <p className="m-0 px-2.5 pt-1.5 text-mute type-small">{t('People from another division are asked first.')}</p>
    </>
  );
}

MENUS.wbs = WbsMenu;
MENUS.wms = MilestoneMenu;
MENUS.wresp = ResponsibleMenu;
