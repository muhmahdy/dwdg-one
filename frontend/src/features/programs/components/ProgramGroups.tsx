/* Register groups (Group by program): each program with its period, owner and counts, then everything not in a program. Used by
   the Projects and Operations registers. From screens/plan.js pgGroups, pgByOn, pgToggle. */
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { Avatar } from '@/components/shared/Avatar';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgramObject } from '@/components/shared/art/objects';
import { plural, t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { useSession, useWorkspace } from '@/lib/workspace/hooks';
import type { DivisionId, Program } from '@/types/workspace';
import { pgPeriod, pgStats } from '../services/programs';

export const useGroupByProgram = (k: 'projects' | 'operations') =>
  useSession((s) => !!(s.pgBy as Record<string, boolean> | undefined)?.[k]);

export const toggleGroupByProgram = (k: 'projects' | 'operations') =>
  setSession((s) => ({
    ...s,
    pgBy: {
      ...(s.pgBy ?? {}),
      [k]: !(s.pgBy as Record<string, boolean> | undefined)?.[k],
    },
  }));

function GroupHead({ g, w }: { g: Program; w: DivisionId }) {
  const s = useWorkspace((db) => pgStats(db, g));
  const first = useWorkspace((db) => db.people.find((p) => p.id === g.owner)?.first ?? '');
  return (
    <div className="mb-3 flex items-center gap-3.5 max-[760px]:flex-wrap">
      <Link
        to={`/programs/${g.id}`}
        className="flex min-w-0 items-center gap-3 text-inherit no-underline [&:hover_b]:underline [&:hover_b]:underline-offset-[3px]"
      >
        <ProgramObject program={g} size="sm" />
        <span className="grid min-w-0">
          <b className="text-d15 font-[650]">{g.name}</b>
          <small className="flex items-center gap-1.5 text-d12 text-mute">
            <Avatar id={g.owner} size="xs" />
            {first}, {pgPeriod(g)}
            {g.div !== w ? `, ${divisionOf(g.div)?.short ?? ''}` : ''}
          </small>
        </span>
      </Link>
      <span className="ml-auto text-d12h whitespace-nowrap text-mute max-[760px]:ml-0">
        {plural(s.ps.length, '{n} project', '{n} projects')}, {plural(s.rs.length, '{n} operation', '{n} operations')}
      </span>
      <Link to={`/programs/${g.id}`} className={buttonClass('ghost', true, 'no-underline')}>
        {t('Open program')}
        <Icon name="right" size="xs" />
      </Link>
    </div>
  );
}

export function ProgramGroups<T extends { id: string; program?: string | null | undefined }>({
  items,
  kind,
  block,
  w,
}: {
  items: T[];
  kind: 'project' | 'routine';
  block: (items: T[]) => ReactNode;
  w: DivisionId;
}) {
  const gs = useWorkspace((db) => {
    const ids = new Set(items.flatMap((x) => (x.program ? [x.program] : [])));
    return (db.programs ?? [])
      .filter((g) => ids.has(g.id) || g.div === w)
      .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
  });
  const rest = items.filter((x) => !x.program || !gs.some((g) => g.id === x.program));
  return (
    <>
      {gs.map((g) => {
        const kids = items.filter((x) => x.program === g.id);
        return (
          <section key={g.id} className="mb-[18px] not-first:border-t not-first:border-line not-first:pt-4">
            <GroupHead g={g} w={w} />
            {kids.length ? (
              block(kids)
            ) : (
              <p className="mb-1 ml-[46px] text-mute type-small">
                {kind === 'project' ? t('No projects here in this view.') : t('No operations here in this view.')}
              </p>
            )}
          </section>
        );
      })}
      {rest.length > 0 && (
        <section className="mb-[18px] not-first:border-t not-first:border-line not-first:pt-4">
          <div className="mb-3 flex items-center gap-3.5 text-d13 text-ink-2">
            <b className="font-[650]">{t('Not in a program')}</b>
            <span className="ml-auto text-d12h text-mute">{rest.length}</span>
          </div>
          {block(rest)}
        </section>
      )}
    </>
  );
}
