/* Organization: who leads DWDG, what each division has open, every active project you can see, and a directory of names and
   roles. Tasks and schedules stay within each workspace. From screens/plan.js PAGES.organisation. */
import { Link } from 'react-router';
import { DIVS } from '@/app/config/org';
import { Avatar, IdentityLine, roleLabel } from '@/components/shared/Avatar';
import { BrandIcon } from '@/components/ui/Icon';
import { State } from '@/components/ui/StatusBadge';
import { SectionHeading } from '@/components/ui/Headings';
import { Page, PageHeader, Restricted, SearchField, Toolbar } from '@/components/ui/page';
import { rank, visibleDivs } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openPerson } from '@/lib/open';
import { dShort } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { OrgProjectRow, RowsBox } from '@/features/projects/components/ProjectViews';
import { ENDED, nextMs, projBlockers } from '@/features/projects/services/project-rules';
import type { Person } from '@/types/workspace';

export const OrganisationCrumb = () => <b>{t('Organization')}</b>;

const omxRow =
  "relative grid min-h-[52px] min-w-[640px] grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_110px_minmax(0,1.6fr)_110px] items-center gap-3 rounded-ctl px-4 py-1.5 text-d13h [&+&]:before:absolute [&+&]:before:inset-x-4 [&+&]:before:-top-0.5 [&+&]:before:h-px [&+&]:before:bg-line [&+&]:before:content-[''] hover:bg-hover @max-[640px]/omx:min-w-0 @max-[640px]/omx:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] @max-[640px]/omx:gap-y-1.5 @max-[640px]/omx:px-3.5 @max-[640px]/omx:py-2.5 @max-[640px]/omx:[grid-template-areas:'dv_dir_n'_'ms_ms_bk']";

const Labelled = ({ label, children, area }: { label: string; children: React.ReactNode; area: string }) => (
  <span
    className={cn(
      '@max-[640px]/omx:before:block @max-[640px]/omx:before:text-d11h @max-[640px]/omx:before:font-medium @max-[640px]/omx:before:text-mute',
      area,
    )}
    data-l={label}
  >
    <span className="@max-[640px]/omx:contents">{children}</span>
  </span>
);

