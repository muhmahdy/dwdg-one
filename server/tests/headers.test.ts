/* The security headers of the browser app (frontend/vercel.json) and the SPA rewrite. The policy itself was checked in a
   browser against a build of the app: it renders, no inline script or foreign connection is allowed. These checks keep it
   from being loosened by accident. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface Config {
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: { key: string; value: string }[] }[];
}
const config = JSON.parse(readFileSync(join(import.meta.dirname, '../../frontend/vercel.json'), 'utf8')) as Config;
const all: Record<string, string> = Object.fromEntries((config.headers.find((h) => h.source === '/(.*)')?.headers ?? []).map((h) => [h.key, h.value]));
const csp: Record<string, string[]> = Object.fromEntries(
  (all['Content-Security-Policy'] ?? '')
    .split(';')
    .map((d) => d.trim().split(/\s+/))
    .filter((d) => d[0])
    .map(([name = '', ...values]): [string, string[]] => [name, values]),
);

describe('Content-Security-Policy', () => {
  it('allows only the app itself by default, and no plugins or framing', () => {
    expect(csp['default-src']).toEqual(["'self'"]);
    expect(csp['object-src']).toEqual(["'none'"]);
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
    expect(csp['base-uri']).toEqual(["'self'"]);
    expect(csp['form-action']).toEqual(["'self'"]);
  });

  it('runs scripts from the app only: no inline script, no eval, no foreign host', () => {
    expect(csp['script-src']).toEqual(["'self'"]);
    expect(JSON.stringify(csp)).not.toMatch(/unsafe-eval|unsafe-hashes/);
  });

  it('connects only to the app and to Supabase (sign-in), never to an arbitrary host', () => {
    expect(csp['connect-src']).toEqual(["'self'", 'https://*.supabase.co', 'wss://*.supabase.co']);
  });

  it('keeps inline styles (React style attributes) and nothing broader than that for styles', () => {
    expect(csp['style-src']).toEqual(["'self'", "'unsafe-inline'"]);
  });
});

describe('the other headers', () => {
  it('are all there', () => {
    expect(all['X-Content-Type-Options']).toBe('nosniff');
    expect(all['X-Frame-Options']).toBe('DENY');
    expect(all['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(all['Strict-Transport-Security']).toMatch(/max-age=\d{7,}/);
    expect(all['Permissions-Policy']).toContain('camera=()');
    expect(all['Cross-Origin-Opener-Policy']).toBe('same-origin-allow-popups');
  });

  it('cache the hashed assets for a year and nothing else', () => {
    const assets = config.headers.find((h) => h.source === '/assets/(.*)');
    expect(assets?.headers).toEqual([{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]);
    expect(config.headers.filter((h) => h.headers.some((x) => x.key === 'Cache-Control'))).toHaveLength(1);
  });
});

describe('the single-page rewrite', () => {
  const rewrite = new RegExp(`^${config.rewrites[0]?.source ?? ''}$`);

  it('sends every page path to index.html', () => {
    expect(config.rewrites).toEqual([expect.objectContaining({ destination: '/index.html' })]);
    for (const path of ['/', '/work', '/projects/p-roadmap/wbs', '/invite/inv-1', '/auth/callback']) expect(rewrite.test(path), path).toBe(true);
  });

  it('leaves the API and the built files alone, so they are never answered with the app\'s page', () => {
    for (const path of ['/api/health', '/api/workspace', '/assets/index-abc.js', '/brand/dwdg-one-mark.svg', '/people/mahdy.jpg']) expect(rewrite.test(path), path).toBe(false);
  });
});
