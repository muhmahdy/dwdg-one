/* People picker (owner review O5, D27): the Presidency and divisions first, members on hover; typing filters everyone.
   Members show photo, nickname, then role marks. Keyboard: Up/Down, Right opens a group, Left goes back, Enter or Tab picks,
   Escape closes. Shared by quick add (@), the task panel and the meeting composer. From screens/work.js pmHtml / PICK. */
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { DIVS, ROLES } from '@/app/config/org';
import { Avatar, IdentityLine, roleText } from '@/components/shared/Avatar';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { rank } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { Person, PersonId } from '@/types/workspace';

interface Group {
  id: string;
  label: string;
  icon: string;
  people: Person[];
}

export interface PickerState {
  q: string;
  group: string | null;
  idx: number;
  level: 1 | 2 | 'flat';
  closed: boolean;
}

export const closedPicker: PickerState = { q: '', group: null, idx: 0, level: 1, closed: true };

function useGroups(exclude: PersonId[]): { groups: Group[]; active: Person[] } {
  const me = useMe();
  const people = useWorkspace((db) => db.people);
  const active = people
    .filter((p) => p.status === 'active' && p.id !== me?.id && !exclude.includes(p.id))
    .sort((a, b) => rank(b) - rank(a));
  const groups: Group[] = [
    { id: 'lead', label: t('Presidency'), icon: 'role-president', people: active.filter((p) => !p.div) },
    ...DIVS.map((d) => ({ id: d.id, label: d.name, icon: d.icon, people: active.filter((p) => p.div === d.id) })),
  ].filter((g) => g.people.length);
  return { groups, active };
}

/** The picker's state and keyboard handling for an input; render <PeoplePicker> with the same state. */
export function usePeoplePicker(exclude: PersonId[], onPick: (id: PersonId) => void) {
  const [st, setSt] = useState<PickerState>(closedPicker);
  const { groups, active } = useGroups(exclude);
  const hits = (q: string) => {
    const lq = q.toLowerCase();
    return active.filter((p) => p.first.toLowerCase().startsWith(lq) || p.name.toLowerCase().includes(lq)).slice(0, 7);
  };
  const open = (q: string) => {
    setSt((s) =>
      s.closed || s.q !== q ? { q, group: q ? null : s.group, idx: 0, level: q ? 'flat' : 1, closed: false } : s,
    );
  };
  const close = () => {
    setSt(closedPicker);
  };
  const onKeyDown = (e: KeyboardEvent): boolean => {
    if (st.closed) return false;
    const list =
      st.level === 'flat'
        ? hits(st.q).map((p) => p.id)
        : st.level === 1
          ? groups.map((g) => g.id)
          : (groups.find((g) => g.id === st.group)?.people.map((p) => p.id) ?? []);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = (st.idx + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % Math.max(1, list.length);
      setSt({ ...st, idx, group: st.level === 1 ? (list[idx] ?? null) : st.group });
      return true;
    }
    if (e.key === 'ArrowRight' && st.level === 1) {
      e.preventDefault();
      setSt({ ...st, group: groups[st.idx]?.id ?? null, level: 2, idx: 0 });
      return true;
    }
    if (e.key === 'ArrowLeft' && st.level === 2) {
      e.preventDefault();
      setSt({
        ...st,
        level: 1,
        idx: Math.max(
          0,
          groups.findIndex((g) => g.id === st.group),
        ),
      });
      return true;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (st.level === 1) setSt({ ...st, group: groups[st.idx]?.id ?? null, level: 2, idx: 0 });
      else {
        const id = list[st.idx];
        if (id) {
          close();
          onPick(id);
        }
      }
      return true;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setSt({ ...st, closed: true });
      return true;
    }
    return false;
  };
  const view = {
    st,
    setSt,
    groups,
    hits: hits(st.q),
    pick: (id: PersonId) => {
      close();
      onPick(id);
    },
  };
  return { st, open, close, onKeyDown, view };
}

const item = 'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 text-d13h hover:bg-hover';

