/* Preference rows (components.css .setbox, .setrow): a label, what it does, and its control on the right. */
import type { ReactNode } from 'react';

/** One preference: a label, what it does, and its control on the right. */
export function SettingRow({ label, help, children }: { label: ReactNode; help?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 border-line px-4 py-2.5 not-first:border-t max-[760px]:flex-col max-[760px]:items-start">
      <div>
        <b className="block font-semibold">{label}</b>
        {help && <small className="block max-w-[56ch] text-d12h text-mute">{help}</small>}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 max-[760px]:justify-start">{children}</div>
    </div>
  );
}

export const SettingBox = ({ children }: { children: ReactNode }) => (
  <div className="grid overflow-hidden rounded-sheet bg-surface-2">{children}</div>
);
