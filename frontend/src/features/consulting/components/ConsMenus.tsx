/* The Consulting menus: the delivery lane on an engagement (MENUS 'cs-lane') and a participant's attendance in a cohort
   session (MENUS 'tnd-att'). Choosing a lane never implies completion. */
import type { MenuRef } from '@/app/ui-state';
import { MENUS, MenuItem, MenuRule, Tick, closeMenu } from '@/components/shared/menus';
import { t } from '@/lib/i18n';
import { useWorkspace } from '@/lib/workspace/hooks';
import { engOf, LANE, type LaneId } from '../services/cons-rules';
import { setLane } from '../services/engagements';

function LaneMenu({ menu }: { menu: MenuRef }) {
  const db = useWorkspace((w) => w);
  const e = engOf(db, menu.id);
  if (!e) return null;
  const pick = (k: LaneId | null) => () => {
    closeMenu();
    void setLane(menu.id ?? '', k);
  };
  return (
    <>
      {(Object.keys(LANE) as LaneId[]).map((k) => (
        <MenuItem
          key={k}
          role="menuitemradio"
          on={e.lane === k}
          extra={e.lane === k ? <Tick /> : undefined}
          onSelect={pick(k)}
        >
          {t(LANE[k])}
        </MenuItem>
      ))}
      <MenuRule />
      <MenuItem onSelect={pick(null)}>{t('Not set')}</MenuItem>
    </>
  );
}

MENUS['cs-lane'] = LaneMenu;
