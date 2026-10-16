/* Right-click any task, meeting or timeline bar to react, like WhatsApp (owner round 7). Rows mark themselves with
   data-react="task:<id>" or data-react="meeting:<id>"; one listener opens the reaction menu at the pointer. */
import { setUi } from '@/lib/workspace/transaction';
import { getMe } from '@/lib/workspace/hooks';

export const reactTarget = (kind: 'task' | 'meeting', id: string) => ({ 'data-react': `${kind}:${id}` });

document.addEventListener('contextmenu', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!getMe() || !target || target.closest('input, textarea, [contenteditable], [role="menu"]')) return;
  const host = target.closest<HTMLElement>('[data-react]');
  const [kind, id] = host?.dataset.react?.split(':') ?? [];
  if (!host || !id || (kind !== 'task' && kind !== 'meeting')) return;
  e.preventDefault();
  const x = e.clientX;
  const y = e.clientY;
  setUi((u) => {
    u.menu = {
      type: 'react',
      kind,
      id,
      more: false,
      width: 296,
      est: 230,
      rect: { x: x - 20, y, top: y, right: x, bottom: y, left: x - 20, width: 20, height: 0 },
    };
  });
});
