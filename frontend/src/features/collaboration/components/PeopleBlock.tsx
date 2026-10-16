/* The People block (R016 group), the same on projects, programs and operations: lead, manager and members with their
   divisions, who added them, and who is still waiting to answer. Lead and Manager add, change roles and remove; Members can
   leave. From screens/people.js peopleBlock, partnerBlock, MENUS.cpmenu and MENUS.pgpartner. */
import { useState, type ReactNode } from 'react';
import { DIVS, divisionOf } from '@/app/config/org';
import type { MenuRef } from '@/app/ui-state';
import { Avatar } from '@/components/shared/Avatar';
import { MENUS, MenuHeading, MenuItem, MenuRule, closeMenu, openMenu } from '@/components/shared/menus';
import { PeoplePicker, usePeoplePicker } from '@/components/shared/PeoplePicker';
import { Button, IconButton } from '@/components/ui/Button';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { inputClass } from '@/components/ui/forms';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openPerson } from '@/lib/open';
import { dShort } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { Program, Project, Routine } from '@/types/workspace';
import { personOf } from '@/features/work/services/selectors';
import { canManageProgram } from '@/features/programs/services/programs';
import {
  CP,
  ROLE,
  canAnswerPartner,
  cpFaces,
  cpRole,
  divName,
  pgDivs,
  pgPartners,
  type CpAdapter,
  type CpEntry,
  type CpKind,
  type CpRole,
} from '../services/collaboration';
import { cpAdd, cpCanManage, cpRemove, cpSetRole, pgPartnerEnd, pgPartnerInvite } from '../services/cp-actions';
import { cpAnswer, pgPartnerAnswer } from '../services/collaboration';

type Subject = Project | Routine | Program;
const adapter = (kind: CpKind) => CP[kind] as CpAdapter<Subject>;

const Card = ({ children }: { children: ReactNode }) => (
  <div className="overflow-hidden rounded-sheet bg-surface shadow-[0_0_0_1px_var(--line-strong)] comfortable:rounded-[var(--cs-r)] comfortable:shadow-card">
    {children}
  </div>
);

const BlockHeading = ({ title, count, children }: { title: ReactNode; count: number; children?: ReactNode }) => (
  <h2 className="mx-1 mb-2 flex items-center gap-2 type-h3">
    {title} <span className="font-medium text-mute">{count}</span>
    {children}
  </h2>
);

const rowClass =
  'flex min-h-14 cursor-pointer items-center gap-3 px-3.5 py-2 not-first:shadow-[inset_0_1px_0_var(--line)] hover:bg-hover';

function DivMark({ id }: { id: string | null }) {
  const d = divisionOf(id as never);
  return (
    <span className="inline-flex items-center gap-1 text-ink-2">
      {d && <BrandIcon id={d.icon} label={false} className="size-3.5" />}
      {divName(d?.id ?? null)}
    </span>
  );
}

