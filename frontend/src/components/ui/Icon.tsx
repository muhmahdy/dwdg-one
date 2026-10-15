import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { BRAND, ICONS2, UI_PATHS } from './icon-data';

export type IconSize = 'md' | 'sm' | 'xs';
const SIZE: Record<IconSize, string> = { md: 'size-[18px]', sm: 'size-4', xs: 'size-3.5' };
const STROKE = { o: 2, b: 2, A: 2.2, S: 3 } as const;

interface IconProps {
  name: string;
  size?: IconSize;
  /** Selected items show the solid form of a two-tone icon (D61). */
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
}

/* Interface icon: the brand two-tone set first (outline with one green piece; solid when selected), then the one-tone
   utility set at the same 2px weight. Always decorative: the control around it carries the accessible name. */
export function Icon({ name, size = 'md', selected = false, className, style }: IconProps) {
  const layers = ICONS2[name];
  // `ic` marks interface icons so containers can size or colour them, as the design system's `.btn .ic` rules do.
  const cls = cn('ic flex-none', SIZE[size], className);
  if (!layers)
    return (
      <svg
        className={cls}
        style={style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={UI_PATHS[name] ?? UI_PATHS.circle} />
      </svg>
    );
  return (
    <svg className={cn(cls, 'overflow-visible')} style={style} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {layers.map(([kind, d, extra], i) => {
        if (kind === 'a')
          return (
            <path
              key={i}
              d={d}
              fill="var(--green)"
              {...(extra ? { stroke: 'var(--green)', strokeWidth: 1.6, strokeLinejoin: 'round' as const } : {})}
            />
          );
        if (kind === 'f')
          return (
            <path
              key={i}
              d={d}
              fill="currentColor"
              {...(extra ? { stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' as const } : {})}
            />
          );
        if (kind === 's')
          return selected ? (
            <path key={i} d={d} fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
          ) : null;
        if (kind === 'S' && !selected) return null;
        if (kind === 'o' && selected) return null;
        const green = kind === 'A';
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={green ? 'var(--green)' : 'currentColor'}
            strokeWidth={green && extra ? extra : STROKE[kind]}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

interface BrandIconProps {
  id: string;
  /** Labelled marks are images with a name; unlabelled ones are decorative. */
  label?: boolean;
  className?: string;
}

/** Division, role and Admin marks from the brand set (.planning/brand). */
export function BrandIcon({ id, label = true, className }: BrandIconProps) {
  const b = BRAND[id];
  if (!b) return null;
  return (
    <svg
      className={cn('size-4 flex-none text-ink [--dwdg-green:var(--green)]', className)}
      viewBox="0 0 24 24"
      {...(label ? { role: 'img', 'aria-label': b.label } : { 'aria-hidden': true })}
      dangerouslySetInnerHTML={{ __html: (label ? `<title>${escapeXml(b.label)}</title>` : '') + b.svg }}
    />
  );
}

const escapeXml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
