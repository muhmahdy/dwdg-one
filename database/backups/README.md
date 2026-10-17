# Database backups

Local backup location for operator machines, and the procedure for the weekly backups. **Dump files are git-ignored** (`*.dump`, `*.dump.enc`, `*.sql` in this folder): they contain members' data and must never be committed.

There are seven projects (the hub and six divisions) and the free tier makes **no automatic backup**, so each one is dumped on its own.

## Create backups

Requirements: PostgreSQL client tools (`pg_dump`, `pg_restore`, optionally `psql`) at the servers' major version or newer, and in `scripts/.env.local` (template: `scripts/.env.example`) one connection string per project: `DATABASE_URL_HUB` (the old `DATABASE_URL` still works for the hub), `DATABASE_URL_EE`, `_MCIT`, `_HR`, `_FNL`, `_SNG`, `_CONS`, and `BACKUP_ENCRYPTION_KEY`.

```bash
node --env-file=scripts/.env.local scripts/backup/backup-database.mjs --project all      # or: hub, or: hr,fnl
```

For each project this writes `database/backups/<project>-backup-YYYY-MM-DD_HH-mm-ss.dump` (custom format; schemas `public`, `app`, `private` for the hub and `public`, `app` for a division). It never overwrites a file, runs `pg_restore --list` on the result and fails unless the archive is readable and lists at least as many tables of data as that project has. A failure in one project is reported and the others still run; the exit code is 1 if any failed. `auth.*` (accounts) belongs to Supabase and is covered by the platform's own backups.

**Encryption.** HR and Finance & Legal hold personal data: their dumps are encrypted (AES-256-GCM) with `BACKUP_ENCRYPTION_KEY` and are **not written at all** without it. With the key set every project's dump is encrypted, the file gets the extra ending `.enc`, the plain dump is deleted, and the script decrypts the new file once to check it gives the same dump back. Create the key once and keep it in the shared password manager, apart from the backups: a backup cannot be restored without it.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Weekly, automatically

`.github/workflows/backup.yml` runs the command above every Sunday and keeps the encrypted files as a workflow artifact for 56 days (8 weeks). It needs the repository secrets `DATABASE_URL_*` and `BACKUP_ENCRYPTION_KEY`. A copy outside GitHub (Google Drive, R2, Backblaze) is still to be added once the organisation chooses where.

## Restore drill (scratch database only)

```bash
node --env-file=scripts/.env.local scripts/backup/restore-database.mjs \
  --file database/backups/hr-backup-2026-10-18_01-00-00.dump.enc \
  --target "$SCRATCH_DATABASE_URL" --i-understand-this-replaces-data
```

An encrypted file is decrypted with `BACKUP_ENCRYPTION_KEY` into a temporary file that is deleted afterwards. The script refuses to restore into any database named by `DATABASE_URL` or `DATABASE_URL_<PROJECT>`, then counts `people` (hub) or the schema version (division) in the target. A restore into production is a manual, reviewed operation (see `docs/deployment/rollback.md`).

**Do the drill once for every project before real data goes in, and again after the schema changes.** Write the date, the project and what you saw in `docs/deployment/`. A backup that has never been restored is not yet a backup. Do HR and Finance & Legal first.

## Where backups should live

This folder is for short-term local copies. Keep at least one copy off the operator's laptop, in the organisation-designated storage; the custodian is still to be decided (PRD `scope_org_storage_setup`, `infrastructure_accounts`). Never keep the only backup here, and never delete the previous backup before the new one has been verified.

## Status

Not run against a real project. The logic is covered by `scripts/backup/backup.test.mjs` (real encryption, tampering and wrong-key refusal, the whole run with a stand-in for `pg_dump` and `pg_restore`), but no Supabase project exists yet and the PostgreSQL client tools are not installed on the machine that wrote these scripts (17 Oct 2026). The first real backup and restore drill of each project must be recorded in `docs/deployment/`.
