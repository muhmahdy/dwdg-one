# MASTER PROMPT — DWDG Semi-ERP Refactoring & Migration

## 1. Role and Objective

Act as a Senior Software Architect, Full-Stack Engineer, Database Engineer, and Code Quality Specialist.

Refactor and migrate the existing DWDG (Do Well Do Good) Semi-ERP application from Vanilla JavaScript to a clean, maintainable, modular React + TypeScript architecture.

The application is used to monitor organizational activities, projects, tasks, and coordination across DWDG divisions.

The objective is to improve the technology, code quality, maintainability, and architecture **without changing the existing features, business workflows, or UI/UX requirements documented in the PRD**.

This is a controlled migration, not a product redesign.

## 2. Non-Negotiable Rules

### A. The PRD Is the Source of Truth

Before modifying code:

1. Locate and read every relevant PRD, technical specification, UI/UX reference, and existing project document.
2. Inspect the current repository and understand the implementation.
3. Inventory all features, pages, components, workflows, permissions, data fields, and integrations.
4. Map every feature to its corresponding PRD requirement.
5. Identify discrepancies between the PRD and the current implementation.

Rules:

- Do not invent new features.
- Do not remove existing features.
- Do not change business logic unless required to fix a verified defect or explicitly authorized by the PRD.
- Do not redesign the UI or change layouts, colors, typography, spacing, navigation, or interactions unless the PRD requires it.
- Do not replace existing functionality with placeholders or mock data.
- Do not assume a feature is unnecessary because its implementation looks outdated.
- If a requirement is ambiguous, document it and ask for clarification when necessary.
- If the PRD is unavailable, do not begin a potentially destructive migration. Report the missing source and continue only with safe repository auditing.

**Success means preserving the existing application while making its internal implementation cleaner, safer, and easier to maintain.**

## 3. Recommended Technology Stack

Use the following stack as the baseline. Inspect the existing project first and document any justified deviations before implementation.

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS, while preserving existing styling and design specifications
- shadcn/ui only where appropriate and compatible with the existing UI
- React Router if routing is required
- TanStack Query for server-state fetching, caching, and synchronization
- Zod for input and data validation
- React Hook Form where suitable for existing forms

Use reusable components, strict typing, clear naming conventions, and feature-based modularization. Do not introduce additional libraries without a clear technical reason.

### Backend

Inspect the existing backend requirements and PRD first.

If the application needs a dedicated backend, use a modular Node.js + TypeScript architecture with a suitable framework such as Fastify or Express, based on actual project needs.

If the current application uses Supabase for authentication, database access, or realtime functionality, evaluate whether it can remain the primary backend service.

Do not create a separate backend merely for architectural appearance. Use the simplest architecture that satisfies the PRD, security requirements, deployment constraints, and expected scale.

### Database

- PostgreSQL as the preferred relational database when compatible with the existing system.
- Supabase PostgreSQL if Supabase is retained.
- SQL migrations for reproducible schema changes.
- Version-controlled database schema and migration files.
- Appropriate indexes, foreign keys, constraints, and transaction handling.
- Row Level Security (RLS) where applicable.

Never expose database credentials, service-role keys, or other secrets in frontend code.

### Deployment

- Vercel for frontend deployment.
- Separate backend deployment configuration if a dedicated backend is required.
- Document environment variables and separate them by environment.
- Do not assume Vercel can run a persistent backend process; choose a deployment-compatible backend architecture.

## 4. Required Project Directory Structure

Organize the repository using the following structure. Treat it as the canonical target structure and do not create alternative top-level folders without a documented technical justification.

