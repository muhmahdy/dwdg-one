/* The My Work rail: everything waiting for your answer, today's meetings, and what you wait for from others (D60).
   Comfortable groups each in a white card under a label on the canvas (R016); Compact keeps the original sticky side column.
   From screens/work.js mwList (rail part) and screens/people.js cpAskRow / waitingOnOthers. */
import type { ReactNode } from 'react';
import { go } from '@/app/router/navigation';
import { Avatar, AvatarBubbles } from '@/components/shared/Avatar';
import { ProgramObject, ProjectObject, RoutineObject } from '@/components/shared/art/objects';
import { Button } from '@/components/ui/Button';
import { TimePill } from '@/components/ui/TimePill';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { dLong, dShort, mins, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { shallow } from '@/lib/store';
import type { Person, Workspace } from '@/types/workspace';
import {
  cpAnswer,
  cpInviteList,
  divName,
  homeDiv,
  pgPartnerAnswer,
  waitingOnOthers,
  type CpInvite,
  type WaitItem,
} from '@/features/collaboration/services/collaboration';
import { rsvp } from '@/features/schedule/services/meetings';
import { canEditRt } from '@/features/operations/services/access';
import { openAsks, type RunAsk } from '@/features/operations/services/routines';
import { assignFor, invitesFor, offersFor, reviewsFor } from '../services/selectors';
import { lastSub, signerFor, subsOf } from '../services/signoff';
import { answerAssignment } from '../services/task-actions';
import { openTask } from './TaskRows';

const openOffer = (id: string) => {
  setUi((u) => {
    u.insp = { type: 'offer', id };
    u.form = null;
  });
};
const openMeeting = (id: string) => {
  setUi((u) => {
    u.insp = { type: 'meeting', id };
  });
};

interface AskProps {
  avatar: ReactNode;
  title: string;
  sub: ReactNode;
  buttons?: ReactNode;
  pill?: ReactNode;
  onOpen: () => void;
  wo?: boolean;
}

/** One request row (.mw-ask). */
function Ask({ avatar, title, sub, buttons, pill, onOpen, wo }: AskProps) {
  return (
    <div
      className={cn(
        'mx-[-8px] grid cursor-pointer grid-cols-[24px_minmax(0,1fr)] items-start gap-x-2.5 gap-y-1.5 rounded-[10px] p-2 hover:bg-hover focus-visible:outline-offset-[-2px]',
        // Comfortable: rows inside one white card with hairlines between them (R016).
        'comfortable:m-0 comfortable:grid-cols-[34px_minmax(0,1fr)_auto] comfortable:items-center comfortable:gap-3 comfortable:rounded-none comfortable:px-4 comfortable:py-3 comfortable:[&+&]:shadow-[inset_0_1px_0_var(--line)] comfortable:[&>.av]:size-[34px]',
        'comfortable:@max-[480px]/cs-responses:grid-cols-[34px_minmax(0,1fr)] comfortable:@max-[480px]/cs-responses:items-start',
        pill &&
          'comfortable:@max-[480px]/cs-responses:grid-cols-[34px_minmax(0,1fr)_auto] comfortable:@max-[480px]/cs-responses:gap-y-1 comfortable:@max-[480px]/cs-responses:[&>.av]:row-[1/span_2]',
      )}
      tabIndex={0}
      role="button"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {avatar}
      <span
        className={cn(
          'grid min-w-0 [&>b]:truncate [&>b]:text-d13 [&>b]:font-semibold [&>small]:text-d12 [&>small]:leading-[1.4] [&>small]:text-ink-2',
          'comfortable:block comfortable:[overflow-wrap:anywhere] comfortable:[&>b]:block comfortable:[&>b]:text-[15px] comfortable:[&>b]:leading-5 comfortable:[&>b]:whitespace-normal comfortable:[&>small]:block comfortable:[&>small]:text-[14px] comfortable:[&>small]:leading-5 comfortable:[&>small]:whitespace-normal comfortable:[&>small]:text-mute',
          pill && 'comfortable:@max-[480px]/cs-responses:contents',
        )}
      >
        <b className={cn(pill && 'comfortable:@max-[480px]/cs-responses:col-[2/-1]')}>{title}</b>
        <small
          className={cn(
            pill &&
              'comfortable:@max-[480px]/cs-responses:col-start-2 comfortable:@max-[480px]/cs-responses:self-center',
          )}
        >
          {sub}
        </small>
      </span>
      {buttons && (
        <span className="col-start-2 flex gap-1.5 comfortable:col-start-3 comfortable:row-start-1 comfortable:flex-wrap comfortable:@max-[480px]/cs-responses:col-start-2 comfortable:@max-[480px]/cs-responses:row-start-2">
          {buttons}
        </span>
      )}
      {pill && (
        <span
          className={cn(
            'col-start-2 justify-self-start comfortable:col-start-3',
            wo && 'ml-auto',
            'comfortable:@max-[480px]/cs-responses:row-start-2',
          )}
        >
          {pill}
        </span>
      )}
    </div>
  );
}

const stop = (fn: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn();
};

const yesNo = (no: () => void, yes: () => void) => (
  <>
    <Button variant="ghost" small onClick={stop(no)}>
      {t('Decline')}
    </Button>
    <Button variant="primary" small onClick={stop(yes)}>
      {t('Accept')}
    </Button>
  </>
);

function useResponses(me: Person): ReactNode[] {
  const db = useWorkspace((d) => d);
  const first = (id: string | null | undefined) => db.people.find((p) => p.id === id)?.first ?? t('Someone');
  const art = (it: CpInvite) => {
    if (it.kind === 'project') {
      const p = db.projects.find((x) => x.id === it.id);
      return p ? <ProjectObject project={p} size="sm" /> : null;
    }
    if (it.kind === 'routine') {
      const r = db.routines?.find((x) => x.id === it.id);
      return r ? <RoutineObject routine={r} size="sm" /> : null;
    }
    const g = db.programs?.find((x) => x.id === it.id);
    return g ? <ProgramObject program={g} size="sm" /> : null;
  };
  const out: ReactNode[] = [];
  for (const it of cpInviteList(db, me)) {
    const what = it.kind === 'project' ? t('Project') : it.kind === 'routine' ? t('Operation') : t('Program');
    const sub =
      it.kind === 'partner'
        ? t('{who} invites {d} to be a partner', { who: first(it.by), d: divName(it.div) })
        : t('{who} invites you to work together, from {d}', { who: first(it.by), d: divName(homeDiv(db, it.by)) });
    const target =
      it.kind === 'project'
        ? `projects/${it.id}/people`
        : it.kind === 'routine'
          ? `operations/${it.id}`
          : `programs/${it.id}`;
    const answer = (yes: boolean) =>
      it.kind === 'partner'
        ? void pgPartnerAnswer(it.id, it.div ?? me.div ?? 'sng', yes)
        : void cpAnswer(it.kind, it.id, yes);
    out.push(
      <Ask
        key={`cp-${it.kind}-${it.id}`}
        avatar={art(it)}
        title={it.name}
        sub={`${what}. ${sub}`}
        onOpen={() => {
          go(target);
        }}
        buttons={yesNo(
          () => {
            answer(false);
          },
          () => {
            answer(true);
          },
        )}
      />,
    );
  }
  for (const x of assignFor(db, me.id)) {
    const a = x.assignees.find((v) => v.id === me.id && v.state === 'invited');
    if (!a) continue;
    out.push(
      <Ask
        key={`as-${x.id}`}
        avatar={<Avatar id={a.by} size="sm" />}
        title={x.title}
        sub={t('{who} asks you to share this task', { who: first(a.by) })}
        onOpen={() => {
          openTask(x.id);
        }}
        buttons={yesNo(
          () => void answerAssignment(x.id, false),
          () => void answerAssignment(x.id, true),
        )}
      />,
    );
  }
  for (const o of offersFor(db, me.id))
    out.push(
      <Ask
        key={`of-${o.id}`}
        avatar={<Avatar id={o.from} size="sm" />}
        title={o.title}
        sub={t('{who} asks if you can take this', { who: first(o.from) })}
        onOpen={() => {
          openOffer(o.id);
        }}
      />,
    );
  for (const x of reviewsFor(db, me.id)) {
    const s = lastSub(x);
    const sub = subsOf(x).length
      ? s?.links.length
        ? plural(
            s.links.length,
            '{who} handed in their work, {n} link',
            '{who} handed in their work, {n} links',
          ).replace('{who}', first(x.owner))
        : t('{who} handed in without attaching work', { who: first(x.owner) })
      : signerFor(db, x)
        ? t('{who} finished this. Sign it off?', { who: first(x.owner) })
        : t('{who} sent this for your review', { who: first(x.owner) });
    out.push(
      <Ask
        key={`rv-${x.id}`}
        avatar={<Avatar id={x.owner} size="sm" />}
        title={x.title}
        sub={sub}
        onOpen={() => {
          openTask(x.id);
        }}
      />,
    );
  }
  for (const r of db.routines ?? []) {
    if (r.personal || !canEditRt(me, r)) continue;
    for (const a of openAsks(r).filter((x: RunAsk) => x.by !== me.id))
      out.push(
        <Ask
          key={`ra-${a.id}`}
          avatar={<Avatar id={a.by} size="sm" />}
          title={r.name}
          sub={askText(db, a)}
          onOpen={() => {
            go(`operations/${r.id}`);
          }}
        />,
      );
  }
  for (const x of invitesFor(db, me.id))
    out.push(
      <Ask
        key={`mt-${x.id}`}
        avatar={<Avatar id={x.organizer} size="sm" />}
        title={x.title}
        sub={`${dLong(x.date)}, ${mins(x.start)}`}
        onOpen={() => {
          openMeeting(x.id);
        }}
        buttons={yesNo(
          () => void rsvp(x.id, 'declined'),
          () => void rsvp(x.id, 'accepted'),
        )}
      />,
    );
  return out;
}

export const askText = (db: Workspace, a: RunAsk) => {
  const first = db.people.find((p) => p.id === a.by)?.first ?? '';
  return a.kind === 'skip'
    ? t('{who} asks to skip {d}', { who: first, d: dLong(a.occ) })
    : t('{who} asks to move {d} to {to}', { who: first, d: dLong(a.occ), to: a.to ? dLong(a.to) : '' });
};

function WaitRow({ w }: { w: WaitItem }) {
  const db = useWorkspace((d) => d);
  const first = (id: string) => db.people.find((p) => p.id === id)?.first ?? '';
  if (w.k === 'task') {
    const word = w.status === 'review' ? t('Handed in') : w.status === 'doing' ? t('In progress') : t('Not started');
    return (
      <Ask
        wo
        avatar={<Avatar id={w.who} size="sm" />}
        title={w.title}
        sub={`${first(w.who)}, ${word}${w.returned ? `, ${t('returned')}` : ''}`}
        pill={
          w.due ? (
            <TimePill tone={w.due < today() ? 'late' : ''} className="comfortable:h-7 comfortable:text-[13px]">
              {dShort(w.due)}
            </TimePill>
          ) : undefined
        }
        onOpen={() => {
          openTask(w.id);
        }}
      />
    );
  }
  if (w.k === 'offer')
    return (
      <Ask
        wo
        avatar={<Avatar id={w.who} size="sm" />}
        title={w.title}
        sub={
          w.changes ? (
            <em className="text-warning not-italic">{t('{who} asked for changes', { who: first(w.who) })}</em>
          ) : (
            t('Offered to {who}, no answer yet', { who: first(w.who) })
          )
        }
        onOpen={() => {
          openOffer(w.id);
        }}
      />
    );
  if (w.k === 'inv')
    return (
      <Ask
        wo
        avatar={<Avatar id={w.who} size="sm" />}
        title={w.name}
        sub={t('Invited {who}, no answer yet', { who: first(w.who) })}
        onOpen={() => {
          go(w.kind === 'project' ? `projects/${w.id}/people` : `operations/${w.id}`);
        }}
      />
    );
  const g = db.programs?.find((x) => x.id === w.id);
  return (
    <Ask
      wo
      avatar={g ? <ProgramObject program={g} size="sm" /> : null}
      title={w.name}
      sub={t('Invited {d} as a partner, no answer yet', { d: divName(w.div) })}
      onOpen={() => {
        go(`programs/${w.id}`);
      }}
    />
  );
}

function ShowAll({ n, open, onToggle }: { n: number; open: boolean; onToggle: () => void }) {
  if (n <= 3) return null;
  return (
    <button
      type="button"
      className={cn(
        'mt-1 cursor-pointer border-0 bg-transparent py-1 text-d12h font-semibold text-ink-2 hover:text-ink hover:underline hover:underline-offset-[3px] focus-visible:outline-offset-[-2px]',
        'comfortable:m-0 comfortable:block comfortable:w-full comfortable:px-4 comfortable:py-3 comfortable:text-left comfortable:font-sans comfortable:text-[14px] comfortable:text-green-ink comfortable:shadow-[inset_0_1px_0_var(--line)] comfortable:hover:no-underline',
      )}
      onClick={onToggle}
    >
      {open ? t('Show fewer') : t('Show all {n}', { n })}
    </button>
  );
}

/** A labelled group on the canvas with one white card (Comfortable). */
function CsGroup({
  title,
  n,
  children,
  className,
}: {
  title: string;
  n: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="mx-1.5 mt-0 mb-2 flex items-baseline gap-2 font-sans text-[15px] leading-5 font-semibold text-ink-2">
        {title}
        <span className="font-medium text-mute">{n}</span>
      </h3>
      <div className="@container/cs-responses overflow-hidden rounded-card bg-surface shadow-card">{children}</div>
    </section>
  );
}

function MeetingRow({ id, comfortable }: { id: string; comfortable: boolean }) {
  const me = useMe();
  const mt = useWorkspace((db) => db.meetings.find((m) => m.id === id));
  if (!mt || !me) return null;
  const others = Object.keys(mt.responses).filter((i) => i !== me.id);
  return (
    <div
      className={cn(
        'mx-[-8px] grid cursor-pointer grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-2 rounded-[9px] px-2 py-[7px] text-d13 hover:bg-hover focus-visible:outline-offset-[-2px]',
        'comfortable:m-0 comfortable:flex comfortable:min-h-[52px] comfortable:gap-3 comfortable:rounded-none comfortable:px-4 comfortable:py-2 comfortable:[&+&]:shadow-[inset_0_1px_0_var(--line)]',
      )}
      tabIndex={0}
      role="button"
      onClick={() => {
        openMeeting(mt.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openMeeting(mt.id);
      }}
    >
      {comfortable ? (
        <TimePill>{mins(mt.start)}</TimePill>
      ) : (
        <span className="text-d12 text-ink-2 type-num">{mins(mt.start)}</span>
      )}
      <b className="truncate font-[550] comfortable:min-w-0 comfortable:flex-1 comfortable:text-[15px] comfortable:font-medium">
        {mt.title}
      </b>
      <AvatarBubbles ids={others} size="xs" />
    </div>
  );
}

export interface RailData {
  responses: ReactNode[];
  meetings: string[];
  waiting: WaitItem[];
}

export function useRailData(me: Person): RailData {
  const responses = useResponses(me);
  const meetings = useWorkspace(
    (db) =>
      db.meetings
        .filter((m) => m.date === today() && m.responses[me.id] === 'accepted' && m.state !== 'cancelled')
        .sort((a, b) => a.start - b.start)
        .map((m) => m.id),
    shallow,
  );
  const waiting = useWorkspace(
    (db) => waitingOnOthers(db, me),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  );
  return { responses, meetings, waiting };
}

/** Comfortable: the groups as cards (R016). */
export function ComfortableRail({ data, top = false }: { data: RailData; top?: boolean }) {
  const all = useUi((u) => !!u.mwAll);
  const woAll = useUi((u) => !!u.woAll);
  const { responses, meetings, waiting } = data;
  if (!responses.length && !meetings.length && !waiting.length) return null;
  return (
    <div
      className={cn(
        'grid min-w-0 content-start gap-[22px]',
        top && 'mt-4 mb-2 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[18px]',
      )}
    >
      {responses.length > 0 && (
        <CsGroup title={t('Needs your response')} n={responses.length}>
          {responses.slice(0, all ? 99 : 3)}
          <ShowAll
            n={responses.length}
            open={all}
            onToggle={() => {
              setUi((u) => void (u.mwAll = !u.mwAll));
            }}
          />
        </CsGroup>
      )}
      {meetings.length > 0 && (
        <CsGroup title={t('Meetings today')} n={meetings.length}>
          {meetings.map((id) => (
            <MeetingRow key={id} id={id} comfortable />
          ))}
        </CsGroup>
      )}
      {waiting.length > 0 && (
        <CsGroup title={t('Waiting on others')} n={waiting.length}>
          {waiting.slice(0, woAll ? 99 : 4).map((w) => (
            <WaitRow key={`${w.k}-${w.id}-${'who' in w ? w.who : ''}`} w={w} />
          ))}
          {waiting.length > 4 && (
            <button
              type="button"
              className="block w-full cursor-pointer border-0 bg-transparent px-4 py-3 text-left font-sans text-[14px] font-semibold text-green-ink shadow-[inset_0_1px_0_var(--line)]"
              onClick={() => {
                setUi((u) => void (u.woAll = !u.woAll));
              }}
            >
              {woAll ? t('Show fewer') : t('Show all {n}', { n: waiting.length })}
            </button>
          )}
        </CsGroup>
      )}
    </div>
  );
}

const railH =
  'mt-0 mb-1.5 flex items-baseline gap-1.5 text-d12h font-[650] text-ink-2 [&>span]:type-num [&>span]:text-d11h [&>span]:text-faint';
const railSection = 'border-t border-line py-3.5 first:border-t-0 first:pt-1';

/** Compact: the sticky side column. */
export function CompactRail({ data, only = false }: { data: RailData; only?: boolean }) {
  const all = useUi((u) => !!u.mwAll);
  const woAll = useUi((u) => !!u.woAll);
  const { responses, meetings, waiting } = data;
  return (
    <aside
      className={cn(
        '@container/work-responses sticky top-2 grid min-w-0',
        '@max-[880px]/mywork:static @max-[880px]/mywork:order-first @max-[880px]/mywork:border-b @max-[880px]/mywork:border-line @max-[880px]/mywork:pb-1.5',
        only && 'static grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3',
      )}
    >
      <section className={railSection}>
        <h3 className={railH}>
          {t('Needs your response')}
          <span>{responses.length}</span>
        </h3>
        {responses.slice(0, all ? 99 : 3)}
        <ShowAll
          n={responses.length}
          open={all}
          onToggle={() => {
            setUi((u) => void (u.mwAll = !u.mwAll));
          }}
        />
        {!responses.length && <p className="m-0 text-d13 text-mute">{t('Nothing waiting for you.')}</p>}
      </section>
      <section className={railSection}>
        <h3 className={railH}>
          {t('Meetings today')}
          <span>{meetings.length}</span>
        </h3>
        {meetings.map((id) => (
          <MeetingRow key={id} id={id} comfortable={false} />
        ))}
        {!meetings.length && <p className="m-0 text-d13 text-mute">{t('No meetings today.')}</p>}
      </section>
      {waiting.length > 0 && (
        <section className={railSection}>
          <h3 className={railH}>
            {t('Waiting on others')}
            <span>{waiting.length}</span>
          </h3>
          {waiting.slice(0, woAll ? 99 : 4).map((w) => (
            <WaitRow key={`${w.k}-${w.id}-${'who' in w ? w.who : ''}`} w={w} />
          ))}
          {waiting.length > 4 && (
            <ShowAll
              n={waiting.length}
              open={woAll}
              onToggle={() => {
                setUi((u) => void (u.woAll = !u.woAll));
              }}
            />
          )}
        </section>
      )}
    </aside>
  );
}
