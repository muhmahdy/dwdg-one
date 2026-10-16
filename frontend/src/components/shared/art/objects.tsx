/* Identity objects (design-resource-identity, D59): a project is a sleeve with a tab and a quiet rear plate, a program a stack of
   three plates, an operation a ring with its own icon in the middle, a resource its type's silhouette. Sizes follow
   screens.css (.po-*, .pgo-*, .rto-*, .rs-box). */
import type { CSSProperties } from 'react';
import { FAMILIES, famMode, pal, RES_MODE } from '@/lib/art/identity';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import type { Look, Program, Project, Resource, Routine } from '@/types/workspace';
import { TaskIconGlyph, iconColor } from './task-icons';
import { IdentityTile } from './IdentityTile';

const SLEEVE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 76' preserveAspectRatio='none'%3E%3Cpath d='M8 0H30L37 8H92Q100 8 100 16V68Q100 76 92 76H8Q0 76 0 68V8Q0 0 8 0Z'/%3E%3C/svg%3E")`;
const FOLDER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 78' preserveAspectRatio='none'%3E%3Cpath d='M0 8Q0 2 6 2H34Q38 2 41 5L45 10H94Q100 10 100 16V72Q100 78 94 78H6Q0 78 0 72Z'/%3E%3C/svg%3E")`;
const NOTE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 100' preserveAspectRatio='none'%3E%3Cpath d='M8 0H56L80 24V92Q80 100 72 100H8Q0 100 0 92V8Q0 0 8 0Z'/%3E%3C/svg%3E")`;
const masked = (m: string): CSSProperties => ({
  WebkitMask: `${m} 0 0 / 100% 100% no-repeat`,
  mask: `${m} 0 0 / 100% 100% no-repeat`,
});

const lookOf = (x: { look?: Look | undefined }): Look => x.look ?? { f: 0, p: 0 };
const titleOf = (lk: Look) => `${FAMILIES[lk.f] ?? ''}, ${pal(lk.p)[0]}`;

export type ObjectSize = 'xs' | 'sm' | 'row' | 'hero' | 'card' | 'cover';

/** The cover art on a card: it rises out of the card's pocket on hover (the card is a `group/pc3`). */
const RISE =
  'absolute transition-transform duration-[320ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover/pc3:-translate-y-2.5 group-focus-visible/pc3:-translate-y-2.5 motion-reduce:transition-none motion-reduce:group-hover/pc3:translate-y-0';

const PO: Record<ObjectSize, string> = {
  xs: 'h-[18px] w-[22px] filter-none',
  sm: 'h-8 w-10',
  row: 'h-[46px] w-[58px]',
  hero: 'h-[68px] w-[86px]',
  card: 'h-[104px] w-[132px] max-[760px]:h-[82px] max-[760px]:w-[104px]',
  cover: cn(RISE, 'bottom-[-14px] left-4 h-[116px] w-[148px]'),
};

export function ProjectObject({
  project,
  size = 'row',
  className,
}: {
  project: Project;
  size?: ObjectSize;
  className?: string;
}) {
  const lk = lookOf(project);
  const c = pal(lk.p);
  return (
    <span
      className={cn(
        'relative inline-block flex-none drop-shadow-[0_1px_1.5px_rgb(22_22_21/16%)] dark:drop-shadow-[0_1px_2px_rgb(0_0_0/45%)]',
        PO[size],
        className,
      )}
      aria-hidden="true"
      title={titleOf(lk)}
    >
      <i
        className={cn(
          'absolute top-0 right-0 bottom-[16%] left-[14%] bg-[var(--rear)] dark:bg-[color-mix(in_srgb,var(--rear)_45%,var(--surface))]',
          size === 'cover' &&
            'transition-transform duration-[320ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover/pc3:translate-x-[3px] group-hover/pc3:-translate-y-[3px] motion-reduce:transition-none motion-reduce:group-hover/pc3:translate-0',
        )}
        style={{ ['--rear' as string]: c[3], ...masked(SLEEVE) }}
      />
      <IdentityTile
        seed={`project:${project.id}`}
        mode={famMode(lk.f)}
        palette={lk.p}
        className="absolute bottom-0 left-0 h-[86%] w-[88%] rounded-none shadow-none dark:shadow-none"
        style={masked(SLEEVE)}
      />
    </span>
  );
}

const PGO: Record<ObjectSize, string> = {
  xs: 'h-[18px] w-5 filter-none',
  sm: 'h-[29px] w-8',
  row: 'h-10 w-11',
  hero: 'h-[76px] w-[84px]',
  card: 'h-[132px] w-[150px]',
  cover: cn(RISE, 'bottom-[-12px] left-[18px] h-[132px] w-[150px]'),
};

