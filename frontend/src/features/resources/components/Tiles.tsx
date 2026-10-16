/* Tiles for resources and links (owner, 6 Oct round 4): a soft squircle with a light rim, in the manner of Samsung One UI icons,
   carrying the site's own favicon; a site without one gets a round web glyph. The prototype asks Google's favicon service for the
   site address only; the real build fetches and caches favicons on the server so link addresses never leave dwdg’ONE (R7). */
import { useState, type ReactNode } from 'react';
import { ProjectObject, ResourceShape } from '@/components/shared/art/objects';
import { Icon } from '@/components/ui/Icon';
import { pal } from '@/lib/art/identity';
import { hash } from '@/lib/art/identity';
import { PALS } from '@/lib/art/identity';
import { cn } from '@/lib/cn';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { EntityRef, Resource } from '@/types/workspace';
import { GLOBE, favKey, googleFavicon, host, ownFavicon, provOf, refInfo, siteFavicon } from '../services/links';

type Fav = 'none' | { src: string; small: boolean };
const FAV: Record<string, Fav> = {};

const SQ_SIZE = { sm: 'size-7', md: 'size-10', lg: 'size-[46px]', row: 'size-8', pin: 'size-5' } as const;
export type SqSize = keyof typeof SQ_SIZE;

const sqClass = (size: SqSize) =>
  cn(
    'relative inline-grid flex-none place-items-center overflow-hidden rounded-[31%] text-ink-2',
    'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--tint,var(--fill))_30%,#fff),color-mix(in_srgb,var(--tint,var(--fill))_72%,#fff))]',
    'shadow-[0_0_0_0.5px_rgb(22_22_21/14%),0_1px_2px_rgb(22_22_21/12%)]',
    'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--tint,var(--fill))_46%,#3a3a37),color-mix(in_srgb,var(--tint,var(--fill))_22%,#262624))] dark:shadow-[0_0_0_0.5px_rgb(0_0_0/50%),0_1px_2px_rgb(0_0_0/40%)]',
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:content-[''] after:[background:linear-gradient(180deg,rgb(255_255_255/95%),rgb(255_255_255/25%)_45%,rgb(0_0_0/7%))] after:[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)] dark:after:[background:linear-gradient(180deg,rgb(255_255_255/32%),rgb(255_255_255/6%)_45%,rgb(0_0_0/20%))]",
    SQ_SIZE[size],
  );

const Glyph = ({ d, className }: { d: string; className?: string }) => (
  <svg
    className={cn('ic', className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);
export { Glyph };

/** The favicon: Google's service first, then the site's own file, then Google's small icon, then nothing. */
function Favicon({ k, own, onNone }: { k: string; own: string | undefined; onNone: () => void }) {
  const cached = FAV[k];
  const [stage, setStage] = useState<'google' | 'own' | 'small'>(
    cached && cached !== 'none' && cached.small ? 'small' : 'google',
  );
  const [gbad, setGbad] = useState(false);
  const [done, setDone] = useState(!!cached && cached !== 'none');
  const src =
    cached && cached !== 'none'
      ? cached.src
      : stage === 'google'
        ? (own ?? googleFavicon(k))
        : stage === 'own'
          ? siteFavicon(k)
          : googleFavicon(k);
  const finish = (img: HTMLImageElement, small: boolean) => {
    FAV[k] = { src: img.src, small };
    setDone(true);
  };
  const none = () => {
    FAV[k] = 'none';
    onNone();
  };
  const toSmall = () => {
    setStage('small');
  };
  const loaded = (img: HTMLImageElement) => {
    if (done) return;
    if (stage === 'small') {
      finish(img, true);
      return;
    }
    if (stage === 'own') {
      if (!img.naturalWidth) {
        if (gbad) none();
        else toSmall();
        return;
      }
      finish(img, img.naturalWidth < 24);
      return;
    }
    if (img.naturalWidth > 16 || own) {
      finish(img, false);
      return;
    }
    setStage('own'); // the service answers a missing favicon with a 16 px default
  };
  const failed = () => {
    if (done) return;
    if (stage === 'small') {
      none();
      return;
    }
    if (stage === 'own') {
      if (gbad) none();
      else toSmall();
      return;
    }
    if (own || !siteFavicon(k)) {
      none();
      return;
    }
    setGbad(true);
    setStage('own');
  };
  return (
    <img
      key={stage}
      className={cn(
        'size-[56%] rounded-[18%] object-contain [filter:drop-shadow(0_0.5px_0.5px_rgb(22_22_21/18%))]',
        stage === 'small' && 'size-4 rounded-[3px]',
      )}
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      draggable={false}
      onLoad={(e) => {
        loaded(e.currentTarget);
      }}
      onError={failed}
    />
  );
}

export function LinkTile({ url, size = 'md', className }: { url: string; size?: SqSize; className?: string }) {
  const own = ownFavicon(url);
  const k = own ? `own:${own}` : favKey(url);
  const pv = provOf(url);
  const c = PALS[pv ? pv.pal : Math.floor(hash(`fav:${k}`) * PALS.length)] ?? pal(0);
  const [missing, setMissing] = useState(!k || FAV[k] === 'none');
  return (
    <span
      className={cn(sqClass(size), className)}
      style={{ ['--tint' as string]: c[3] }}
      role="img"
      aria-label={pv ? pv.name : host(url)}
    >
      {!missing && (
        <Favicon
          k={k.startsWith('own:') ? k.slice(4) : k}
          own={own}
          onNone={() => {
            setMissing(true);
          }}
        />
      )}
      {missing && (
        <span className="grid size-[62%] place-items-center rounded-full bg-[rgb(255_255_255/70%)] text-ink-2 shadow-[inset_0_0_0_1px_rgb(22_22_21/10%)] dark:bg-[rgb(255_255_255/14%)] dark:text-ink">
          <Glyph d={GLOBE} className="size-[64%]" />
        </span>
      )}
    </span>
  );
}

/** A record inside dwdg’ONE: its own mark in a neutral squircle. */
export function RefTile({ target, size = 'md' }: { target: EntityRef; size?: SqSize }) {
  const info = useWorkspace((db) => refInfo(db, target));
  const project = useWorkspace((db) =>
    target.type === 'project' ? db.projects.find((p) => p.id === target.id) : undefined,
  );
  const resource = useWorkspace((db) =>
    target.type === 'resource' ? db.resources.find((r) => r.id === target.id) : undefined,
  );
  if (!info) return null;
  if (resource) return <ResourceTile r={resource} />;
  return (
    <span className={cn(sqClass(size), '[--tint:var(--fill)]')}>
      {project ? (
        <ProjectObject
          project={project}
          size="xs"
          className="h-1/2 w-[62%] [filter:drop-shadow(0_0.5px_0.5px_rgb(22_22_21/20%))]"
        />
      ) : (
        <Icon name={info.kind === 'task' ? 'tasks' : 'calendar'} className="size-1/2" />
      )}
    </span>
  );
}

/** A resource's tile: a link shows its site's favicon (or the record it points to), a note or folder its silhouette. */
export function ResourceTile({ r, size, large = false }: { r: Resource; size?: SqSize; large?: boolean }): ReactNode {
  const refOk = useWorkspace((db) => (r.ref ? !!refInfo(db, r.ref) : false));
  if (r.kind === 'link' && r.ref && refOk) return <RefTile target={r.ref} size={size ?? (large ? 'lg' : 'row')} />;
  if (r.kind === 'link' && r.url) return <LinkTile url={r.url} size={size ?? (large ? 'lg' : 'row')} />;
  return <ResourceShape resource={r} large={large} />;
}