```text
dwdg-erp/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── router/
│   │   │   ├── providers/
│   │   │   └── config/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── shared/
│   │   ├── features/
│   │   │   └── [feature-from-prd]/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       ├── services/
│   │   │       ├── types/
│   │   │       └── utils/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── assets/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   └── [module-from-prd]/
│   │   │       ├── routes/
│   │   │       ├── controllers/
│   │   │       ├── services/
│   │   │       ├── repositories/
│   │   │       ├── schemas/
│   │   │       └── types/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── lib/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   ├── schema/
│   ├── migrations/
│   ├── seeds/
│   ├── functions/
│   ├── policies/
│   ├── backups/
│   │   ├── README.md
│   │   └── .gitkeep
│   └── README.md
│
├── docs/
│   ├── prd/
│   ├── audit/
│   ├── architecture/
│   ├── database/
│   ├── deployment/
│   └── development/
│
├── scripts/
│   ├── backup/
│   ├── database/
│   └── maintenance/
│
├── bin/
│   └── README.md
│
├── .github/
│   └── workflows/
│
├── .gitignore
├── .editorconfig
├── .nvmrc
├── README.md
└── package.json
```

This is a target template, not a requirement to create empty directories or unused services.

### Directory Rules

1. `frontend/` contains frontend source code, tests, assets, and frontend configuration.
2. `backend/` contains backend source code, tests, API configuration, business logic, and server-side integrations. If no dedicated backend is required, document that decision instead of generating an unused backend.
3. `database/` contains SQL schema definitions, migrations, policies, seeds, and database backup procedures.
4. `database/backups/` is reserved for local or explicitly approved backup artifacts. Do not commit production data, credentials, or sensitive personal information.
5. `docs/` contains project documentation, permitted PRD copies, audit results, architecture decisions, and deployment guides.
6. `scripts/` contains reusable scripts for backup, database operations, and maintenance.
7. `bin/` is reserved for obsolete, unused, or superseded files that have been verified as safe to archive.
8. Keep the root directory minimal. Only necessary project-wide configuration, documentation, and tooling files belong there.

Use the actual PRD to name feature folders. Do not create speculative modules.

## 5. Strict File Cleanup and `bin/` Policy

Audit every existing file and directory before moving or removing anything.

Classify existing files as:

- **KEEP:** actively used source code, assets, configuration, environment templates, deployment files, and required documentation.
- **REFACTOR:** files that are used but need to be reorganized or rewritten.
- **ARCHIVE:** obsolete, duplicated, superseded, or unused files that are safe and useful to retain outside the active application.
- **REMOVE:** generated files or clearly disposable artifacts that can safely be regenerated and are not required.

### Rules for `bin/`

- Move verified obsolete source files, superseded implementations, old migration drafts, and redundant documentation into clearly named subdirectories inside `bin/` when retaining them is useful.
- Preserve the original relative path in an archive manifest where practical.
- Create `docs/audit/archive-manifest.md` documenting each archived file, its original path, destination, reason for archiving, and verification status.
- Check imports, references, scripts, and build dependencies before moving any file.
- Do not archive a file merely because it is unfamiliar or looks old.
- Do not put active source code, production database files, secrets, `.env` files, package-manager configuration, or deployment configuration into `bin/`.
- Do not use `bin/` as a replacement for `.gitignore`.
- Do not leave multiple competing implementations active.

**Important:** `bin/` is for archived project files, not executable system binaries or a general dumping ground.

If a file is definitely unnecessary and safe to regenerate, it may be removed instead of archived. Document significant cleanup decisions.

## 6. Backup and Recovery Requirements

Backups must be organized, reproducible, and clearly separated from source code.

### Database Backups

- Document how to create a database backup.
- Provide a reusable backup script where technically appropriate.
- Use a consistent naming convention, for example: `database-backup-YYYY-MM-DD_HH-mm-ss.sql`.
- Document required tools, environment variables, permissions, and restore procedures.
- Verify backup integrity where possible.
- Document how to restore the database into a test environment.
- Do not claim a backup is valid until its creation and basic integrity have been verified.
- Never overwrite the only existing backup.
- Do not automatically run destructive restore operations against production.
- Never store real credentials in backup scripts or documentation.

For PostgreSQL, choose an appropriate format such as a custom-format `pg_dump` backup or a plain SQL dump, and document the corresponding restore command.

### Source Code and Configuration Backups

- Use Git commits and branches as the primary source-code history mechanism.
- Before major refactoring, create a recoverable Git checkpoint or a separate backup branch.
- Record the original repository state before moving or deleting files.
- Preserve required deployment configuration and document migration steps.
- Use `.env.example` or equivalent templates containing placeholder values only.

### Backup Storage

