/* The stage menus on a relationship and an opportunity (MENUS 'ec-rel-st', 'ec-opp-st'). Choosing a stage never records an
   interaction; gated changes (a reason, a win, a review date) open the stage panel first. */
import type { MenuRef } from '@/app/ui-state';
import { Chip } from '@/components/shared/division-ui';
import { MENUS, MenuItem, MenuRule, Tick, closeMenu } from '@/components/shared/menus';
import { openPanel } from '@/lib/open';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import {
  OPP,
  OPP_FLOW,
  OPP_SIDE,
  REL,
  REL_ORDER,
  canStage,
  oppDef,
  oppOf,
  orgOf,
  type OppStage,
  type RelStage,
} from '../services/ee-data';
import { changeStage, stageGated } from '../services/external';

function RelStageMenu({ menu }: { menu: MenuRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = orgOf(db, menu.id);
  if (!o) return null;
  const pick = (to: RelStage) => {
    closeMenu();
    if (o.stage === to || !canStage(o, m)) return;
    if (stageGated(db, 'rel', o, to)) openPanel('ec-stage', o.id, { k: 'rel', to });
    else void changeStage('rel', o.id, to);
  };
  return (
    <>
      {REL_ORDER.map((s) => (
        <MenuItem
          key={s}
          role="menuitemradio"
          on={s === o.stage}
          extra={s === o.stage ? <Tick /> : undefined}
          onSelect={() => {
            pick(s);
          }}
        >
          <Chip def={REL[s]} />
        </MenuItem>
      ))}
    </>
  );
}

function OppStageMenu({ menu }: { menu: MenuRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = oppOf(db, menu.id);
  if (!o) return null;
  const pick = (to: OppStage) => {
    closeMenu();
    if (o.stage === to || !canStage(o, m)) return;
    if (stageGated(db, 'opp', o, to)) openPanel('ec-stage', o.id, { k: 'opp', to });
    else void changeStage('opp', o.id, to);
  };
  const item = (s: OppStage) => (
    <MenuItem
      key={s}
      role="menuitemradio"
      on={s === o.stage}
      extra={s === o.stage ? <Tick /> : undefined}
      onSelect={() => {
        pick(s);
      }}
    >
      <Chip def={s === 'active' ? oppDef({ stage: 'active', kind: o.kind }) : OPP[s]} />
    </MenuItem>
  );
  return (
    <>
      {OPP_FLOW.map(item)}
      <MenuRule />
      {OPP_SIDE.map(item)}
    </>
  );
}

MENUS['ec-rel-st'] = RelStageMenu;
MENUS['ec-opp-st'] = OppStageMenu;