export function ProgramObject({
  program,
  size = 'row',
  className,
}: {
  program: Program;
  size?: ObjectSize;
  className?: string;
}) {
  const lk = lookOf(program);
  const c = pal(lk.p);
  return (
    <span
      className={cn(
        'relative inline-block flex-none drop-shadow-[0_1px_1.5px_rgb(22_22_21/16%)]',
        PGO[size],
        className,
      )}
      aria-hidden="true"
      title={titleOf(lk)}
      style={{ ['--r1' as string]: c[3] }}
    >
      <i
        className={cn(
          'absolute top-0 right-[20%] left-[20%] h-[36%] rounded-[28%/45%] bg-[color-mix(in_srgb,var(--r1)_70%,var(--surface))] dark:bg-[color-mix(in_srgb,var(--r1)_30%,var(--surface))]',
          size === 'cover' && 'transition-transform duration-[320ms] group-hover/pc3:-translate-y-[5px]',
        )}
      />
      <i
        className={cn(
          'absolute top-[13%] right-[10%] left-[10%] h-[36%] rounded-[28%/45%] bg-[var(--r1)] dark:bg-[color-mix(in_srgb,var(--r1)_50%,var(--surface))]',
          size === 'cover' && 'transition-transform duration-[320ms] group-hover/pc3:-translate-y-0.5',
        )}
      />
      <IdentityTile
        seed={`program:${program.id}`}
        mode={famMode(lk.f)}
        palette={lk.p}
        className="absolute right-0 bottom-0 left-0 h-[72%] w-auto rounded-[22%/30%] shadow-none dark:shadow-none"
      />
    </span>
  );
}

const RTO: Record<ObjectSize, string> = {
  xs: 'size-5 filter-none',
  sm: 'size-[30px]',
  row: 'size-[38px]',
  hero: 'size-20',
  card: 'size-20',
  cover: 'size-20',
};
const RING: CSSProperties = {
  WebkitMask: 'radial-gradient(circle closest-side, transparent 0 60%, #000 62%)',
  mask: 'radial-gradient(circle closest-side, transparent 0 60%, #000 62%)',
};

export function RoutineObject({
  routine,
  size = 'row',
  className,
}: {
  routine: Routine;
  size?: ObjectSize;
  className?: string;
}) {
  const lk = lookOf(routine);
  return (
    <span
      className={cn(
        'relative inline-grid flex-none place-items-center drop-shadow-[0_1px_1px_rgb(22_22_21/14%)]',
        RTO[size],
        className,
      )}
      aria-hidden="true"
      title={titleOf(lk)}
    >
      <IdentityTile
        seed={`routine:${routine.id}`}
        mode={famMode(lk.f)}
        palette={lk.p}
        className="absolute inset-0 size-auto rounded-full shadow-none dark:shadow-none"
        style={RING}
      />
      <span
        className="relative grid size-[44%] place-items-center [&_svg]:size-full [&_svg]:stroke-[2.2]"
        style={{ color: routine.icon ? iconColor(routine.icon.c) : 'var(--ink-2)' }}
      >
        {routine.icon ? <TaskIconGlyph name={routine.icon.n} /> : <Icon name="routine" />}
      </span>
    </span>
  );
}

/** A resource in its type's silhouette: folder, note page with a folded corner, link disc. */
export function ResourceShape({
  resource,
  large = false,
  pin = false,
  className,
}: {
  resource: Resource;
  large?: boolean;
  pin?: boolean;
  className?: string;
}) {
  const lk = resource.look ?? { f: RES_MODE[resource.kind], p: 0 };
  const shape =
    resource.kind === 'folder'
      ? cn('h-7 w-9 rounded-none', large && 'h-9 w-[46px]', pin && 'h-4 w-5')
      : resource.kind === 'note'
        ? cn(
            'h-[31px] w-[25px] rounded-none after:absolute after:top-0 after:right-0 after:h-[24%] after:w-[30%] after:bg-[linear-gradient(45deg,rgb(0_0_0/16%)_50%,transparent_50%)]',
            large && 'h-10 w-8',
            pin && 'h-[19px] w-[15px]',
          )
        : cn('size-7 rounded-full', large && 'size-9', pin && 'size-[18px]');
  return (
    <span
      className={cn(
        'inline-grid h-[34px] w-10 flex-none place-items-center drop-shadow-[0_1px_1px_rgb(22_22_21/14%)]',
        large && 'h-11 w-[50px]',
        pin && 'h-5 w-[22px] drop-shadow-none',
        className,
      )}
      role="img"
      aria-label={resource.kind}
    >
      <IdentityTile
        seed={`res:${resource.id}`}
        mode={lk.f}
        palette={lk.p}
        className={cn(shape, 'shadow-none dark:shadow-none')}
        style={resource.kind === 'folder' ? masked(FOLDER) : resource.kind === 'note' ? masked(NOTE) : undefined}
      >
        {resource.kind === 'link' && (
          <Icon
            name="link"
            className={cn(
              'relative z-[1] size-[15px] text-white drop-shadow-[0_1px_1.5px_rgb(0_0_0/55%)]',
              pin && 'size-2.5',
            )}
          />
        )}
      </IdentityTile>
    </span>
  );
}
