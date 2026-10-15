# Database backups

Local backup location for operator machines. **Dump files are git-ignored** (`*.dump`, `*.sql` in this folder): they contain members' data and must never be committed.

## Create a backup

Requirements: PostgreSQL client tools (`pg_dump`, `pg_restore`, optionally `psql`) at the server's major version or newer, and `DATABASE_URL` in `scripts/.env.local` (template: `scripts/.env.example`). Use a database role that can read the schemas `public`, `app` and `private`.

```bash
node --env-file=scripts/.env.local scripts/backup/backup-database.mjs
```

This writes `database/backups/database-backup-YYYY-MM-DD_HH-mm-ss.dump` (custom format, schemas `public`, `app`, `private`). It never overwrites an existing file. It then runs `pg_restore --list` on the result and fails unless the archive is readable and lists the workspace tables. `auth.*` (accounts) belongs to Supabase and is covered by the platform's own backups. Re-linking people to accounts uses `people.auth_user_id`/`email`.

## Restore drill (scratch database only)

```bash
node --env-file=scripts/.env.local scripts/backup/restore-database.mjs \
  --file database/backups/database-backup-2026-10-15_09-00-00.dump \
  --target "$SCRATCH_DATABASE_URL" --i-understand-this-replaces-data
```

The script refuses to restore into the database named by `DATABASE_URL`. A restore into production is a manual, reviewed operation (see `docs/deployment/rollback.md`).

## Where backups should live

This folder is for short-term local copies. Keep at least one copy off the operator's laptop, in the organisation-designated storage. The custodian is still to be decided (PRD `scope_org_storage_setup`, `infrastructure_accounts`). Never keep the only backup here, and never delete the previous backup before the new one has been verified.

## Status

Not verified yet. No Supabase project exists for this repository, and the PostgreSQL client tools are not installed on the machine that wrote these scripts (15 Oct 2026). The first real backup and restore drill must be recorded in `docs/deployment/`.