export function PeoplePicker({
  view,
  className,
}: {
  view: ReturnType<typeof usePeoplePicker>['view'];
  className?: string;
}) {
  const { st, setSt, groups, hits, pick } = view;
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<'' | 'flip' | 'stack'>('');
  const g = groups.find((x) => x.id === st.group);
  // Keep the picker inside the window: members open to the right, flip to the left, or stack below when there is no room.
  useLayoutEffect(() => {
    const pm = ref.current;
    const r2 = pm?.querySelector<HTMLElement>('[data-pm-r]');
    if (!pm || !r2) return;
    const a = pm.getBoundingClientRect();
    const w = r2.offsetWidth + 6;
    setFit(
      window.innerWidth < 760
        ? 'stack'
        : a.right + w <= window.innerWidth - 8
          ? ''
          : a.left - w >= 8
            ? 'flip'
            : 'stack',
    );
  }, [st.group]);
  if (st.closed) return null;
  const panel =
    'grid max-h-[360px] content-start gap-0.5 overflow-auto overflow-x-hidden rounded-[10px] bg-surface p-[5px] shadow-pop';
  const row = (p: Person, act: boolean, ctx: boolean) => (
    <div
      key={p.id}
      className={cn(item, 'h-[42px]', act && 'bg-hover')}
      role="menuitem"
      aria-label={`${p.name}, ${roleText(p)}`}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={() => {
        pick(p.id);
      }}
    >
      <Avatar id={p.id} size="sm" className="cursor-inherit" />
      <b className="min-w-0 flex-1 truncate font-semibold">{p.first}</b>
      <span className="inline-flex flex-none gap-[5px] [&_svg]:size-4">
        {ctx ? (
          <IdentityLine person={p} />
        ) : (
          <>
            <BrandIcon id={ROLES[p.role].icon} />
            {p.admin && <BrandIcon id="role-admin" />}
          </>
        )}
      </span>
    </div>
  );
  if (st.level === 'flat')
    return (
      <div
        ref={ref}
        className={cn('absolute top-0 left-0 z-[6] w-[260px] max-[760px]:w-[calc(100vw-32px)]', className)}
        role="menu"
      >
        <div className={panel}>
          {hits.length ? (
            hits.map((p, i) => row(p, i === st.idx, true))
          ) : (
            <div className="px-2.5 py-3.5 text-d13h text-mute">{t('No one by that name')}</div>
          )}
        </div>
      </div>
    );
  return (
    <div ref={ref} className={cn('absolute top-0 left-0 z-[6] w-[260px] max-[760px]:w-[calc(100vw-32px)]', className)}>
      <div className={panel} role="menu" aria-label={t('Mention someone')}>
        {groups.map((x, i) => (
          <div
            key={x.id}
            className={cn(
              item,
              'justify-start',
              x.id === st.group && 'bg-sel-neutral font-semibold hover:bg-sel-neutral',
              st.level === 1 && i === st.idx && 'bg-hover',
            )}
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={x.id === st.group}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onMouseEnter={() => {
              if (st.group !== x.id) setSt({ ...st, group: x.id, level: 1, idx: i });
            }}
            onClick={() => {
              setSt({ ...st, group: x.id, level: 2, idx: 0 });
            }}
          >
            <BrandIcon id={x.icon} label={false} className="size-[18px]" />
            <span className="block min-w-0 flex-1 truncate">{x.label}</span>
            <span className="text-mute type-num">{x.people.length}</span>
            <Icon name="chevron" size="xs" className="text-mute" />
          </div>
        ))}
      </div>
      {g && (
        <div
          data-pm-r
          className={cn(
            panel,
            'absolute top-[var(--top)] left-[calc(100%+6px)] w-[230px]',
            fit === 'flip' && 'right-[calc(100%+6px)] left-auto',
            fit === 'stack' && 'static mt-1.5 w-full',
          )}
          role="menu"
          aria-label={g.label}
          style={{ ['--top' as string]: `${Math.max(0, groups.indexOf(g) * 38 - 40)}px` }}
        >
          {g.people.map((p, i) => row(p, st.level === 2 && i === st.idx, false))}
        </div>
      )}
    </div>
  );
}
