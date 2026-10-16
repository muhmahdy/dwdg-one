/* Updates (work_updates): what is for you, and the division's Activity (the change log that used to be its own page, D58).
   Reminders arrive here; email or phone notifications while the app is closed are not decided yet. From screens/plan.js. */
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { State } from '@/components/ui/StatusBadge';
import { Empty, Page, PageHeader, Row, RowText, Rows, TabLinks } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { ago, dShort, mins } from '@/lib/time';
import { useMe, useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import type { Update } from '@/types/workspace';
import { openEntity } from '@/lib/open';
import { refTitle, markAllRead, myReplies, openUpdate, type Reply, type ReplyChoice } from '../services/updates';
import { updateText } from '../services/update-text';
import { ChangesFeed, dayLabel } from './ChangesFeed';

export const UpdatesCrumb = () => <b>{t('Updates')}</b>;

const CHOICE: Record<ReplyChoice, [string, 'green' | 'mute' | 'danger' | 'warn']> = {
  Accepted: ['check', 'green'],
  Approved: ['check', 'green'],
  Declined: ['close', 'mute'],
  Rejected: ['close', 'danger'],
  'Asked for changes': ['undo', 'warn'],
};

function UpdateRow({ u }: { u: Update }) {
  const who = useWho();
  const title = useWorkspace((db) => refTitle(db, u.ref));
  const meeting = useWorkspace((db) =>
    u.ref.type === 'meeting' ? db.meetings.find((m) => m.id === u.ref.id) : undefined,
  );
  return (
    <Row
      onOpen={() => {
        openUpdate(u.id);
      }}
    >
      {u.actor ? (
        <Avatar id={u.actor} />
      ) : (
        <span className="grid size-7 flex-none place-items-center rounded-full bg-fill text-mute">
          <Icon name="clock" size="sm" />
        </span>
      )}
      <RowText
        className="overflow-visible whitespace-normal"
        title={
          <span className={cn(!u.read && 'font-semibold')}>
            {updateText(u.type, u.actor ? who.first(u.actor) : '')}
          </span>
        }
        sub={
          <>
            {title ?? <span className="text-mute">{t('No longer available')}</span>}
            {meeting ? `, ${dShort(meeting.date)} ${mins(meeting.start)}` : ''}
          </>
        }
      />
      {!u.read && (
        <>
          <span className="size-2 flex-none rounded-full bg-green" aria-hidden="true" />
          <span className="absolute size-px overflow-hidden [clip:rect(0_0_0_0)]">{t('Unread')}</span>
        </>
      )}
      <time className="w-[72px] flex-none text-right text-mute type-num">{ago(u.at)}</time>
    </Row>
  );
}

function ReplyRow({ r }: { r: Reply }) {
  const who = useWho();
  const choice = r.choice;
  return (
    <Row
      onOpen={() => {
        openEntity(r.open);
      }}
    >
      <Avatar id={r.from} />
      <RowText
        title={<b className="font-semibold">{r.title}</b>}
        sub={`${t(r.kind)}, ${t('from {who}', { who: who.first(r.from) })}${r.extra ? `, ${r.extra}` : ''}`}
      />
      {choice ? (
        <State label={t(choice)} icon={CHOICE[choice][0]} tone={CHOICE[choice][1]} pill="pill-o" />
      ) : (
        <State label={t('Not replied')} icon="clock" tone="warn" pill="pill-o" />
      )}
      <time className="flex-none text-mute type-num">{choice && r.at ? ago(r.at) : ''}</time>
    </Row>
  );
}

function Replies() {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const all = myReplies(db, me);
  const wait = all.filter((x) => !x.choice);
  const done = all.filter((x) => x.choice);
  const emptyRow = (text: string) => <div className="px-2.5 py-3 text-d13h text-mute">{text}</div>;
  return (
    <div className="flex flex-col gap-4 mt-3">
      {/* Waiting â€” label on canvas, white card below (R016 pattern) */}
      <div>
        <h2 className="mb-1.5 px-0.5 text-[13px] font-medium text-mute">
          {t('Waiting for your reply')}
          {wait.length > 0 && (
            <span className="ml-2 text-faint type-num">{wait.length}</span>
          )}
        </h2>
        <div className="overflow-hidden rounded-card bg-surface shadow-card py-1">
          <Rows>
            {wait.length
              ? wait.map((r) => <ReplyRow key={`${r.open.type}-${r.open.id}`} r={r} />)
              : emptyRow(t('Nothing is waiting for you.'))}
          </Rows>
        </div>
      </div>
      {/* Replied â€” label on canvas, white card below */}
      <div>
        <h2 className="mb-1.5 px-0.5 text-[13px] font-medium text-mute">
          {t('You replied')}
          {done.length > 0 && (
            <span className="ml-2 text-faint type-num">{done.length}</span>
          )}
        </h2>
        <div className="overflow-hidden rounded-card bg-surface shadow-card py-1">
          <Rows>
            {done.length
              ? done.map((r) => <ReplyRow key={`${r.open.type}-${r.open.id}`} r={r} />)
              : emptyRow(t('No replies yet.'))}
          </Rows>
        </div>
      </div>
    </div>
  );
}

export function UpdatesPage({ route }: { route: Route }) {
  const me = useMe();
  const ws = useWs();
  const filter = useUi((u) => u.updFilter || 'all');
  const updates = useWorkspace((db) => db.updates);
  if (!me) return null;
  if (route.id === 'activity')
    return (
      <Page wide canvas data-page="updates">
        <PageHeader
          title={t('Updates')}
          sub={t('{d} only. History is never erased; Undo adds a new entry.', { d: divisionOf(ws)?.name ?? '' })}
        />
        <TabLinks
          label={t('Updates')}
          tabs={[
            { to: '/updates', label: t('For you'), on: false },
            { to: '/updates/activity', label: t('Activity'), on: true },
          ]}
        />
        {/* Activity feed in a white card */}
        <div className="mt-3 overflow-hidden rounded-card bg-surface shadow-card px-0 py-1">
          <ChangesFeed projectId={route.sub} />
        </div>
      </Page>
    );
  const all = updates.filter((u) => u.to === me.id);
  const list = filter === 'unread' ? all.filter((u) => !u.read) : all;
  const unread = all.filter((u) => !u.read).length;
  const days = [...new Set(list.map((u) => u.at.slice(0, 10)))];
  return (
    <Page wide canvas data-page="updates">
      <PageHeader title={t('Updates')} sub={unread ? plural(unread, '{n} unread', '{n} unread') : t('All caught up')}>
        <Segmented
          value={filter as 'all' | 'unread' | 'replies'}
          label={t('Filter')}
          options={[
            ['all', t('All')],
            ['unread', t('Unread')],
            ['replies', t('Your replies')],
          ]}
          onChange={(k) => {
            setUi((u) => {
              u.updFilter = k;
            });
          }}
        />
        {unread > 0 && (
          <Button
            small
            onClick={() => {
              void markAllRead();
            }}
          >
            <Icon name="check" />
            {t('Mark all as read')}
          </Button>
        )}
      </PageHeader>
      <TabLinks
        label={t('Updates')}
        tabs={[
          { to: '/updates', label: t('For you'), on: true },
          { to: '/updates/activity', label: t('Activity'), on: false },
        ]}
      />
      {filter === 'replies' ? (
        /* Replies: two sections in white cards (R016: label on canvas, white group) */
        <Replies />
      ) : list.length ? (
        /* For you: each day group is a white card on the canvas */
        <div className="flex flex-col gap-4 mt-3">
          {days.map((d) => (
            <div key={d}>
              {/* Day label sits on the canvas above the card */}
              <h2 className="mb-1.5 px-0.5 text-[13px] font-medium text-mute">{dayLabel(d)}</h2>
              {/* White card per day group */}
              <div className="overflow-hidden rounded-card bg-surface shadow-card py-1">
                <Rows>
                  {list
                    .filter((u) => u.at.startsWith(d))
                    .map((u) => (
                      <UpdateRow key={u.id} u={u} />
                    ))}
                </Rows>
              </div>
            </div>
          ))}
          <p className="mt-1 text-mute type-small">
            {t(
              "Updates reach you inside dwdg\u2019ONE. Email or phone notifications while the app is closed are not decided yet.",
            )}
          </p>
        </div>
      ) : (
        /* Empty state in a white card */
        <div className="mt-3 overflow-hidden rounded-card bg-surface shadow-card">
          <Empty title={filter === 'unread' ? t('Nothing unread') : t('No updates yet')}>
            {t('Offers, review requests, invitations and reminders for you appear here.')}
          </Empty>
          <p className="px-7 pb-5 -mt-1 text-mute type-small">
            {t(
              "Updates reach you inside dwdg\u2019ONE. Email or phone notifications while the app is closed are not decided yet.",
            )}
          </p>
        </div>
      )}
    </Page>
  );
}

export const ChangesCrumb = () => {
  const ws = useWs();
  return (
    <>
      {divisionOf(ws)?.short}
      <i className="mx-1.5 text-faint not-italic">/</i>
      <b>{t('Changes')}</b>
    </>
  );
};

export function ChangesPage({ route }: { route: Route }) {
  const ws = useWs();
  return (
    <Page data-page="changes">
      <PageHeader
        title={t('Changes')}
        sub={t('{d} only. History is never erased; Undo adds a new entry.', { d: divisionOf(ws)?.name ?? '' })}
      />
      <ChangesFeed projectId={route.id} />
    </Page>
  );
}
