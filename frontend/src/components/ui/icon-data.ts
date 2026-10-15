/* Brand two-tone interface icons (owner, 11 Oct, D61), ported from frontend/prototype/core/icons.js.
   Each icon is a list of layers on a 24px grid:
     o  outline, shown at rest          s  solid (fill), shown when selected      S  heavy stroke, shown when selected
     b  ink stroke, always              f  ink fill, always                        a  green fill, always      A  green stroke, always
   Solid shapes run clockwise and their holes counter-clockwise, so no masks or ids are needed. */
import assets from '@/assets/generated/assets.json';

export type Layer = readonly [kind: 'o' | 's' | 'S' | 'b' | 'f' | 'a' | 'A', d: string, extra?: number];

const n = (v: number) => +v.toFixed(2);
/** Rounded rectangle; `rev` draws it the other way round so it cuts a hole in a solid shape. */
const rr = (x: number, y: number, w: number, h: number, r: number, rev?: number) => {
  r = Math.min(r, w / 2, h / 2);
  return rev
    ? `M${n(x + r)} ${y}a${r} ${r} 0 0 0-${r} ${r}v${n(h - 2 * r)}a${r} ${r} 0 0 0 ${r} ${r}h${n(w - 2 * r)}a${r} ${r} 0 0 0 ${r}-${r}v-${n(h - 2 * r)}a${r} ${r} 0 0 0-${r}-${r}Z`
    : `M${n(x + r)} ${y}h${n(w - 2 * r)}a${r} ${r} 0 0 1 ${r} ${r}v${n(h - 2 * r)}a${r} ${r} 0 0 1-${r} ${r}h-${n(w - 2 * r)}a${r} ${r} 0 0 1-${r}-${r}v-${n(h - 2 * r)}a${r} ${r} 0 0 1 ${r}-${r}Z`;
};
const circ = (cx: number, cy: number, r: number, rev?: number) =>
  `M${n(cx - r)} ${cy}a${r} ${r} 0 1 ${rev ? 0 : 1} ${2 * r} 0a${r} ${r} 0 1 ${rev ? 0 : 1}-${2 * r} 0Z`;
function gear(cx: number, cy: number, ro: number, ri: number, teeth: number) {
  const pts: [number, number][] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    for (const [t, r] of [
      [a - step * 0.18, ro],
      [a + step * 0.18, ro],
      [a + step * 0.32, ri],
      [a + step * 0.68, ri],
    ] as const)
      pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return 'M' + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L') + 'Z';
}

const fold =
  'M8 3.5h6.2c.5 0 1 .2 1.4.6l3.3 3.3c.4.4.6.9.6 1.4V18a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 18V6A2.5 2.5 0 0 1 8 3.5Z';
const bell: Layer[] = [
  ['o', 'M6 11a6 6 0 0 1 12 0v5.4l1.7 2.1H4.3L6 16.4Z'],
  ['s', 'M6 11a6 6 0 0 1 12 0v5.4l1.7 2.1H4.3L6 16.4Z'],
  ['b', 'M12 3v2'],
  ['a', 'M9.4 20h5.2a2.6 2.6 0 0 1-5.2 0Z'],
];