Local backups may be stored in `database/backups/` if they are not sensitive and the location is appropriate.

Do not commit large database dumps or sensitive production data to Git. Configure `.gitignore` appropriately and document any external backup location the project owner must provide.

## 7. Code Quality Standards

All code must be clean, readable, consistent, and maintainable.

### TypeScript

- Enable strict TypeScript settings where practical.
- Avoid `any`; use explicit types, generics, discriminated unions, or `unknown` with proper validation.
- Avoid unnecessary type assertions and non-null assertions.
- Share API and domain types where appropriate without tightly coupling frontend internals to backend implementation.
- Remove dead code and duplicated logic only after verifying that they are not required.

### React

- Use functional components and hooks.
- Separate UI components, business logic, API access, and shared utilities.
- Avoid oversized components and excessively nested conditional logic.
- Follow the Rules of Hooks.
- Use stable keys for rendered lists.
- Implement loading, empty, success, and error states where required by the existing UX.
- Avoid unnecessary global state and re-renders.
- Preserve current navigation and interactions.

### General Code Quality

- Use consistent naming conventions.
- Apply ESLint and Prettier with shared, documented rules.
- Remove unused imports, unreachable code, duplicated utilities, and unnecessary dependencies.
- Keep functions focused and avoid hidden side effects.
- Add comments for complex decisions, not obvious code.
- Use reusable components when they reduce genuine duplication.
- Do not sacrifice readability for excessive abstraction.

## 8. Database and Backend Quality

- Derive the database schema from the actual PRD and existing data requirements.
- Document every table, column, relationship, constraint, and relevant index.
- Use migrations rather than undocumented manual schema changes.
- Preserve data relationships and business rules.
- Validate input on the server side where a backend exists.
- Apply authentication and authorization consistently.
- Enforce data access rules using the selected backend's capabilities.
- If using Supabase, review RLS policies for all tables exposed to client access.
- Never expose privileged service keys to the browser.
- Avoid N+1 queries, unbounded queries, and unnecessary full-table reads.
- Use pagination for large lists when consistent with the existing UI.
- Use realtime subscriptions only where required by the PRD.
- Do not introduce Redis, a message queue, or additional infrastructure without measurable justification.

## 9. Required Audit Documents

Create the following documents before major implementation.

### `docs/audit/prd-inventory.md`

List every PRD document, its version, location, and the features and requirements it describes.

### `docs/audit/feature-matrix.md`

Map each feature to its PRD reference, current implementation, migration status, and test status.

### `docs/audit/ui-inventory.md`

Document existing pages, layouts, navigation, reusable components, visual references, and interaction states.

### `docs/audit/archive-manifest.md`

Record files moved into `bin/` or removed, including reasons and verification status.

### `docs/architecture/architecture.md`

Document the frontend, backend, database, authentication, API communication, and deployment architecture.

### `docs/database/database-design.md`

Document tables, relationships, indexes, constraints, access policies, migration strategy, and backup/restore procedures.

### `docs/audit/traceability-matrix.md`

Link each PRD requirement to its implementation location and corresponding verification test.

### `docs/architecture/decision-log.md`

Record important technical decisions, alternatives considered, and reasons for choosing the final approach.

Do not fabricate documentation content. Ground every statement in the repository, PRD, or an explicitly recorded engineering decision.

## 10. Migration Workflow

### Phase 0 — Repository and PRD Audit

- Inspect the repository, Git history, package files, environment configuration, existing frontend, database access, and deployment configuration.
- Locate all PRDs and UI/UX references.
- Create the audit documents.
- Identify files that are active, duplicated, obsolete, or uncertain.
- Do not perform destructive cleanup during the initial audit.

### Phase 1 — Establish a Baseline

- Run the existing application where possible.
- Record current routes, pages, interactions, and known defects.
- Capture screenshots or document visual references.
- Record current build and runtime behavior.
- Create a recoverable checkpoint before significant changes.

### Phase 2 — Finalize the Target Architecture

- Confirm the actual stack based on project requirements.
- Finalize the directory structure.
- Decide whether a dedicated backend is necessary.
- Document database access patterns and security boundaries.
- Define linting, formatting, typing, and testing rules.