function DirRow({ p }: { p: Person }) {
  return (
    <div
      className="flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover"
      role="button"
      tabIndex={0}
      onClick={() => {
        openPerson(p.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openPerson(p.id);
      }}
    >
      <Avatar id={p.id} />
      <div className="min-w-0 flex-1">
        <b className="block font-semibold">{p.name}</b>
        <small className="block text-d12h text-mute">{roleLabel(p)}</small>
      </div>
      <IdentityLine person={p} />
    </div>
  );
}

function DivisionRows() {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const vis = visibleDivs(me);
  return (
    <div
      className="@container/omx grid gap-[3px] overflow-x-auto @max-[640px]/omx:overflow-visible"
      role="table"
      aria-label={t('Divisions')}
    >
      <div
        className={cn(
          omxRow,
          'min-h-[30px] border-b border-line-strong text-mute type-caption hover:bg-transparent @max-[640px]/omx:hidden',
        )}
        role="row"
      >
        <span role="columnheader">{t('Division')}</span>
        <span role="columnheader">{t('Director')}</span>
        <span role="columnheader" title={t('Planned, active or in review')}>
          {t('Open projects')}
        </span>
        <span role="columnheader">{t('Next milestone')}</span>
        <span role="columnheader">{t('Open blockers')}</span>
      </div>
      {DIVS.map((d) => {
        const ok = vis.includes(d.id);
        const dir = db.people.find((p) => p.div === d.id && p.role === 'director' && p.status === 'active');
        const ps = db.projects.filter((p) => p.div === d.id && !ENDED.includes(p.stage) && p.stage !== 'draft');
        const nx = ps
          .map((p) => nextMs(db, p))
          .filter((m): m is NonNullable<typeof m> => !!m)
          .sort((a, b) => a.target.localeCompare(b.target))[0];
        const bk = ps.reduce((n, p) => n + projBlockers(db, p).length, 0);
        return (
          <div key={d.id} className={omxRow} role="row">
            <span role="cell" className="flex min-w-0 items-center gap-2.5 @max-[640px]/omx:[grid-area:dv]">
              <BrandIcon id={d.icon} className="size-5" />
              <b className="font-semibold">{d.name}</b>
            </span>
            <span role="cell" className="@max-[640px]/omx:[grid-area:dir]">
              {dir ? (
                <span className="inline-flex h-[21px] items-center gap-1.5 align-top font-[550]">
                  <Avatar id={dir.id} size="xs" />
                  {dir.first}
                </span>
              ) : (
                <span className="text-mute">{t('Not named')}</span>
              )}
            </span>
            {ok ? (
              <>
                <Labelled
                  label={t('Open projects')}
                  area="type-num @max-[640px]/omx:[grid-area:n] @max-[640px]/omx:justify-self-end"
                >
                  {ps.length}
                </Labelled>
                <Labelled label={t('Next milestone')} area="@max-[640px]/omx:[grid-area:ms]">
                  {nx ? (
                    <>
                      <Link to={`/projects/${nx.project}`}>{nx.title}</Link>{' '}
                      <small className="text-mute type-num">{dShort(nx.target)}</small>
                    </>
                  ) : (
                    <span className="text-mute">{t('None')}</span>
                  )}
                </Labelled>
                <Labelled
                  label={t('Open blockers')}
                  area="@max-[640px]/omx:[grid-area:bk] @max-[640px]/omx:justify-self-end"
                >
                  {bk ? (
                    <State label={String(bk)} icon="warning" tone="danger" />
                  ) : (
                    <span className="text-mute">0</span>
                  )}
                </Labelled>
              </>
            ) : (
              <span role="cell" className="col-span-3">
                <Restricted />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrganisationPage() {
  const me = useMe();
  const q = useUi((u) => (u.oq as string | undefined) ?? '');
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const vis = visibleDivs(me);
  const lead = db.people.filter((p) => !p.div && p.status === 'active');
  const active = db.projects.filter((p) => vis.includes(p.div) && p.stage === 'active');
  const people = db.people.filter(
    (p) => p.status === 'active' && (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <Page wide data-page="organisation">
      <PageHeader title={t('Organization')} sub={`DWDG UII, ${t('batch 2026')}`} />
      <SectionHeading as="h2">{t('Leadership')}</SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-3 gap-y-[3px]">
        {lead.map((p) => (
          <DirRow key={p.id} p={p} />
        ))}
      </div>
      <SectionHeading as="h2">{t('Divisions')}</SectionHeading>
      <DivisionRows />
      {vis.length > 1 && (
        <>
          <SectionHeading as="h2">{t('All active projects you can see')}</SectionHeading>
          <RowsBox>
            <div className="flex flex-col gap-[3px]">
              {active.map((p) => (
                <OrgProjectRow key={p.id} p={p} />
              ))}
            </div>
          </RowsBox>
          <p className="mt-2 text-mute type-small">
            {t('Built from the same project records as each division. Nothing here is typed in twice.')}
          </p>
        </>
      )}
      <SectionHeading as="h2">{t('People')}</SectionHeading>
      <Toolbar>
        <SearchField
          label={t('Find a person')}
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setUi((u) => {
              u.oq = v;
            });
          }}
        />
        <span className="text-mute type-small">
          {t('Names and roles only. Tasks and schedules stay within each workspace.')}
        </span>
      </Toolbar>
      {DIVS.map((d) => {
        const ps = people.filter((p) => p.div === d.id).sort((a, b) => rank(b) - rank(a));
        return ps.length ? (
          <div key={d.id}>
            <h3 className="mt-[18px] mb-1.5 flex items-center gap-2 type-small">
              <BrandIcon id={d.icon} label={false} className="size-4" />
              <b className="font-semibold">{d.short}</b> <span className="text-mute type-num">{ps.length}</span>
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-3 gap-y-[3px]">
              {ps.map((p) => (
                <DirRow key={p.id} p={p} />
              ))}
            </div>
          </div>
        ) : null;
      })}
    </Page>
  );
}