export const ICONS2: Record<string, Layer[]> = {
  tasks: [
    ['o', rr(4.5, 4.5, 15, 17, 3.5) + 'M9 12h6M9 16h3.5'],
    ['s', rr(4.5, 4.5, 15, 17, 3.5) + rr(7, 10, 10, 4, 2, 1) + rr(7, 14, 7.5, 4, 2, 1)],
    ['a', rr(8.3, 2.3, 7.4, 4.4, 2.2)],
  ],
  calendar: [
    ['o', rr(3.5, 5.5, 17, 15, 3.5) + 'M3.5 10.5h17'],
    [
      's',
      rr(3.5, 5.5, 17, 15, 3.5) +
        rr(5.4, 11, 4.6, 4.2, 1.8, 1) +
        rr(10.4, 11, 4.6, 4.2, 1.8, 1) +
        rr(5.4, 15.4, 4.6, 4.2, 1.8, 1),
    ],
    ['b', 'M8 3v4M16 3v4'],
    ['a', rr(15.9, 15.9, 3.4, 3.1, 1.2)],
  ],
  bell,
  updates: bell,
  program: [
    ['o', 'M3.5 12.2 12 16.8l8.5-4.6M3.5 16.6 12 21.2l8.5-4.6'],
    ['S', 'M3.5 12.2 12 16.8l8.5-4.6M3.5 16.6 12 21.2l8.5-4.6'],
    ['a', 'M12 3.2 20.5 7.8 12 12.4 3.5 7.8Z', 1],
  ],
  projects: [
    ['a', 'M3.5 10V6a2 2 0 0 1 2-2h3.8c.6 0 1.1.3 1.5.7L12.5 7h6a2 2 0 0 1 2 2v1Z', 1],
    ['o', 'M3.5 9.5h17V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18Z'],
    ['s', 'M3.5 9.5h17V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18Z'],
  ],
  routine: [
    ['o', 'M5 12a7 7 0 0 1 12.1-4.8M19 12a7 7 0 0 1-12.1 4.8'],
    ['S', 'M5 12a7 7 0 0 1 12.1-4.8M19 12a7 7 0 0 1-12.1 4.8'],
    ['a', 'M20.2 3.6v5.6h-5.6Z', 1],
    ['f', 'M3.8 20.4v-5.6h5.6Z', 1],
  ],
  resources: [
    ['o', 'M4.5 18.5v-13A2.5 2.5 0 0 1 7 3h12.5v13H7a2.5 2.5 0 0 0-2.5 2.5Z'],
    ['s', 'M4.5 18.5v-13A2.5 2.5 0 0 1 7 3h12.5v13H7a2.5 2.5 0 0 0-2.5 2.5Z'],
    ['b', 'M4.5 18.5A2.5 2.5 0 0 0 7 21h12.5v-5'],
    ['a', 'M13.2 3h4.3v7.6l-2.15-1.7-2.15 1.7Z'],
  ],
  flag: [
    ['b', 'M6 21.5V5.5'],
    ['o', 'M6 5h12l-2.6 4.25L18 13.5H6'],
    ['s', 'M6 5h12l-2.6 4.25L18 13.5H6Z'],
    ['a', circ(6, 3.4, 2)],
  ],
  chart: [
    ['o', rr(4, 13, 4.2, 7.5, 1.8) + rr(9.9, 8.5, 4.2, 12, 1.8)],
    ['s', rr(4, 13, 4.2, 7.5, 1.8) + rr(9.9, 8.5, 4.2, 12, 1.8)],
    ['a', rr(15.8, 3.5, 4.2, 17, 1.8)],
  ],
  activity: [
    ['o', 'M2.8 12h3.6l2.6-6.5 4.6 13 2.6-6.5h1.4'],
    ['S', 'M2.8 12h3.6l2.6-6.5 4.6 13 2.6-6.5h1.4'],
    ['a', circ(19.6, 12, 2.3)],
  ],
  people: [
    ['a', circ(17, 8.2, 2.7)],
    ['A', 'M17.6 13.4a4.6 4.6 0 0 1 4 4.6v1.5'],
    ['o', circ(9, 8, 3.6) + 'M2.5 20v-.6a6.5 6.5 0 0 1 13 0v.6Z'],
    ['s', circ(9, 8, 3.6) + 'M2.5 20v-.6a6.5 6.5 0 0 1 13 0v.6Z'],
  ],
  person: [
    ['a', circ(12, 7.8, 4)],
    ['o', 'M4.5 20.5v-.4a7.5 7.5 0 0 1 15 0v.4Z'],
    ['s', 'M4.5 20.5v-.4a7.5 7.5 0 0 1 15 0v.4Z'],
  ],
  settings: [
    ['o', gear(12, 12, 9.2, 7, 8)],
    ['s', gear(12, 12, 9.2, 7, 8)],
    ['a', circ(12, 12, 3.1)],
  ],
  search: [
    ['b', circ(10.5, 10.5, 6.5)],
    ['S', circ(10.5, 10.5, 6.5)],
    ['A', 'M15.6 15.6 20.4 20.4', 3],
  ],
  pin: [
    ['o', 'M9.2 7h5.6l.6 4.4 2.6 2.6v1.5H6v-1.5l2.6-2.6Z'],
    ['s', 'M9.2 7h5.6l.6 4.4 2.6 2.6v1.5H6v-1.5l2.6-2.6Z'],
    ['b', 'M12 15.5v5.5'],
    ['a', rr(7.8, 2.6, 8.4, 3.4, 1.7)],
  ],
  globe: [
    ['b', circ(12, 12, 8.5)],
    ['S', circ(12, 12, 8.5)],
    ['b', 'M3.8 12h16.4'],
    ['A', 'M12 3.5c2.4 2.4 3.5 5.4 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.4-3.5-8.5s1.1-6.1 3.5-8.5Z'],
  ],
  sun: [
    ['a', circ(12, 12, 4.2)],
    ['b', 'M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4'],
  ],
  moon: [
    ['o', 'M20 14.6A8.5 8.5 0 1 1 9.4 4a6.8 6.8 0 0 0 10.6 10.6Z'],
    ['s', 'M20 14.6A8.5 8.5 0 1 1 9.4 4a6.8 6.8 0 0 0 10.6 10.6Z'],
    ['a', 'M17.2 3.2l.75 1.65 1.65.75-1.65.75-.75 1.65-.75-1.65-1.65-.75 1.65-.75Z', 1],
  ],
  logout: [
    ['b', 'M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10'],
    ['A', 'M14.5 8l4 4-4 4M18.5 12H9.5'],
  ],
  shield: [
    ['a', 'M12 3 4.5 5.8v5.7c0 4.8 3.2 8.3 7.5 9.8Z', 1],
    ['o', 'M12 3l7.5 2.8v5.7c0 4.8-3.2 8.3-7.5 9.8'],
    ['s', 'M12 3l7.5 2.8v5.7c0 4.8-3.2 8.3-7.5 9.8Z'],
  ],
  heart: [
    ['o', 'M12 20.5s-8-4.6-8-10.4a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 5.8-8 10.4-8 10.4Z'],
    ['s', 'M12 20.5s-8-4.6-8-10.4a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 5.8-8 10.4-8 10.4Z'],
    ['a', 'M19.4 1.8l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7Z', 1],
  ],
  briefcase: [
    ['b', 'M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5'],
    ['o', rr(3, 7.5, 18, 12.5, 3)],
    ['s', rr(3, 7.5, 18, 12.5, 3)],
    ['a', rr(10.2, 11.6, 3.6, 3.2, 1.2)],
  ],
  documents: [
    ['o', fold + 'M8.8 12.5h6.4M8.8 16h4'],
    ['s', fold + rr(7.8, 11.5, 8.4, 4, 2, 1)],
    ['a', 'M14.5 3.6v3.4a1.6 1.6 0 0 0 1.6 1.6h3.4Z', 1],
  ],
  file: [
    ['o', fold],
    ['s', fold],
    ['a', 'M14.5 3.6v3.4a1.6 1.6 0 0 0 1.6 1.6h3.4Z', 1],
  ],
  compass: [
    ['b', circ(12, 12, 8.5)],
    ['S', circ(12, 12, 8.5)],
    ['a', 'M16 8 13.6 13.6 10.4 10.4Z', 1],
    ['f', 'M8 16 10.4 10.4 13.6 13.6Z', 1],
  ],
  wallet: [
    ['b', 'M17.5 6V5.2A1.7 1.7 0 0 0 15.8 3.5H6.5A3 3 0 0 0 3.5 6.5'],
    ['o', rr(3.5, 6, 17, 14, 3)],
    ['s', rr(3.5, 6, 17, 14, 3)],
    ['a', rr(14.5, 10.4, 7.5, 5.2, 2.2)],
  ],
  finance: [
    ['o', 'M4.5 7v10c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V7M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3'],
    ['s', 'M4.5 7v10c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V7Z'],
    ['a', 'M4.5 7c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3-3.4-3-7.5-3-7.5 1.3-7.5 3Z', 1],
  ],
  home: [
    ['o', 'M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z'],
    ['s', 'M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z'],
    ['a', rr(10, 13.8, 4, 6.7, 1.6)],
  ],
  attendance: [
    ['o', rr(3.5, 5.5, 17, 15, 3.5)],
    ['s', rr(3.5, 5.5, 17, 15, 3.5)],
    ['b', 'M8 3v4M16 3v4'],
    ['A', 'm8.3 13.6 2.6 2.6 4.9-5', 2.6],
  ],
};

