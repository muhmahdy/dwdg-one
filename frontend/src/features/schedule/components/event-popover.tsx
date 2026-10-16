/* The small card that opens beside a calendar item (D23): when, where, guests, reply, and the way into the details or the
   editor. Opens beside the item, to its right or its left when there is no room. From screens/schedule.js evpop. */
import type { ReactNode } from 'react';
import type { MenuRef } from '@/app/ui-state';
import { AvatarBubbles } from '@/components/shared/Avatar';
import { closeMenu, MENUS, openMenu } from '@/components/shared/menus';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t, WDL } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { dLong, mins } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { overlaps, unavailableOn } from '../services/availability';
import { draftFromMeeting } from '../services/drafts';
import { downloadIcs, TZ_LABEL } from '../services/ics';
import { deleteUnavailable } from '../services/meeting-actions';
import { rsvp } from '../services/meetings';
import { openDraft } from '../services/schedule-ui';
import { WhereText } from './WhereText';

type Kind = 'meeting' | 'unavail' | 'gbusy';

/** Opens the details panel for an item (closing the card). */
export function openDetails(kind: Kind, id: string) {
  setUi((u) => {
    u.menu = null;
    u.form = null;
    u.ua = null;
    u.insp = { type: kind, id };
  });
}

/** Opens the card beside the item; without an anchor (keyboard from elsewhere) goes straight to the details. */
export function openEvent(kind: Kind, id: string, anchor?: HTMLElement) {
  if (!anchor) {
    openDetails(kind, id);
    return;
  }
  const r = anchor.getBoundingClientRect();
  const width = Math.min(360, window.innerWidth - 16);
  const right = r.right + 10 + width <= window.innerWidth;
  const x = right ? r.right + 10 : Math.max(8, r.left - width - 10);
  openMenu(anchor, {
    type: 'evpop',
    k: kind,
    id,
    width,
    est: 320,
    rect: { x, y: r.top - 8, left: x, right: x + width, top: r.top - 8, bottom: r.top - 8, width: 0, height: 0 },
  });
}

const row = 'm-0 flex items-center gap-2.5 text-d13 text-ink-2 [&>.ic]:flex-none [&>.ic]:text-mute';
const swatch = 'mt-[5px] size-3.5 flex-none rounded-[4px] bg-green';

function Top({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <i className={cn(swatch, tone)} />
      <h3 className="m-0 flex-1 font-sans text-d17 leading-[23px] font-semibold">{children}</h3>
      <button
        type="button"
        className="inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
        aria-label={t('Close')}
        onClick={closeMenu}
      >
        <Icon name="close" />
      </button>
    </div>
  );
}

