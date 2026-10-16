/* Resource rows (owner, 6 Oct round 4): one fixed icon column; the name opens the thing itself (the site, the page, the folder);
   anywhere else on the row opens its details in the side panel. Double-click a folder to open it. Drag a row onto a folder to
   move it. From screens/plan.js resRow, resOpen, resMeta. */
import { useRef, type DragEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { AvatarBubbles } from '@/components/shared/Avatar';
import { openMenu } from '@/components/shared/menus';
import { IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { State } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import type { Resource } from '@/types/workspace';
import { KIND, refInfo } from '../services/links';
import { moveResource, resLinks, resMeta } from '../services/resources';
import { ResourceTile } from './Tiles';

export const DRAG_TYPE = 'text/x-res';

/** Opens the details panel for a resource. */
export const openDetails = (id: string) => {
  setUi((u) => {
    u.menu = null;
    u.form = null;
    u.insp = { type: 'res', id };
  });
};

/** Opens a folder: inside a project's Resources tab it is that project's folder, elsewhere the workspace's. */
export function openFolder(id: string | null, inProject: boolean) {
  setUi((u) => {
    u.menu = null;
    u.insp = null;
    if (inProject) u.pfolder = id;
    else {
      u.folder = id;
      u.rq = '';
    }
  });
}

/** What the name does: folders open, links go to their site or record, project briefs go to the project, notes open details. */
export function useOpenResource(inProject: boolean) {
  const db = useWorkspace((w) => w);
  return (r: Resource) => {
    if (r.kind === 'folder') {
      openFolder(r.id, inProject);
      return;
    }
    if (r.kind === 'link' && r.ref) {
      const info = refInfo(db, r.ref);
      if (info) info.open();
      else openDetails(r.id);
      return;
    }
    if (r.kind === 'link') {
      if (r.url.startsWith('https://')) window.open(r.url, '_blank', 'noopener');
      return;
    }
    openDetails(r.id);
  };
}

export function ResourceRow({
  r,
  showProject = false,
  inProject = false,
}: {
  r: Resource;
  showProject?: boolean;
  inProject?: boolean;
}) {
  const selected = useUi((u) => u.insp?.type === 'res' && u.insp.id === r.id);
  const open = useOpenResource(inProject);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const last = useRef(0);
  const linked = useWorkspace((db) => resLinks(db, r).length);
  const issues = r.reports.filter((x) => (x as { state: string }).state === 'open').length;
  const meta = useWorkspace((db) => resMeta(db, r));
  const adder = useWorkspace((db) => db.people.find((p) => p.id === r.createdBy)?.first ?? '');
  const projName = useWorkspace((db) => (r.project ? (db.projects.find((p) => p.id === r.project)?.name ?? '') : ''));
  const refOk = useWorkspace((db) => (r.kind === 'link' && r.ref ? !!refInfo(db, r.ref) : true));

  // The first click re-renders the row, so a native dblclick may never arrive: detect the second click ourselves.
  const click = () => {
    const now = Date.now();
    const dbl = now - last.current < 450;
    last.current = dbl ? 0 : now;
    clearTimeout(timer.current);
    if (dbl) {
      open(r);
      return;
    }
    if (r.kind === 'folder' || r.kind === 'link') {
      timer.current = setTimeout(() => {
        openDetails(r.id);
      }, 260);
      return;
    }
    openDetails(r.id);
  };

  const nameClass = 'font-[550] text-ink no-underline hover:underline';
  const name: ReactNode =
    r.kind === 'link' && !r.ref ? (
      <a
        className={nameClass}
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {r.name}
      </a>
    ) : r.brief ? (
      <Link
        className={nameClass}
        to={`/projects/${r.project ?? ''}`}
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {r.name}
      </Link>
    ) : (
      <a
        className={cn(nameClass, 'cursor-pointer')}
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          clearTimeout(timer.current);
          open(r);
        }}
      >
        {r.name}
      </a>
    );

  const dragStart = (e: DragEvent) => {
    e.dataTransfer.setData(DRAG_TYPE, r.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const folderProps =
    r.kind === 'folder'
      ? {
          onDragOver: (e: DragEvent<HTMLDivElement>) => {
            if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
            e.preventDefault();
            e.currentTarget.dataset.over = '1';
          },
          onDragLeave: (e: DragEvent<HTMLDivElement>) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) delete e.currentTarget.dataset.over;
          },
          onDrop: (e: DragEvent<HTMLDivElement>) => {
            if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
            e.preventDefault();
            delete e.currentTarget.dataset.over;
            const id = e.dataTransfer.getData(DRAG_TYPE);
            if (id && id !== r.id) void moveResource(id, r.id);
          },
        }
      : {};

  if (!refOk && r.kind === 'link' && r.ref) return null;
  return (
    <div
      className={cn(
        'group/row grid min-h-14 cursor-pointer grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-x-3 rounded-ctl px-3 py-2 hover:bg-hover max-[760px]:min-h-[60px]',
        'data-[over]:bg-green-soft data-[over]:shadow-[inset_0_0_0_1.5px_var(--green)] [&.dragging]:opacity-45',
        selected && 'bg-sel hover:bg-sel',
      )}
      role="button"
      tabIndex={0}
      data-kind={r.kind}
      draggable
      aria-label={`${t(KIND[r.kind][0])}: ${r.name}`}
      onClick={click}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          openDetails(r.id);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setUi((u) => {
          u.menu = {
            type: 'res',
            id: r.id,
            est: 300,
            width: 248,
            rect: {
              x: e.clientX,
              y: e.clientY,
              top: e.clientY,
              right: e.clientX,
              bottom: e.clientY,
              left: e.clientX,
              width: 0,
              height: 0,
            },
          };
        });
      }}
      onDragStart={(e) => {
        dragStart(e);
        e.currentTarget.classList.add('dragging');
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('dragging');
      }}
      {...folderProps}
    >
      <span className="grid size-9 place-items-center">
        <ResourceTile r={r} size="row" />
      </span>
      <div className="grid min-w-0 gap-px">
        {name}
        <small className="truncate text-d12h text-mute">
          {meta}, {t('added by {who}', { who: adder })}
          {showProject && projName ? `, ${projName}` : ''}
        </small>
      </div>
      <span className="inline-flex items-center gap-3">
        {issues > 0 && <State label={t('Cannot open')} icon="warning" tone="danger" />}
        {linked > 0 && (
          <span
            className="inline-flex items-center gap-1 text-d12 text-mute type-num"
            title={plural(linked, '{n} linked task', '{n} linked tasks')}
          >
            <Icon name="tasks" size="xs" />
            {linked}
          </span>
        )}
        <AvatarBubbles ids={[r.owner, ...r.contributors]} size="xs" className="max-[760px]:hidden" />
        <IconButton
          aria-haspopup="menu"
          aria-label={t('Actions for {name}', { name: r.name })}
          onClick={(e) => {
            e.stopPropagation();
            openMenu(e.currentTarget, { type: 'res', id: r.id, alignRight: true, est: 300 });
          }}
        >
          <Icon name="more" />
        </IconButton>
      </span>
    </div>
  );
}