function PersonRow({
  kind,
  x,
  id,
  role,
  entry,
  rotation,
  can,
}: {
  kind: CpKind;
  x: Subject;
  id: string;
  role: CpRole;
  entry?: CpEntry;
  rotation: boolean;
  can: boolean;
}) {
  const me = useMe();
  const p = useWorkspace((db) => personOf(db, id));
  const by = useWorkspace((db) => (entry?.by ? personOf(db, entry.by) : undefined));
  const home = adapter(kind).div(x);
  if (!p || !me) return null;
  const d = p.div;
  const inv = entry?.state === 'invited';
  return (
    <div
      className={cn(rowClass, inv && 'bg-[color-mix(in_srgb,var(--surface-2)_60%,var(--surface))]')}
      role="button"
      tabIndex={0}
      onClick={() => {
        openPerson(id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) openPerson(id);
      }}
    >
      <Avatar id={id} size="sm" />
      <span className="grid min-w-0 flex-1 gap-px">
        <b className="font-semibold">
          {p.name}
          {id === me.id && <small className="font-normal text-mute"> {t('(you)')}</small>}
        </b>
        <small className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[length:13px] text-ink-2">
          {rotation && role === 'member' ? t('Takes turns') : t(ROLE[role])}
          {d !== home && <DivMark id={d} />}
          {inv && (
            <em className="font-medium text-[var(--warning-mark)] not-italic">{t('Invited, waiting for an answer')}</em>
          )}
          {entry?.by && entry.by !== id && (
            <span className="text-mute">
              {t('added by {who}', { who: by?.first ?? '' })}
              {entry.at ? `, ${dShort(entry.at.slice(0, 10))}` : ''}
            </span>
          )}
        </small>
      </span>
      {id === me.id && role !== 'lead' ? (
        <Button
          small
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            void cpRemove(kind, x.id, me.id);
          }}
        >
          {t('Leave')}
        </Button>
      ) : can ? (
        <IconButton
          aria-label={role === 'lead' ? t('Change the lead') : t('Change {who}', { who: p.first })}
          aria-haspopup="menu"
          onClick={(e) => {
            e.stopPropagation();
            openMenu(e.currentTarget, {
              type: 'cpmenu',
              id: `${kind}|${x.id}|${id}`,
              lead: role === 'lead',
              alignRight: true,
              width: 240,
              est: 180,
            });
          }}
        >
          <Icon name="more" />
        </IconButton>
      ) : null}
    </div>
  );
}

