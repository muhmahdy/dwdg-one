/* A popover placed beside a control (design-overlays, measure-popovers): below the control when it fits, otherwise above,
   kept 8px inside the window. It closes on a click outside, on scroll elsewhere, and on resize. Used by the date and the
   choice fields. */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { compute, viewport } from '@/lib/placement';

export function Popover({
  anchor,
  width,
  onClose,
  children,
  className,
  role = 'dialog',
  label,
}: {
  anchor: HTMLElement | null;
  width: number;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  role?: 'dialog' | 'listbox';
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Place after every render: the content (a month with 5 or 6 rows, a filtered list) changes the height.
  useLayoutEffect(() => {
    const pop = ref.current;
    if (!pop || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    pop.style.maxHeight = 'none';
    pop.style.width = `${width}px`;
    const pos = compute(rect, { width: pop.offsetWidth, height: pop.scrollHeight }, viewport(), { gap: 4 });
    Object.assign(pop.style, {
      left: `${pos.left}px`,
      top: `${pos.top}px`,
      width: `${pos.width}px`,
      maxHeight: `${Math.min(340, pos.maxHeight)}px`,
    });
  });

  useEffect(() => {
    const outside = (e: Event) => {
      const node = e.target as Node | null;
      if (node && (ref.current?.contains(node) || anchor?.contains(node))) return;
      onClose();
    };
    const scroll = (e: Event) => {
      if (e.target instanceof Node && ref.current?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', outside, true);
    document.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', outside, true);
      document.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={ref}
      role={role}
      aria-label={label}
      className={cn(
        'fixed z-[60] grid gap-1 overflow-auto overscroll-contain rounded-[10px] bg-surface p-[5px] shadow-pop',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
