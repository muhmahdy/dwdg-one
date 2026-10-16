/* "Part of {program}" on a project or operation header, with the menu to change it, and the menus to place items from the program
   page. From screens/plan.js pgChip, MENUS.pgplace, MENUS.pgpick. */
import { Link } from 'react-router';
import type { MenuRef } from '@/app/ui-state';
import { LineGlyph } from '@/components/shared/art/task-icons';
import { ProgramObject, ProjectObject, RoutineObject } from '@/components/shared/art/objects';
import { MENUS, MenuHeading, MenuItem, Tick, closeMenu, openMenu } from '@/components/shared/menus';
import { IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { Program, Project, Routine } from '@/types/workspace';
import { pgDivs } from '@/features/collaboration/services/collaboration';
import { PG_D, canPlace, itemDiv, pgItem, pgOf, setProgram, type PgKind } from '../services/programs';

export function ProgramChip({ kind, x }: { kind: PgKind; x: Project | Routine }) {
  const me = useMe();
  const g = useWorkspace((db) => pgOf(db, x.program));
  const can = useWorkspace((db) => !!me && canPlace(db, me, kind, x, g));
  const any = useWorkspace((db) => (db.programs ?? []).some((v) => pgDivs(v).includes(itemDiv(kind, x) as never)));
  const id = `${kind}:${x.id}`;
  if (g)
    return (
      <span className="inline-flex items-center gap-1.5 text-d13 text-ink-2">
        <ProgramObject program={g} size="xs" />
        <span>
          {t('Part of')}{' '}
          <Link
            className="font-semibold text-ink no-underline hover:underline hover:underline-offset-[3px]"
            to={`/programs/${g.id}`}
          >
            {g.name}
          </Link>
        </span>
        {can && (
          <IconButton
            className="size-6"
            aria-label={t('Change program')}
            onClick={(e) => {
              openMenu(e.currentTarget, { type: 'pgplace', id });
            }}
          >
            <Icon name="chevron-down" size="xs" />
          </IconButton>
        )}
      </span>
    );
  if (!(can && any && !(kind === 'routine' && (x as Routine).personal))) return null;
  return (
    <button
      type="button"
      aria-haspopup="menu"
      className="inline-flex h-[26px] cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent pr-2.5 pl-2 text-d12h text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)] hover:text-ink [&_.ic]:size-3.5"
      onClick={(e) => {
        openMenu(e.currentTarget, { type: 'pgplace', id });
      }}
    >
      <LineGlyph d={PG_D} />
      {t('Add to a program')}
    </button>
  );
}

function PlaceMenu({ menu }: { menu: MenuRef }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const { k, x } = pgItem(db, menu.id ?? '');
  if (!x || !me) return null;
  const gs = (db.programs ?? []).filter((g) => pgDivs(g).includes(itemDiv(k, x) as never) && canPlace(db, me, k, x, g));
  const pick = (g: string | null) => {
    closeMenu();
    void setProgram(menu.id ?? '', g);
  };
  return (
    <>
      <MenuHeading>{t('Program')}</MenuHeading>
      {gs.map((g) => (
        <MenuItem
          key={g.id}
          role="menuitemradio"
          on={x.program === g.id}
          icon={<ProgramObject program={g} size="xs" />}
          extra={x.program === g.id ? <Tick /> : null}
          onSelect={() => {
            pick(g.id);
          }}
        >
          {g.name}
        </MenuItem>
      ))}
      <MenuItem
        role="menuitemradio"
        on={!x.program}
        extra={!x.program ? <Tick /> : null}
        onSelect={() => {
          pick(null);
        }}
      >
        {t('Not in a program')}
      </MenuItem>
    </>
  );
}

/** Picking children from the program page: what this person may place, from the program's divisions, not yet in another program. */
function PickMenu({ menu }: { menu: MenuRef }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const g: Program | undefined = pgOf(db, menu.id);
  const k = (menu.k as PgKind | undefined) ?? 'project';
  if (!g || !me) return null;
  const xs: (Project | Routine)[] =
    k === 'project'
      ? db.projects.filter((p) => pgDivs(g).includes(p.div) && !p.program && canPlace(db, me, 'project', p, g))
      : (db.routines ?? []).filter(
          (r) =>
            !r.personal && !!r.unit && pgDivs(g).includes(r.unit) && !r.program && canPlace(db, me, 'routine', r, g),
        );
  if (!xs.length)
    return (
      <div className="px-2.5 py-3.5 text-d13h text-mute">
        {k === 'project'
          ? t('No other projects of this division can be added.')
          : t('No other operations of this division can be added.')}
      </div>
    );
  return (
    <>
      {xs.map((x) => (
        <MenuItem
          key={x.id}
          icon={
            k === 'project' ? (
              <ProjectObject project={x as Project} size="sm" />
            ) : (
              <RoutineObject routine={x as Routine} size="sm" />
            )
          }
          onSelect={() => {
            closeMenu();
            void setProgram(`${k}:${x.id}`, g.id);
          }}
        >
          {x.name}
        </MenuItem>
      ))}
    </>
  );
}

MENUS.pgplace = PlaceMenu;
MENUS.pgpick = PickMenu;
