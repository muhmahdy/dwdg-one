/* The task menus: react (right-click), who reacted, the icon picker, Move to, and the dependency menus. Registered by type
   in the shared menu layer. From screens/work.js MENUS.react / rxwho / ticon / move / dep / deppick / depfix. */
import { openMeeting } from '@/lib/open';
import type { MenuRef } from '@/app/ui-state';
import { Avatar } from '@/components/shared/Avatar';
import { closeMenu, MENUS, MenuHeading, MenuItem, MenuRule, Tick } from '@/components/shared/menus';
import { ICOL, ICONSET, iconColor, TaskIcon, TaskIconGlyph } from '@/components/shared/art/task-icons';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TASK_ORDER, TaskStatusMark } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { canEditRt } from '@/features/operations/services/access';
import { projTasks } from '@/features/projects/services/project-rules';
import type { Meeting, Person, Task, TaskIcon as TaskIconValue, Workspace } from '@/types/workspace';
import { canEditTask, projOf } from '../services/selectors';
import {
  addDep,
  applyFixPlan,
  DEP_T,
  depOk,
  fixPlan,
  rangeTxt,
  react,
  removeDep,
  setItemIcon,
  setStatus,
  waitsFor,
} from '../services/task-actions';
import { openTask } from '@/lib/open';

interface Menu {
  menu: MenuRef;
}

/** The current workspace, for permission checks inside render; menus re-render when it changes. */
const useWorkspaceNow = () => useWorkspace((db) => db);
type Kind = 'task' | 'meeting' | 'routine';

const EMO = ['👍', '❤️', '😂', '😮', '🙏', '🔥'];
const EMO_MORE = [
  '✅',
  '🎉',
  '👏',
  '💯',
  '👀',
  '🤝',
  '💪',
  '🙌',
  '😍',
  '🤔',
  '😅',
  '😢',
  '⏳',
  '📌',
  '🚀',
  '⭐',
  '👌',
  '🫡',
];

const rxItem = (db: Workspace, kind: string, id: string | undefined): Task | Meeting | undefined =>
  kind === 'meeting' ? db.meetings.find((m) => m.id === id) : db.tasks.find((x) => x.id === id);
const myReaction = (x: Task | Meeting, me: string) => Object.entries(x.reactions).find(([, v]) => v.includes(me))?.[0];

const emojiButton =
  'grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[22px] leading-none transition-transform duration-[140ms] hover:scale-[1.22] hover:bg-surface focus-visible:scale-[1.22] focus-visible:bg-surface motion-reduce:transition-none motion-reduce:hover:scale-100';
const emojiOn = 'bg-surface shadow-[0_0_0_1.5px_var(--line-strong)]';

/** Who can change an item's icon: the owner of a task, the organiser of a meeting, whoever edits the operation. */
const canIcon = (db: Workspace, me: Person, kind: Kind, id: string) => {
  if (kind === 'meeting') return db.meetings.find((m) => m.id === id)?.organizer === me.id;
  if (kind === 'routine') {
    const r = db.routines?.find((x) => x.id === id);
    return !!r && canEditRt(me, r);
  }
  const x = db.tasks.find((v) => v.id === id);
  return !!x && canEditTask(db, me, x);
};

