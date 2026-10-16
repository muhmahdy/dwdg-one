/* Task, meeting and routine icons (owner, 6 Oct round 7): a wide set of line icons and eight colours plus a custom colour,
   stored on the record as icon = {n, c}. From screens/work.js XI / ICONSET / ICOL. */
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { TaskIcon as TaskIconValue } from '@/types/workspace';

export const XI: Record<string, string> = {
  book: 'M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z M5 18a2 2 0 0 1 2-2h11',
  school: 'M2 9l10-5 10 5-10 5Z M6 11v5c3 2 9 2 12 0v-5 M22 9v6',
  pencil: 'M4 20l1-5L16 4l4 4L9 19Z M14 6l4 4',
  pen: 'M12 19l7-7-7-7-7 7 3 3 M5 12l-2 8 8-2 M12 12a1.5 1.5 0 1 0 0-.01',
  code: 'M9 7l-5 5 5 5 M15 7l5 5-5 5',
  terminal: 'M4 5h16v14H4Z M7 10l3 2-3 2 M12 15h5',
  music: 'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  popcorn: 'M6 9h12l-2 11H8Z M10 9v11 M14 9v11 M6 9a3 3 0 0 1 3-4 3 3 0 0 1 6 0 3 3 0 0 1 3 4',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-2 0-3 4 1 6-2a9 9 0 0 0-8-11Z M7.5 11h.01 M10 7h.01 M15 7h.01',
  stethoscope: 'M6 3v6a4 4 0 0 0 8 0V3 M10 13v2a5 5 0 0 0 10 0v-2 M20 11a2 2 0 1 0 0 .01',
  lotus: 'M12 20c-5 0-9-3-9-7 3 0 6 1 9 4 3-3 6-4 9-4 0 4-4 7-9 7Z M12 17c-2-3-2-8 0-12 2 4 2 9 0 12Z',
  bag: 'M5 8h14l-1 12H6Z M9 8a3 3 0 0 1 6 0',
  bars: 'M5 20V12 M10 20V6 M15 20v-9 M20 20V4',
  dumbbell: 'M3 10v4 M6 7v10 M18 7v10 M21 10v4 M6 12h12',
  scale: 'M12 4v16 M7 20h10 M5 7h14 M5 7l-3 6a3 3 0 0 0 6 0Z M19 7l-3 6a3 3 0 0 0 6 0Z',
  plane: 'M3 13l7-2 4-7h2l-1 7 5 1 1 2-6 1-3 5h-2l1-5-7 1Z',
  wrench: 'M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 0-2-2Z',
  paw: 'M12 20c-3 0-5-2-5-4s3-4 5-4 5 2 5 4-2 4-5 4Z M6 10a1.5 2 0 1 0 0 .01 M10 6a1.5 2 0 1 0 0 .01 M14 6a1.5 2 0 1 0 0 .01 M18 10a1.5 2 0 1 0 0 .01',
  flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3 M7 15h10',
  brain:
    'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1Z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1',
  gift: 'M4 10h16v10H4Z M3 7h18v3H3Z M12 7v13 M12 7c-2-4-6-3-5 0 M12 7c2-4 6-3 5 0',
  camera: 'M4 8h4l2-3h4l2 3h4v11H4Z M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  mic: 'M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0Z M5 11a7 7 0 0 0 14 0 M12 18v3',
  megaphone: 'M3 10v4l11 5V5Z M14 8h3a3 3 0 0 1 0 6h-3 M6 15l1 5h3l-1-4',
  rocket: 'M12 3c4 2 6 6 5 11l-3 3h-4l-3-3c-1-5 1-9 5-11Z M12 9a1.5 1.5 0 1 0 0 .01 M7 14l-3 2 2 3 M17 14l3 2-2 3',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0Z M8 6H5a3 3 0 0 0 3 4 M16 6h3a3 3 0 0 1-3 4 M12 13v4 M8 20h8 M9 17h6',
  coffee: 'M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z M16 11h2a2 2 0 0 1 0 4h-2 M8 3v3 M12 3v3',
  cart: 'M3 4h2l2 11h11l2-8H6 M9 20a1 1 0 1 0 0 .01 M17 20a1 1 0 1 0 0 .01',
  phone: 'M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  mail: 'M3 6h18v12H3Z M3 7l9 6 9-6',
  map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2Z M9 4v14 M15 6v14',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 12h.01',
  bulb: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10Z',
  star: 'M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1Z',
  handshake: 'M3 12l4-4 5 2 5-2 4 4-7 6-2-2-2 2Z M8 13l3 3',
  video: 'M3 7h12v10H3Z M15 10l6-3v10l-6-3',
  leaf: 'M5 19C5 9 11 4 20 4c0 9-5 15-15 15Z M5 19l8-8',
  truck: 'M3 6h11v10H3Z M14 9h4l3 4v3h-7 M7 19a2 2 0 1 0 0-.01 M17 19a2 2 0 1 0 0-.01',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8 14a5 5 0 0 0 8 0 M9 9h.01 M15 9h.01',
};

