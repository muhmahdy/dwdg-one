/* The Schedule's overlays, which can open from any page: the quick card (a block dragged on the calendar) and the meeting
   composer (New menu, Find a time, Meet with…). From screens/schedule.js quickCard / composer. */
import { useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useUi } from '@/lib/workspace/hooks';
import { useDraft } from '../services/schedule-ui';
import { closeDraft } from '../services/schedule-ui';
import { DraftForm } from './DraftForm';
import { MeetingComposer } from './MeetingComposer';

function QuickCard() {
  const d = useDraft();
  const inEditor = useUi((u) => u.insp?.type === 'event-edit');
  useEffect(() => {
    if (!d || inEditor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDraft();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [d, inEditor]);
  if (!d || inEditor) return null;
  const a = d.anchor ?? { x: window.innerWidth / 2 - 210, y: 110 };
  const w = Math.min(420, window.innerWidth - 24);
  const left = Math.max(12, Math.min(a.x, window.innerWidth - w - 12));
  const top = Math.max(12, Math.min(a.y, window.innerHeight - 520));
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={closeDraft} aria-hidden="true" />
      <div
        role="dialog"
        aria-label={t('Create')}
        className={cn(
          'fixed z-[32] max-h-[calc(100dvh-24px)] overflow-auto rounded-[10px] bg-surface px-[18px] pt-2 pb-4 shadow-pop',
        )}
        style={{ left, top, width: w }}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="-mr-2.5 flex justify-end">
          <button
            type="button"
            className="inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
            aria-label={t('Close')}
            onClick={closeDraft}
          >
            <Icon name="close" />
          </button>
        </div>
        <DraftForm d={d} full={false} />
      </div>
    </>
  );
}

export function ScheduleOverlays() {
  return (
    <>
      <QuickCard />
      <MeetingComposer />
    </>
  );
}
