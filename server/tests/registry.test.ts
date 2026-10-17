import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.ts';
import { DivisionNotConfigured, db } from '../src/lib/divisions/client.ts';
import {
  DIVISIONS,
  configuredDivisions,
  getDivisionEnv,
  isConfigured,
  isDivisionSlug,
} from '../src/lib/divisions/registry.ts';

describe('division registry', () => {
  it("lists the six divisions in the app's own ids", () => {
    expect(DIVISIONS.map((d) => d.slug)).toEqual(['ee', 'mcit', 'hr', 'fnl', 'sng', 'cons']);
  });

  it('accepts only whitelisted slugs, so no environment name is ever built from request input', () => {
    expect(isDivisionSlug('hr')).toBe(true);
    for (const bad of ['consulting', 'HR', 'hr ', '', '../hr', 'hub', '__proto__', 'constructor'])
      expect(isDivisionSlug(bad)).toBe(false);
  });

  it('reads SPOKE_<SLUG>_URL and SPOKE_<SLUG>_SERVICE_KEY, and needs both', () => {
    const env = { SPOKE_CONS_URL: 'https://c.example', SPOKE_CONS_SERVICE_KEY: 'k', SPOKE_HR_URL: 'https://h.example' };
    expect(getDivisionEnv('cons', env)).toEqual({ url: 'https://c.example', key: 'k' });
    expect(isConfigured('hr', env)).toBe(false);
    expect(isConfigured('ee', env)).toBe(false);
    expect(configuredDivisions(env).map((d) => d.slug)).toEqual(['cons']);
  });

  it('does not throw when no division is configured', () => {
    expect(configuredDivisions({})).toEqual([]);
  });

  it('db() refuses an unconfigured division with a typed error and reuses the client of a configured one', () => {
    expect(() => db('sng', {})).toThrow(DivisionNotConfigured);
    const env = { SPOKE_SNG_URL: 'https://s.example', SPOKE_SNG_SERVICE_KEY: 'k' };
    expect(db('sng', env)).toBe(db('sng', env));
  });
});

describe('server settings', () => {
  const hub = {
    HUB_SUPABASE_URL: 'https://hub.example',
    HUB_SUPABASE_PUBLISHABLE_KEY: 'pub',
    HUB_SUPABASE_SERVICE_KEY: 'svc',
  };

  it('needs only the hub', () => {
    expect(loadConfig(hub)).toMatchObject({ hubUrl: 'https://hub.example', port: 8787, corsOrigin: undefined });
  });

  it('names the missing variables but never prints a value', () => {
    const attempt = () => loadConfig({ HUB_SUPABASE_URL: 'not-a-url', HUB_SUPABASE_SERVICE_KEY: 'super-secret-value' });
    expect(attempt).toThrow(/HUB_SUPABASE_URL/);
    expect(attempt).toThrow(/HUB_SUPABASE_PUBLISHABLE_KEY/);
    expect(attempt).not.toThrow(/super-secret-value/);
  });
});