function ReactMenu({ menu }: Menu) {
  const me = useMe();
  const kind = menu.kind as string;
  const id = menu.id ?? '';
  const x = useWorkspace((db) => rxItem(db, kind, id));
  const iconOk = useWorkspace((db) => !!me && canIcon(db, me, kind === 'meeting' ? 'meeting' : 'task', id));
  if (!x || !me) return null;
  const mine = myReaction(x, me.id);
  const more = !!menu.more;
  const pick = (e: string) => {
    void react(kind === 'meeting' ? 'meeting' : 'task', x.id, e);
  };
  return (
    <>
      <div
        className="mx-0.5 mt-0.5 mb-1 flex items-center justify-between gap-0.5 rounded-full bg-fill p-1"
        role="group"
        aria-label={t('React')}
      >
        {EMO.map((e) => (
          <button
            key={e}
            type="button"
            className={cn(emojiButton, mine === e && emojiOn)}
            aria-label={e}
            onClick={() => {
              pick(e);
            }}
          >
            {e}
          </button>
        ))}
        <button
          type="button"
          className={cn(emojiButton, 'text-[14px] text-ink-2 hover:scale-100', more && emojiOn)}
          aria-label={t('More reactions')}
          onClick={() => {
            setUi((u) => {
              if (u.menu) {
                u.menu.more = !u.menu.more;
                u.menu.est = u.menu.more ? 330 : 230;
              }
            });
          }}
        >
          <Icon name="plus" size="sm" />
        </button>
      </div>
      {more && (
        <div className="grid grid-cols-6 gap-0.5 px-1 pt-0.5 pb-1.5">
          {EMO_MORE.map((e) => (
            <button
              key={e}
              type="button"
              className={cn(emojiButton, 'h-[38px] w-full text-[20px]', mine === e && emojiOn)}
              aria-label={e}
              onClick={() => {
                pick(e);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <MenuRule />
      <MenuItem
        icon={kind === 'meeting' ? 'calendar' : 'tasks'}
        onSelect={() => {
          closeMenu();
          if (kind === 'meeting') openMeeting(x.id);
          else openTask(x.id);
        }}
      >
        {kind === 'meeting' ? t('Open meeting') : t('Open task')}
      </MenuItem>
      {iconOk && (
        <MenuItem
          icon="sparkles"
          onSelect={() => {
            setUi((u) => {
              if (u.menu) u.menu = { ...u.menu, type: 'ticon', kind, id: x.id, more: false, width: 308, est: 430 };
            });
          }}
        >
          {x.icon ? t('Change icon') : t('Add an icon')}
        </MenuItem>
      )}
      {mine && (
        <MenuItem
          icon="close"
          onSelect={() => {
            pick(mine);
          }}
        >
          {t('Remove my reaction')}
        </MenuItem>
      )}
    </>
  );
}

function ReactorsMenu({ menu }: Menu) {
  const me = useMe();
  const who = useWho();
  const kind = menu.kind as string;
  const x = useWorkspace((db) => rxItem(db, kind, menu.id));
  if (!x || !me) return null;
  const rows = Object.entries(x.reactions).filter(([, v]) => v.length);
  const mine = myReaction(x, me.id);
  return (
    <>
      <MenuHeading>{t('Reactions')}</MenuHeading>
      <div className="grid gap-0.5 px-1.5 pb-1.5">
        {rows.length ? (
          rows.map(([e, v]) => (
            <div key={e} className="flex items-start gap-2.5 border-b border-line px-1 py-1.5">
              <span className="text-[20px] leading-6">{e}</span>
              <span className="flex flex-wrap gap-x-2.5 gap-y-1 pt-0.5 text-[13px]">
                {v.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5">
                    <Avatar id={p} size="xs" />
                    {p === me.id ? t('You') : who.first(p)}
                  </span>
                ))}
              </span>
            </div>
          ))
        ) : (
          <p className="text-mute type-small">{t('No reactions yet.')}</p>
        )}
      </div>
      <div
        className="m-1 flex items-center justify-between gap-0.5 rounded-full bg-fill p-1"
        role="group"
        aria-label={t('React')}
      >
        {EMO.map((e) => (
          <button
            key={e}
            type="button"
            className={cn(emojiButton, 'size-8 text-[19px]', mine === e && emojiOn)}
            aria-label={e}
            onClick={() => {
              void react(kind === 'meeting' ? 'meeting' : 'task', x.id, e);
            }}
          >
            {e}
          </button>
        ))}
      </div>
    </>
  );
}

function TaskIconMenu({ menu }: Menu) {
  const me = useMe();
  const kind = menu.kind as Kind;
  const id = menu.id ?? '';
  const cur = useWorkspace((db) => {
    const x =
      kind === 'meeting'
        ? db.meetings.find((m) => m.id === id)
        : kind === 'routine'
          ? db.routines?.find((r) => r.id === id)
          : db.tasks.find((v) => v.id === id);
    return x?.icon ?? null;
  });
  const ok = useWorkspace((db) => !!me && canIcon(db, me, kind, id));
  if (!ok) return null;
  const color = (menu.c as string | undefined) ?? cur?.c ?? 'ink';
  const q = ((menu.q as string | undefined) ?? '').toLowerCase();
  const set = (v: TaskIconValue | null) => {
    void setItemIcon(kind, id, v);
  };
  const setMenu = (patch: Record<string, unknown>) => {
    setUi((u) => {
      if (u.menu) Object.assign(u.menu, patch);
    });
  };
  const custom = !ICOL[color];
  const names = ICONSET.filter((n) => !q || n.includes(q));
  const swatch = 'relative size-6 cursor-pointer rounded-full border-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/10%)]';
  const swatchOn = 'shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--c)]';
  return (
    <div className="grid gap-2.5 p-1.5">
      <div className="flex flex-wrap gap-2">
        {Object.entries(ICOL).map(([k, v]) => (
          <button
            key={k}
            type="button"
            className={cn(swatch, 'bg-[var(--c)]', color === k && swatchOn)}
            style={{ ['--c' as string]: v }}
            aria-label={k}
            onClick={() => {
              setMenu({ c: k });
              if (cur) set({ ...cur, c: k });
            }}
          />
        ))}
        <label
          className={cn(
            swatch,
            'bg-[conic-gradient(#E5484D,#E2A336,#16A34A,#3E7BFA,#8E4EC6,#E93D82,#E5484D)]',
            custom && swatchOn,
          )}
          style={{ ['--c' as string]: iconColor(color) }}
          title={t('Custom color')}
        >
          <input
            type="color"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={iconColor(color).startsWith('#') ? iconColor(color) : '#161615'}
            aria-label={t('Custom color')}
            onChange={(e) => {
              setMenu({ c: e.target.value });
            }}
            onBlur={(e) => {
              if (cur) set({ ...cur, c: e.target.value });
            }}
          />
        </label>
      </div>
      <input
        className="h-8 w-full rounded-ctl border-0 bg-surface px-3 text-ink shadow-[0_0_0_1px_var(--line-strong)] type-body placeholder:text-mute"
        placeholder={t('Find an icon')}
        value={(menu.q as string | undefined) ?? ''}
        autoComplete="off"
        onChange={(e) => {
          setMenu({ q: e.target.value });
        }}
      />
      <div className="grid max-h-[236px] grid-cols-7 gap-0.5 overflow-y-auto p-0.5" style={{ color: iconColor(color) }}>
        {names.length ? (
          names.map((n) => (
            <button
              key={n}
              type="button"
              className={cn(
                'grid aspect-square cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-inherit hover:bg-hover [&_.ic]:size-5',
                cur?.n === n && 'bg-fill shadow-[inset_0_0_0_1.5px_var(--line-strong)]',
              )}
              title={n}
              aria-label={n}
              onClick={() => {
                set({ n, c: color });
                closeMenu();
              }}
            >
              <TaskIconGlyph name={n} />
            </button>
          ))
        ) : (
          <span className="text-mute type-small">{t('No icon by that name')}</span>
        )}
      </div>
      <div className="flex justify-between gap-1.5 border-t border-line pt-1.5">
        {cur && (
          <Button
            variant="ghost"
            small
            onClick={() => {
              set(null);
              closeMenu();
            }}
          >
            {t('Remove icon')}
          </Button>
        )}
        <Button variant="ghost" small className="ml-auto" onClick={closeMenu}>
          {t('Close')}
        </Button>
      </div>
    </div>
  );
}

function MoveMenu({ menu }: Menu) {
  const task = useWorkspace((db) => db.tasks.find((x) => x.id === menu.id));
  if (!task) return null;
  return (
    <>
      <MenuHeading>{t('Move to')}</MenuHeading>
      {TASK_ORDER.map((s) => (
        <MenuItem
          key={s}
          role="menuitemradio"
          on={task.status === s}
          extra={task.status === s ? <Tick /> : undefined}
          onSelect={() => {
            closeMenu();
            void setStatus(task.id, s);
          }}
        >
          <TaskStatusMark status={s} />
        </MenuItem>
      ))}
    </>
  );
}

const depKey = 'inline-grid h-[22px] w-7 place-items-center rounded-md bg-fill type-num text-[11px]';

function DependencyMenu({ menu }: Menu) {
  const me = useMe();
  const sId = menu.s as string;
  const pId = menu.p as string;
  const s = useWorkspace((db) => db.tasks.find((x) => x.id === sId));
  const p = useWorkspace((db) => db.tasks.find((x) => x.id === pId));
  const db = useWorkspaceNow();
  if (!s || !p || !me) return null;
  const ty = s.deps.find((d) => d.id === p.id)?.type ?? 'FS';
  const ok = depOk(p, s, ty);
  const can = canEditTask(db, me, s);
  return (
    <>
      <MenuHeading>{t('{b} waits for {a}', { a: p.title, b: s.title })}</MenuHeading>
      {(Object.entries(DEP_T) as [keyof typeof DEP_T, [string, string]][]).map(([k, [l, h]]) => (
        <MenuItem
          key={k}
          role="menuitemradio"
          on={k === ty}
          extra={k === ty ? <Tick /> : undefined}
          onSelect={() => {
            closeMenu();
            if (can) void addDep(s.id, p.id, k);
          }}
        >
          <b className={depKey}>{k}</b>
          <span>
            {t(l)}
            <small className="block text-[11.5px] font-normal text-mute">{t(h)}</small>
          </span>
        </MenuItem>
      ))}
      {!ok && (
        <p className="m-2.5 flex items-center gap-1.5 text-danger type-small">
          <Icon name="warning" size="xs" />
          {t('{b} is too early for this link.', { b: s.title })}
        </p>
      )}
      {can && (
        <>
          <MenuRule />
          <MenuItem
            icon="close"
            onSelect={() => {
              closeMenu();
              void removeDep(s.id, p.id);
            }}
          >
            {t('Remove link')}
          </MenuItem>
        </>
      )}
    </>
  );
}

function DependencyPickMenu({ menu }: Menu) {
  const task = useWorkspace((db) => db.tasks.find((x) => x.id === menu.id));
  const db = useWorkspaceNow();
  if (!task) return null;
  const project = projOf(db, task.project);
  const have = new Set(task.deps.map((d) => d.id));
  const candidates = project
    ? projTasks(db, project).filter((x) => x.id !== task.id && !have.has(x.id) && !waitsFor(db, x, task))
    : [];
  return (
    <>
      <MenuHeading>{t('It waits for')}</MenuHeading>
      {candidates.length ? (
        candidates.map((x) => (
          <MenuItem
            key={x.id}
            icon={x.icon ? <TaskIcon icon={x.icon} size="xs" /> : 'tasks'}
            onSelect={() => {
              closeMenu();
              void addDep(task.id, x.id, 'FS');
            }}
          >
            <span>
              {x.title}
              <small className="block text-[11.5px] font-normal text-mute">
                {x.due ? rangeTxt({ s: x.start, e: x.due }) : t('No date')}
              </small>
            </span>
          </MenuItem>
        ))
      ) : (
        <p className="mx-2.5 my-1.5 text-mute type-small">
          {t('No other task in this project can be linked without a loop.')}
        </p>
      )}
      <p className="mx-2.5 my-1.5 text-mute type-small">
        {t('Added as Finish to start. Change the type on the card.')}
      </p>
    </>
  );
}

function FixDatesMenu({ menu }: Menu) {
  const me = useMe();
  const db = useWorkspaceNow();
  const project = projOf(db, menu.id);
  if (!project || !me) return null;
  const tasks = projTasks(db, project).filter((x) => x.due);
  const plan = fixPlan(db, me, tasks);
  return (
    <>
      <MenuHeading>{t('Fix dates')}</MenuHeading>
      <div className="grid max-h-[220px] gap-0.5 overflow-y-auto px-1.5">
        {plan.length ? (
          plan.map((x) => (
            <div key={x.t.id} className="grid gap-px border-b border-line px-1 py-1.5">
              <b className="text-[13px] font-[550]">{x.t.title}</b>
              <span className="text-[12px] text-ink-2 type-num">
                <s className="text-mute">{rangeTxt(x.from)}</s> → {rangeTxt(x.to)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-mute type-small">{t('Every link is satisfied.')}</p>
        )}
      </div>
      <p className="mx-2.5 my-2 text-mute type-small">
        {t('Only these tasks move, each by the smallest amount, keeping its length. Nothing else changes.')}
      </p>
      {plan.length > 0 && (
        <div className="mx-2.5 mt-1 mb-1.5 flex gap-2">
          <Button
            variant="primary"
            small
            onClick={() => {
              void applyFixPlan(tasks);
            }}
          >
            {plural(plan.length, 'Move {n} task', 'Move {n} tasks')}
          </Button>
          <Button variant="ghost" small onClick={closeMenu}>
            {t('Cancel')}
          </Button>
        </div>
      )}
    </>
  );
}

MENUS.react = ReactMenu;
MENUS.rxwho = ReactorsMenu;
MENUS.ticon = TaskIconMenu;
MENUS.move = MoveMenu;
MENUS.dep = DependencyMenu;
MENUS.deppick = DependencyPickMenu;
MENUS.depfix = FixDatesMenu;
