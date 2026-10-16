import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { pal, still } from '@/lib/art/identity';
import { cn } from '@/lib/cn';

interface Props {
  /** Stable seed, e.g. `project:p-roadmap`. */
  seed: string;
  mode: number;
  palette: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/* The shader tile (.idn): a gradient in the palette until the still image is drawn at its real size, then the image.
   Hovering its host ([data-art-host]) animates it (lib/art/identity.ts). */
export function IdentityTile({ seed, mode, palette, className, style, children }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const c = pal(palette);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const url = still(seed, mode, palette, Math.round(r.width * dpr), Math.round(r.height * dpr));
    if (url) el.style.backgroundImage = `url(${url})`;
  }, [seed, mode, palette]);
  return (
    <span
      ref={ref}
      data-idn={seed}
      data-mode={mode}
      data-pal={palette}
      className={cn(
        'relative inline-grid size-10 flex-none place-items-center overflow-hidden rounded-[10px] bg-cover bg-center',
        'shadow-[inset_0_0_0_1px_rgb(0_0_0/8%)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/8%)]',
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${c[1]}, ${c[2]} 62%, ${c[3]})`, ...style }}
    >
      {children}
    </span>
  );
}
