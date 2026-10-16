/* Buttons from the design system (components.css): default, primary (ink), ghost, danger; small; icon button. */
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';

const VARIANT: Record<ButtonVariant, string> = {
  default: 'bg-surface text-ink shadow-[0_0_0_1px_var(--line-strong)] hover:bg-hover [&_.ic]:text-mute',
  primary:
    'bg-ink text-on-ink shadow-press hover:bg-[color-mix(in_srgb,var(--ink)_88%,var(--surface))] [&_.ic]:text-on-ink',
  ghost: 'bg-transparent text-ink-2 shadow-none hover:bg-hover [&_.ic]:text-mute',
  danger:
    'bg-surface text-danger shadow-[0_0_0_1px_color-mix(in_srgb,var(--danger)_35%,transparent)] hover:bg-hover [&_.ic]:text-mute',
};

export const buttonClass = (variant: ButtonVariant = 'default', small = false, className?: string) =>
  cn(
    'inline-flex items-center justify-center gap-[7px] rounded-ctl border-0 px-3 text-d13 font-[550] whitespace-nowrap',
    'h-[var(--ctl-h)] transition-[transform,background] duration-[var(--d-press),var(--d-hover)] ease-ds active:scale-[.98]',
    'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 [&_.ic]:size-4',
    small && 'h-[var(--ctl-h-sm)] px-2.5',
    // Simple: bigger text and room, whatever the size (core/simple.css .btn).
    'simple:px-4 simple:text-[16px] simple:[&_.ic]:size-[18px]',
    VARIANT[variant],
    className,
  );

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  small?: boolean;
}

export function Button({ variant = 'default', small = false, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, small, className)} {...rest} />;
}

export const iconButtonClass = (className?: string) =>
  cn(
    'inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink',
    className,
  );

export function IconButton({ className, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={iconButtonClass(className)} {...rest} />;
}

/** Segmented control (.seg): a quiet track with the chosen option raised. */
export const segClass = 'inline-flex gap-0.5 rounded-[10px] bg-fill p-[3px]';
export const segButtonClass = (on: boolean, className?: string) =>
  cn(
    'h-7 rounded-[7px] border-0 bg-transparent px-3 text-d13 font-[550] text-mute',
    on && 'bg-surface text-ink shadow-sheet',
    className,
  );
