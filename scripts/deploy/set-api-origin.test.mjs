// Checks of scripts/deploy/set-api-origin.mjs: the right rewrite in the right place, the policy touched only where it should be,
// and the committed file left exactly as it was when the address is taken away again.
//   node --test scripts/deploy/
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {copyFileSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {BASE_CONNECT, apply, parseOrigin} from './set-api-origin.mjs';

const SCRIPT = fileURLToPath(new URL('./set-api-origin.mjs', import.meta.url));
const COMMITTED = fileURLToPath(new URL('../../frontend/vercel.json', import.meta.url));
const config = JSON.parse(readFileSync(COMMITTED, 'utf8'));
const csp = c => c.headers.flatMap(h => h.headers).find(h => h.key === 'Content-Security-Policy').value;
const directive = (c, name) => csp(c).split(';').map(d => d.trim().split(/\s+/)).find(d => d[0] === name).slice(1);

test('the committed file has the connect-src the script builds on, and no server address', () => {
  assert.deepEqual(directive(config, 'connect-src'), BASE_CONNECT);
  assert.ok(!config.rewrites.some(r => r.source.startsWith('/api/')));
});

test('rewrite: forwards /api to the server, as the FIRST rule so the app\'s page never answers it, and changes nothing else', () => {
  const out = apply(config, 'https://dwdg-server.onrender.com');
  assert.deepEqual(out.rewrites[0], {source: '/api/:path*', destination: 'https://dwdg-server.onrender.com/api/:path*'});
  assert.deepEqual(out.rewrites.slice(1), config.rewrites);
  assert.equal(csp(out), csp(config));
  assert.deepEqual(out.headers, config.headers);
});

test('rewrite: running it again with another address replaces the first, never adds a second', () => {
  const twice = apply(apply(config, 'https://one.example'), 'https://two.example');
  assert.deepEqual(twice.rewrites.filter(r => r.source.startsWith('/api/')).map(r => r.destination), ['https://two.example/api/:path*']);
  assert.deepEqual(apply(config, 'https://two.example'), twice);
});

test('direct: allows the browser to connect to the server\'s address and to nothing else new, and adds no rewrite', () => {
  const out = apply(config, 'https://api.example.org', 'direct');
  assert.deepEqual(directive(out, 'connect-src'), [...BASE_CONNECT, 'https://api.example.org']);
  assert.deepEqual(out.rewrites, config.rewrites);
  for (const name of ['default-src', 'script-src', 'frame-ancestors', 'object-src', 'style-src']) assert.deepEqual(directive(out, name), directive(config, name), name);
  assert.ok(!/unsafe-eval/.test(csp(out)));
});

test('direct: another address replaces the first in connect-src', () => {
  const out = apply(apply(config, 'https://one.example', 'direct'), 'https://two.example', 'direct');
  assert.deepEqual(directive(out, 'connect-src'), [...BASE_CONNECT, 'https://two.example']);
});

test('switching between the two ways leaves nothing of the other behind, and taking the address away restores the committed file exactly', () => {
  const rewritten = apply(config, 'https://a.example');
  const direct = apply(rewritten, 'https://a.example', 'direct');
  assert.ok(!direct.rewrites.some(r => r.source.startsWith('/api/')));
  assert.deepEqual(apply(direct, 'https://a.example'), rewritten);
  assert.deepEqual(apply(rewritten, null), config);
  assert.deepEqual(apply(direct, null), config);
});

test('only a proper address is accepted', () => {
  assert.equal(parseOrigin('https://dwdg-server.onrender.com'), 'https://dwdg-server.onrender.com');
  assert.equal(parseOrigin('https://dwdg-server.onrender.com/'), 'https://dwdg-server.onrender.com');
  assert.equal(parseOrigin('https://api.example.org:8443'), 'https://api.example.org:8443');
  assert.equal(parseOrigin('http://localhost:8787'), 'http://localhost:8787');
  for (const bad of ['', 'dwdg-server.onrender.com', 'http://api.example.org', 'ftp://x.example', 'https://x.example/api', 'https://x.example?a=1', 'https://x.example#h', 'https://user:pass@x.example', 'not a url'])
    assert.throws(() => parseOrigin(bad), undefined, bad);
});

test('unknown mode is refused', () => {
  assert.throws(() => apply(config, 'https://a.example', 'sideways'), /Unknown mode/);
});

test('the command edits a copy of the file, says what it did, and refuses bad input', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dwdg-origin-'));
  try {
    const file = join(dir, 'vercel.json');
    copyFileSync(COMMITTED, file);
    const run = (...args) => spawnSync('node', [SCRIPT, ...args, '--file', file], {encoding: 'utf8'});
    const r = run('https://dwdg-server.onrender.com');
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /forwarded to https:\/\/dwdg-server\.onrender\.com\. Build the app without VITE_API_URL/);
    assert.equal(JSON.parse(readFileSync(file, 'utf8')).rewrites[0].destination, 'https://dwdg-server.onrender.com/api/:path*');
    assert.match(run('https://api.example.org', '--mode', 'direct').stdout, /VITE_API_URL=https:\/\/api\.example\.org.*CORS_ORIGIN/);
    assert.equal(run('--reset').status, 0);
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), config);
    assert.equal(run('http://api.example.org').status, 1);
    assert.equal(spawnSync('node', [SCRIPT, '--file', file], {encoding: 'utf8'}).status, 1);
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), config); // refusals changed nothing
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
