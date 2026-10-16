/* The Schedule's menus: More (go to a date, how it works), the help card, and the layers list for narrow screens.
   From screens/schedule.js MENUS.calmore / calhelp / layers. */
import { closeMenu, MENUS, MenuItem } from '@/components/shared/menus';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { setUi } from '@/lib/workspace/transaction';
import type { Layers } from '../services/calendar';
import { toggleLayer, useLayers } from '../services/schedule-ui';

function MoreMenu() {
  return (
    <>
      <MenuItem
        icon="calendar"
        onSelect={() => {
          closeMenu();
          const input = document.getElementById('cal-jump');
          if (input instanceof HTMLInputElement)
            try {
              input.showPicker();
            } catch {
              input.focus();
            }
        }}
      >
        {t('Go to a date')}
      </MenuItem>
      <MenuItem
        icon="info"
        onSelect={() => {
          setUi((u) => {
            if (u.menu) u.menu = { ...u.menu, type: 'calhelp', width: 320 };
          });
        }}
      >
        {t('How the schedule works')}
      </MenuItem>
    </>
  );
}

function HelpCard() {
  return (
    <div className="px-3 py-2.5 text-d13 [&_p]:mt-1.5 [&_p]:mb-0 [&_p]:text-ink-2">
      <b>{t('How the schedule works')}</b>
      <p>{t('Shortcuts: T today, D day, W week, M month, J next, K previous, C create.')}</p>
      <p>
        {t(
          'Click or drag on empty time to create. Drag your own meetings and unavailable time to move them, or select one and use the arrow keys. Meetings others organize stay put. Task due dates sit in the all-day row and never block hours.',
        )}
      </p>
      <p>
        {t(
          'Arrow keys move a selected item by 15 minutes, Shift with arrows changes its length, Left and Right move it a day.',
        )}
      </p>
    </div>
  );
}

const LAYER_LABELS: [keyof Layers, string][] = [
  ['meetings', 'Meetings'],
  ['away', 'My unavailable time'],
  ['google', 'Google Calendar busy time'],
  ['due', 'Due dates and milestones'],
];

function LayersMenu() {
  const layers = useLayers();
  return (
    <>
      {LAYER_LABELS.map(([k, label]) => (
        <MenuItem
          key={k}
          role="menuitemradio"
          on={false}
          icon={
            <span
              className={cn(
                'inline-grid size-[18px] flex-none place-items-center rounded-md bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)]',
                layers[k] &&
                  "bg-ink text-on-ink shadow-none after:h-[5px] after:w-[9px] after:-translate-y-px after:-rotate-45 after:border-2 after:border-t-0 after:border-r-0 after:content-['']",
              )}
            />
          }
          onSelect={() => {
            closeMenu();
            toggleLayer(k);
          }}
        >
          {t(label)}
        </MenuItem>
      ))}
    </>
  );
}

MENUS.calmore = MoreMenu;
MENUS.calhelp = HelpCard;
MENUS.layers = LayersMenu;
