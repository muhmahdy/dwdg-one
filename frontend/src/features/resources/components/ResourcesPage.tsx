/* Resources (resource_explorer, resource_folder, resource_move): the workspace's notes, links and folders. Notes live here;
   files stay in the person's own drives as links. Search, filter by type, open folders, pinned items first. From screens/plan.js
   PAGES.resources and projResources. */
import { type DragEvent, Fragment } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Empty, Page, Rows, SearchField, Toolbar } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { isPinned } from '@/features/pins/services/pins';
import type { Project, Resource, Workspace } from '@/types/workspace';
import { KIND } from '../services/links';
import { moveResource, resOf, sortResources } from '../services/resources';
import { DRAG_TYPE, ResourceRow, openDetails, openFolder } from './ResourceRow';
import { ResourceTile } from './Tiles';

export const ResourcesCrumb = () => {
  const ws = useWs();
  return (
    <>
      {divisionOf(ws)?.short}
      <i className="mx-1.5 text-faint not-italic">/</i>
      <b>{t('Resources')}</b>
    </>
  );
};

export const openNewResource = (
  kind: Resource['kind'],
  project: string | null = null,
  parent: string | null = null,
) => {
  setUi((u) => {
    u.menu = null;
    u.insp = { type: 'new-res', kind, project, parent };
  });
};

const trailOf = (db: Workspace, folder: Resource | undefined) => {
  const trail: Resource[] = [];
  for (let f = folder; f; f = f.parent ? resOf(db, f.parent) : undefined) trail.unshift(f);
  return trail;
};

/** A breadcrumb button that also accepts a dragged row (move it into that folder). */
function CrumbButton({ id, onOpen, children }: { id: string | null; onOpen: () => void; children: string }) {
  return (
    <button
      type="button"
      className="border-0 bg-transparent p-0 text-ink-2 data-[over]:rounded-md data-[over]:bg-green-soft"
      onClick={onOpen}
      onDragOver={(e: DragEvent<HTMLButtonElement>) => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        e.currentTarget.dataset.over = '1';
      }}
      onDragLeave={(e: DragEvent<HTMLButtonElement>) => {
        delete e.currentTarget.dataset.over;
      }}
      onDrop={(e: DragEvent<HTMLButtonElement>) => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        delete e.currentTarget.dataset.over;
        const r = e.dataTransfer.getData(DRAG_TYPE);
        if (r && r !== id) void moveResource(r, id);
      }}
    >
      {children}
    </button>
  );
}

const Breadcrumb = ({ trail, root, inProject }: { trail: Resource[]; root: string; inProject: boolean }) => (
  <nav className="mt-1.5 flex min-w-0 items-center gap-1.5 text-d13 text-mute" aria-label={t('Folder path')}>
    {trail.length ? (
      <CrumbButton
        id={null}
        onOpen={() => {
          openFolder(null, inProject);
        }}
      >
        {root}
      </CrumbButton>
    ) : (
      <b className="text-ink">{root}</b>
    )}
    {trail.map((f, i) => (
      <Fragment key={f.id}>
        <Icon name="chevron" size="xs" />
        {i === trail.length - 1 ? (
          <b className="text-ink" aria-current="page">
            {f.name}
          </b>
        ) : (
          <CrumbButton
            id={f.id}
            onOpen={() => {
              openFolder(f.id, inProject);
            }}
          >
            {f.name}
          </CrumbButton>
        )}
      </Fragment>
    ))}
  </nav>
);

const NewButtons = ({ project, parent }: { project: string | null; parent: string | null }) => (
  <>
    <Button
      onClick={() => {
        openNewResource('folder', project, parent);
      }}
    >
      <Icon name="folder" />
      {t('Folder')}
    </Button>
    <Button
      onClick={() => {
        openNewResource('note', project, parent);
      }}
    >
      <Icon name="note" />
      {t('Note')}
    </Button>
    <Button
      variant="primary"
      onClick={() => {
        openNewResource('link', project, parent);
      }}
    >
      <Icon name="link" />
      {t('Link')}
    </Button>
  </>
);

const Hint = ({ children }: { children: string }) => <p className="mt-3.5 text-mute type-small">{children}</p>;

