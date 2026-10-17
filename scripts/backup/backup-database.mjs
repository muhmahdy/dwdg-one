// Backs up the hub and the division projects with pg_dump and checks that each dump can be read back.
//   node --env-file=scripts/.env.local scripts/backup/backup-database.mjs [--project all|hub|hr,fnl,...] [--out database/backups]
// Needs: pg_dump and pg_restore (PostgreSQL client 15+, same major version as the server or newer) and one connection string
// per project: DATABASE_URL_HUB (or the old DATABASE_URL), DATABASE_URL_EE, _MCIT, _HR, _FNL, _SNG, _CONS
// (Supabase -> Project Settings -> Database -> connection string, session pooler or direct). Files are never overwritten.
// HR and Finance & Legal hold personal data: their dumps are encrypted (AES-256-GCM) with BACKUP_ENCRYPTION_KEY and are
// not written at all without it. With the key set, every project's dump is encrypted. The exit code is 1 if any project failed.
import {spawnSync} from 'node:child_process';
import {parseProjects, runBackup} from './lib/backup.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };
let projects;
try { projects = parseProjects(arg('--project')); } catch (e) { console.error(e.message); process.exit(1); }

const run = (command, args) => spawnSync(command, args, {encoding: 'utf8', stdio: command === 'pg_dump' ? ['ignore', 'inherit', 'inherit'] : 'pipe'});
const results = await runBackup({projects, env: process.env, out: arg('--out') || 'database/backups', run, log: console.log});
const failed = results.filter(r => !r.ok);
console.log(`${results.length - failed.length} of ${results.length} backups made and verified${failed.length ? `; failed: ${failed.map(r => r.project).join(', ')}` : ''}.`);
process.exit(failed.length ? 1 : 0);
