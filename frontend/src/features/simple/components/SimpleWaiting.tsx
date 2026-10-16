/* "Waiting for you" in the Simple look: offers and reviews open with one Review button; shared tasks, meetings and
   invitations to work together are answered in the row with Decline and Accept. From screens/simple.js sWaiting. */
import type { ReactNode } from 'react';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { openMeeting, openOffer, openTask } from '@/lib/open';
import { t } from '@/lib/i18n';
import { dLong, mins } from '@/lib/time';
import { useWorkspace } from '@/lib/workspace/hooks';
import {
  cpAnswer,
  cpInviteList,
  divName,
  homeDiv,
  pgPartnerAnswer,
} from '@/features/collaboration/services/collaboration';
import { rsvp } from '@/features/schedule/services/meetings';
import { assignFor, invitesFor, offersFor, reviewsFor } from '@/features/work/services/selectors';
import { answerAssignment } from '@/features/work/services/task-actions';
import type { Person } from '@/types/workspace';
import { Section } from './parts';

function Ask({
  who,
  title,
  sub,
  onOpen,
  children,
}: {
  who: string;
  title: string;
  sub: string;
  onOpen?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-16 items-center gap-3 py-2.5 pr-4 pl-4 transition-colors max-[899px]:flex-wrap',
        '[&+&]:before:absolute [&+&]:before:top-0 [&+&]:before:right-0 [&+&]:before:left-[68px] [&+&]:before:h-px [&+&]:before:bg-line [&+&]:before:content-[""]',
        onOpen && 'cursor-pointer hover:bg-hover',
      )}
      {...(onOpen
        ? {
            tabIndex: 0,
            role: 'button',
            onClick: onOpen,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onOpen();
              }
            },
          }
        : {})}
    >
      <Avatar id={who} size="lg" />
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className="[overflow-wrap:anywhere] type-body">{title}</span>
        <span className="text-mute type-small">{sub}</span>
      </div>
      <div className="flex flex-none gap-2 max-[899px]:w-full max-[899px]:flex-wrap max-[899px]:pl-[52px] max-[899px]:[&>button]:h-11 max-[899px]:[&>button]:flex-1">
        {children}
      </div>
    </div>
  );
}

const stop = (fn: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn();
};

function Review({ onOpen }: { onOpen: () => void }) {
  return <Button onClick={stop(onOpen)}>{t('Review')}</Button>;
}

function YesNo({ no, yes }: { no: () => void; yes: () => void }) {
  return (
    <>
      <Button onClick={stop(no)}>{t('Decline')}</Button>
      <Button variant="primary" onClick={stop(yes)}>
        {t('Accept')}
      </Button>
    </>
  );
}

export function SimpleWaiting({ me }: { me: Person }) {
  const db = useWorkspace((d) => d);
  const first = (id: string | null | undefined) => db.people.find((p) => p.id === id)?.first ?? t('Someone');
  const rows: ReactNode[] = [];
  for (const o of offersFor(db, me.id))
    rows.push(
      <Ask
        key={`of-${o.id}`}
        who={o.from}
        title={o.title}
        sub={t('{who} asks if you can take this', { who: first(o.from) })}
        onOpen={() => {
          openOffer(o.id);
        }}
      >
        <Review
          onOpen={() => {
            openOffer(o.id);
          }}
        />
      </Ask>,
    );
  for (const x of reviewsFor(db, me.id))
    rows.push(
      <Ask
        key={`rv-${x.id}`}
        who={x.owner}
        title={x.title}
        sub={t('{who} sent this for your review', { who: first(x.owner) })}
        onOpen={() => {
          openTask(x.id);
        }}
      >
        <Review
          onOpen={() => {
            openTask(x.id);
          }}
        />
      </Ask>,
    );
  for (const x of assignFor(db, me.id)) {
    const a = x.assignees.find((v) => v.id === me.id && v.state === 'invited');
    if (!a) continue;
    rows.push(
      <Ask
        key={`as-${x.id}`}
        who={a.by}
        title={x.title}
        sub={t('{who} asks you to share this task', { who: first(a.by) })}
        onOpen={() => {
          openTask(x.id);
        }}
      >
        <YesNo
          no={() => void answerAssignment(x.id, false)}
          yes={() => void answerAssignment(x.id, true)}
        />
      </Ask>,
    );
  }
  for (const x of invitesFor(db, me.id))
    rows.push(
      <Ask
        key={`mt-${x.id}`}
        who={x.organizer}
        title={x.title}
        sub={t('Meeting on {when}', { when: `${dLong(x.date)}, ${mins(x.start)}` })}
        onOpen={() => {
          openMeeting(x.id);
        }}
      >
        <YesNo no={() => void rsvp(x.id, 'declined')} yes={() => void rsvp(x.id, 'accepted')} />
      </Ask>,
    );
  // Invitations to work together are answered here, so nobody needs the full project page.
  for (const it of cpInviteList(db, me)) {
    const answer = (yes: boolean) =>
      it.kind === 'partner'
        ? void pgPartnerAnswer(it.id, it.div ?? me.div ?? 'sng', yes)
        : void cpAnswer(it.kind, it.id, yes);
    rows.push(
      <Ask
        key={`cp-${it.kind}-${it.id}`}
        who={it.by}
        title={it.name}
        sub={
          it.kind === 'partner'
            ? t('{who} invites {d} to be a partner', { who: first(it.by), d: divName(it.div) })
            : t('{who} invites you to work together, from {d}', {
                who: first(it.by),
                d: divName(homeDiv(db, it.by)),
              })
        }
      >
        <YesNo
          no={() => {
            answer(false);
          }}
          yes={() => {
            answer(true);
          }}
        />
      </Ask>,
    );
  }
  return rows.length ? (
    <Section title={t('Waiting for you')} n={rows.length}>
      {rows}
    </Section>
  ) : null;
}