function MeetingCard({ id }: { id: string }) {
  const me = useMe();
  const who = useWho();
  const mt = useWorkspace((db) => db.meetings.find((m) => m.id === id));
  const clash = useWorkspace(
    (db) =>
      !!mt &&
      db.unavailable.some(
        (u) =>
          u.who === me?.id &&
          unavailableOn(u, mt.date) &&
          overlaps(mt.start, mt.end, u.allDay ? 0 : u.start, u.allDay ? 1440 : u.end),
      ),
  );
  if (!mt || !me) return null;
  const r = mt.responses;
  const mine = r[me.id];
  const org = mt.organizer === me.id;
  const ids = Object.keys(r);
  const count = (v: string) => ids.filter((i) => r[i] === v).length;
  const going = count('accepted');
  const waiting = count('pending');
  const no = count('declined');
  const guests = [
    going && t('{n} going', { n: going }),
    waiting && t('{n} waiting', { n: waiting }),
    no && t('{n} declined', { n: no }),
  ]
    .filter(Boolean)
    .join(', ');
  const reply = (v: 'accepted' | 'declined') => {
    void rsvp(mt.id, v);
    closeMenu();
  };
  return (
    <div className="grid gap-2 px-3.5 pt-3 pb-3.5">
      <Top tone={mine === 'pending' ? 'bg-surface shadow-[inset_0_0_0_2px_var(--green)]' : undefined}>{mt.title}</Top>
      <p className="mt-[-2px] mr-0 mb-0 ml-6 text-d13h">
        {dLong(mt.date)},{' '}
        <span className="type-num">
          {mins(mt.start)}–{mins(mt.end)}
        </span>
        <small className="block text-d12 text-mute">{TZ_LABEL}</small>
      </p>
      {clash && (
        <p className="m-0 ml-6 flex items-center gap-1.5 text-d12h font-semibold text-danger">
          <Icon name="warning" size="xs" />
          {t('Clashes with your unavailable time')}
        </p>
      )}
      {mt.where && (
        <p className={row}>
          <Icon name="link" size="sm" />
          <WhereText where={mt.where} />
        </p>
      )}
      <p className={row}>
        <Icon name="people" size="sm" />
        <span>
          {t('{n} guests', { n: ids.length })}: {guests}
        </span>
        <span className="ml-auto">
          <AvatarBubbles ids={ids} size="xs" />
        </span>
      </p>
      <p className={row}>
        <Icon name="person" size="sm" />
        <span>{t('Organized by {who}', { who: who.name(mt.organizer) })}</span>
      </p>
      {mine && !org && mt.state === 'planned' && (
        <div className="flex items-center gap-1.5 border-t border-line pt-2 text-d13">
          <span className="mr-auto font-semibold">{t('Going?')}</span>
          <Button
            small
            variant={mine === 'accepted' ? 'primary' : 'default'}
            autoFocus={mine === 'pending'}
            onClick={() => {
              reply('accepted');
            }}
          >
            {t('Yes')}
          </Button>
          <Button
            small
            variant={mine === 'declined' ? 'primary' : 'default'}
            onClick={() => {
              reply('declined');
            }}
          >
            {t('No')}
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 border-t border-line pt-2">
        <Button
          small
          onClick={() => {
            openDetails('meeting', mt.id);
          }}
        >
          {t('Details')}
        </Button>
        {org && mt.state === 'planned' && (
          <Button
            small
            onClick={() => {
              closeMenu();
              openDraft(draftFromMeeting(mt), true);
            }}
          >
            <Icon name="edit" />
            {t('Edit')}
          </Button>
        )}
        <Button
          small
          variant="ghost"
          onClick={() => {
            downloadIcs(mt);
          }}
        >
          <Icon name="download" />
          .ics
        </Button>
      </div>
    </div>
  );
}

function UnavailableCard({ id }: { id: string }) {
  const u = useWorkspace((db) => db.unavailable.find((x) => x.id === id));
  if (!u) return null;
  return (
    <div className="grid gap-2 px-3.5 pt-3 pb-3.5">
      <Top tone="bg-[repeating-linear-gradient(135deg,var(--line-strong)_0_3px,var(--fill)_3px_6px)]">
        {u.note || t('Unavailable')}
      </Top>
      <p className="mt-[-2px] mr-0 mb-0 ml-6 text-d13h">
        {u.allDay ? (
          t('All day')
        ) : (
          <span className="type-num">
            {mins(u.start)}–{mins(u.end)}
          </span>
        )}
        {u.weekly ? `, ${t('every {day}', { day: WDL()[u.day % 7] ?? '' })}` : u.date ? `, ${dLong(u.date)}` : ''}
      </p>
      <p className={row}>
        <Icon name="lock" size="sm" />
        <span>{t('Only you see this note. Others see that you are unavailable.')}</span>
      </p>
      <div className="flex flex-wrap gap-1.5 border-t border-line pt-2">
        <Button
          small
          autoFocus
          onClick={() => {
            openDetails('unavail', u.id);
          }}
        >
          <Icon name="edit" />
          {t('Edit')}
        </Button>
        <Button
          small
          variant="danger"
          onClick={() => {
            closeMenu();
            void deleteUnavailable(u.id);
          }}
        >
          <Icon name="trash" />
          {t('Remove')}
        </Button>
      </div>
    </div>
  );
}

function GoogleCard({ id }: { id: string }) {
  const g = useWorkspace((db) => db.gbusy.find((x) => x.id === id));
  if (!g) return null;
  return (
    <div className="grid gap-2 px-3.5 pt-3 pb-3.5">
      <Top tone="bg-ink-2">{g.title}</Top>
      <p className="mt-[-2px] mr-0 mb-0 ml-6 text-d13h">
        {dLong(g.date)},{' '}
        <span className="type-num">
          {mins(g.start)}–{mins(g.end)}
        </span>
      </p>
      <p className={row}>
        <Icon name="lock" size="sm" />
        <span>{t('From Google Calendar. Only you see this title; others see busy. Edit it in Google Calendar.')}</span>
      </p>
    </div>
  );
}

function EventPopover({ menu }: { menu: MenuRef }) {
  const id = menu.id ?? '';
  const kind = menu.k as Kind;
  return kind === 'meeting' ? (
    <MeetingCard id={id} />
  ) : kind === 'unavail' ? (
    <UnavailableCard id={id} />
  ) : (
    <GoogleCard id={id} />
  );
}

MENUS.evpop = EventPopover;
