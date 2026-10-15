// Creates a custom-format pg_dump of the Supabase database and verifies it can be read back.
//   node --env-file=scripts/.env.local scripts/backup/backup-database.mjs [--out database/backups]
// Needs: pg_dump and pg_restore (PostgreSQL client 15+, same major version as the server or newer), and DATABASE_URL
// (Supabase → Project Settings → Database → connection string, session pooler or direct). The file is never overwritten.
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is not set. See scripts/.env.example.'); process.exit(1); }

const out = arg('--out') || 'database/backups';
mkdirSync(out, {recursive: true});
const d = new Date(), p = n => String(n).padStart(2, '0');
const name = `database-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}.dump`;
const file = join(out, name);
if (existsSync(file)) { console.error(`${file} already exists; refusing to overwrite.`); process.exit(1); }

// Only the schemas this project owns. auth.* belongs to Supabase and is backed up by the platform.
const dump = spawnSync('pg_dump', ['--format=custom', '--no-owner', '--no-privileges', '--schema=public', '--schema=app', '--schema=private', `--file=${file}`, url], {stdio: 'inherit'});
if (dump.error) { console.error(`pg_dump could not start: ${dump.error.message}`); process.exit(1); }
if (dump.status !== 0) { console.error(`pg_dump failed with exit code ${dump.status}.`); process.exit(dump.status || 1); }

// Integrity check: the archive's table of contents must be readable and list the workspace tables.
const list = spawnSync('pg_restore', ['--list', file], {encoding: 'utf8'});
if (list.status !== 0) { console.error(`Backup written but pg_restore cannot read it:\n${list.stderr}`); process.exit(1); }
const tables = (list.stdout.match(/ TABLE DATA public /g) || []).length;
if (tables < 10) { console.error(`Backup written but lists only ${tables} public tables; check the connection string and permissions.`); process.exit(1); }
console.log(`Backup ${file} (${(statSync(file).size / 1024).toFixed(0)} KiB, ${tables} public tables). Verified with pg_restore --list.`);
