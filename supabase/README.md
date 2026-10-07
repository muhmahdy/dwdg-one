# Shared DWDG Workspace setup

The browser preview remains available without Supabase. Shared mode needs a
Supabase project, Google OAuth, and an explicitly chosen first Super Admin.
Nothing in this repository chooses the first administrator's email.

1. Create a Supabase project and configure its Google Auth provider. Register
   the app origin and Supabase callback in Google Cloud, and add the app URL to
   Supabase Auth redirect URLs. Disable unrelated sign-in providers and
   anonymous sign-in. The database hook below admits only invited emails.
2. Apply migrations in filename order with the Supabase CLI (supabase db push
   against the linked project), or review and run them in the SQL editor.
   The 202609240001 migration requires every existing project and task to have
   an explicit lead or assignee and valid start and target dates. It stops if
   any are missing so an administrator can resolve them without invented data.
3. In the SQL editor, set the exact first administrator email before anyone
   signs in:

   ~~~sql
   insert into private.bootstrap_settings(key,value)
   values ('first_admin_email', lower(trim('ADMIN_EMAIL_HERE')))
   on conflict(key) do update set value=excluded.value;
   ~~~

   Replace the placeholder; do not use the student email shown in earlier
   screenshots by assumption. Changing this setting later does not silently
   change existing account roles.
4. In Supabase Auth Hooks, enable the Before User Created database hook and
   select private.before_user_created. The migration grants execution to
   supabase_auth_admin. Verify an uninvited Google account receives an
   invite-required denial before inviting real members.
5. Copy .env.example to .env and fill the project URL and publishable key.
   Install @supabase/supabase-js through the app build and run its dev server.
   Never include a secret/service-role key in client code or any VITE_ variable.
6. The first Super Admin signs in, invites members by exact email, assigns
   membership and permissions, and may grant finance approvers. A division can
   be discoverable in the catalog without granting access to its full records.
   HR candidate details and finance/legal records have narrower database
   policies.

Core and division editor saves now use one database transaction each, with
record versions checked against the user's loaded snapshot. A failed save
rolls back all changes in that batch. The project catalog excludes restricted
project titles from ungranted users; the separate budget-line catalog exposes
only a line's ID, name, and category so members can submit their own requests
without seeing allocations or other Finance records.

The workspace-files Storage bucket is private. Create a document metadata
row with a storage path before uploading the object at that same path. The
service's upload helper does this and removes the row if upload fails. Downloads
use short-lived signed URLs.

The dwdg-workspace-v1 browser key is never uploaded automatically. The admin
importer first previews the JSON, requires every legacy member ID to be mapped
to an active account UUID, translates Client Engagement to External Engagement,
then commits projects, tasks, dependencies, and meetings in one transaction.
Keep the original JSON backup until the imported result has been reviewed.
Importing with the same import ID twice fails instead of duplicating.

## Verification

Run SQL policy tests against a disposable local Supabase database before
production. The browser service has pure preview tests. After deployment,
verify sign-in with invited and uninvited accounts, cross-division catalog
visibility versus full rows, HR and finance restrictions, self-approval
rejection, and private file access.

Official guidance: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google),
[Before User Created hook](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), and
[private Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).
