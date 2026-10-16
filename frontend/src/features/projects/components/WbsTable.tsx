/* The WBS as a table (owner round 10; request R15), modelled on the owner's reference: phase, activity, responsible, days, start,
   finish, predecessors, remarks. Cells read as plain text; double-click a cell to edit it; drag a row to move it (left half =
   beside, right half = inside); right-click a row for everything else. From screens/plan.js wbsTab and screens/work.js. */
import { Fragment, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { AvatarBubbles } from '@/components/shared/Avatar';
import { openMenu } from '@/components/shared/menus';
import { LineGlyph, TaskIcon } from '@/components/shared/art/task-icons';
import { IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { pal } from '@/lib/art/identity';
import { daysBetween, dShort } from '@/lib/time';
import { t } from '@/lib/i18n';
import { openMilestone } from '@/lib/open';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { canEditTask, isSummary, taskPeople } from '@/features/work/services/selectors';
import { predsOf } from '@/features/work/services/task-actions';
import type { Milestone, Project, Task, Workspace } from '@/types/workspace';
import { canEditProject } from '../services/project-rules';
import {
  wbsAdd,
  wbsCodes,
  wbsDelete,
  wbsDrop,
  wbsSet,
  wbsTree,
  isUnder,
  rollup,
  type DropMode,
  type WbsField,
  type WbsNode,
} from '../services/wbs';

const GRIP = 'M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01';
const f2 = (d: string | null) => (d ? dShort(d) : '–');
const dash = <span className="text-mute">–</span>;

const td = 'h-10 overflow-hidden border-b border-line px-2.5 align-middle text-ellipsis whitespace-nowrap';

/** A cell that turns into a field on double-click (or from the row menu) and saves on Enter or when it loses focus. */
function EditCell({
  task,
  field,
  value,
  children,
  editable,
  className,
  num = false,
}: {
  task: Task;
  field: WbsField | 'start' | 'due';
  value: string;
  children: ReactNode;
  editable: boolean;
  className?: string;
  num?: boolean;
}) {
  const editing = useUi(
    (u) =>
      (u.wbsEdit as { id: string; f: string } | undefined)?.id === task.id && (u.wbsEdit as { f: string }).f === field,
  );
  const [draft, setDraft] = useState(value);
  const done = useRef(false);
  const stop = () => {
    setUi((u) => {
      u.wbsEdit = null;
    });
  };
  if (!editable) return <span className={className}>{children}</span>;
  if (editing && field !== 'start' && field !== 'due')
    return (
      <input
        className={cn(
          'h-[30px] w-full rounded-md border-0 bg-surface px-1.5 text-ink shadow-[0_0_0_1.5px_var(--ink)] outline-none [font:inherit]',
          num && 'w-14 text-right font-mono',
        )}
        aria-label={field}
        type={num ? 'number' : 'text'}
        min={num ? 1 : undefined}
        autoFocus
        defaultValue={value}
        onFocus={(e) => {
          done.current = false;
          setDraft(value);
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            done.current = true;
            void wbsSet(task.id, field, e.currentTarget.value);
            stop();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            done.current = true;
            stop();
          }
        }}
        onBlur={(e) => {
          if (done.current) return;
          done.current = true;
          if (e.currentTarget.value.trim() !== draft || e.currentTarget.value.trim() !== value)
            void wbsSet(task.id, field, e.currentTarget.value);
          stop();
        }}
      />
    );
  return (
    <span
      className={cn(
        'inline-block max-w-full cursor-text overflow-hidden rounded-[4px] align-middle text-ellipsis hover:shadow-[inset_0_-1px_0_var(--line-strong)]',
        className,
      )}
      title={t('Double-click to edit')}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setUi((u) => {
          if (field === 'start' || field === 'due') u.insp = { type: 'task', id: task.id };
          else u.wbsEdit = { id: task.id, f: field };
        });
      }}
    >
      {children}
    </span>
  );
}

const Guide = ({ depth }: { depth: number }) =>
  depth > 0 ? (
    <i
      className="absolute -top-5 bottom-1/2 w-[9px] rounded-bl-[5px] border-b-[1.5px] border-l-[1.5px] border-line-strong"
      style={{ left: `calc(${depth} * 22px - 13px)` }}
    />
  ) : null;

