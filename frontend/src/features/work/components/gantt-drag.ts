/* Pointer interactions on the timeline: drag a bar or flag to move it, drag a bar's end to change its dates (a day is one
   step), and click or drag across empty days to start a task there. Moves are shown while dragging and saved on release.
   From screens/work.js (pointerdown handlers, design-timeline-interactions). */
import type { PointerEvent as ReactPointerEvent } from 'react';

/** Pixels of movement before a press becomes a drag (so a plain click still opens the task). */
const SLOP = 4;

export type DragKind = 'move' | 'start' | 'due';

/**
 * Starts dragging a bar. `done(kind, days)` is called on release with the whole days moved (not called for a click).
 * `dragged` is set while and just after a drag so the click that follows the release can be ignored.
 */
export function dragBar(
  e: ReactPointerEvent<HTMLElement>,
  px: number,
  done: (kind: DragKind, days: number) => void,
  dragged: { current: boolean },
) {
  if (e.button !== 0) return;
  e.preventDefault();
  const el = e.currentTarget;
  const grab = (e.target as HTMLElement).dataset.gk;
  const kind: DragKind = grab === 'start' || grab === 'due' ? grab : 'move';
  const x0 = e.clientX;
  const left0 = el.offsetLeft;
  const width0 = el.offsetWidth;
  const style0 = { left: el.style.left, width: el.style.width };
  let days = 0;
  let moved = false;
  const move = (ev: PointerEvent) => {
    const dx = ev.clientX - x0;
    if (!moved && Math.abs(dx) < SLOP) return;
    moved = true;
    dragged.current = true;
    el.classList.add('dragging');
    days = Math.round(dx / px);
    if (kind === 'move') el.style.left = `${left0 + days * px}px`;
    else if (kind === 'start') {
      el.style.left = `${left0 + days * px}px`;
      el.style.width = `${Math.max(px - 4, width0 - days * px)}px`;
    } else el.style.width = `${Math.max(px - 4, width0 + days * px)}px`;
  };
  const up = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    el.classList.remove('dragging');
    el.style.left = style0.left;
    el.style.width = style0.width;
    if (!moved) return;
    setTimeout(() => {
      dragged.current = false;
    }, 0);
    if (days) done(kind, days);
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
}

/** Tracks the day columns a press covers on an empty track; `update` shows the ghost, `finish` is called on release. */
export function dragAcrossDays(
  e: ReactPointerEvent<HTMLElement>,
  px: number,
  update: (first: number, last: number) => void,
  finish: (first: number, last: number) => void,
) {
  if (e.button !== 0) return;
  e.preventDefault();
  const rect = e.currentTarget.getBoundingClientRect();
  const col = (clientX: number) => Math.max(0, Math.floor((clientX - rect.left) / px));
  const first = col(e.clientX);
  let last = first;
  update(first, last);
  const move = (ev: PointerEvent) => {
    last = col(ev.clientX);
    update(first, last);
  };
  const up = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    finish(Math.min(first, last), Math.max(first, last));
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
}