function useAddPeople({
  kind,
  x,
  home,
  rotation,
}: {
  kind: CpKind;
  x: Subject;
  home: string | null;
  rotation: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const exclude = useWorkspace((db) => {
    const A = adapter(kind);
    return [A.lead(x), A.mgr(x), ...A.entries(db, x).map((v) => v.id)].filter((v): v is string => !!v);
  });
  const picker = usePeoplePicker(exclude, (id) => {
    void cpAdd(kind, x.id, id);
  });
  return {
    button: adding ? null : (
      <Button
        small
        className="ml-auto"
        onClick={() => {
          setAdding(true);
        }}
      >
        <Icon name="plus" />
        {rotation ? t('Add to the rotation') : t('Add people')}
      </Button>
    ),
    form: adding ? (
      <div className="mb-2.5 grid gap-2">
        <div className="relative">
          <input
            className={inputClass}
            placeholder={t('Find someone in any division')}
            autoComplete="off"
            aria-label={t('Add people')}
            autoFocus
            onFocus={(e) => {
              picker.open(e.target.value.trim());
            }}
            onChange={(e) => {
              picker.open(e.target.value.trim());
            }}
            onKeyDown={(e) => {
              picker.onKeyDown(e);
            }}
          />
          <div className="absolute top-[calc(100%+4px)] left-0 z-[6]">
            <PeoplePicker view={picker.view} />
          </div>
        </div>
        <p className="text-d13 text-mute type-small">
          {t(
            'People from {d} and the Presidency join at once. Someone from another division gets an invitation and joins after accepting; their leaders are told.',
            { d: divName(home as never) },
          )}
        </p>
        <div>
          <Button
            small
            onClick={() => {
              picker.close();
              setAdding(false);
            }}
          >
            {t('Done')}
          </Button>
        </div>
      </div>
    ) : null,
  };
}

export function PeopleBlock({
  kind,
  x,
  title,
  rotation = false,
}: {
  kind: CpKind;
  x: Subject;
  title?: string;
  rotation?: boolean;
}) {
  const A = adapter(kind);
  const can = useWorkspace((db) => cpCanManage(db, kind, x.id));
  const faces = useWorkspace((db) => cpFaces(db, kind, x));
  const entries = useWorkspace((db) => A.entries(db, x));
  const lead = A.lead(x);
  const mgr = A.mgr(x);
  const home = A.div(x);
  const es = entries.filter((v) => v.id !== lead && v.id !== mgr);
  const add = useAddPeople({ kind, x, home, rotation });
  const showAdd = can && kind !== 'program';
  return (
    <section className="mt-[18px]">
      <BlockHeading title={title ?? t('People')} count={faces.length}>
        {showAdd && add.button}
      </BlockHeading>
      {showAdd && add.form}
      <Card>
        {lead && <PersonRow kind={kind} x={x} id={lead} role="lead" rotation={rotation} can={can} />}
        {mgr && <PersonRow kind={kind} x={x} id={mgr} role="manager" rotation={rotation} can={can} />}
        {es.map((v) => (
          <PersonRow key={v.id} kind={kind} x={x} id={v.id} role="member" entry={v} rotation={rotation} can={can} />
        ))}
        {!lead && !mgr && !es.length && <p className="m-0 p-3.5 text-mute">{t('Nobody yet.')}</p>}
      </Card>
    </section>
  );
}

/** A program's divisions: the host and the partners, with who is still to answer. */
export function PartnerBlock({ g }: { g: Program }) {
  const me = useMe();
  const rows = [{ div: g.div, state: 'host', by: undefined as string | undefined }, ...pgPartners(g)];
  const others = DIVS.filter((d) => !rows.some((v) => v.div === d.id));
  const by = useWorkspace((db) => rows.map((v) => (v.by ? personOf(db, v.by)?.first : '')));
  if (!me) return null;
  const can = canManageProgram(me, g);
  return (
    <section className="mt-[18px]">
      <BlockHeading title={t('Divisions')} count={pgDivs(g).length}>
        {can && others.length > 0 && (
          <Button
            small
            className="ml-auto"
            aria-haspopup="menu"
            onClick={(e) => {
              openMenu(e.currentTarget, { type: 'pgpartner', id: g.id });
            }}
          >
            <Icon name="plus" />
            {t('Invite a division')}
          </Button>
        )}
      </BlockHeading>
      <Card>
        {rows.map((v, i) => {
          const d = divisionOf(v.div);
          const answers = v.state === 'invited' && canAnswerPartner(me, v.div);
          return (
            <div
              key={v.div}
              className={cn(
                rowClass,
                'cursor-default hover:bg-transparent',
                v.state === 'invited' && 'bg-[color-mix(in_srgb,var(--surface-2)_60%,var(--surface))]',
              )}
            >
              {d && <BrandIcon id={d.icon} label={false} className="size-[22px]" />}
              <span className="grid min-w-0 flex-1 gap-px">
                <b className="font-semibold">{d?.name ?? v.div}</b>
                <small className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[length:13px] text-ink-2">
                  {v.state === 'host' ? (
                    t('Runs this program')
                  ) : v.state === 'invited' ? (
                    <em className="font-medium text-[var(--warning-mark)] not-italic">
                      {t('Invited, waiting for their leaders')}
                    </em>
                  ) : (
                    t('Partner, places its own projects and operations here')
                  )}
                  {by[i] && <span className="text-mute">{t('invited by {who}', { who: by[i] ?? '' })}</span>}
                </small>
              </span>
              {answers ? (
                <span className="flex gap-1.5">
                  <Button small variant="ghost" onClick={() => void pgPartnerAnswer(g.id, v.div, false)}>
                    {t('Decline')}
                  </Button>
                  <Button small variant="primary" onClick={() => void pgPartnerAnswer(g.id, v.div, true)}>
                    {t('Accept')}
                  </Button>
                </span>
              ) : v.state !== 'host' && (can || canAnswerPartner(me, v.div)) ? (
                <Button small variant="ghost" onClick={() => void pgPartnerEnd(g.id, v.div)}>
                  {v.state === 'invited' ? t('Withdraw') : me.div === v.div && !can ? t('Leave') : t('End partnership')}
                </Button>
              ) : null}
            </div>
          );
        })}
      </Card>
    </section>
  );
}

/** "Someone invited you to work on this project": shown on the project's People tab until you answer. */
export function InviteNotice({ p }: { p: Project }) {
  const me = useMe();
  const x = p.team.find((v) => v.id === me?.id && v.state === 'invited');
  const who = useWorkspace((db) => (x ? personOf(db, x.by)?.first : ''));
  if (!me || !x) return null;
  return (
    <div className="mb-4 grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-sheet bg-[color-mix(in_srgb,var(--info-bg,var(--surface-2))_100%,transparent)] p-3.5 shadow-[0_0_0_1px_var(--line-strong)]">
      <Icon name="info" />
      <div>
        <b>{t('{who} invited you to work on this project', { who: who ?? '' })}</b>
        <p className="m-0 text-ink-2">
          {t('Accepting lets you see its work and resources and take tasks here. You stay in {d}.', {
            d: divName(me.div),
          })}
        </p>
      </div>
      <div className="flex gap-1.5">
        <Button small variant="ghost" onClick={() => void cpAnswer('project', p.id, false)}>
          {t('Decline')}
        </Button>
        <Button small variant="primary" onClick={() => void cpAnswer('project', p.id, true)}>
          {t('Accept')}
        </Button>
      </div>
    </div>
  );
}

// ---------- menus ----------

function CpMenu({ menu }: { menu: MenuRef }) {
  const [kind, xid, pid] = (menu.id ?? '').split('|') as [CpKind, string, string];
  const role = useWorkspace((db) => {
    const x =
      kind === 'project'
        ? db.projects.find((p) => p.id === xid)
        : kind === 'routine'
          ? db.routines?.find((r) => r.id === xid)
          : db.programs?.find((g) => g.id === xid);
    return x ? cpRole(db, kind, x, pid) : null;
  });
  const invited = useWorkspace((db) => {
    const x =
      kind === 'project'
        ? db.projects.find((p) => p.id === xid)
        : kind === 'routine'
          ? db.routines?.find((r) => r.id === xid)
          : undefined;
    return (
      !!x &&
      adapter(kind)
        .entries(db, x)
        .some((v) => v.id === pid && v.state === 'invited')
    );
  });
  if (menu.lead) return <MenuHeading>{t('Hand the lead to someone else from People')}</MenuHeading>;
  const remove = (label: string) => (
    <MenuItem
      icon="close"
      onSelect={() => {
        closeMenu();
        void cpRemove(kind, xid, pid);
      }}
    >
      {label}
    </MenuItem>
  );
  if (invited) return remove(t('Withdraw the invitation'));
  const set = (r: CpRole, label: string, icon: string) => (
    <MenuItem
      icon={icon}
      onSelect={() => {
        closeMenu();
        void cpSetRole(kind, xid, pid, r);
      }}
    >
      {label}
    </MenuItem>
  );
  return (
    <>
      {set('lead', t('Make lead'), 'flag')}
      {role !== 'manager' ? set('manager', t('Make manager'), 'shield') : set('member', t('Make member'), 'person')}
      <MenuRule />
      {remove(kind === 'routine' ? t('Take off the rotation') : t('Take off'))}
    </>
  );
}

function PartnerMenu({ menu }: { menu: MenuRef }) {
  const g = useWorkspace((db) => db.programs?.find((x) => x.id === menu.id));
  if (!g) return null;
  return (
    <>
      <MenuHeading>{t('Invite a division to be a partner')}</MenuHeading>
      {DIVS.filter((d) => d.id !== g.div && !pgPartners(g).some((v) => v.div === d.id)).map((d) => (
        <MenuItem
          key={d.id}
          icon={<BrandIcon id={d.icon} label={false} className="size-4" />}
          onSelect={() => {
            closeMenu();
            void pgPartnerInvite(g.id, d.id);
          }}
        >
          {d.name}
        </MenuItem>
      ))}
    </>
  );
}

MENUS.cpmenu = CpMenu;
MENUS.pgpartner = PartnerMenu;
