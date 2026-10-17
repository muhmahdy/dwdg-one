// Tells the static app (frontend/vercel.json) where the server runs, so the browser's calls to /api reach it.
//   node scripts/deploy/set-api-origin.mjs https://dwdg-server.onrender.com            forward /api to the server (default, "rewrite")
//   node scripts/deploy/set-api-origin.mjs https://api.example.org --mode direct        the browser calls the server on its own address
//   node scripts/deploy/set-api-origin.mjs --reset                                      back to no server address
// Run it, commit the file, deploy the static app. It can be run again with another address.
//
// rewrite  The host of the static app forwards every /api/... request to the server and the browser sees one address, so no CORS
//          and nothing else to set. This works on Vercel (a rewrite to an outside address). Build the app WITHOUT VITE_API_URL.
// direct   The browser calls the server's own address. The script adds that address to the Content-Security-Policy's connect-src.
//          Then also: build the app with VITE_API_URL=<address>, and set CORS_ORIGIN=<the app's address> on the server.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** The connect-src of the committed file: the app itself and Supabase (sign-in). A server address is added to this, never to anything else. */
export const BASE_CONNECT = ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'];

/** An origin the server can be reached at: https (or http on this machine), a host, optionally a port, nothing else. */
export function parseOrigin(value) {
  let url;
  try { url = new URL(String(value)); } catch { throw new Error(`"${value}" is not an address. Use something like https://dwdg-server.onrender.com`); }
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new Error('The server address must start with https:// (http:// is accepted only for localhost).');
  if (url.username || url.password) throw new Error('The server address must not contain a user name or password.');
  if ((url.pathname !== '/' && url.pathname !== '') || url.search || url.hash) throw new Error('Give the address only, without a path: https://host or https://host:port');
  return url.origin;
}

const isApiRule = rule => rule.source.startsWith('/api/');

/** Returns the config with the server address set. `origin` null means none. Never changes anything but the /api rewrite and connect-src. */
export function apply(config, origin, mode = 'rewrite') {
  const next = structuredClone(config);
  next.rewrites = next.rewrites.filter(r => !isApiRule(r));
  const csp = next.headers.flatMap(h => h.headers).find(h => h.key === 'Content-Security-Policy');
  if (!csp) throw new Error('The config has no Content-Security-Policy.');
  const directives = csp.value.split(';').map(d => d.trim()).filter(Boolean).map(d => d.split(/\s+/));
  const connect = directives.find(d => d[0] === 'connect-src');
  if (!connect) throw new Error('The Content-Security-Policy has no connect-src.');
  connect.splice(1, connect.length, ...BASE_CONNECT);
  if (origin && mode === 'rewrite') next.rewrites.unshift({source: '/api/:path*', destination: `${origin}/api/:path*`});
  else if (origin && mode === 'direct') connect.push(origin);
  else if (origin) throw new Error(`Unknown mode "${mode}": use rewrite or direct.`);
  csp.value = directives.map(d => d.join(' ')).join('; ');
  return next;
}

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = path.resolve(arg('--file') ?? path.join(here, '../../frontend/vercel.json'));
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  try {
    const reset = process.argv.includes('--reset');
    const given = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined;
    if (!reset && !given) throw new Error('Give the server address (https://...) or --reset. See the top of scripts/deploy/set-api-origin.mjs.');
    const mode = arg('--mode') ?? 'rewrite';
    const origin = reset ? null : parseOrigin(given);
    fs.writeFileSync(file, `${JSON.stringify(apply(config, origin, mode), null, 2)}\n`);
    console.log(reset ? `${path.relative(process.cwd(), file)}: no server address.`
      : mode === 'rewrite' ? `${path.relative(process.cwd(), file)}: /api is forwarded to ${origin}. Build the app without VITE_API_URL.`
        : `${path.relative(process.cwd(), file)}: ${origin} added to connect-src. Build the app with VITE_API_URL=${origin} and set CORS_ORIGIN to the app's address on the server.`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
