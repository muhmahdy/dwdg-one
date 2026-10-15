/* The organisation's fixed structure: six divisions (D18 names and shorthands) and the role classes (D6). */
import org from '@/assets/generated/org.json';
import type { DivisionId, RoleId } from '@/types/workspace';

export interface Division {
  id: DivisionId;
  name: string;
  short: string;
  /** Brand mark id in the asset table. */
  icon: string;
}

export interface Role {
  label: string;
  icon: string;
  rank: number;
}

export const DIVS = org.divisions as Division[];
export const ROLES = org.roles as Record<RoleId, Role>;
export const DEMO_TODAY = org.demoToday;

export const divisionOf = (id: DivisionId | null | undefined) => DIVS.find((d) => d.id === id);
