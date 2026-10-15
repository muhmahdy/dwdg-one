/* Popover placement (design-overlays, measure-popovers), from core/ui-polish.js UIPlacement: keep the popover inside the
   visible viewport, below its control when it fits (or above when asked or when there is more room), aligned to the
   control's left or right edge, 8px from every edge. */
export interface Box {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface Viewport {
  left: number;
  top: number;
  width: number;
  height: number;
}
export interface Placement {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  side: 'above' | 'below';
}

const MARGIN = 8;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(n, Math.max(lo, hi)));

export function viewport(): Viewport {
  const v = window.visualViewport;
  return {
    left: v?.offsetLeft ?? 0,
    top: v?.offsetTop ?? 0,
    width: v?.width ?? window.innerWidth,
    height: v?.height ?? window.innerHeight,
  };
}

export function compute(
  r: Box,
  size: { width: number; height: number },
  v: Viewport,
  opt: { gap?: number; up?: boolean; alignRight?: boolean } = {},
): Placement {
  const gap = opt.gap ?? 8;
  const x = v.left;
  const y = v.top;
  const width = Math.min(size.width, Math.max(0, v.width - MARGIN * 2));
  const aTop = clamp(r.top, y + MARGIN, y + v.height - MARGIN);
  const aBottom = clamp(r.bottom, y + MARGIN, y + v.height - MARGIN);
  const below = Math.max(0, y + v.height - MARGIN - aBottom - gap);
  const above = Math.max(0, aTop - y - MARGIN - gap);
  const side = opt.up
    ? above >= size.height || above >= below
      ? 'above'
      : 'below'
    : below >= size.height || below >= above
      ? 'below'
      : 'above';
  const maxHeight = Math.max(0, side === 'above' ? above : below);
  const height = Math.min(size.height, maxHeight);
  return {
    left: clamp(opt.alignRight ? r.right - width : r.left, x + MARGIN, x + v.width - MARGIN - width),
    top: clamp(side === 'above' ? aTop - gap - height : aBottom + gap, y + MARGIN, y + v.height - MARGIN - height),
    width,
    maxHeight,
    side,
  };
}
