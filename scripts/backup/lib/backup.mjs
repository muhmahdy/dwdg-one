// What a backup of the hub-and-spoke layout is: seven projects, each dumped on its own, the two that hold personal data
// (HR, Finance & Legal) encrypted at rest. The functions here do the thinking and take the commands to run as an argument,
// so tests can run them without PostgreSQL.
import {existsSync, mkdirSync, readFileSync, statSync, unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decryptFile, encryptFile, parseKey, sha256File} from './crypto.mjs';

export const PROJECTS = ['hub', 'ee', 'mcit', 'hr', 'fnl', 'sng', 'cons'];
/** Projects whose dumps must never be written unencrypted (spec section 10.2). */
export const SENSITIVE = new Set(['hr', 'fnl']);

const partition = JSON.parse(readFileSync(fileURLToPath(new URL('../../../database/schema/generated/partition.json', import.meta.url)), 'utf8'));

/** The schemas a project owns. auth.* belongs to Supabase and is backed up by the platform. */
export const schemasOf = project => (project === 'hub' ? ['public', 'app', 'private'] : ['public', 'app']);

/** A dump of a healthy project lists at least this many tables of data: the tables of the spec plus the ones the split adds. */
export function minTables(project) {
  const own = partition.homes[project].tables.length;
  return project === 'hub' ? own + 3 : own + 2; // hub: divisions, division_progress, audit_log. division: schema_meta, row_tables
}

/** `DATABASE_URL_<PROJECT>`; the hub also answers to the old single `DATABASE_URL`. */
export function urlOf(project, env) {
  return env[`DATABASE_URL_${project.toUpperCase()}`] || (project === 'hub' ? env.DATABASE_URL : undefined);
}

export function parseProjects(arg) {
  if (!arg || arg === 'hub') return ['hub'];
  if (arg === 'all') return [...PROJECTS];
  const list = arg.split(',').map(s => s.trim()).filter(Boolean);
  const bad = list.filter(p => !PROJECTS.includes(p));
  if (bad.length || !list.length) throw new Error(`Unknown project: ${bad.join(', ') || arg}. Use ${PROJECTS.join(', ')}, a comma list, or all.`);
  return list;
}

const p2 = n => String(n).padStart(2, '0');
export function fileName(project, date, encrypted) {
  const stamp = `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}_${p2(date.getHours())}-${p2(date.getMinutes())}-${p2(date.getSeconds())}`;
  return `${project}-backup-${stamp}.dump${encrypted ? '.enc' : ''}`;
}

export const dumpArgs = (project, file, url) => ['--format=custom', '--no-owner', '--no-privileges', ...schemasOf(project).map(s => `--schema=${s}`), `--file=${file}`, url];

/**
 * Backs up each project in turn. `run(command, args)` runs a program and returns {status, stdout, stderr, error?}.
 * A failure in one project is reported and the others still run. Resolves to one result per project.
 */
export async function runBackup({projects, env, out, now = () => new Date(), run, log = () => {}}) {
  mkdirSync(out, {recursive: true});
  const results = [];
  for (const project of projects) {
    const result = {project, ok: false, file: null, encrypted: false, tables: 0, error: null};
    results.push(result);
    let plain = null;
    try {
      const url = urlOf(project, env);
      if (!url) throw new Error(`No connection string: set DATABASE_URL_${project.toUpperCase()}${project === 'hub' ? ' (or DATABASE_URL)' : ''}.`);
      const encrypted = SENSITIVE.has(project) || Boolean(env.BACKUP_ENCRYPTION_KEY);
      const key = encrypted ? parseKey(env.BACKUP_ENCRYPTION_KEY) : null; // a sensitive project without a key stops here
      const at = now();
      plain = join(out, fileName(project, at, false));
      const final = encrypted ? join(out, fileName(project, at, true)) : plain;
      if (existsSync(plain) || existsSync(final)) throw new Error(`${final} already exists; refusing to overwrite.`);

      const dump = run('pg_dump', dumpArgs(project, plain, url));
      if (dump.error) throw new Error(`pg_dump could not start: ${dump.error.message}`);
      if (dump.status !== 0) throw new Error(`pg_dump failed with exit code ${dump.status}.`);

      const list = run('pg_restore', ['--list', plain]);
      if (list.status !== 0) throw new Error(`The dump was written but pg_restore cannot read it: ${list.stderr}`);
      result.tables = (String(list.stdout).match(/ TABLE DATA public /g) ?? []).length;
      if (result.tables < minTables(project)) throw new Error(`The dump lists ${result.tables} tables of data, fewer than the ${minTables(project)} a ${project} project has; check the connection string and permissions.`);

      if (encrypted) {
        const digest = await sha256File(plain);
        await encryptFile(plain, final, key);
        // the encrypted file must give the same dump back, or it is worthless
        if ((await decryptFile(final, null, key)) !== digest) throw new Error('The encrypted backup does not decrypt to the dump; it was kept for inspection.');
        unlinkSync(plain);
        plain = null;
      }
      result.file = final;
      result.encrypted = encrypted;
      result.ok = true;
      log(`${project}: ${final} (${(statSync(final).size / 1024).toFixed(0)} KiB, ${result.tables} tables of data${encrypted ? ', encrypted' : ''}).`);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      // never leave an unencrypted dump of a sensitive project behind after a failure
      if (plain && SENSITIVE.has(project) && existsSync(plain)) unlinkSync(plain);
      log(`${project}: FAILED. ${result.error}`);
    }
  }
  return results;
}
