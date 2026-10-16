/* The project's Links (resource_explorer): app-style tiles for files and pages, outside and inside dwdg’ONE. Each is a link
   resource of the project. From screens/plan.js linksSection. */
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { LinkTile, RefTile } from '@/features/resources/components/Tiles';
import { host, provOf, refInfo } from '@/features/resources/services/links';
import { addProjectLink, projLinks } from '@/features/resources/services/resources';
import type { Project, Resource } from '@/types/workspace';
import { LinkResults } from './BriefSection';

const tile =
  'flex min-h-[60px] cursor-pointer items-center gap-3 rounded-sheet border-0 bg-surface-2 px-3 py-2.5 text-left font-[inherit] text-inherit hover:bg-hover';

function LinkTileButton({ r }: { r: Resource }) {
  const info = useWorkspace((db) => (r.ref ? refInfo(db, r.ref) : null));
  const pv = provOf(r.url);
  if (r.ref && !info) return null;
  const open = () => {
    if (info) info.open();
    else if (r.url.startsWith('https://')) window.open(r.url, '_blank', 'noopener');
  };
  return (
    <div
      className={tile}
      role="link"
      tabIndex={0}
      title={r.purpose || r.name}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter') open();
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
    >
      {r.ref ? <RefTile target={r.ref} /> : <LinkTile url={r.url} />}
      <span className="min-w-0 flex-1">
        <b className="block truncate text-d13h font-semibold">{r.name}</b>
        <small className="block text-d12 text-mute">{info ? info.sub : (pv?.name ?? host(r.url))}</small>
      </span>
      {!info && <Icon name="external" size="xs" className="text-mute" />}
    </div>
  );
}

function AddLink({ p }: { p: Project }) {
  const [q, setQ] = useState('');
  const [name, setName] = useState('');
  return (
    <div className="col-span-full my-2.5 grid gap-2 rounded-[10px] bg-surface-2 p-3 shadow-[inset_0_0_0_1px_var(--line)]">
      <input
        className={inputClass}
        placeholder={t('Paste https:// link, or search a task, meeting, resource or project')}
        autoComplete="off"
        autoFocus
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
      />
      <input
        className={inputClass}
        placeholder={t('Name, optional')}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <LinkResults
        p={p}
        q={q.trim()}
        onPick={(target) => {
          void addProjectLink(p.id, target, name);
        }}
      />
      <div>
        <Button
          small
          variant="ghost"
          onClick={() => {
            setUi((u) => {
              u.form = null;
            });
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

export function LinksSection({ p, edit }: { p: Project; edit: boolean }) {
  const links = useWorkspace((db) => projLinks(db, p));
  const adding = useUi((u) => u.form === 'plink');
  return (
    <section className="mt-[22px] border-t border-line-strong pt-[18px]">
      <div className="mb-2.5 flex items-center gap-2.5">
        <h2 className="m-0 type-h3">
          {t('Links')} <span className="ml-1 text-mute type-num">{links.length}</span>
        </h2>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-2">
        {links.map((r) => (
          <LinkTileButton key={r.id} r={r} />
        ))}
        {edit &&
          (adding ? (
            <AddLink p={p} />
          ) : (
            <button
              type="button"
              className={cn(tile, 'bg-transparent shadow-[inset_0_0_0_1.5px_var(--line-strong)]')}
              onClick={() => {
                setUi((u) => {
                  u.form = 'plink';
                });
              }}
            >
              <Icon name="plus" className="w-[38px] text-mute" />
              <span className="min-w-0 flex-1">
                <b className="block text-d13h font-semibold">{t('Add link')}</b>
                <small className="block text-d12 text-mute">{t('Drive, Figma, Notion, a page here…')}</small>
              </span>
            </button>
          ))}
      </div>
    </section>
  );
}
