import type { DivisionId } from '@/types/workspace';

/** The division each feature module belongs to; modules not listed here are shared by every division. */
export const DIVISION_OF_MODULE: Readonly<Record<string, DivisionId>> = {
  hr: 'hr',
  strategy: 'sng',
  external: 'ee',
  consulting: 'cons',
  'finance-legal': 'fnl',
  'marketing-it': 'mcit',
};
