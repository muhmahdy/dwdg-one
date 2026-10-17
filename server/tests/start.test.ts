/* The production entry: the server starts on a port, answers its health check, refuses to start without its settings, and stops
   cleanly. The real entry file (main.ts) is run as its own process; stopping is checked on the shared start function because
   a process cannot be sent SIGTERM on every platform. */
import { spawn, spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.ts';
import { loadConfig } from '../src/config.ts';
import { startServer, type RunningServer } from '../src/start.ts';
import { fakeHub, fakeSpokes } from './helpers.ts';

const main = join(import.meta.dirname, '../src/main.ts');
const HUB = { HUB_SUPABASE_URL: 'https://hub.invalid', HUB_SUPABASE_PUBLISHABLE_KEY: 'pk', HUB_SUPABASE_SERVICE_KEY: 'sk' };

const running: RunningServer[] = [];
afterEach(async () => {
  for (const r of running.splice(0)) await r.stop(100);
});

async function boot() {
  const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub: fakeHub(), spokes: fakeSpokes(), env: {} });
  const r = await startServer(app, { port: 0, host: '127.0.0.1' });
  running.push(r);
  return r;
}

describe('startServer', () => {
  it('listens on the port it was given (0 picks a free one) and answers the health check', async () => {
    const r = await boot();
    expect(r.port).toBeGreaterThan(0);
    const res = await fetch(`http://127.0.0.1:${r.port}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  it('stops: the port is closed afterwards, and a request in flight is not cut off', async () => {
    const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub: fakeHub(), spokes: fakeSpokes(), env: {} });
    const r = await startServer(app, { port: 0, host: '127.0.0.1' });
    expect((await fetch(`http://127.0.0.1:${r.port}/api/health`)).status).toBe(200);
    await r.stop(1000);
    const open = await new Promise<boolean>((resolve) => {
      const c = createConnection({ port: r.port, host: '127.0.0.1' });
      c.once('connect', () => {
        c.destroy();
        resolve(true);
      });
      c.once('error', () => {
        resolve(false);
      });
    });
    expect(open).toBe(false);
  });

  it('refuses a port that is already taken, with an error rather than silence', async () => {
    const first = await boot();
    const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub: fakeHub(), spokes: fakeSpokes(), env: {} });
    await expect(startServer(app, { port: first.port, host: '127.0.0.1' })).rejects.toThrow(/EADDRINUSE/);
  });
});

describe('main.ts as its own process', () => {
  it('starts with only the hub settings, listens where the environment says, and answers /api/health', async () => {
    const port = 20000 + Math.floor(Math.random() * 20000);
    const child = spawn('node', [main], { env: { PATH: process.env.PATH ?? '', ...HUB, PORT: String(port), HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d: Buffer) => {
      out += d.toString();
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`the server did not start: ${out}`));
        }, 15_000);
        child.stdout.on('data', () => {
          if (out.includes('listening')) {
            clearTimeout(timer);
            resolve();
          }
        });
        child.once('exit', (code) => {
          clearTimeout(timer);
          reject(new Error(`the server exited with ${String(code)}: ${out}`));
        });
      });
      expect(out).toContain(`http://127.0.0.1:${port}/api`);
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { ok: boolean; divisions: Record<string, { configured: boolean }> };
      expect(body.ok).toBe(true);
      expect(Object.values(body.divisions).every((d) => !d.configured)).toBe(true); // no division settings were given
      expect((await fetch(`http://127.0.0.1:${port}/api/me`)).status).toBe(401);
    } finally {
      child.kill();
    }
  }, 30_000);

  it('does not start without its settings, names the missing ones, and never prints a value', () => {
    const r = spawnSync('node', [main], { env: { PATH: process.env.PATH ?? '', HUB_SUPABASE_SERVICE_KEY: 'super-secret-value' }, encoding: 'utf8', timeout: 15_000 });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/HUB_SUPABASE_URL/);
    expect(r.stderr).toMatch(/HUB_SUPABASE_PUBLISHABLE_KEY/);
    expect(r.stderr + r.stdout).not.toContain('super-secret-value');
  });
});

describe('where the visitor\'s address comes from', () => {
  it('defaults to X-Forwarded-For and can be pointed at the header the host sets', () => {
    expect(loadConfig(HUB).clientIpHeader).toBe('x-forwarded-for');
    expect(loadConfig({ ...HUB, CLIENT_IP_HEADER: 'Fly-Client-IP' }).clientIpHeader).toBe('fly-client-ip');
    expect(loadConfig({ ...HUB, CLIENT_IP_HEADER: '' }).clientIpHeader).toBe('x-forwarded-for');
    expect(() => loadConfig({ ...HUB, CLIENT_IP_HEADER: 'bad header!' })).toThrow(/CLIENT_IP_HEADER/);
  });

  it('is the header the brake on refused tokens reads', async () => {
    const hub = fakeHub();
    const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined, clientIpHeader: 'fly-client-ip' }, hub, spokes: fakeSpokes(), env: {} });
    const ask = (headers: Record<string, string>) => app.request('/api/me', { headers: { Authorization: 'Bearer forged', ...headers } });
    for (let i = 0; i < 30; i++) expect((await ask({ 'Fly-Client-IP': '203.0.113.5' })).status).toBe(401);
    expect((await ask({ 'Fly-Client-IP': '203.0.113.5' })).status).toBe(429);
    // another visitor, and the forged X-Forwarded-For that this host does not use, are not blocked by it
    expect((await ask({ 'Fly-Client-IP': '203.0.113.6' })).status).toBe(401);
    expect((await ask({ 'Fly-Client-IP': '203.0.113.6', 'X-Forwarded-For': '203.0.113.5' })).status).toBe(401);
  });
});
