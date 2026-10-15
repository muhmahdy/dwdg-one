/* Back/forward and undo/redo (D45): two quiet groups in the top bar, separated by space, never by a vertical rule. */
import { useNavigate } from 'react-router';
import { jump, pageHistory } from '@/app/router/page-history';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { historyStore, redoLast, setUi, undoLast } from '@/lib/workspace/transaction';

const btn =
  'inline-grid size-8 place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink disabled:cursor-default disabled:bg-transparent disabled:opacity-35';

export function HistoryButtons({ className }: { className?: string }) {
  const navigate = useNavigate();
  const ph = useStore(pageHistory, (h) => h);
  const lastUndo = useStore(historyStore, (h) => h.u.at(-1)?.msg);
  const lastRedo = useStore(historyStore, (h) => h.r.at(-1)?.msg);
  const go = (i: number) => {
    const e = jump(i);
    if (!e) return;
    setUi((ui) => {
      ui.menu = null;
      ui.form = null;
      ui.insp = e.insp ? { ...e.insp } : null;
    });
    void navigate(e.path);
  };
  const b = (label: string, icon: string, on: boolean, onClick: () => void, extra?: string) => (
    <button type="button" className={btn} disabled={!on} aria-label={label} title={label} onClick={onClick}>
      <Icon name={icon} size="sm" className={extra} />
    </button>
  );
  return (
    <div className={cn('ml-auto inline-flex items-center gap-2', className)} role="group" aria-label={t('History')}>
      <span className="inline-flex gap-0.5">
        {b(t('Previous page'), 'left', ph.i > 0, () => {
          go(ph.i - 1);
        })}
        {b(t('Next page'), 'right', ph.i < ph.s.length - 1, () => {
          go(ph.i + 1);
        })}
      </span>
      <span className="inline-flex gap-0.5">
        {b(
          lastUndo ? t('Undo: {m} (Ctrl+Z)', { m: lastUndo }) : t('Nothing to undo'),
          'undo',
          !!lastUndo,
          () => void undoLast(),
        )}
        {b(
          lastRedo ? t('Redo: {m} (Ctrl+Y)', { m: lastRedo }) : t('Nothing to redo'),
          'undo',
          !!lastRedo,
          () => void redoLast(),
          '-scale-x-100',
        )}
      </span>
    </div>
  );
}
