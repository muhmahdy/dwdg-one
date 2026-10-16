/* Links (resource_references, resource_link_validation): where a link points (a known app or a record inside dwdg’ONE), the
   address checks, and the pages a project member may link to. From screens/plan.js PROV, provOf, refInfo, linkablePages. */
import { go } from '@/app/router/navigation';
import { t } from '@/lib/i18n';
import { openMeeting, openResource, openTask } from '@/lib/open';
import { dShort } from '@/lib/time';
import type { EntityRef, Project, Resource, Workspace } from '@/types/workspace';
import { projTasks } from '@/features/projects/services/project-rules';

/** Known apps: a pattern, the name, a palette number for the tile and a line glyph. */
export const PROV: [RegExp, string, number, string][] = [
  [/docs\.google\.com\/document/, 'Google Docs', 6, 'M7 3h7l4 4v14H7Z M14 3v4h4 M10 12h5 M10 16h5'],
  [/docs\.google\.com\/spreadsheets/, 'Google Sheets', 5, 'M5 4h14v16H5Z M5 10h14 M5 15h14 M11 4v16'],
  [/docs\.google\.com\/presentation/, 'Google Slides', 4, 'M4 5h16v11H4Z M12 16v4 M8 20h8'],
  [
    /docs\.google\.com\/forms|forms\.gle/,
    'Google Forms',
    3,
    'M6 3h12v18H6Z M9 8h.01 M12 8h4 M9 12h.01 M12 12h4 M9 16h.01 M12 16h4',
  ],
  [
    /classroom\.google\.com/,
    'Google Classroom',
    0,
    'M3 5h18v14H3Z M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M8 17c.6-1.8 2.2-3 4-3s3.4 1.2 4 3',
  ],
  [/drive\.google\.com/, 'Google Drive', 8, 'M9 4h6l6 10-3 6H6l-3-6Z M9 4l6 10H3 M15 4 9 14 M18 20 15 14'],
  [/meet\.google\.com/, 'Google Meet', 5, 'M3 7h11v10H3Z M14 10l7-3v10l-7-3'],
  [
    /google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/,
    'Google Maps',
    7,
    'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  ],
  [
    /figma\.com/,
    'Figma',
    9,
    'M9 3h3v6H9a3 3 0 0 1 0-6Z M12 3h3a3 3 0 0 1 0 6h-3Z M9 9h3v6H9a3 3 0 0 1 0-6Z M18 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M9 15h3v3a3 3 0 1 1-3-3Z',
  ],
  [/notion\.(so|site)/, 'Notion', 6, 'M5 5l3-1 11 1v15l-3 1-11-1Z M9 9v8 M9 9l6 8 M15 9v8'],
  [/canva\.com/, 'Canva', 8, 'M16.5 9a5 5 0 1 0 0 6'],
  [/miro\.com/, 'Miro', 4, 'M5 18 9 6l3 12 3-12 4 12'],
  [
    /github\.com/,
    'GitHub',
    6,
    'M7 4v10 M10 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M20 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M17 10c0 4-10 2-10 6',
  ],
  [
    /youtube\.com|youtu\.be/,
    'YouTube',
    1,
    'M4 7c0-1 1-2 2-2h12c1 0 2 1 2 2v10c0 1-1 2-2 2H6c-1 0-2-1-2-2Z M10 9l5 3-5 3Z',
  ],
];

export interface Provider {
  name: string;
  pal: number;
  d: string;
}

export const provOf = (url: string | null | undefined): Provider | null => {
  for (const [rx, name, pal, d] of PROV) if (rx.test(url ?? '')) return { name, pal, d };
  return null;
};

export const host = (u: string | null | undefined) => (u ?? '').replace(/^https?:\/\//, '').split('/')[0] ?? '';

/** resource_link_validation: a full https:// address. */
export const isHttps = (url: string) => /^https:\/\/[^\s/]+\.[^\s]+/.test(url);
export const isHttpsLoose = (url: string) => /^https:\/\/\S+\.\S+/.test(url);

/** The address a favicon is asked for: the site only (Google Docs, Sheets and Slides share a host, so the first path segment stays). */
export function favKey(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname !== 'docs.google.com') return u.origin;
    const first = u.pathname.split('/')[1];
    return `${u.origin}/${first ? `${first}/` : ''}`;
  } catch {
    return '';
  }
}