export function ResourcesPage() {
  const me = useMe();
  const ws = useWs();
  const q = useUi((u) => ((u.rq as string | undefined) ?? '').toLowerCase());
  const raw = useUi((u) => (u.rq as string | undefined) ?? '');
  const kindFilter = useUi((u) => (u.rkind as string | undefined) ?? 'all');
  const folderId = useUi((u) => u.folder);
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const all = db.resources.filter((r) => r.div === ws && !r.archived);
  const folder = folderId ? resOf(db, folderId) : undefined;
  const trail = trailOf(db, folder);
  const kindOk = (r: Resource) => kindFilter === 'all' || r.kind === kindFilter;
  const div = divisionOf(ws);
  const rows = (rs: Resource[], opt: { project?: boolean } = {}) =>
    rs.length ? rs.map((r) => <ResourceRow key={r.id} r={r} showProject={!!opt.project} />) : null;
  let body;
  if (q) {
    const hits = sortResources(
      all.filter(
        (r) =>
          kindOk(r) &&
          (r.name.toLowerCase().includes(q) ||
            r.purpose.toLowerCase().includes(q) ||
            (r.kind === 'note' && r.body.toLowerCase().includes(q))),
      ),
    );
    body = (
      <>
        <SectionHeading as="h2" count={hits.length}>
          {t('Results')}
        </SectionHeading>
        <Rows>{rows(hits, { project: true }) ?? <Empty title={t('Nothing matches.')} />}</Rows>
      </>
    );
  } else if (folder) {
    const items = sortResources(all.filter((r) => r.parent === folder.id && kindOk(r)));
    body = (
      <>
        {folder.purpose && <p className="mt-3 mb-1 max-w-[72ch] text-ink-2">{folder.purpose}</p>}
        <Rows>
          {rows(items) ?? (
            <Empty title={t('This folder is empty')}>{t('Add a note or a link to a file in your drive.')}</Empty>
          )}
        </Rows>
      </>
    );
  } else {
    const pinned = all.filter((r) => isPinned(db, me, 'res', r.id) && kindOk(r));
    const root = sortResources(all.filter((r) => !r.parent && !r.project && kindOk(r)));
    const byProj = db.projects
      .filter((p) => p.div === ws)
      .map((p): [Project, Resource[]] => [
        p,
        sortResources(all.filter((r) => r.project === p.id && !r.parent && kindOk(r))),
      ])
      .filter(([, rs]) => rs.length);
    body = (
      <>
        {pinned.length > 0 && (
          <>
            <SectionHeading as="h2">{t('Pinned')}</SectionHeading>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
              {pinned.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="flex items-center gap-3 rounded-[10px] border-0 bg-surface-2 px-3 py-2.5 text-left hover:bg-hover"
                  onClick={() => {
                    openDetails(r.id);
                  }}
                >
                  <ResourceTile r={r} large />
                  <span>
                    <b className="block text-d13h font-semibold">{r.name}</b>
                    <small className="text-d12 text-mute">{t(KIND[r.kind][0])}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
        <SectionHeading as="h2">{t('Workspace')}</SectionHeading>
        <Rows>{rows(root) ?? <div className="px-2.5 py-3 text-d13h text-mute">{t('Nothing here yet.')}</div>}</Rows>
        {byProj.map(([p, rs]) => (
          <Fragment key={p.id}>
            <SectionHeading as="h2" count={rs.length}>
              <Link to={`/projects/${p.id}/resources`} className="no-underline">
                {p.name}
              </Link>
            </SectionHeading>
            <Rows>{rows(rs)}</Rows>
          </Fragment>
        ))}
      </>
    );
  }
  return (
    <Page wide data-page="resources">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
        <div className="min-w-0">
          <h1 className="m-0 type-title comfortable:tracking-[-0.01em]">{t('Resources')}</h1>
          {folder ? (
            <Breadcrumb trail={trail} root={div?.short ?? ''} inProject={false} />
          ) : (
            <p className="mt-1 mb-0 text-d13h text-mute">
              {t('{d}. Notes live here; files stay in your own drives as links.', { d: div?.name ?? '' })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NewButtons project={null} parent={folder?.id ?? null} />
        </div>
      </div>
      <Toolbar>
        <SearchField
          label={t('Search resources')}
          value={raw}
          onChange={(e) => {
            const v = e.target.value;
            setUi((u) => {
              u.rq = v;
            });
          }}
        />
        <Segmented
          value={kindFilter}
          label={t('Type')}
          options={[
            ['all', t('All')],
            ['folder', t('Folders')],
            ['note', t('Notes')],
            ['link', t('Links')],
          ]}
          onChange={(k) => {
            setUi((u) => {
              u.rkind = k;
            });
          }}
        />
      </Toolbar>
      {body}
      <Hint>
        {t(
          'Right-click a row, or use its ⋯ button, for actions. Avatars show who is responsible; they never change who can open a file in Drive.',
        )}
      </Hint>
    </Page>
  );
}

/** The project's Resources tab: its own folders and files. */
export function ProjectResources({ p }: { p: Project }) {
  const db = useWorkspace((w) => w);
  const id = useUi((u) => u.pfolder as string | null | undefined);
  const f0 = id ? resOf(db, id) : undefined;
  const folder = f0?.project === p.id && !f0.archived ? f0 : undefined;
  const trail = trailOf(db, folder);
  const res = db.resources.filter((r) => r.project === p.id && !r.archived);
  const items = sortResources(res.filter((r) => (r.parent ?? null) === (folder ? folder.id : null)));
  return (
    <>
      <Toolbar className={cn('items-center')}>
        <Breadcrumb trail={trail} root={t('All resources')} inProject />
        <span className="flex-1" />
        <NewButtons project={p.id} parent={folder?.id ?? null} />
      </Toolbar>
      {folder?.purpose && <p className="mt-3 mb-1 max-w-[72ch] text-ink-2">{folder.purpose}</p>}
      <Rows>
        {items.length ? (
          items.map((r) => <ResourceRow key={r.id} r={r} inProject />)
        ) : folder ? (
          <Empty title={t('This folder is empty')}>
            {t('Add a note or a link here, or drag items onto the folder.')}
          </Empty>
        ) : (
          <div className="px-2.5 py-3.5 text-d13h text-mute">{t('No resources linked to this project yet.')}</div>
        )}
      </Rows>
      <Hint>
        {t(
          'Click a row for details; double-click it, or click its name, to open it. Drag a row onto a folder to move it. Files stay in your own drives.',
        )}
      </Hint>
    </>
  );
}
