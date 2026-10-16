/* Who is working on something, at a glance: a stack of faces (joined people, lead first) and the divisions involved. Used on
   project headers, cards and rows, and on programs and operations. From screens/people.js faceStack, divChips, cpGlance. */
import { divisionOf } from '@/app/config/org';
import { Avatar } from '@/components/shared/Avatar';
import { BrandIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { DivisionId, PersonId, Program, Project, Routine } from '@/types/workspace';
import { cpDivs, cpFaces, divName, type CpKind } from '../services/collaboration';

export function FaceStack({ ids, n = 4 }: { ids: PersonId[]; n?: number }) {
  const names = useWorkspace((db) => ids.map((i) => db.people.find((p) => p.id === i)?.name ?? '').join(', '));
  if (!ids.length) return null;
  return (
    <span className="inline-flex align-middle" title={names}>
      {ids.slice(0, n).map((i, k) => (
        <Avatar
          key={i}
          id={i}
          size="xs"
          className={cn('size-6 shadow-[0_0_0_2px_var(--surface)]', k > 0 && '-ml-[7px]')}
        />
      ))}
      {ids.length > n && (
        <span className="av -ml-[7px] inline-grid size-6 place-items-center rounded-full bg-surface-2 text-d11 font-semibold text-ink-2 shadow-[0_0_0_2px_var(--surface)]">
          +{ids.length - n}
        </span>
      )}
    </span>
  );
}

/** The divisions involved, home first; nothing when only one division is involved. */
export function DivChips({ ds, className }: { ds: DivisionId[]; className?: string }) {
  if (ds.length < 2) return null;
  return (
    <span className={cn('inline-flex flex-wrap gap-1 align-middle', className)}>
      {ds.map((d, i) => (
        <span
          key={d}
          title={divisionOf(d)?.name ?? ''}
          className={cn(
            'inline-flex h-[22px] items-center gap-1 rounded-[11px] pr-[7px] pl-[5px] text-d12h font-medium text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)]',
            i === 0 && 'text-ink',
          )}
        >
          <BrandIcon id={divisionOf(d)?.icon ?? ''} label={false} className="size-[13px]" />
          {divName(d)}
        </span>
      ))}
    </span>
  );
}

export function CpGlance({ kind, x }: { kind: CpKind; x: Project | Routine | Program }) {
  const faces = useWorkspace((db) => cpFaces(db, kind, x));
  const divs = useWorkspace((db) => cpDivs(db, kind, x));
  return (
    <>
      <FaceStack ids={faces} />
      <DivChips ds={divs} />
    </>
  );
}

export const PersonName = ({ id }: { id: PersonId | null | undefined }) => {
  const n = useWorkspace((db) => db.people.find((p) => p.id === id)?.first ?? '');
  return <>{n}</>;
};

/** "Not available to you": the neutral page for a record outside the viewer's workspace (flow-vp-scope 4). */
export const unavailableText = () => t('This page is not available to you');
