/* The access rules of the division tables, by table name. A division whose tables ALL have a rule here is served by the
   server; a division with a table missing is not (its rows never leave the server), so a rule cannot be forgotten. */
import { TABLE_HOME, VALUES_TABLE, type DivisionId } from '../../generated/partition.ts';
import { cons_cohorts, cons_dlv, cons_engagements, cons_kn, cons_staff } from './cons.ts';
import { ee_contacts, ee_fu, ee_handoffs, ee_interactions, ee_opps, ee_orgs, ee_postpones } from './ee.ts';
import { fnl_allocations, fnl_incoming, fnl_legal, fnl_payments, fnl_periods, fnl_register, fnl_requests } from './fnl.ts';
import {
  hr_actions,
  hr_assessments,
  hr_cycles,
  hr_notices,
  hr_onboarding_instances,
  hr_onboarding_templates,
  hr_packets,
  hr_registers,
  hr_rounds,
} from './hr.ts';
import { mcit_accounts, mcit_briefs, mcit_campaigns, mcit_content, mcit_it } from './mcit.ts';
import { sng_initiatives, sng_packets } from './sng.ts';
import type { TablePolicy } from './types.ts';
import { store_values } from './values.ts';

export {
  mayChange,
  mayDelete,
  mayRead,
  mayUpsert,
  mayWrite,
  noLookup,
  type Lookup,
  type RowView,
  type TablePolicy,
} from './types.ts';

export type PolicyTable = Readonly<Record<string, TablePolicy>>;

export const TABLE_POLICIES: PolicyTable = {
  sng_initiatives,
  sng_packets,
  mcit_campaigns,
  mcit_content,
  mcit_briefs,
  mcit_it,
  mcit_accounts,
  ee_orgs,
  ee_contacts,
  ee_interactions,
  ee_fu,
  ee_postpones,
  ee_opps,
  ee_handoffs,
  cons_engagements,
  cons_dlv,
  cons_staff,
  cons_kn,
  cons_cohorts,
  hr_registers,
  hr_notices,
  hr_cycles,
  hr_assessments,
  hr_actions,
  hr_rounds,
  hr_packets,
  hr_onboarding_templates,
  hr_onboarding_instances,
  fnl_legal,
  fnl_register,
  fnl_allocations,
  fnl_requests,
  fnl_payments,
  fnl_incoming,
  fnl_periods,
};

/** The rule for a table of a division project, or undefined when there is none (then nothing of it is served). */
export function policyFor(table: string, policies: PolicyTable = TABLE_POLICIES): TablePolicy | undefined {
  if (table === VALUES_TABLE) return store_values;
  return Object.hasOwn(policies, table) ? policies[table] : undefined;
}

/** True when every table of the division has an access rule. */
export function hasPolicies(slug: DivisionId, policies: PolicyTable = TABLE_POLICIES): boolean {
  const tables = Object.entries(TABLE_HOME).filter(([, home]) => home === slug);
  return tables.length > 0 && tables.every(([name]) => Object.hasOwn(policies, name));
}