/** One-tone utility paths (chevrons, plus, close …) from the generated asset table, plus the names the prototype added. */
export const UI_PATHS: Record<string, string> = {
  ...(assets.ui as Record<string, string>),
  routine:
    (assets.ui as Record<string, string>).routine ??
    'M4 12a8 8 0 0 1 13.7-5.6L20 9 M20 4v5h-5 M20 12a8 8 0 0 1-13.7 5.6L4 15 M4 20v-5h5',
};

export const BRAND = assets.brand as Record<string, { label: string; svg: string }>;
export const WORDMARK = assets.wordmark;
export const LOCKUP = assets.lockup;

/* Status badges (R016): a solid shape with the mark cut out, used as a CSS mask so every tone paints it. Callers name
   the icon; unknown marks fall back to the outline path drawn smaller. */
const BADGE: Record<string, [shape: 'c' | 't' | 'r', mark?: string]> = {
  check: ['c', 'm7.4 12.4 3.1 3.1 6.1-6.4'],
  clock: ['c', 'M12 7.2V12l3.2 2'],
  warning: ['t', 'M12 9.6v4.2M12 17.3h.01'],
  info: ['c', 'M12 11.2v5.3M12 7.8h.01'],
  close: ['c', 'm8.6 8.6 6.8 6.8M15.4 8.6l-6.8 6.8'],
  minus: ['c', 'M7.8 12h8.4'],
  circle: ['r'],
  undo: ['c', 'M9.6 8.4 7 11l2.6 2.6M7.4 11h6.1a3.1 3.1 0 0 1 0 6.2H11'],
  search: ['c', 'M14.6 14.6 16.8 16.8' + circ(11, 11, 3.6)],
  edit: ['c', 'M8 16l.7-2.9 5.6-5.6 2.2 2.2-5.6 5.6Z'],
  calendar: ['c', rr(7.2, 8, 9.6, 8.6, 1.6) + 'M7.2 11h9.6'],
  list: ['c', 'M8 9h8M8 12h8M8 15h5'],
  flag: ['c', 'M9 17V7.5h6.5L14 10l1.5 2.5H9'],
  person: ['c', circ(12, 9.6, 2.2) + 'M8 16.6a4 4 0 0 1 8 0'],
  lock: ['c', rr(8.2, 11, 7.6, 5.6, 1.2) + 'M9.8 11V9.6a2.2 2.2 0 0 1 4.4 0V11'],
  escalate: ['c', 'M12 16.6V7.8M8.4 11.2 12 7.6l3.6 3.6'],
  heart: ['c', 'M12 16s-3.8-2.2-3.8-5a2 2 0 0 1 3.8-1.1 2 2 0 0 1 3.8 1.1c0 2.8-3.8 5-3.8 5Z'],
  hand: ['c', 'M9.5 9.5v5M12 8v6.5M14.5 9.5v5'],
  archive: ['c', 'M7.6 9h8.8M8.4 9v6.6h7.2V9M10.6 12h2.8'],
};
const SHAPE = {
  c: '<circle cx="12" cy="12" r="11" fill="#000" mask="url(#k)"/>',
  t: '<path d="M10.2 3.3a2.1 2.1 0 0 1 3.6 0l8.7 15.3a2.1 2.1 0 0 1-1.8 3.2H3.3a2.1 2.1 0 0 1-1.8-3.2Z" fill="#000" mask="url(#k)"/>',
};
const svgUrl = (inner: string) =>
  `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`)}')`;
const badgeCache = new Map<string, string>();

/** The status badge mask for an icon name (check, clock, warning …). */
export function badgeMask(name: string): string {
  const hit = badgeCache.get(name);
  if (hit) return hit;
  const b = BADGE[name];
  let svg: string;
  if (b?.[0] === 'r') svg = '<circle cx="12" cy="12" r="9.4" fill="none" stroke="#000" stroke-width="2.8"/>';
  else {
    const mark = b?.[1]
      ? `<path d="${b[1]}"/>`
      : `<path d="${UI_PATHS[name] ?? UI_PATHS.circle ?? ''}" transform="translate(12 12) scale(.54) translate(-12 -12)" stroke-width="4"/>`;
    svg = `<defs><mask id="k" maskUnits="userSpaceOnUse"><rect width="24" height="24" fill="#fff"/><g fill="none" stroke="#000" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${mark}</g></mask></defs>${SHAPE[b?.[0] === 't' ? 't' : 'c']}`;
  }
  const url = svgUrl(svg);
  badgeCache.set(name, url);
  return url;
}

/** The outline mask for project stages (the owner's set, D20). */
export const lineMask = (name: string) =>
  `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${UI_PATHS[name] ?? ''}"/></svg>`)}')`;
