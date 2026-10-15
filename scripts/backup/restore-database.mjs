// Restores a backup made by backup-database.mjs into a SCRATCH database, for restore drills and investigations.
//   node --env-file=scripts/.env.local scripts/backup/restore-database.mjs --file database/backups/<name>.dump --target "$SCRATCH_DATABASE_URL" --i-understand-this-replaces-data
// Refuses to run against DATABASE_URL (production). Restoring production is a manual, reviewed operation; see docs/deployment/rollback.md.
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };
const file = arg('--file'), target = arg('--target');
if (!file || !existsSync(file)) { console.error('--file <backup.dump> is required and must exist.'); process.exit(1); }
if (!target) { console.error('--target <scratch database url> is required.'); process.exit(1); }
const host = u => { try { const x = new URL(u); return `${x.hostname}:${x.port}${x.pathname}`; } catch { return u; } };
if (process.env.DATABASE_URL && host(process.env.DATABASE_URL) === host(target)) {
  console.error('The target is the production database (DATABASE_URL). This script only restores into a scratch database.');
  process.exit(1);
}
if (!process.argv.includes('--i-understand-this-replaces-data')) {
  console.error('Add --i-understand-this-replaces-data: objects in the target schemas public, app and private are dropped and recreated.');
  process.exit(1);
}
const r = spawnSync('pg_restore', ['--clean', '--if-exists', '--no-owner', '--no-privileges', '--exit-on-error', `--dbname=${target}`, file], {stdio: 'inherit'});
if (r.error) { console.error(`pg_restore could not start: ${r.error.message}`); process.exit(1); }
if (r.status !== 0) { console.error(`pg_restore failed with exit code ${r.status}.`); process.exit(r.status || 1); }
const check = spawnSync('psql', [target, '-At', '-c', 'select count(*) from public.people'], {encoding: 'utf8'});
console.log(check.status === 0 ? `Restored. people rows in target: ${check.stdout.trim()}` : 'Restored. (psql not available for the row-count check.)');
