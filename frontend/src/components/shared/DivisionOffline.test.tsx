import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DIVISION_OF_MODULE } from '@/app/router/division-of-module';
import { PAGES } from '@/app/router/pages';
import { divisionStatusStore } from '@/lib/workspace/division-status';
import { DivisionOffline } from './DivisionOffline';

afterEach(() => {
  divisionStatusStore.set({});
});

describe('DivisionOffline', () => {
  it('says the division is not connected yet when the server has no project for it', () => {
    divisionStatusStore.set({ hr: 'not_configured' });
    render(<DivisionOffline d="hr" />);
    expect(screen.getByTestId('division-offline')).toHaveTextContent('Human Resources');
    expect(screen.getByTestId('division-offline')).toHaveTextContent('not connected yet');
  });

  it('says it cannot be reached when the project exists but is not answering', () => {
    divisionStatusStore.set({ fnl: 'unavailable' });
    render(<DivisionOffline d="fnl" />);
    expect(screen.getByTestId('division-offline')).toHaveTextContent('cannot be reached right now');
  });
});

describe('which pages belong to a division', () => {
  it('maps exactly the six division modules, each to a different division', () => {
    expect(Object.keys(DIVISION_OF_MODULE).sort()).toEqual([
      'consulting',
      'external',
      'finance-legal',
      'hr',
      'marketing-it',
      'strategy',
    ]);
    expect(new Set(Object.values(DIVISION_OF_MODULE)).size).toBe(6);
  });

  it('every page of a division module is a page the app really has', () => {
    const modules = new Set(Object.values(PAGES).map((p) => p.module));
    for (const m of Object.keys(DIVISION_OF_MODULE)) expect(modules.has(m), m).toBe(true);
  });
});