function RowMenuButton({ type, id, name }: { type: 'wbs' | 'wms'; id: string; name: string }) {
  return (
    <IconButton
      className="opacity-0 group-hover/wr:opacity-100 focus-visible:opacity-100 touch:opacity-100"
      aria-haspopup="menu"
      aria-label={t('Actions for {name}', { name })}
      onClick={(e) => {
        e.stopPropagation();
        openMenu(e.currentTarget, {
          type,
          id,
          alignRight: true,
          width: type === 'wbs' ? 236 : 240,
          est: type === 'wbs' ? 330 : 200,
        });
      }}
    >
      <Icon name="more" />
    </IconButton>
  );
}

function Days({ db, task }: { db: Workspace; task: Task }) {
  if (isSummary(db, task)) {
    const ru = rollup(db, task);
    return <>{ru.s && ru.e ? daysBetween(ru.s, ru.e) + 1 : '–'}</>;
  }
  return <>{task.due ? daysBetween(task.start ?? task.due, task.due) + 1 : '–'}</>;
}

function TaskRowT({
  n,
  depth,
  edit,
  codes,
  kind,
}: {
  n: WbsNode;
  depth: number;
  edit: boolean;
  codes: Record<string, string>;
  kind: 'leaf' | 'sum' | 'phase';
}) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const task = n.t;
  const ed = !!me && (edit || canEditTask(db, me, task));
  const ru = kind === 'leaf' ? null : rollup(db, task);
  const sdate = kind === 'leaf' ? (task.due ? (task.start ?? task.due) : null) : (ru?.s ?? null);
  const edate = kind === 'leaf' ? task.due : (ru?.e ?? null);
  const pred = predsOf(db, task)
    .map((d) => `${d.type} ${codes[d.id] ?? d.t.title}`)
    .join(' + ');
  const people = kind === 'leaf' ? taskPeople(task) : [task.owner];
  const title = kind === 'phase' ? 'text-d14 font-[650]' : kind === 'sum' ? 'font-semibold' : 'font-[450]';
  const bg =
    kind === 'phase'
      ? 'bg-[color-mix(in_srgb,var(--t)_28%,var(--surface))] border-line-strong group-hover/wr:bg-[color-mix(in_srgb,var(--t)_42%,var(--surface))]'
      : kind === 'sum'
        ? 'bg-[color-mix(in_srgb,var(--fill)_45%,var(--surface))]'
        : 'group-hover/wr:bg-hover';
  const cell = cn(td, bg, kind === 'phase' && 'h-12');
  return (
    <tr
      className="group/wr cursor-grab focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring [&.lifting_td]:opacity-45"
      data-wrow={task.id}
      tabIndex={0}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setUi((u) => {
          u.menu = {
            type: 'wbs',
            id: task.id,
            width: 260,
            est: 470,
            rect: {
              x: e.clientX,
              y: e.clientY,
              top: e.clientY,
              right: e.clientX,
              bottom: e.clientY,
              left: e.clientX,
              width: 0,
              height: 0,
            },
          };
        });
      }}
    >
      <td
        className={cn(
          cell,
          'relative pl-4 text-d11h text-mute',
          kind === 'phase' && 'text-d12h font-semibold text-ink-2',
        )}
      >
        {ed && (
          <i
            className="absolute top-1/2 left-0 -mt-[9px] h-[18px] w-3.5 text-mute opacity-0 group-hover/wr:opacity-100"
            aria-hidden="true"
          >
            <LineGlyph d={GRIP} className="h-[18px] w-3.5" />
          </i>
        )}
        <span className="type-num">{n.code}</span>
      </td>
      <td className={cell}>
        <div className="relative flex min-w-0 items-center gap-1" style={{ paddingLeft: `calc(${depth} * 22px)` }}>
          <Guide depth={depth} />
          <TaskIcon icon={task.icon} size="xs" />
          <EditCell task={task} field="title" value={task.title} editable={ed} className={title}>
            {task.title}
          </EditCell>
        </div>
      </td>
      <td className={cell}>
        {ed ? (
          <button
            type="button"
            className="inline-flex min-h-7 cursor-pointer items-center rounded-full border-0 bg-transparent px-1 py-0.5 hover:bg-fill"
            aria-label={t('Responsible for {t}', { t: task.title })}
            onClick={(e) => {
              openMenu(e.currentTarget, { type: 'wresp', id: task.id, width: 300, est: 460 });
            }}
          >
            <AvatarBubbles ids={people} size="xs" />
          </button>
        ) : (
          <AvatarBubbles ids={people} size="xs" />
        )}
      </td>
      <td className={cn(cell, 'text-right type-num')}>
        {kind === 'leaf' ? (
          <EditCell
            task={task}
            field="dur"
            value={String(task.due ? daysBetween(task.start ?? task.due, task.due) + 1 : '')}
            editable={ed}
            num
          >
            <Days db={db} task={task} />
          </EditCell>
        ) : (
          <Days db={db} task={task} />
        )}
      </td>
      <td className={cn(cell, 'text-d12h text-ink-2 type-num')}>
        {kind === 'leaf' ? (
          <EditCell task={task} field="start" value="" editable={ed}>
            {f2(sdate)}
          </EditCell>
        ) : (
          f2(sdate)
        )}
      </td>
      <td className={cn(cell, 'text-d12h text-ink-2 type-num')}>
        {kind === 'leaf' ? (
          <EditCell task={task} field="due" value="" editable={ed}>
            {f2(edate)}
          </EditCell>
        ) : (
          f2(edate)
        )}
      </td>
      <td className={cn(cell, 'text-d12 type-num')} title={kind === 'leaf' ? pred : undefined}>
        {kind === 'leaf' ? (
          pred || dash
        ) : (
          <>
            {kind === 'phase' && (
              <span
                className="mr-2 inline-block h-1 w-16 overflow-hidden rounded-[2px] bg-[color-mix(in_srgb,var(--ink)_12%,transparent)] align-middle"
                aria-hidden="true"
              >
                <i
                  className="block h-full bg-[var(--a)]"
                  style={{ width: `${ru?.total ? (ru.done / ru.total) * 100 : 0}%` }}
                />
              </span>
            )}
            <span className="text-d11h text-ink-2 type-num">
              {ru?.done}/{ru?.total} {kind === 'sum' ? t('done') : ''}
            </span>
          </>
        )}
      </td>
      <td className={cell}>
        {kind === 'phase' ? (
          edit && (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-d12h font-semibold text-green-ink"
              onClick={() => {
                void wbsAdd(task.project ?? '', 'child', task.id);
              }}
            >
              <Icon name="plus" size="xs" /> {t('Add an item')}
            </button>
          )
        ) : (
          <EditCell task={task} field="remarks" value={task.remarks} editable={ed}>
            {task.remarks || dash}
          </EditCell>
        )}
      </td>
      <td className={cn(cell, 'text-right')}>{ed && <RowMenuButton type="wbs" id={task.id} name={task.title} />}</td>
    </tr>
  );
}

