/* Reaction bubbles (owner round 7, like WhatsApp): one per emoji with its count; yours is tinted. Tapping a bubble shows who
   reacted. From screens/work.js rxBubbles. */
import { openMenu } from '@/components/shared/menus';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { PersonId } from '@/types/workspace';

export function Reactions({
  kind,
  id,
  reactions,
  big = false,
  className,
}: {
  kind: 'task' | 'meeting';
  id: string;
  reactions: Record<string, PersonId[]>;
  big?: boolean;
  className?: string;
}) {
  const me = useMe();
  const firsts = useWorkspace((db) => Object.fromEntries(db.people.map((p) => [p.id, p.first])));
  const r = Object.entries(reactions).filter(([, v]) => v.length);
  if (!r.length) return null;
  return (
    <span className={cn('mt-1 flex flex-wrap gap-1', big && 'mt-0.5 mb-1.5', className)}>
      {r.map(([e, v]) => {
        const names = v.map((p) => firsts[p] ?? t('Someone')).join(', ');
        return (
          <button
            key={e}
            type="button"
            className={cn(
              'inline-flex h-[22px] cursor-pointer items-center gap-[3px] rounded-round border-0 bg-fill px-[7px] text-[13px] leading-none shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--line-strong)]',
              big && 'h-[26px] text-[15px]',
              me &&
                v.includes(me.id) &&
                'bg-green-soft shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--green)_45%,transparent)]',
            )}
            title={names}
            aria-label={`${e} ${names}`}
            onClick={(ev) => {
              ev.stopPropagation();
              openMenu(ev.currentTarget, { type: 'rxwho', kind, id, width: 280, est: 260 });
            }}
          >
            {e}
            {v.length > 1 && <b className="font-mono text-[11px] font-semibold text-ink-2">{v.length}</b>}
          </button>
        );
      })}
    </span>
  );
}
