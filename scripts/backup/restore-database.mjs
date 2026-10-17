// Restores a backup made by backup-database.mjs into a SCRATCH database, for restore drills and investigations.
//   node --env-file=scripts/.env.local scripts/backup/restore-database.mjs --file database/backups/<name>.dump[.enc] --target "$SCRATCH_DATABASE_URL" --i-understand-this-replaces-data
// An encrypted backup (.dump.enc) is decrypted with BACKUP_ENCRYPTION_KEY into a temporary file that is deleted afterwards.
// Refuses to run against any production database (DATABASE_URL, DATABASE_URL_<PROJECT>). Restoring production is a manual,
// reviewed operation; see docs/deployment/rollback.md.
import {spawnSync} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {decryptFile, parseKey} from './lib/crypto.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };
const file = arg('--file'), target = arg('--target');
if (!file || !existsSync(file)) { console.error('--file <backup.dump or backup.dump.enc> is required and must exist.'); process.exit(1); }
if (!target) { console.error('--target <scratch database url> is required.'); process.exit(1); }
const host = u => { try { const x = new URL(u); return `${x.hostname}:${x.port}${x.pathname}`; } catch { return u; } };
const production = Object.entries(process.env).filter(([k, v]) => v && /^DATABASE_URL(_|$)/.test(k));
const clash = production.find(([, v]) => host(v) === host(target));
if (clash) { console.error(`The target is the production database (${clash[0]}). This script only restores into a scratch database.`); process.exit(1); }
if (!process.argv.includes('--i-understand-this-replaces-data')) {
  console.error('Add --i-understand-this-replaces-data: objects in the target schemas are dropped and recreated.');
  process.exit(1);
}

let dump = file, temp = null;
try {
  if (file.endsWith('.enc')) {
    temp = mkdtempSync(join(tmpdir(), 'dwdg-restore-'));
    dump = join(temp, 'backup.dump');
    try { await decryptFile(file, dump, parseKey(process.env.BACKUP_ENCRYPTION_KEY)); }
    catch (e) { console.error(`Cannot decrypt ${file}: ${e.message}`); process.exit(1); }
  }
  const r = spawnSync('pg_restore', ['--clean', '--if-exists', '--no-owner', '--no-privileges', '--exit-on-error', `--dbname=${target}`, dump], {stdio: 'inherit'});
  if (r.error) { console.error(`pg_restore could not start: ${r.error.message}`); process.exit(1); }
  if (r.status !== 0) { console.error(`pg_restore failed with exit code ${r.status}.`); process.exit(r.status || 1); }
  // A row count that proves the restore holds data: people in the hub, schema_meta (the version row) in a division project.
  const probe = (sql) => spawnSync('psql', [target, '-At', '-c', sql], {encoding: 'utf8'});
  const hub = probe('select count(*) from public.people');
  const division = hub.status === 0 ? null : probe('select version from public.schema_meta');
  if (hub.status === 0) console.log(`Restored. people rows in target: ${hub.stdout.trim()}`);
  else if (division && division.status === 0) console.log(`Restored. schema version in target: ${division.stdout.trim()}`);
  else console.log('Restored. (psql not available, or the target has neither people nor schema_meta, for the row-count check.)');
} finally {
  if (temp) rmSync(temp, {recursive: true, force: true});
}
