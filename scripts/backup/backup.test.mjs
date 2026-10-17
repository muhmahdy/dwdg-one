// Offline checks of the backup logic: the real encryption on real files, and the whole run with a stand-in for pg_dump and
// pg_restore (neither is installed on every machine). A real dump and restore still has to be done once against Supabase.
//   node --test scripts/backup/
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {decryptFile, encryptFile, parseKey, sha256File} from './lib/crypto.mjs';
import {PROJECTS, SENSITIVE, dumpArgs, fileName, minTables, parseProjects, runBackup, schemasOf, urlOf} from './lib/backup.mjs';

const dir = () => mkdtempSync(join(tmpdir(), 'dwdg-backup-test-'));
const KEY = randomBytes(32).toString('base64');
const OTHER_KEY = randomBytes(32).toString('base64');

test('encryption: a file comes back the same, and the encrypted file shows nothing of it', async () => {
  const d = dir();
  try {
    const plain = join(d, 'a.dump');
    const data = Buffer.concat([Buffer.from('PGDMP secret salary 12345678'), randomBytes(200_000)]);
    writeFileSync(plain, data);
    await encryptFile(plain, join(d, 'a.dump.enc'), parseKey(KEY));
    const enc = readFileSync(join(d, 'a.dump.enc'));
    assert.ok(!enc.includes('secret salary'));
    assert.ok(enc.length > data.length);
    const hash = await decryptFile(join(d, 'a.dump.enc'), join(d, 'back.dump'), parseKey(KEY));
    assert.equal(hash, await sha256File(plain));
    assert.ok(readFileSync(join(d, 'back.dump')).equals(data));
    assert.equal(await decryptFile(join(d, 'a.dump.enc'), null, parseKey(KEY)), hash); // checking without writing
  } finally { rmSync(d, {recursive: true, force: true}); }
});

test('encryption: a wrong key, a changed byte, a cut file and a plain file are all refused', async () => {
  const d = dir();
  try {
    const plain = join(d, 'a.dump');
    writeFileSync(plain, randomBytes(50_000));
    const enc = join(d, 'a.dump.enc');
    await encryptFile(plain, enc, parseKey(KEY));
    await assert.rejects(decryptFile(enc, null, parseKey(OTHER_KEY)));
    const bytes = readFileSync(enc);
    const flipped = Buffer.from(bytes); flipped[100] ^= 1;
    writeFileSync(join(d, 'flipped.enc'), flipped);
    await assert.rejects(decryptFile(join(d, 'flipped.enc'), null, parseKey(KEY)));
    writeFileSync(join(d, 'cut.enc'), bytes.subarray(0, bytes.length - 40));
    await assert.rejects(decryptFile(join(d, 'cut.enc'), null, parseKey(KEY)));
    await assert.rejects(decryptFile(plain, null, parseKey(KEY)), /Not an encrypted backup/);
    await assert.rejects(encryptFile(plain, enc, parseKey(KEY))); // never overwrites
  } finally { rmSync(d, {recursive: true, force: true}); }
});

test('encryption: the key must be 32 bytes', () => {
  for (const bad of [undefined, '', 'short', Buffer.alloc(16).toString('base64'), Buffer.alloc(33).toString('base64')]) assert.throws(() => parseKey(bad), /32 random bytes/);
  assert.equal(parseKey(KEY).length, 32);
});

test('projects: seven, the hub first, HR and Finance & Legal are the sensitive ones', () => {
  assert.deepEqual(PROJECTS, ['hub', 'ee', 'mcit', 'hr', 'fnl', 'sng', 'cons']);
  assert.deepEqual([...SENSITIVE].sort(), ['fnl', 'hr']);
  assert.deepEqual(parseProjects('all'), PROJECTS);
  assert.deepEqual(parseProjects(undefined), ['hub']);
  assert.deepEqual(parseProjects('hr, fnl'), ['hr', 'fnl']);
  assert.throws(() => parseProjects('hub,moon'), /Unknown project: moon/);
});

test('projects: schemas, how many tables of data a healthy dump lists, connection strings, file names', () => {
  assert.deepEqual(schemasOf('hub'), ['public', 'app', 'private']);
  assert.deepEqual(schemasOf('sng'), ['public', 'app']);
  assert.equal(minTables('hub'), 28); // 25 data tables, divisions, division_progress, audit_log
  assert.equal(minTables('sng'), 5); // 2 data tables, store_values, schema_meta, row_tables
  assert.equal(minTables('hr'), 12);
  assert.equal(urlOf('hr', {DATABASE_URL_HR: 'x'}), 'x');
  assert.equal(urlOf('hub', {DATABASE_URL: 'old'}), 'old');
  assert.equal(urlOf('hub', {DATABASE_URL: 'old', DATABASE_URL_HUB: 'new'}), 'new');
  assert.equal(urlOf('hr', {DATABASE_URL: 'old'}), undefined);
  assert.equal(fileName('hr', new Date(2026, 9, 17, 3, 4, 5), true), 'hr-backup-2026-10-17_03-04-05.dump.enc');
  assert.deepEqual(dumpArgs('sng', 'f', 'url').slice(-3), ['--schema=app', '--file=f', 'url']);
});

