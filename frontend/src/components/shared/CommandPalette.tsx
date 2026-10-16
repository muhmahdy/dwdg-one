/* Search or jump to (work_search, design-search): one box over the page that finds the projects, tasks, meetings, people and
   resources the viewer may see. Opens with Ctrl K or the search button, closes with Escape or a click outside, and returns focus
   to what opened it. From core/app.js palette and paletteResults. */
import { useEffect, useRef, useState } from 'react';
import { divisionOf } from '@/app/config/org';
import { go } from '@/app/router/navigation';
import { inShip } from '@/app/router/routes';
import { roleText } from '@/components/shared/Avatar';
import { MenuItem } from '@/components/shared/menus';
import { visibleDivs } from '@/lib/access';
import { t } from '@/lib/i18n';
import { openMeeting, openPerson, openResource, openTask } from '@/lib/open';
import { dShort } from '@/lib/time';
import { useMe, useSession, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { taskDiv } from '@/features/work/services/selectors';

interface Hit {
  key: string;
  label: string;
  sub: string;
  run: () => void;
}

export const closePalette = () => {
  setUi((u) => {
    u.palette = false;
  });
};

function Body() {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const preview = useSession((s) => s.preview);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(document.activeElement);
  useEffect(() => {
    const o = opener.current;
    return () => {
      if (o instanceof HTMLElement && o.isConnected) o.focus({ preventScroll: true });
    };
  }, []);
  if (!me) return null;
  const needle = q.toLowerCase().trim();
  const divs = visibleDivs(me);
  const first = (id: string) => db.people.find((p) => p.id === id)?.first ?? '';
  const hits: Hit[] = [];
  const add = (key: string, label: string, sub: string, run: () => void) => {
    hits.push({ key, label, sub, run });
  };
  db.projects
    .filter((p) => divs.includes(p.div) && (!needle || p.name.toLowerCase().includes(needle)))
    .slice(0, 5)
    .forEach((p) => {
      add(`p${p.id}`, p.name, `${t('Project')}, ${divisionOf(p.div)?.short ?? ''}`, () => {
        go(`projects/${p.id}`);
      });
    });
  db.tasks
    .filter((x) => {
      const d = taskDiv(db, x);
      return (
        !x.trashed &&
        (x.owner === me.id || (!!d && divs.includes(d))) &&
        (!needle || x.title.toLowerCase().includes(needle))
      );
    })
    .slice(0, 5)
    .forEach((x) => {
      add(`t${x.id}`, x.title, `${t('Task')}, ${first(x.owner)}`, () => {
        openTask(x.id);
      });
    });
  if (needle) {
    db.meetings
      .filter((mt) => mt.responses[me.id] && mt.title.toLowerCase().includes(needle))
      .slice(0, 3)
      .forEach((mt) => {
        add(`m${mt.id}`, mt.title, `${t('Meeting')}, ${dShort(mt.date)}`, () => {
          openMeeting(mt.id);
        });
      });
    db.people
      .filter((p) => p.status === 'active' && p.name.toLowerCase().includes(needle))
      .slice(0, 5)
      .forEach((p) => {
        add(`u${p.id}`, p.name, roleText(p), () => {
          openPerson(p.id);
        });
      });
    if (inShip('resources', preview))
      db.resources
        .filter((r) => !r.archived && divs.includes(r.div) && r.name.toLowerCase().includes(needle))
        .slice(0, 4)
        .forEach((r) => {
          add(`r${r.id}`, r.name, t(r.kind === 'note' ? 'Note' : r.kind === 'link' ? 'Link' : 'Folder'), () => {
            openResource(r.id);
          });
        });
  }
  const pick = (h: Hit) => {
    closePalette();
    h.run();
  };
  return (
    <div className="pointer-events-none fixed inset-0 z-50 [&>*]:pointer-events-auto" id="layer">
      <div
        className="fixed inset-0 bg-[rgb(22_22_21/18%)] dark:bg-[rgb(0_0_0/45%)]"
        onClick={closePalette}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-label={t('Search')}
        className="fixed top-[12vh] left-1/2 z-[1] w-[min(560px,calc(100vw-32px))] -translate-x-1/2 rounded-[10px] bg-surface p-2 shadow-pop"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closePalette();
            return;
          }
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          e.preventDefault();
          const items = [...(ref.current?.querySelectorAll<HTMLElement>('input, [data-mi]') ?? [])];
          const i = items.indexOf(document.activeElement as HTMLElement);
          items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
        }}
      >
        <input
          id="pal"
          className="h-11 w-full rounded-lg border-0 bg-fill px-3 text-ink type-body"
          placeholder={t('Search tasks, projects, people and resources')}
          autoComplete="off"
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
          }}
          onKeyDown={(e) => {
            const h = hits[0];
            if (e.key === 'Enter' && h) {
              e.preventDefault();
              pick(h);
            }
          }}
        />
        <div className="mt-1.5 grid max-h-[50vh] gap-0.5 overflow-auto">
          {hits.length ? (
            hits.map((h) => (
              <MenuItem
                key={h.key}
                onSelect={() => {
                  pick(h);
                }}
                extra={<small>{h.sub}</small>}
              >
                {h.label}
              </MenuItem>
            ))
          ) : (
            <div className="px-2.5 py-3 text-d13h text-mute">{t('No matches.')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommandPalette() {
  const open = useUi((u) => u.palette);
  return open ? <Body /> : null;
}
