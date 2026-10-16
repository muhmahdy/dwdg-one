/* Relationships: one record per organization, shared by the Partner and Client branches, and one organization with its contacts,
   opportunities, follow-ups and recorded interactions. Last interaction comes only from recorded interactions. From
   divisions/div-ee-cons.js relPage and orgPage (external_relationship, external_stages, external_directory_privacy). */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { divisionOf } from '@/app/config/org';
import { DivCrumb, Hint, Locked, Chip, th, tblClass, tblScroll, trLink } from '@/components/shared/division-ui';
import { openMenu } from '@/components/shared/menus';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/forms';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Stage } from '@/components/ui/StatusBadge';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows, SearchField } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openPanel } from '@/lib/open';
import { useWho } from '@/lib/people';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { canSeeProject } from '@/features/projects/services/access';
import { projOf } from '@/features/work/services/selectors';
import {
  EE,
  KIND,
  REL,
  REL_ORDER,
  canContact,
  canStage,
  eeMember,
  eeOf,
  oppDef,
  orgIx,
  orgOf,
  seeDiv,
  type RelStage,
} from '../services/ee-data';
import { FollowupRow, IxList, Kinds, LastIxCell, WhoOr, DueCell, openFollowups, eeTd } from './ext-parts';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function RelationshipsCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const o = route.id ? orgOf(db, route.id) : undefined;
  if (o)
    return (
      <DivCrumb
        d={EE}
        parts={[
          ['relationships', t('Relationships')],
          ['', o.name],
        ]}
      />
    );
  return <DivCrumb d={EE} parts={[['relationships', t('Relationships')]]} />;
}

/** A stage chip that opens the stage menu for those who may change it. */
export function StageButton({
  menu,
  id,
  label,
  children,
}: {
  menu: string;
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-0.5 rounded-round border-0 bg-transparent p-0 text-mute hover:[&_.st]:shadow-[inset_0_0_0_1px_var(--ink-2)]"
      aria-haspopup="menu"
      aria-label={label}
      onClick={(e) => {
        openMenu(e.currentTarget, { type: menu, id });
      }}
    >
      {children}
      <Icon name="chevron-down" size="xs" />
    </button>
  );
}

function RelationshipList() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  const f = useUi((u) => (typeof u.ecRel === 'string' ? u.ecRel : 'all'));
  const [q, setQ] = useState('');
  useDivisionWorkspace(EE);
  const all = [...eeOf(db).orgs].sort((a, b) => a.name.localeCompare(b.name));
  const rows = f === 'all' ? all : all.filter((o) => o.stage === f);
  const counts = REL_ORDER.map((s): [RelStage, number] => [s, all.filter((o) => o.stage === s).length]).filter(
    (x) => x[1],
  );
  const needle = q.trim().toLowerCase();
  const shown = needle ? rows.filter((o) => [o.name, ...o.aliases].join(' ').toLowerCase().includes(needle)) : rows;
  return (
    <Page wide>
      <PageHeader
        title={t('Relationships')}
        sub={t(
          'One record per organization, shared by the Partner and Client branches. Last interaction comes only from recorded interactions.',
        )}
      >
        <SearchField
          label={t('Search organizations and aliases')}
          className="w-[280px] max-[600px]:w-full"
          placeholder={t('Search organizations and aliases')}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
          }}
        />
        {eeMember(m) && (
          <Button
            variant="primary"
            onClick={() => {
              openPanel('ec-org-new');
            }}
          >
            <Icon name="plus" />
            {t('New relationship')}
          </Button>
        )}
      </PageHeader>
      <div className="mt-4 mb-2 max-w-full overflow-x-auto">
        <Segmented<string>
          label={t('Filter by stage')}
          value={f}
          onChange={(k) => {
            setUi((u) => {
              u.ecRel = k;
            });
          }}
          options={[
            [
              'all',
              <>
                {t('All')} <span className="ml-1 text-mute type-num">{all.length}</span>
              </>,
            ],
            ...counts.map(([s, n]): [string, React.ReactNode] => [
              s,
              <>
                {t(REL[s][0])} <span className="ml-1 text-mute type-num">{n}</span>
              </>,
            ]),
          ]}
        />
      </div>
      {rows.length ? (
        <div className={tblScroll}>
          <table className={tblClass}>
            <thead>
              <tr>
                <th className={th}>{t('Organization')}</th>
                <th className={th}>{t('Kind')}</th>
                <th className={th}>{t('Stage')}</th>
                <th className={th}>{t('PIC')}</th>
                <th className={th}>{t('Last interaction')}</th>
                <th className={th}>{t('Next follow-up')}</th>
                <th className={cn(th, 'text-right')}>{t('Open opportunities')}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const nf = openFollowups(db, (x) => x.org === o.id)[0];
                const op = eeOf(db).opps.filter(
                  (x) => x.org === o.id && !['lost', 'withdrawn'].includes(x.stage),
                ).length;
                const go = () => {
                  void navigate(`/relationships/${o.id}`);
                };
                return (
                  <tr
                    key={o.id}
                    className={trLink}
                    tabIndex={0}
                    role="link"
                    onClick={go}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') go();
                    }}
                  >
                    <td className={eeTd}>
                      <b>{o.name}</b>
                      {o.aliases.length > 0 && <small className="text-mute">{o.aliases.join(', ')}</small>}
                    </td>
                    <td className={eeTd}>
                      <Kinds kinds={o.kinds} />
                    </td>
                    <td className={eeTd}>
                      <Chip def={REL[o.stage]} pill="pill-o" />
                    </td>
                    <td className={eeTd}>
                      <WhoOr id={o.pic} label="No PIC" />
                    </td>
                    <td className={eeTd}>
                      <LastIxCell orgId={o.id} />
                    </td>
                    <td className={eeTd}>
                      {nf ? (
                        <span className="inline-flex max-w-[280px] items-center gap-2">
                          <span className="min-w-0 truncate">{nf.t.title}</span>
                          <DueCell task={nf.t} />
                        </span>
                      ) : (
                        <span className="text-mute">{t('None')}</span>
                      )}
                    </td>
                    <td className={cn(eeTd, 'text-right')}>{op}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title={t('No relationships in this stage')}>{t('Choose another stage or show all.')}</Empty>
      )}
      {rows.length > 0 && shown.length === 0 && (
        <p className="mx-2.5 my-3 text-mute type-small">
          {t('No organization matches. Check the spelling before creating a new record.')}
        </p>
      )}
      <Hint>
        {t('Stage counts filter the saved records in that stage. Choosing a stage never records an interaction.')}
      </Hint>
    </Page>
  );
}

function OrgPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const navigate = useNavigate();
  useDivisionWorkspace(EE);
  const o = orgOf(db, id);
  if (!o) return <Unavailable />;
  const edit = eeMember(m);
  const ix = orgIx(db, o.id);
  const store = eeOf(db);
  const opps = store.opps.filter((x) => x.org === o.id);
  const fus = openFollowups(db, (x) => x.org === o.id);
  const cs = store.contacts.filter((c) => c.org === o.id && !c.archived);
  const projects = [
    ...new Set(
      [
        ...opps.map((x) => x.project),
        ...store.handoffs.filter((h) => opps.some((x) => x.id === h.opp)).map((h) => h.project),
      ].filter((p): p is string => !!p),
    ),
  ];
  const mayContact = canContact(o, m);
  const mayStage = canStage(o, m);
  return (
    <Page wide>
      <PageHeader
        title={o.name}
        sub={
          <span className="flex flex-wrap items-center gap-1.5">
            <Kinds kinds={o.kinds} /> {o.sector}
          </span>
        }
      >
        {mayStage ? (
          <StageButton menu="ec-rel-st" id={o.id} label={t('Stage: {s}. Change', { s: t(REL[o.stage][0]) })}>
            <Chip def={REL[o.stage]} pill="pill" />
          </StageButton>
        ) : (
          <Chip def={REL[o.stage]} pill="pill" />
        )}
        {mayStage && (
          <Button
            onClick={() => {
              openPanel('ec-org-edit', o.id);
            }}
          >
            <Icon name="edit" />
            {t('Edit')}
          </Button>
        )}
        {edit && (
          <>
            <Button
              onClick={() => {
                openPanel('ec-fu-new', undefined, { org: o.id, opp: null });
              }}
            >
              <Icon name="clock" />
              {t('New follow-up')}
            </Button>
            <Button
              onClick={() => {
                openPanel('ec-opp-new', undefined, { org: o.id });
              }}
            >
              <Icon name="briefcase" />
              {t('New opportunity')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setUi((u) => {
                  u.ecIxDraft = null;
                });
                openPanel('ec-ix', o.id, { org: o.id, opp: null });
              }}
            >
              <Icon name="edit" />
              {t('Log interaction')}
            </Button>
          </>
        )}
      </PageHeader>
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[600px]:grid-cols-[112px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('PIC')}>
          <WhoOr id={o.pic} label="No PIC" />
        </MetaRow>
        <MetaRow label={t('Backup')}>
          <WhoOr id={o.backup} label="No backup" />
        </MetaRow>
        <MetaRow label={t('Source')}>{o.source || <span className="text-mute">{t('Not recorded')}</span>}</MetaRow>
        <MetaRow label={t('Also known as')}>
          {o.aliases.length ? o.aliases.join(', ') : <span className="text-mute">{t('None')}</span>}
        </MetaRow>
        <MetaRow label={t('Created by')}>{who.stamp(o.createdBy, o.at)}</MetaRow>
      </Meta>
      <SectionHeading
        as="h2"
        count={cs.length}
        action={
          edit && (
            <Button
              small
              variant="ghost"
              onClick={() => {
                openPanel('ec-contact', undefined, { org: o.id });
              }}
            >
              <Icon name="plus" />
              {t('Add contact')}
            </Button>
          )
        }
      >
        {t('Contacts')}
      </SectionHeading>
      <Rows>
        {cs.map((c) => (
          <Row key={c.id} className="cursor-default flex-wrap gap-2.5">
            <Icon name="person" />
            <RowText title={<b>{c.name}</b>} sub={c.role} />
            {mayContact ? (
              <span className="inline-flex flex-wrap gap-x-3 gap-y-1 text-d13 text-ink-2">
                {c.email && (
                  <span className="inline-flex items-center gap-[5px]">
                    <Icon name="documents" size="xs" />
                    {c.email}
                  </span>
                )}
                {c.phone && (
                  <span className="inline-flex items-center gap-[5px] type-num">
                    <Icon name="bell" size="xs" />
                    {c.phone}
                  </span>
                )}
                {!c.email && !c.phone && <span className="text-mute">{t('No contact details kept')}</span>}
              </span>
            ) : (
              <Locked>{t('Contact details restricted')}</Locked>
            )}
            <small className="basis-[220px] text-d13 text-mute">{t('Use: {u}', { u: c.use })}</small>
          </Row>
        ))}
        {!cs.length && <EmptyLine>{t('No contacts recorded.')}</EmptyLine>}
      </Rows>
      {!mayContact && (
        <p className="my-2 text-mute type-small">
          {t('Contact details are kept to the PIC, the backup, the branch and EE leads. Ask {who} if you need them.', {
            who: who.first(o.pic),
          })}
        </p>
      )}
      <SectionHeading as="h2" count={opps.length}>
        {t('Opportunities')}
      </SectionHeading>
      <Rows>
        {opps.map((x) => (
          <Row
            key={x.id}
            className="gap-2.5"
            onOpen={() => {
              void navigate(`/opportunities/${x.id}`);
            }}
          >
            <Icon name="briefcase" />
            <RowText
              title={<b>{x.title}</b>}
              sub={`${t(KIND[x.kind])}, ${t('PIC {who}', { who: who.first(x.pic) })}`}
            />
            <Chip def={oppDef(x)} pill="pill-o" />
          </Row>
        ))}
        {!opps.length && <EmptyLine>{t('No opportunities yet.')}</EmptyLine>}
      </Rows>
      <SectionHeading as="h2" count={fus.length}>
        {t('Open follow-ups')}
      </SectionHeading>
      <Rows>
        {fus.map((x) => (
          <FollowupRow key={x.task} x={x} />
        ))}
        {!fus.length && <EmptyLine>{t('No open follow-up. Create one so the next step has an owner.')}</EmptyLine>}
      </Rows>
      <SectionHeading as="h2" count={ix.length}>
        {t('Interactions')}
      </SectionHeading>
      <IxList ix={ix} />
      {projects.length > 0 && (
        <>
          <SectionHeading as="h2" count={projects.length}>
            {t('Linked projects')}
          </SectionHeading>
          <Rows>
            {projects.map((pid) => {
              const p = projOf(db, pid);
              return p && m && canSeeProject(db, m, p) ? (
                <Row
                  key={pid}
                  className="gap-2.5"
                  onOpen={() => {
                    void navigate(`/projects/${p.id}`);
                  }}
                >
                  <Icon name="projects" />
                  <RowText title={<b>{p.name}</b>} sub={divisionOf(p.div)?.name} />
                  <Stage stage={p.stage} />
                </Row>
              ) : (
                <Row key={pid} className="cursor-default gap-2.5">
                  <Icon name="lock" />
                  <RowText title={<b>{t('A project you can’t open')}</b>} sub={t('Linked, but outside your access.')} />
                </Row>
              );
            })}
          </Rows>
        </>
      )}
      <Hint>
        {t(
          'Recording an interaction never sends anything. Calls, emails and WhatsApp messages happen outside dwdg’ONE.',
        )}
      </Hint>
    </Page>
  );
}

export function RelationshipsPage({ route }: { route: Route }) {
  const m = useMe();
  if (!seeDiv(m, EE)) return <Unavailable />;
  return route.id ? <OrgPage id={route.id} /> : <RelationshipList />;
}