/** A stand-in for pg_dump and pg_restore: dump writes a file, restore --list prints `tables` lines of table data. */
function fakePostgres({tables = 40, failDump = new Set(), failList = new Set()} = {}) {
  const calls = [];
  const run = (command, args) => {
    calls.push([command, ...args]);
    if (command === 'pg_dump') {
      const url = args.at(-1);
      if ([...failDump].some(p => url.includes(p))) return {status: 1, stdout: '', stderr: 'could not connect'};
      writeFileSync(args.find(a => a.startsWith('--file=')).slice(7), Buffer.concat([Buffer.from('PGDMP'), randomBytes(5000)]));
      return {status: 0, stdout: '', stderr: ''};
    }
    const file = args.at(-1);
    if ([...failList].some(p => file.includes(p))) return {status: 1, stdout: '', stderr: 'unsupported version'};
    return {status: 0, stdout: Array.from({length: tables}, (_, i) => `${i}; 0 1 TABLE DATA public t${i} postgres`).join('\n'), stderr: ''};
  };
  return {run, calls};
}
const allUrls = Object.fromEntries(PROJECTS.map(p => [`DATABASE_URL_${p.toUpperCase()}`, `postgresql://u:p@${p}.db.example:5432/postgres`]));
const NOW = () => new Date(2026, 9, 17, 3, 0, 0);

test('a full run: seven backups, only HR and FnL (and everything, once a key is set) encrypted, no plain dump of a sensitive project left', async () => {
  const out = dir();
  try {
    const {run} = fakePostgres();
    const noKey = await runBackup({projects: PROJECTS, env: allUrls, out, now: NOW, run});
    assert.deepEqual(noKey.filter(r => r.ok).map(r => r.project), ['hub', 'ee', 'mcit', 'sng', 'cons']);
    for (const p of ['hr', 'fnl']) {
      const r = noKey.find(x => x.project === p);
      assert.equal(r.ok, false);
      assert.match(r.error, /BACKUP_ENCRYPTION_KEY/);
    }
    assert.deepEqual(readdirSync(out).filter(f => /^(hr|fnl)-/.test(f)), []); // nothing of the sensitive ones on disk
    assert.ok(readdirSync(out).includes('hub-backup-2026-10-17_03-00-00.dump'));

    const out2 = dir();
    const withKey = await runBackup({projects: PROJECTS, env: {...allUrls, BACKUP_ENCRYPTION_KEY: KEY}, out: out2, now: NOW, run});
    assert.ok(withKey.every(r => r.ok && r.encrypted));
    assert.deepEqual(readdirSync(out2).sort(), PROJECTS.map(p => `${p}-backup-2026-10-17_03-00-00.dump.enc`).sort());
    rmSync(out2, {recursive: true, force: true});
  } finally { rmSync(out, {recursive: true, force: true}); }
});

test('an encrypted backup restores to the very dump that was made', async () => {
  const out = dir();
  try {
    const {run} = fakePostgres();
    const [r] = await runBackup({projects: ['hr'], env: {...allUrls, BACKUP_ENCRYPTION_KEY: KEY}, out, now: NOW, run});
    assert.equal(r.ok, true);
    const back = join(out, 'restored.dump');
    await decryptFile(r.file, back, parseKey(KEY));
    assert.ok(readFileSync(back).subarray(0, 5).equals(Buffer.from('PGDMP')));
  } finally { rmSync(out, {recursive: true, force: true}); }
});

test('one project failing does not stop the others, and says why', async () => {
  const out = dir();
  try {
    const {run} = fakePostgres({failDump: new Set(['ee.db.example']), failList: new Set(['mcit-backup'])});
    const results = await runBackup({projects: PROJECTS, env: {...allUrls, BACKUP_ENCRYPTION_KEY: KEY}, out, now: NOW, run});
    assert.deepEqual(results.filter(r => !r.ok).map(r => r.project), ['ee', 'mcit']);
    assert.match(results.find(r => r.project === 'ee').error, /pg_dump failed/);
    assert.match(results.find(r => r.project === 'mcit').error, /pg_restore cannot read/);
    assert.deepEqual(results.filter(r => r.ok).map(r => r.project), ['hub', 'hr', 'fnl', 'sng', 'cons']);
  } finally { rmSync(out, {recursive: true, force: true}); }
});

test('a dump that lists too few tables is refused, and so is a missing connection string or an existing file', async () => {
  const out = dir();
  try {
    const few = await runBackup({projects: ['hub'], env: allUrls, out, now: NOW, run: fakePostgres({tables: 3}).run});
    assert.match(few[0].error, /fewer than the 28/);
    const none = await runBackup({projects: ['sng'], env: {}, out, now: NOW, run: fakePostgres().run});
    assert.match(none[0].error, /DATABASE_URL_SNG/);
    const again = dir();
    await runBackup({projects: ['sng'], env: allUrls, out: again, now: NOW, run: fakePostgres().run});
    const twice = await runBackup({projects: ['sng'], env: allUrls, out: again, now: NOW, run: fakePostgres().run});
    assert.match(twice[0].error, /refusing to overwrite/);
    rmSync(again, {recursive: true, force: true});
  } finally { rmSync(out, {recursive: true, force: true}); }
});

test('the connection string is only handed to pg_dump, never printed', async () => {
  const out = dir();
  const lines = [];
  try {
    const {run, calls} = fakePostgres();
    await runBackup({projects: ['hub'], env: {...allUrls, DATABASE_URL_HUB: 'postgresql://u:topsecret@h.example/db'}, out, now: NOW, run, log: l => lines.push(l)});
    assert.ok(calls.some(c => c.at(-1).includes('topsecret')));
    assert.ok(!lines.join('\n').includes('topsecret'));
    assert.ok(existsSync(join(out, 'hub-backup-2026-10-17_03-00-00.dump')));
  } finally { rmSync(out, {recursive: true, force: true}); }
});
