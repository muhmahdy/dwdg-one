/* Menus (design-overlays): opened from a control, placed beside it, closed by Escape, a click outside or a choice.
   Arrow keys move between items; focus returns to the opener when the menu closes. Each feature registers its menus by
   type (the prototype's MENUS table). */
import { useLayoutEffect, useRef, type ComponentType, type ReactNode } from 'react';
import type { MenuRef, Rect } from '@/app/ui-state';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { compute, viewport } from '@/lib/placement';
import { useUi } from '@/lib/workspace/hooks';
import { setUi, uiStore } from '@/lib/workspace/transaction';

const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return {
    x: r.x,
    y: r.y,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    left: r.left,
    width: r.width,
    height: r.height,
  };
};

let opener: HTMLElement | null = null;

export function openMenu(
  el: HTMLElement,
  menu: {
    type: string;
    alignRight?: boolean;
    up?: boolean;
    width?: number;
    est?: number;
    id?: string;
    [key: string]: unknown;
  },
) {
  opener = el;
  setUi((ui) => {
    ui.acctSub = '';
    ui.menu = { rect: rectOf(el), ...menu };
  });
}

export function closeMenu() {
  setUi((ui) => {
    ui.menu = null;
  });
}

export const MENUS: Record<string, ComponentType<{ menu: MenuRef }>> = {};

/** A menu item (.mi): a row with an optional icon and a trailing extra (shortcut, tick, chevron). */
export function MenuItem({
  icon,
  children,
  extra,
  on,
  onSelect,
  role = 'menuitem',
  className,
}: {
  icon?: ReactNode | string;
  children: ReactNode;
  extra?: ReactNode;
  on?: boolean;
  onSelect: () => void;
  role?: 'menuitem' | 'menuitemradio';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-9 flex-shrink-0 cursor-pointer items-center justify-between gap-2.5 rounded-[7px] px-2.5 py-2 text-d13h hover:bg-hover roomy:min-h-10 touch:min-h-[var(--touch)]',
        on && 'bg-sel-neutral font-semibold hover:bg-sel-neutral',
        '[&>small]:ml-auto [&>small]:min-w-0 [&>small]:text-[13px] [&>small]:[overflow-wrap:anywhere] [&>small]:text-mute',
        className,
      )}
      role={role}
      tabIndex={0}
      data-focus-inset
      data-mi
      {...(role === 'menuitemradio' ? { 'aria-checked': !!on } : {})}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5 [overflow-wrap:anywhere] [&>.ic]:flex-none">
        {typeof icon === 'string' ? <Icon name={icon} /> : icon}
        {children}
      </span>
      {extra}
    </div>
  );
}

export const MenuRule = () => <hr className="mx-0 my-[5px] h-px border-0 bg-line" />;
export const MenuHeading = ({ children }: { children: ReactNode }) => (
  <div className="px-2.5 pt-1.5 pb-1 text-mute type-caption">{children}</div>
);
export const Tick = () => <Icon name="check" size="sm" className="flex-none text-ink" />;
export const Kbd = ({ children }: { children: ReactNode }) => (
  <span className="ml-auto flex-none rounded-[5px] bg-fill px-1.5 py-px font-mono text-[11px] font-medium whitespace-nowrap text-mute roomy:text-[12.5px]">
    {children}
  </span>
);

export function MenuLayer() {
  const menu = useUi((u) => u.menu);
  const ref = useRef<HTMLDivElement>(null);
  const Body = menu ? MENUS[menu.type] : undefined;

  useLayoutEffect(() => {
    const pop = ref.current;
    if (!pop || !menu) return;
    const anchor = opener?.isConnected ? opener.getBoundingClientRect() : menu.rect;
    pop.style.maxHeight = 'none';
    const width = Math.min(menu.width ?? 248, viewport().width - 16);
    pop.style.width = `${width}px`;
    const pos = compute(anchor, { width: pop.offsetWidth, height: pop.scrollHeight }, viewport(), {
      up: !!menu.up,
      alignRight: !!menu.alignRight,
    });
    Object.assign(pop.style, {
      left: `${pos.left}px`,
      top: `${pos.top}px`,
      width: `${pos.width}px`,
      maxHeight: `${pos.maxHeight}px`,
    });
    pop.dataset.side = pos.side;
    pop.style.transformOrigin = `${menu.alignRight ? 'right' : 'left'} ${pos.side === 'above' ? 'bottom' : 'top'}`;
  });

  // Focus the first item when a menu opens; give focus back to the opener when it closes.
  const type = menu ? `${menu.type}:${uiStore.get().acctSub}` : '';
  useLayoutEffect(() => {
    if (type) {
      ref.current?.querySelector<HTMLElement>('[data-mi], input, button')?.focus({ preventScroll: true });
      return;
    }
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }, [type]);

  if (!menu || !Body) return null;
  return (
    <div id="layer" className="pointer-events-none fixed inset-0 z-50 [&>*]:pointer-events-auto">
      <div className="fixed inset-0" onClick={closeMenu} aria-hidden="true" />
      <div
        ref={ref}
        role="menu"
        className="fixed z-[1] flex w-[220px] flex-col gap-0.5 overflow-auto overscroll-contain rounded-[10px] bg-surface p-1.5 shadow-pop simple:rounded-[14px]"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
            return;
          }
          if (e.key === 'Tab') {
            closeMenu();
            return;
          }
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          e.preventDefault();
          const items = [...(ref.current?.querySelectorAll<HTMLElement>('[data-mi]') ?? [])];
          const i = items.indexOf(document.activeElement as HTMLElement);
          items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
        }}
      >
        <Body menu={menu} />
      </div>
    </div>
  );
}
