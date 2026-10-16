/* A rendered document (.doc): the brief or a note, with links to records inside dwdg’ONE shown as chips that open them. */
import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useWorkspace } from '@/lib/workspace/hooks';
import { refInfo } from '@/features/resources/services/links';
import { briefHtml } from '../services/brief';

export const docClass = cn(
  'max-w-[72ch] text-[15px] leading-6 text-ink',
  '[&_h3]:mt-[18px] [&_h3]:mb-1 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3:first-child]:mt-0',
  '[&_li+li]:mt-1 [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-[22px] [&_p]:mb-2.5 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-[22px]',
  '[&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-[3px]',
  "[&_.ref]:inline-flex [&_.ref]:cursor-pointer [&_.ref]:items-center [&_.ref]:gap-1 [&_.ref]:rounded-md [&_.ref]:bg-fill [&_.ref]:px-1.5 [&_.ref]:text-[14px] [&_.ref]:font-[550] [&_.ref]:no-underline [&_.ref.gone]:cursor-default [&_.ref.gone]:text-mute [&_a.ref]:before:text-[11px] [&_a.ref]:before:text-mute [&_a.ref]:before:content-['↗']",
);

export function BriefDoc({ html, small = false }: { html: string; small?: boolean }) {
  const db = useWorkspace((w) => w);
  const body = useMemo(() => briefHtml(db, html), [db, html]);
  return (
    <div
      className={cn(docClass, small && 'text-[13.5px] leading-[21px]')}
      onClick={(e) => {
        const el = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-open]') : null;
        const [type = '', id = ''] = (el?.dataset.open ?? '').split(':');
        if (el) refInfo(db, { type: type, id })?.open();
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return;
        const el = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-open]') : null;
        const [type = '', id = ''] = (el?.dataset.open ?? '').split(':');
        if (el) refInfo(db, { type: type, id })?.open();
      }}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