function MsRowT({
  m,
  depth,
  db,
  codes,
}: {
  m: Milestone;
  depth: number;
  db: Workspace;
  codes: Record<string, string>;
}) {
  const linked = db.tasks.filter((x) => x.milestone === m.id && !x.trashed && codes[x.id]);
  return (
    <tr
      className="group/wr focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
      data-wms={m.id}
      tabIndex={0}
      onDoubleClick={() => {
        openMilestone(m.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setUi((u) => {
          u.menu = {
            type: 'wms',
            id: m.id,
            width: 240,
            est: 200,
            rect: {
              x: e.clientX,
              y: e.clientY,
              top: e.clientY,
              right: e.clientX,
              bottom: e.clientY,
              left: e.clientX,
              width: 0,
              height: 0,
            },
          };
        });
      }}
    >
      <td className={cn(td, 'bg-surface pl-4 text-left')}>
        <i className="ml-1 inline-block size-[9px] rotate-45 rounded-[2px] bg-ink-2" />
      </td>
      <td className={cn(td, 'bg-surface')}>
        <div className="relative flex min-w-0 items-center gap-1" style={{ paddingLeft: `calc(${depth} * 22px)` }}>
          <Guide depth={depth} />
          <span
            className="cursor-pointer font-semibold"
            onClick={() => {
              openMilestone(m.id);
            }}
          >
            {m.title}
          </span>
          <span className="ml-2 rounded-full bg-fill px-[7px] py-px text-d11 font-[550] text-ink-2">
            {t('Milestone')}
          </span>
        </div>
      </td>
      <td className={cn(td, 'bg-surface')}>
        <AvatarBubbles ids={[m.owner]} size="xs" />
      </td>
      <td className={cn(td, 'bg-surface text-right type-num')}>0</td>
      <td className={cn(td, 'bg-surface text-d12h text-ink-2 type-num')}>–</td>
      <td className={cn(td, 'bg-surface text-d12h text-ink-2 type-num')}>{f2(m.target)}</td>
      <td className={cn(td, 'bg-surface text-d12 type-num')}>
        {linked.map((x) => `FS ${codes[x.id] ?? ''}`).join(', ') || dash}
      </td>
      <td className={cn(td, 'bg-surface')} />
      <td className={cn(td, 'bg-surface text-right')}>
        <RowMenuButton type="wms" id={m.id} name={m.title} />
      </td>
    </tr>
  );
}

interface DropMark {
  mode: DropMode;
  id: string;
  top: number;
  height: number;
  left: number;
  label: string;
}

export function WbsTable({ p, edit }: { p: Project; edit: boolean }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const wrap = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState<DropMark | null>(null);
  const tree = wbsTree(db, p);
  const codes = wbsCodes(db, p);
  const c = pal(p.look?.p ?? 0);
  const unMs = db.milestones.filter(
    (m) => m.project === p.id && !(m.parent && db.tasks.find((x) => x.id === m.parent && !x.trashed)),
  );

  const walk = (n: WbsNode, depth: number): ReactNode => (
    <Fragment key={n.t.id}>
      <TaskRowT n={n} depth={depth} edit={edit} codes={codes} kind={isSummary(db, n.t) ? 'sum' : 'leaf'} />
      {n.kids.map((k) => walk(k, depth + 1))}
      {n.ms.map((m) => (
        <MsRowT key={m.id} m={m} depth={depth + 1} db={db} codes={codes} />
      ))}
    </Fragment>
  );

  const down = (e: PointerEvent<HTMLTableElement>) => {
    const row = (e.target as Element).closest<HTMLElement>('tr[data-wrow]');
    if (!row || e.button !== 0 || (e.target as Element).closest('button, a, input')) return;
    const id = row.dataset.wrow ?? '';
    const t0 = db.tasks.find((x) => x.id === id);
    if (!t0 || !me || !(canEditProject(db, me, p) || canEditTask(db, me, t0))) return;
    const box = wrap.current;
    if (!box) return;
    const y0 = e.clientY;
    let on = false;
    let drop: { mode: DropMode; id: string } | null = null;
    const move = (ev: globalThis.PointerEvent) => {
      if (!on && Math.abs(ev.clientY - y0) < 6) return;
      if (!on) {
        on = true;
        document.body.classList.add('select-none');
        row.classList.add('lifting');
      }
      const wb = box.getBoundingClientRect();
      const hit = [...box.querySelectorAll<HTMLElement>('tr[data-wrow]')].find((r) => {
        const b = r.getBoundingClientRect();
        return ev.clientY >= b.top && ev.clientY < b.bottom;
      });
      drop = null;
      setMark(null);
      const hid = hit?.dataset.wrow ?? '';
      const target = db.tasks.find((x) => x.id === hid);
      if (!hit || !target || hid === id || isUnder(db, target, id)) return;
      const b = hit.getBoundingClientRect();
      const top = b.top - wb.top + box.scrollTop;
      if (ev.clientX > b.left + b.width / 2) {
        drop = { mode: 'in', id: target.id };
        setMark({ ...drop, top, height: b.height, left: 0, label: t('Make it a part of {t}', { t: target.title }) });
      } else {
        const after = ev.clientY > b.top + b.height / 2;
        const nm = hit.querySelector<HTMLElement>('td:nth-child(2) > div');
        drop = { mode: after ? 'after' : 'before', id: target.id };
        setMark({
          ...drop,
          top: top + (after ? b.height : 0) - 1,
          height: 0,
          left:
            (nm ? nm.getBoundingClientRect().left + parseFloat(getComputedStyle(nm).paddingLeft) : b.left) -
            wb.left -
            4,
          label: '',
        });
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.body.classList.remove('select-none');
      row.classList.remove('lifting');
      setMark(null);
      if (on && drop) void wbsDrop(id, drop);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  const key = (e: KeyboardEvent<HTMLTableElement>) => {
    const row = (e.target as Element).closest<HTMLElement>('tr[data-wrow]');
    if (!row || e.target !== row) return;
    const id = row.dataset.wrow ?? '';
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      setUi((u) => {
        u.wbsEdit = { id, f: 'title' };
      });
    } else if (e.key === 'Delete') {
      e.preventDefault();
      void wbsDelete(id);
    } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
      e.preventDefault();
      const r = row.getBoundingClientRect();
      setUi((u) => {
        u.menu = {
          type: 'wbs',
          id,
          width: 270,
          est: 560,
          rect: {
            x: r.left + 120,
            y: r.bottom,
            top: r.bottom,
            right: r.left + 120,
            bottom: r.bottom,
            left: r.left + 120,
            width: 0,
            height: 0,
          },
        };
      });
    }
  };

  const heads: [string, boolean][] = [
    [t('WBS'), false],
    [t('Phase and activity'), false],
    [t('Responsible'), false],
    [t('Days'), true],
    [t('Start'), false],
    [t('Finish'), false],
    [t('Predecessors'), false],
    [t('Remarks'), false],
    ['', false],
  ];
  const widths = ['w-[72px]', '', 'w-24', 'w-16', 'w-[76px]', 'w-[76px]', 'w-[150px]', 'w-[22%]', 'w-10'];
  return (
    <>
      <div
        ref={wrap}
        className="relative overflow-x-auto rounded-sheet shadow-[0_0_0_1px_var(--line-strong)]"
        style={{ ['--t' as string]: c[3], ['--a' as string]: c[1] }}
      >
        <table
          className="w-full min-w-[1080px] table-fixed border-separate border-spacing-0 bg-surface text-d13"
          onPointerDown={down}
          onKeyDown={key}
        >
          <colgroup>
            {widths.map((w, i) => (
              <col key={i} className={w} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {heads.map(([h, r], i) => (
                <th
                  key={i}
                  className={cn(
                    'sticky top-0 border-b border-line-strong bg-surface-2 px-2.5 py-2.5 text-left whitespace-nowrap text-mute type-caption',
                    r && 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {tree.map((n) => (
            <tbody
              key={n.t.id}
              className="[&+tbody>tr:first-child>td]:border-t-[10px] [&+tbody>tr:first-child>td]:border-t-surface-2"
            >
              <TaskRowT n={n} depth={0} edit={edit} codes={codes} kind="phase" />
              {n.kids.length || n.ms.length ? (
                <>
                  {n.kids.map((k) => walk(k, 1))}
                  {n.ms.map((m) => (
                    <MsRowT key={m.id} m={m} depth={1} db={db} codes={codes} />
                  ))}
                </>
              ) : (
                <tr>
                  <td className={cn(td, 'h-9')} />
                  <td colSpan={8} className={cn(td, 'h-9 text-mute type-small')}>
                    {t('No items yet. Right-click the phase to add one.')}
                  </td>
                </tr>
              )}
            </tbody>
          ))}
          {unMs.length > 0 && (
            <tbody>
              <tr>
                <td className={cn(td, 'bg-surface-2')} />
                <td colSpan={8} className={cn(td, 'bg-surface-2')}>
                  <b>{t('Milestones not placed in the WBS')}</b>
                </td>
              </tr>
              {unMs.map((m) => (
                <MsRowT key={m.id} m={m} depth={1} db={db} codes={codes} />
              ))}
            </tbody>
          )}
        </table>
        {mark &&
          (mark.mode === 'in' ? (
            <i
              className="pointer-events-none absolute inset-x-0 z-[5] rounded-md bg-[color-mix(in_srgb,var(--green)_12%,transparent)] shadow-[inset_0_0_0_1.5px_var(--green)]"
              style={{ top: mark.top, height: mark.height }}
            >
              <b className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md bg-green px-2 py-0.5 text-d12 font-semibold text-white not-italic">
                {mark.label}
              </b>
            </i>
          ) : (
            <i
              className="pointer-events-none absolute right-0 z-[5] h-0.5 rounded-[1px] bg-green"
              style={{ top: mark.top, left: mark.left }}
            />
          ))}
      </div>
      <p className="mt-3.5 text-mute type-small">
        {t(
          'Double-click a cell to edit it. Drag a row by its handle or anywhere: drop on the left half to put it beside a row, on the right half to put it inside. Right-click a row for responsible people, dates, status, adding a descendant or a milestone, and delete.',
        )}
      </p>
    </>
  );
}
