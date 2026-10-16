/* The picture on a project, program or operation header, with its small edit button, and the picker panel it opens. */
import type { ReactNode } from 'react';
import type { InspectorRef } from '@/app/ui-state';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { IdentityTile } from '@/components/shared/art/IdentityTile';
import { ProgramObject, ProjectObject, RoutineObject } from '@/components/shared/art/objects';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { FAMILIES, PALS, famMode, pal } from '@/lib/art/identity';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import type { Program, Project, Routine } from '@/types/workspace';
import { canEditLook, lookItem, setLook, type LookKind } from '../services/looks';

function Art({ k, x, size }: { k: LookKind; x: Project | Program | Routine; size: 'hero' }) {
  if (k === 'project') return <ProjectObject project={x as Project} size={size} />;
  if (k === 'program') return <ProgramObject program={x as Program} size={size} />;
  return <RoutineObject routine={x as Routine} size={size} />;
}

/** The art, with a small button to change it when the viewer may. */
export function ArtEdit({
  kind,
  x,
  children,
}: {
  kind: LookKind;
  x: Project | Program | Routine;
  children: ReactNode;
}) {
  const me = useMe();
  const can = useWorkspace((db) => !!me && canEditLook(db, me, kind, x));
  if (!can) return <>{children}</>;
  return (
    <span className="relative inline-flex flex-none" data-art-host="">
      {children}
      <button
        type="button"
        className="absolute -top-1.5 -right-1.5 z-[2] grid size-[26px] cursor-pointer place-items-center rounded-full border-0 bg-surface p-0 text-ink-2 shadow-[0_0_0_1px_var(--line),0_2px_6px_rgb(22_22_21/16%)] transition-transform duration-150 hover:scale-[1.08] hover:text-ink [&_.ic]:size-3.5"
        aria-label={t('Change picture')}
        title={t('Change picture')}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setUi((u) => {
            u.insp = { type: 'look-pick', k: kind, id: x.id };
            u.form = null;
          });
        }}
      >
        <Icon name="sparkles" size="xs" />
      </button>
    </span>
  );
}

function LookPicker({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const k = insp.k as LookKind;
  const db = useWorkspace((w) => w);
  const x = typeof insp.id === 'string' ? lookItem(db, k, insp.id) : undefined;
  if (!me) return null;
  if (!x || !canEditLook(db, me, k, x))
    return (
      <>
        <InspectorHead>{t('Picture')}</InspectorHead>
        <div className="grid gap-2 p-7">
          <b className="type-h3">{t('This is not available to you')}</b>
        </div>
      </>
    );
  const lk = x.look ?? { f: 0, p: 0 };
  const key = `${k}:${x.id}`;
  return (
    <>
      <InspectorHead>{t('Picture')}</InspectorHead>
      <h2 className="mt-3 mb-2 type-h2">{x.name}</h2>
      <div className="mt-1 mb-3 flex items-center gap-3.5">
        <Art k={k} x={x} size="hero" />
        <p className="m-0 text-mute type-small">
          {t(FAMILIES[lk.f] ?? '')}, {t(pal(lk.p)[0])}. {t('The picture stays the same until someone changes it here.')}
        </p>
      </div>
      <div className="mb-1 flex gap-2">
        <Button
          onClick={() => {
            void setLook(k, x.id, { surprise: true });
          }}
        >
          <Icon name="sparkles" />
          {t('Surprise me')}
        </Button>
      </div>
      <SectionHeading count={FAMILIES.length}>{t('Style')}</SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(82px,1fr))] gap-2" data-art-host="">
        {FAMILIES.map((nm, f) => (
          <button
            key={nm}
            type="button"
            aria-pressed={f === lk.f}
            className={cn(
              'grid cursor-pointer justify-items-center gap-[5px] rounded-xl border-0 bg-transparent px-1.5 pt-1.5 pb-[7px] text-d12 leading-[1.2] font-medium text-ink-2 hover:bg-hover',
              f === lk.f && 'bg-surface-2 text-ink shadow-[inset_0_0_0_2px_var(--ink)]',
            )}
            onClick={() => {
              void setLook(k, x.id, { f });
            }}
          >
            <IdentityTile
              seed={key}
              mode={famMode(f)}
              palette={lk.p}
              className="aspect-[1.25] h-auto w-full rounded-[9px]"
            />
            <span>{t(nm)}</span>
          </button>
        ))}
      </div>
      <SectionHeading>{t('Color')}</SectionHeading>
      <div className="mb-2 flex flex-wrap gap-2">
        {PALS.map((c, i) => (
          <button
            key={c[0]}
            type="button"
            aria-pressed={i === lk.p}
            aria-label={t(c[0])}
            title={t(c[0])}
            className={cn(
              'size-[30px] cursor-pointer rounded-full border-0 p-0 shadow-[0_0_0_1px_var(--line)]',
              i === lk.p && 'shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--ink)]',
            )}
            style={{ background: `linear-gradient(135deg, ${c[1]}, ${c[2]})` }}
            onClick={() => {
              void setLook(k, x.id, { p: i });
            }}
          />
        ))}
      </div>
      <div className="mt-[18px] flex gap-2">
        <Button variant="primary" onClick={closeInspector}>
          {t('Done')}
        </Button>
      </div>
    </>
  );
}

PANELS['look-pick'] = LookPicker;