export const ICONSET = [
  'tasks',
  'flag',
  'calendar',
  'clock',
  'folder',
  'documents',
  'note',
  'link',
  'people',
  'person',
  'briefcase',
  'chart',
  'bars',
  'target',
  'compass',
  'globe',
  'map',
  'home',
  'finance',
  'wallet',
  'cart',
  'gift',
  'trophy',
  'star',
  'heart',
  'smile',
  'sparkles',
  'bulb',
  'rocket',
  'book',
  'school',
  'pencil',
  'pen',
  'palette',
  'camera',
  'video',
  'mic',
  'megaphone',
  'music',
  'popcorn',
  'coffee',
  'code',
  'terminal',
  'wrench',
  'settings',
  'shield',
  'lock',
  'scale',
  'handshake',
  'mail',
  'phone',
  'bell',
  'plane',
  'truck',
  'flask',
  'brain',
  'stethoscope',
  'lotus',
  'leaf',
  'paw',
  'dumbbell',
  'bag',
  'sun',
  'moon',
  'pin',
  'board',
  'activity',
  'search',
];

export const ICOL: Record<string, string> = {
  ink: 'var(--ink)',
  red: '#E5484D',
  orange: '#F0761A',
  yellow: '#E2A336',
  green: '#16A34A',
  blue: '#3E7BFA',
  purple: '#8E4EC6',
  pink: '#E93D82',
};

export const iconColor = (c: string | null | undefined): string =>
  (c && ICOL[c]) ?? (c && /^#[0-9a-f]{6}$/i.test(c) ? c : 'var(--ink)');

/** A 1.8px line drawing from a raw path (the prototype's svgD). */
export const LineGlyph = ({ d, className }: { d: string; className?: string }) => (
  <svg
    className={cn('ic', className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

/** The drawing for an icon name: the extra set first, then the interface set. */
export function TaskIconGlyph({ name, className }: { name: string; className?: string }) {
  const d = XI[name];
  return d ? <LineGlyph d={d} className={className} /> : <Icon name={name} className={className} />;
}

/** The coloured icon shown before a task or meeting title (.ticon). */
export function TaskIcon({
  icon,
  size = 'md',
  className,
}: {
  icon: TaskIconValue | null | undefined;
  size?: 'md' | 'xs';
  className?: string;
}) {
  if (!icon) return null;
  return (
    <span
      className={cn(
        'inline-grid flex-none place-items-center [&_.ic]:size-full',
        size === 'xs' ? 'mr-[5px] size-[15px] align-[-2px]' : 'mr-1.5 size-[18px] align-[-3px]',
        className,
      )}
      style={{ color: iconColor(icon.c) }}
      aria-hidden="true"
    >
      <TaskIconGlyph name={icon.n} />
    </span>
  );
}
