/* The batch roadmap (D32, proposed; owner: easier to collapse and hide, no black box). Organization-level milestones marked for
   the roadmap with a today marker and no invented progress. Three states per person: a one-line strip (default), open with
   labels, or hidden (brought back by the Roadmap button). Only the President and VPs add items. From screens/work.js. */
import { Button, IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { MON, plural, t } from '@/lib/i18n';
import { setSession, type Session } from '@/lib/session';
import { D, daysBetween, dLong, dShort, iso, today } from '@/lib/time';
import { getMe, useMe, useSession, useWorkspace } from '@/lib/workspace/hooks';
import { act, setUi, showToast } from '@/lib/workspace/transaction';
import { uid } from '@/lib/ids';
import type { Milestone, Person } from '@/types/workspace';

export type RmMode = 'line' | 'open' | 'hidden';
const LO = '2026-08-01';
const HI = '2027-07-31';

export const canRoadmap = (me: Person | undefined) => !!me && (me.role === 'president' || me.role === 'vp');
export const msLate = (x: Milestone) =>
  !!x.target && x.target < today() && x.state !== 'achieved' && x.state !== 'cancelled';

export function rmMode(s: Session): RmMode {
  const me = s.me ?? '';
  const m = (s.rmMode as Record<string, RmMode> | undefined)?.[me];
  return m ?? ((s.rmOpen as Record<string, boolean> | undefined)?.[me] ? 'open' : 'line');
}

function setRmMode(k: RmMode, was: RmMode) {
  setSession((s) => ({ ...s, rmMode: { ...(s.rmMode ?? {}), [s.me ?? '']: k } }));
  if (k === 'hidden')
    showToast(t('Roadmap hidden. Bring it back with Roadmap at the top of My Work.'), () => {
      setSession((s) => ({ ...s, rmMode: { ...(s.rmMode ?? {}), [s.me ?? '']: was } }));
    });
}

const useItems = () =>
  useWorkspace((db) =>
    db.milestones.filter((m) => m.roadmap).sort((a, b) => (a.target || '9').localeCompare(b.target || '9')),
  );

export function RoadmapShowButton() {
  const mode = useSession(rmMode);
  const me = useMe();
  const any = useWorkspace((db) => db.milestones.some((m) => m.roadmap));
  if (mode !== 'hidden' || !(any || canRoadmap(me))) return null;
  return (
    <Button
      variant="ghost"
      small
      className="text-ink-2 [&_.ic]:text-green"
      onClick={() => {
        setRmMode('line', 'hidden');
      }}
    >
      <Icon name="flag" size="sm" />
      {t('Roadmap')}
    </Button>
  );
}

const pc = (d: string) => Math.max(0, Math.min(100, (daysBetween(LO, d) / daysBetween(LO, HI)) * 100));

/** Labels take the first free lane (above, below, then a second row each side) so nearby items never overlap. */
function lanes(items: Milestone[], width: number) {
  const W = Math.max(480, width - 140);
  const last: Record<string, number> = {};
  const order = ['up', 'dn', 'up2', 'dn2'] as const;
  return items.map((m) => {
    const x = (pc(m.target) / 100) * W;
    const w = Math.max(m.title.length * 6.6, 40) / 2 + 10;
    const lane = order.find((l) => last[l] == null || (last[l] ?? 0) < x - w) ?? 'up';
    last[lane] = x + w;
    return [m, lane] as const;
  });
}

const openMs = (id: string) => {
  setUi((u) => {
    u.insp = { type: 'ms', id };
  });
};

function addRoadmapItem() {
  void act(({ db, ui, toast }) => {
    const me = getMe();
    const p = db.projects.find((x) => x.org) ?? db.projects[0];
    if (!p || !canRoadmap(me) || !me) return;
    const id = uid('ms');
    db.milestones.push({
      id,
      project: p.id,
      title: t('New roadmap item'),
      owner: me.id,
      target: today(),
      state: 'active',
      achievedAt: null,
      parent: null,
      roadmap: true,
    });
    ui.insp = { type: 'ms', id };
    toast(t('Roadmap item added'), ({ db: d, ui: u }) => {
      d.milestones = d.milestones.filter((x) => x.id !== id);
      u.insp = null;
    });
  });
}

export function RoadmapStrip() {
  const me = useMe();
  const mode = useSession(rmMode);
  const items = useItems();
  if ((!items.length && !canRoadmap(me)) || mode === 'hidden') return null;
  const nx = items.find((m) => m.state !== 'achieved' && m.target >= today());
  const rel = nx
    ? daysBetween(today(), nx.target) > 0
      ? plural(daysBetween(today(), nx.target), 'in {n} day', 'in {n} days')
      : t('today')
    : '';
  const next = nx && (
    <span className="inline-flex min-w-0 items-baseline gap-1.5 text-d12h whitespace-nowrap text-ink-2 @max-[600px]/mywork:hidden">
      <small className="text-d12 text-mute">{t('Next')}</small>
      <b className="truncate font-semibold text-ink">{nx.title}</b>
      <span className="text-d12 type-num">{dShort(nx.target)}</span>
      <em className="text-mute not-italic @max-[880px]/mywork:hidden">{rel}</em>
    </span>
  );
  const title = (
    <span className="inline-flex items-center gap-2 text-d13 whitespace-nowrap [&_.ic]:size-4 [&_.ic]:text-green">
      <Icon name="flag" />
      <b className="font-[650]">{t('Batch 2026')}</b>
    </span>
  );
  const hide = (
    <IconButton
      aria-label={t('Hide the roadmap')}
      onClick={() => {
        setRmMode('hidden', mode);
      }}
    >
      <Icon name="close" size="sm" />
    </IconButton>
  );
  if (mode === 'line')
    return (
      <section
        className="mb-3 flex items-center gap-0.5 rounded-xl bg-surface-2 pr-1.5 shadow-[inset_0_0_0_1px_var(--line)] comfortable:mt-3.5 comfortable:rounded-[14px] comfortable:bg-surface comfortable:shadow-card"
        aria-label={t('Batch 2026 roadmap')}
      >
        <button
          type="button"
          className="group/rm grid h-11 min-w-0 flex-1 cursor-pointer grid-cols-[auto_minmax(120px,1fr)_auto_auto] items-center gap-[18px] rounded-xl border-0 bg-transparent pr-1.5 pl-3.5 text-left focus-visible:outline-offset-[-2px] @max-[880px]/mywork:grid-cols-[auto_minmax(80px,1fr)_auto_auto] @max-[600px]/mywork:grid-cols-[auto_minmax(60px,1fr)_auto] @max-[600px]/mywork:gap-3"
          aria-expanded="false"
          aria-label={t('Open the batch roadmap')}
          onClick={() => {
            setRmMode('open', mode);
          }}
        >
          {title}
          <span className="relative h-3.5" aria-hidden="true">
            <i className="absolute top-1.5 right-0 left-0 h-0.5 rounded-[1px] bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]" />
            <i
              className="absolute top-1.5 left-0 h-0.5 rounded-[1px] bg-[color-mix(in_srgb,var(--ink)_35%,transparent)]"
              style={{ width: `${pc(today())}%` }}
            />
            {items.map((m) => (
              <i
                key={m.id}
                className={cn(
                  'absolute top-[3px] -ml-1 size-2 rotate-45 rounded-[2px] bg-surface-2 shadow-[0_0_0_1.5px_var(--ink-2)] comfortable:bg-surface',
                  m.state === 'achieved' && 'bg-green shadow-none comfortable:bg-green',
                  msLate(m) && 'shadow-[0_0_0_1.5px_var(--danger)]',
                )}
                style={{ left: `${pc(m.target)}%` }}
              />
            ))}
            <i
              className="absolute top-0.5 -ml-[5px] size-2.5 rounded-full bg-green shadow-[0_0_0_3px_color-mix(in_srgb,var(--green)_22%,transparent)]"
              style={{ left: `${pc(today())}%` }}
            />
          </span>
          {next}
          <span className="grid place-items-center text-mute group-hover/rm:text-ink">
            <Icon name="chevron-down" size="sm" />
          </span>
        </button>
        {hide}
      </section>
    );
  const months: string[] = [];
  for (let d = D(LO); iso(d) <= HI; d.setMonth(d.getMonth() + 1, 1)) months.push(iso(d));
  const width = document.querySelector('[data-page]')?.clientWidth ?? 900;
  return (
    <section
      className="mb-3 rounded-2xl bg-surface-2 px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--line)] comfortable:mt-3.5"
      aria-label={t('Batch 2026 roadmap')}
    >
      <div className="flex items-center gap-3">
        <span className="[&_b]:text-d14">{title}</span>
        <span className="text-d12 text-mute @max-[600px]/mywork:hidden">{t('August 2026 to July 2027')}</span>
        <span className="flex-1" />
        {next}
        <IconButton
          aria-label={t('Collapse')}
          aria-expanded="true"
          onClick={() => {
            setRmMode('line', mode);
          }}
        >
          <Icon name="chevron-down" size="sm" className="rotate-180" />
        </IconButton>
        {hide}
      </div>
      <div className="relative mx-[34px] h-[168px] max-[760px]:mx-6">
        {months.map((d) => (
          <span
            key={d}
            className="absolute top-[86px] -translate-x-1/2 font-mono text-d10h font-medium whitespace-nowrap text-mute"
            style={{ left: `${pc(d)}%` }}
          >
            {MON()[D(d).getMonth()]}
            {D(d).getMonth() === 0 && <small className="text-ink-2"> {D(d).getFullYear()}</small>}
          </span>
        ))}
        <i className="absolute top-[78px] right-0 left-0 h-[3px] rounded-[2px] bg-[color-mix(in_srgb,var(--ink)_12%,transparent)]" />
        <i className="absolute top-[78px] left-0 h-[3px] rounded-[2px] bg-ink-2" style={{ width: `${pc(today())}%` }} />
        <i className="absolute top-[62px] -ml-px h-9 w-0.5 bg-green" style={{ left: `${pc(today())}%` }}>
          <b className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-[4px] bg-green px-1.5 text-[10px] leading-4 font-semibold whitespace-nowrap text-white">
            {t('Today')}
          </b>
        </i>
        {lanes(items, width).map(([m, lane]) => (
          <button
            key={m.id}
            type="button"
            className={cn(
              'group/rmi absolute top-[72px] grid w-0 cursor-pointer justify-items-center border-0 bg-transparent p-0',
              lane === 'up2' &&
                'before:absolute before:bottom-[18px] before:-left-px before:h-[34px] before:w-px before:bg-line-strong before:content-[""]',
              lane === 'dn2' &&
                'before:absolute before:top-4 before:-left-px before:h-[46px] before:w-px before:bg-line-strong before:content-[""]',
            )}
            style={{ left: `${pc(m.target)}%` }}
            aria-label={`${m.title}, ${dLong(m.target)}`}
            onClick={() => {
              openMs(m.id);
            }}
          >
            <i
              className={cn(
                'mt-px size-[13px] rotate-45 rounded-[3px] bg-surface-2 shadow-[0_0_0_2px_var(--ink-2)] group-hover/rmi:scale-125 group-focus-visible/rmi:outline-2 group-focus-visible/rmi:outline-offset-[3px] group-focus-visible/rmi:outline-focus-ring',
                m.state === 'achieved' && 'bg-green shadow-[0_0_0_2px_var(--green)]',
                msLate(m) && 'shadow-[0_0_0_2px_var(--danger)]',
              )}
            />
            <span
              className={cn(
                'absolute grid justify-items-center text-d11h whitespace-nowrap max-[760px]:text-[10px]',
                lane === 'up' && 'bottom-5',
                lane === 'up2' && 'bottom-[52px]',
                lane === 'dn' && 'top-[30px]',
                lane === 'dn2' && 'top-[62px]',
              )}
            >
              <b className="font-semibold">{m.title}</b>
              <small className="text-d10h text-mute type-num">{dShort(m.target)}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-2.5 text-d12h text-mute">
        {canRoadmap(me) ? (
          <>
            <Button small onClick={addRoadmapItem}>
              <Icon name="plus" size="sm" />
              {t('Add a roadmap item')}
            </Button>
            <span>{t('Or open any milestone and turn on Show on the batch roadmap.')}</span>
          </>
        ) : (
          <span>{t('Set by the President and VPs. Click an item to see its milestone.')}</span>
        )}
      </div>
    </section>
  );
}
