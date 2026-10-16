/* One VEVENT in Asia/Jakarta (integration-calendar: .ics stays available to everyone). */
import { mins } from '@/lib/time';
import type { Meeting } from '@/types/workspace';

export const TZ_LABEL = 'Asia/Jakarta (GMT+7)';

const stamp = (d: string, m: number) => `${d.replace(/-/g, '')}T${mins(m).replace(':', '')}00`;
/** RFC 5545 text escaping: backslash, semicolon and comma get a backslash; line breaks become \n. */
const escape = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export function icsFor(mt: Meeting): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DWDG UII//dwdgONE//EN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Jakarta',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:WIB',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${mt.id}@dwdg-one.local`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=Asia/Jakarta:${stamp(mt.date, mt.start)}`,
    `DTEND;TZID=Asia/Jakarta:${stamp(mt.date, mt.end)}`,
    `SUMMARY:${escape(mt.title)}`,
    mt.where ? `LOCATION:${escape(mt.where)}` : '',
    mt.agenda ? `DESCRIPTION:${escape(mt.agenda)}` : '',
    mt.state === 'cancelled' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/** Saves the meeting as a calendar file through a temporary link. */
export function downloadIcs(mt: Meeting) {
  const url = URL.createObjectURL(new Blob([icsFor(mt)], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mt.title.replace(/[^\w\- ]+/g, '').trim() || 'meeting'}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
