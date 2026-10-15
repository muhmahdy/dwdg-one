/* Small action-driven effects (measure-motion): a completed task's checkbox pops, a newly pinned item nudges in the
   sidebar. Skipped with reduced motion, in hidden tabs and when nothing visible changed. Port of core/ui-polish.js UIEffects. */
import type { CommitEffects } from '@/lib/workspace/transaction';
import { sessionStore } from './session';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function animate(el: Element | null | undefined, frames: Keyframe[], duration: number) {
  if (!el || !('animate' in el) || reduced() || document.hidden) return null;
  return el.animate(frames, { duration, easing: 'cubic-bezier(.2,.8,.2,1)' });
}

export function playCommitEffects({ before, after }: CommitEffects) {
  if (reduced()) return;
  const was = new Map(before.tasks.map((t) => [t.id, t.status]));
  for (const t of after.tasks) {
    if (t.status !== 'done' || was.get(t.id) === 'done' || !was.has(t.id)) continue;
    const check = document.querySelector(`[data-tick="${CSS.escape(t.id)}"]`);
    animate(
      check,
      [{ transform: 'scale(.8)' }, { transform: 'scale(1.12)', offset: 0.6 }, { transform: 'scale(1)' }],
      220,
    );
  }
  const me = sessionStore.get().me;
  if (!me) return;
  const pinned = new Set((before.pins?.[me] ?? []).map((p) => `${p.k}|${p.id}`));
  for (const p of after.pins?.[me] ?? []) {
    if (pinned.has(`${p.k}|${p.id}`)) continue;
    const btn = document.querySelector(`[data-pin="${CSS.escape(`${p.k}|${p.id}`)}"] svg`);
    animate(
      btn,
      [
        { transform: 'rotate(-16deg) scale(.8)' },
        { transform: 'rotate(6deg) scale(1.12)', offset: 0.65 },
        { transform: 'rotate(0) scale(1)' },
      ],
      240,
    );
    const link = document.querySelector(`[data-pin-link="${CSS.escape(`${p.k}|${p.id}`)}"]`);
    animate(
      link,
      [
        { opacity: 0.5, transform: 'translateX(-4px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      240,
    );
  }
}