/** Google Forms and Classroom: the favicon services return the generic Google mark, so the products’ own icons are used. */
export const FAV_OWN: [RegExp, string][] = [
  [/docs\.google\.com\/forms|forms\.gle/, 'https://www.gstatic.com/images/branding/product/2x/forms_2020q4_48dp.png'],
  [/classroom\.google\.com/, 'https://www.gstatic.com/images/branding/product/2x/classroom_48dp.png'],
];
export const ownFavicon = (url: string) => FAV_OWN.find(([rx]) => rx.test(url))?.[1];
export const googleFavicon = (k: string) =>
  `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(k)}&sz=64`;
export const siteFavicon = (k: string) => {
  try {
    return `${new URL(k).origin}/favicon.ico`;
  } catch {
    return '';
  }
};

export const GLOBE =
  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3.5 9h17 M3.5 15h17 M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z';

export type RefKind = 'task' | 'meeting' | 'resource' | 'project';

/** A reference to a record inside dwdg’ONE: its label, what it is, and how to open it. */
export interface RefInfo {
  kind: RefKind;
  id: string;
  name: string;
  sub: string;
  open: () => void;
}

export function refInfo(db: Workspace, ref: EntityRef | null | undefined): RefInfo | null {
  if (!ref) return null;
  const { type, id } = ref;
  if (type === 'task') {
    const x = db.tasks.find((v) => v.id === id);
    return x
      ? {
          kind: 'task',
          id,
          name: x.title,
          sub: t('Task'),
          open: () => {
            openTask(id);
          },
        }
      : null;
  }
  if (type === 'meeting') {
    const x = db.meetings.find((v) => v.id === id);
    return x
      ? {
          kind: 'meeting',
          id,
          name: x.title,
          sub: `${t('Meeting')}, ${dShort(x.date)}`,
          open: () => {
            openMeeting(id);
          },
        }
      : null;
  }
  if (type === 'resource') {
    const x = db.resources.find((v) => v.id === id);
    return x
      ? {
          kind: 'resource',
          id,
          name: x.name,
          sub: t(KIND[x.kind][0]),
          open: () => {
            openResource(id);
          },
        }
      : null;
  }
  if (type === 'project') {
    const x = db.projects.find((v) => v.id === id);
    return x
      ? {
          kind: 'project',
          id,
          name: x.name,
          sub: t('Project'),
          open: () => {
            go(`projects/${id}`);
          },
        }
      : null;
  }
  return null;
}

export const KIND: Record<Resource['kind'], [string, string]> = {
  folder: ['Folder', 'folder'],
  note: ['Note', 'note'],
  link: ['Link', 'link'],
};

/** Pages a member may link to: records of this project first, then other projects in the workspace. */
export function linkablePages(db: Workspace, p: Project, query: string) {
  const q = query.toLowerCase();
  const out: { type: RefKind; id: string; name: string }[] = [];
  for (const x of projTasks(db, p)) out.push({ type: 'task', id: x.id, name: x.title });
  for (const m of db.meetings) if (m.project === p.id) out.push({ type: 'meeting', id: m.id, name: m.title });
  for (const r of db.resources)
    if (r.project === p.id && !r.archived && !r.brief) out.push({ type: 'resource', id: r.id, name: r.name });
  for (const x of db.projects)
    if (x.div === p.div && x.id !== p.id) out.push({ type: 'project', id: x.id, name: x.name });
  return out.filter((x) => !q || x.name.toLowerCase().includes(q)).slice(0, 8);
}
