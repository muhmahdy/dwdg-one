/* Form controls from the design system (components.css .field, .input, .textarea, .help, .seg): a labelled field, the text
   controls, and the segmented choice. Comfortable makes controls 42px (44px on phones, where text is 18px against iOS zoom). */
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';

export const inputClass = cn(
  'h-[38px] w-full rounded-ctl border-0 bg-surface px-3 text-ink shadow-[0_0_0_1px_var(--line-strong)] type-body',
  'placeholder:text-mute disabled:cursor-not-allowed disabled:opacity-60 roomy:h-[42px]',
  'phone:roomy:h-11 phone:roomy:[font:400_18px/25px_var(--font)]',
);
export const textareaClass = cn(inputClass, 'h-auto min-h-[88px] resize-y px-3 py-2.5 roomy:h-auto phone:roomy:h-auto');
export const invalidClass = 'shadow-[0_0_0_1.5px_var(--danger)]';

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: ReactNode;
  /** Helper text under the control; turns red with `error`. */
  help?: ReactNode;
  error?: boolean;
  children: ReactNode;
  className?: string;
}

/** A label, its control, and a line of help. `optional` shows a quiet "Optional" (or the given text) at the right. */
export function Field({ label, htmlFor, required, optional, help, error, children, className }: FieldProps) {
  return (
    <div className={cn('mb-3.5 grid gap-1.5', className)}>
      <label htmlFor={htmlFor} className="flex gap-1.5 text-d13 font-[550] roomy:text-[14px]">
        {label}
        {required && <span className="text-danger">*</span>}
        {!!optional && (
          <span className="ml-auto overflow-hidden font-normal text-ellipsis whitespace-nowrap text-mute">
            {optional === true ? t('Optional') : optional}
          </span>
        )}
      </label>
      {children}
      {help ? (
        <span className={cn('text-d12h text-mute roomy:text-[14px]', error && 'text-danger')}>{help}</span>
      ) : null}
    </div>
  );
}

/** The two-column row used for paired fields such as due date and time. */
export const Grid2 = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">{children}</div>
);

/** A segmented choice (.seg): one button per option, the chosen one raised. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: [T, ReactNode][];
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="inline-flex gap-0.5 rounded-[10px] bg-fill p-[3px]" role="radiogroup" aria-label={label}>
      {options.map(([k, text]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={value === k}
          className={cn(
            'h-7 rounded-[7px] border-0 bg-transparent px-3 text-d13 font-[550] text-mute roomy:h-8 phone:roomy:h-[38px]',
            value === k && 'bg-surface text-ink shadow-sheet',
          )}
          onClick={() => {
            onChange(k);
          }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