Do not add unnecessary infrastructure merely to fill the proposed directory structure.

### Phase 3 — Reorganize and Migrate Incrementally

- Establish the new project structure.
- Move and refactor code in small, verifiable steps.
- Migrate Vanilla JavaScript components to React + TypeScript.
- Preserve existing UI and interactions.
- Keep related features modular.
- Validate imports, assets, routes, and dependencies after each significant move.
- Archive obsolete files only after checking references and dependencies.

Do not rewrite the entire application in one uncontrolled operation.

### Phase 4 — Integrate Data and Backend

- Implement the data-access layer and backend integration required by the PRD.
- Create or migrate database schemas using version-controlled migrations.
- Preserve required workflows, permissions, and existing data behavior.
- Verify authorization and data validation.
- Implement realtime updates only where required.
- Test failure handling and concurrent updates where applicable.

### Phase 5 — Verification and Cleanup

- Run TypeScript checks, linting, formatting checks, tests, and production builds.
- Compare migrated screens against the original application and UI/UX references.
- Verify every PRD feature against the traceability matrix.
- Search for stale imports, unused dependencies, duplicated active implementations, and obsolete files.
- Check that secrets, backup dumps, generated artifacts, and local-only files are correctly excluded from Git.
- Verify the documented backup and restore procedure in a safe test environment.

### Phase 6 — Deployment

- Verify production build compatibility.
- Configure environment variables correctly.
- Deploy the frontend to Vercel.
- Deploy a dedicated backend separately if required.
- Verify API connectivity, authentication, database access, routing, and error handling in production.
- Document deployment and rollback procedures.

## 11. Testing and Acceptance Criteria

The migration is not complete until the following criteria have been checked.

### Feature Parity

- Every PRD requirement is mapped and verified.
- No required feature has been silently removed.
- No unauthorized feature has been added.
- Existing workflows and business rules remain consistent.

### UI/UX Parity

- Pages, navigation, layout, typography, colors, spacing, and interactions match the PRD and original reference.
- Forms, dialogs, tables, filters, and other existing controls remain functional.
- Responsive behavior is preserved where required.

### Code and Architecture

- Frontend, backend, and database assets are organized in their designated directories.
- No competing active implementation remains.
- No unexplained root-level folders or files remain.
- Every additional directory has a clear purpose.
- `bin/` contains only documented, verified archives.
- TypeScript checks, linting, and production builds pass, or remaining failures are explicitly documented.

### Database and Backup

- Database schema and migrations are documented.
- Access policies are reviewed.
- Backup and restore procedures are documented and tested where possible.
- No credentials or sensitive production data are accidentally committed.

### Deployment

- Frontend deployment to Vercel succeeds.
- Backend deployment succeeds if a separate backend exists.
- Required production integrations work.
- Rollback instructions are available.

Do not report a criterion as passed without evidence. If a check cannot be run, mark it as **Not Verified** and explain why.

## 12. Working Rules for the Coding Agent

- Inspect first; modify second.
- Never assume repository structure without examining it.
- Never delete or move uncertain files.
- Never overwrite the only working implementation without a recovery point.
- Prefer small changes that can be reviewed and tested.
- Keep documentation synchronized with the actual implementation.
- Do not generate fake credentials, fake production records, or fake test results.
- Ask before destructive operations or changes that could affect production data.
- Do not stop after creating a plan: implement the approved migration incrementally and report actual progress.
- If a technical requirement conflicts with the PRD, explain the conflict instead of silently choosing one.
- Keep the final architecture as simple as possible while meeting documented requirements.

## 13. Final Report

At completion, provide:

1. Final directory tree.
2. Summary of the architecture and technology stack.
3. List of migrated features and verification status.
4. Files moved to `bin/`, files removed, and reasons.
5. Database schema and migration summary.
6. Backup and restore instructions.
7. Lint, type-check, test, and build results.
8. Deployment status and remaining manual steps.
9. Known limitations and unresolved issues.
10. Confirmation that the PRD was used as the source of truth.

Begin with Phase 0. Do not start large-scale refactoring or destructive cleanup before the audit and recovery checkpoint are complete.
