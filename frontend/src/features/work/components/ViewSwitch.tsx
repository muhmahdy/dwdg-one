/* List, Board and Timeline over the same task records (work_work_views). The choice is personal per place and survives reload. */
import { segButtonClass, segClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { useSession } from '@/lib/workspace/hooks';

export type View = 'list' | 'board' | 'timeline';
export const VIEWS: [View, string, string][] = [
  ['list', 'List', 'list'],
  ['board', 'Board', 'board'],
  ['timeline', 'Timeline', 'gantt'],
];

export const useView = (scope: string): View =>
  useSession((s) => (s.views as Record<string, View> | undefined)?.[scope] ?? 'list');
export const setView = (scope: string, v: View) =>
  setSession((s) => ({ ...s, views: { ...(s.views ?? {}), [scope]: v } }));

export function ViewSwitch({
  scope,
  views = VIEWS,
  className,
}: {
  scope: string;
  views?: [View, string, string][];
  className?: string;
}) {
  const cur = useView(scope);
  return (
    <div className={cn(segClass, className)} role="radiogroup" aria-label={t('View')}>
      {views.map(([k, l, i]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={cur === k}
          className={segButtonClass(
            cur === k,
            'inline-flex items-center gap-1.5 roomy:h-8 phone:roomy:h-11 [&_.ic]:size-[15px]',
          )}
          onClick={() => setView(scope, k)}
        >
          <Icon name={i} size="sm" />
          {t(l)}
        </button>
      ))}
    </div>
  );
}
