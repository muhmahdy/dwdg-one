/* The toast with Undo (work_undo_archive): one polite live region at the bottom centre, above everything else. */
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { toastStore } from '@/lib/workspace/transaction';

export function Toast() {
  const toast = useStore(toastStore, (s) => s);
  return (
    <div
      id="toast"
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[70] max-w-[calc(100vw-24px)] -translate-x-1/2"
    >
      {toast && (
        <span
          key={toast.id}
          className="inline-flex min-h-11 max-w-full items-center gap-3.5 rounded-[10px] bg-ink py-1.5 pr-2 pl-4 text-d13h [overflow-wrap:anywhere] text-on-ink shadow-pop"
        >
          {toast.msg}
          {toast.undo && (
            <button
              type="button"
              className="h-[30px] flex-none rounded-[7px] border-0 bg-white/12 px-2.5 font-semibold text-inherit dark:bg-black/10"
              onClick={() => {
                toastStore.set(null);
                toast.undo?.();
              }}
            >
              {t('Undo')}
            </button>
          )}
        </span>
      )}
    </div>
  );
}
