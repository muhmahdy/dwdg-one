/* A collapsible section in the side panel (.fdisc, D55): the common things stay in view, the rest sits behind a header that
   opens by itself when something there waits on someone (`attention`). Which sections the person opened is remembered on
   this device. */
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { setSession } from '@/lib/session';
import { useSession } from '@/lib/workspace/hooks';

export function Disclosure({
  id,
  title,
  count,
  attention = false,
  children,
}: {
  id: string;
  title: string;
  count?: ReactNode;
  attention?: boolean;
  children: ReactNode;
}) {
  const chosen = useSession((s) => s.fdisc?.[id]);
  const open = chosen ?? attention;
  const toggle = () => {
    setSession((s) => ({ ...s, fdisc: { ...s.fdisc, [id]: !open } }));
  };
  return (
    <section className="border-t border-line last-of-type:border-b">
      <button
        type="button"
        className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-ctl border-0 bg-transparent px-0.5 text-left text-ink type-h3 hover:bg-hover roomy:min-h-[50px] roomy:text-[15px]"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="flex-1">{title}</span>
        {attention && <i className="size-[7px] rounded-full bg-warning-mark" />}
        {!!count && <small className="ml-auto text-mute type-small">{count}</small>}
        <Icon
          name="chevron"
          size="xs"
          className={cn(
            'size-4 text-mute transition-transform duration-[var(--d-hover)]',
            open ? 'rotate-90 roomy:-rotate-90' : 'roomy:rotate-90',
          )}
        />
      </button>
      {open && <div className="pt-0.5 pb-3.5">{children}</div>}
    </section>
  );
}
