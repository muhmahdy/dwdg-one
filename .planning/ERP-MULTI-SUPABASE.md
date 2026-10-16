# ERP Multi-Supabase (Hub-and-Spoke) — Panduan Implementasi

Dokumen ini adalah spesifikasi arsitektur, skema, kode acuan, dan aturan keamanan untuk ERP berbasis **Next.js + banyak project Supabase**: **1 hub + 6 spoke divisi** (akun Supabase berbeda per divisi), dengan struktur organisasi **President, Vice President, dan 6 divisi**. Ikuti dokumen ini sebagai sumber kebenaran saat membangun proyek.

---

## 0. Prinsip Utama (baca dulu)

1. **Tetap database terpisah per divisi + 1 hub.** Jangan digabung, jangan diganti arsitekturnya.
2. **Modular dan bertahap.** Aplikasi HARUS bisa jalan dengan hanya hub, atau hub + sebagian divisi. Divisi yang belum punya env/belum aktif tidak boleh membuat build atau halaman lain error.
3. **Semua akses spoke lewat server Next.js.** Browser tidak pernah tahu URL/key spoke.
4. **Pengecekan akses di server sebelum memanggil spoke.** Ini satu-satunya penjaga karena `service_role` melewati RLS.
5. **Satu pintu login: hub.** User tidak login ke akun Supabase divisi. Akun `supabase.com` hanya dipakai pemilik project untuk dashboard.
6. **Dua lapis hak akses:** peran organisasi (President / Vice President / anggota) dan peran per divisi (viewer / member / lead / admin). Lihat bagian 3.
7. **Free tier adalah kendala desain.** Tangani auto-pause, tidak ada backup otomatis, dan batas 500 MB sejak awal (lihat bagian 10).
8. **Data HR dan Legal & Finance bersifat sensitif.** Perlakuan khusus di bagian 3.4 dan 9.

---

## 1. Arsitektur

```
                 Browser (user login ke HUB saja)
                              │
                       ┌──────▼───────┐
                       │   Next.js    │  ← satu-satunya yang memegang
                       │ (server-side)│    URL + service key semua spoke
                       └──┬────────┬──┘
              auth/role   │        │  data detail per divisi
                    ┌─────▼──┐  ┌──▼──────────────────────────────────┐
                    │  HUB   │  │ SPOKE: sng · fnl · hr · mcit · ee · │
                    │Supabase│  │        consulting  (akun masing2)   │
                    └────────┘  └─────────────────────────────────────┘
```

**Hub menyimpan:** user (Supabase Auth), profil + peran organisasi, daftar divisi, `user_divisions` (hak akses), ringkasan progres per divisi (`division_progress`), audit log.
**Spoke menyimpan:** data detail operasional divisi tersebut.

**Tidak ada join / foreign key lintas project.** Penggabungan data dilakukan di Next.js atau lewat ringkasan yang di-push ke hub.

**Jumlah project:** 6 spoke + 1 hub = 7 project Supabase. Presiden dan Vice President **bukan spoke**; mereka adalah peran di hub yang punya akses lintas divisi (bagian 3.2). Jika kelak mereka butuh database sendiri, cukup tambah slug baru di registry (bagian 4), tanpa ubah kode lain.

---

## 2. Struktur Folder (App Router)

```
src/
  app/
    (auth)/login/page.tsx
    (app)/
      dashboard/page.tsx            # ringkasan semua divisi yang boleh dilihat (dari hub)
      d/[slug]/page.tsx             # detail divisi (tarik langsung dari spoke)
      admin/access/page.tsx         # kelola akses (super admin / president / VP / lead)
    api/
      d/[slug]/progress/route.ts    # contoh route handler per divisi
      cron/ping/route.ts            # keep-alive spoke (dilindungi CRON_SECRET)
  lib/
    divisions/
      registry.ts                   # daftar divisi + status terkonfigurasi
      client.ts                     # db(slug) → client Supabase spoke
    hub/
      server.ts                     # client hub (cookie/session user)
      admin.ts                      # client hub service_role (server-only)
    auth/
      access.ts                     # requireUser, requireDivisionAccess
    audit.ts                        # tulis audit_log
    sync/
      progress.ts                   # push ringkasan spoke → hub
supabase/
  hub/migrations/                   # migrasi khusus hub
  spoke/migrations/                 # migrasi STANDAR yang sama untuk semua spoke
```

Semua file di `lib/divisions`, `lib/hub/admin.ts`, `lib/auth`, `lib/audit.ts`, `lib/sync` wajib diawali `import 'server-only'`.

---

## 3. Struktur Organisasi & Hak Akses

### 3.1 Divisi (spoke)

| Slug | Nama | Sensitif |
|------|------|----------|
| `sng` | Strategy & Growth (SnG) | tidak |
| `fnl` | Legal & Finance (FnL) | **ya** |
| `hr` | Human Resource (HR) | **ya** |
| `mcit` | Marketing, Communication & IT (MCIT) | tidak |
| `ee` | External Engagement (EE) | tidak |
| `consulting` | Consulting | tidak |

### 3.2 Dua lapis peran

**Lapis 1 — Peran organisasi** (kolom `profiles.org_role`, bersifat global):

| `org_role` | Arti | Akses implisit |
|------------|------|----------------|
| `president` | President | `lead` di **semua** divisi |
| `vice_president` | Vice President | `lead` di **semua** divisi |
| `member` | Anggota biasa (default) | tidak ada; hanya via `user_divisions` |

Ditambah flag teknis terpisah `profiles.is_super_admin` (untuk pengembang/admin sistem) → setara `admin` di semua divisi + hak kelola akses.

**Lapis 2 — Peran per divisi** (tabel `user_divisions`, enum `division_role`):

| Peran | Cocok untuk | Boleh |
|-------|-------------|-------|
| `viewer` | pengamat/anggota baru | baca |
| `member` | staf divisi | baca + tulis |
| `lead` | kepala/direktur divisi | baca + tulis + hapus + kelola `member`/`viewer` di divisinya |
| `admin` | admin teknis divisi | semua di divisinya |

**Peran efektif** seseorang di sebuah divisi = peran tertinggi dari: peran eksplisit di `user_divisions`, peran implisit dari `org_role`, dan `admin` bila `is_super_admin`.

> Jika President/VP sebaiknya **hanya membaca** (bukan menulis), ubah satu konstanta `IMPLICIT_ROLE` di `lib/auth/access.ts` dari `'lead'` menjadi `'viewer'`. Tidak ada perubahan lain.

### 3.3 Matriks izin

| Aksi | viewer | member | lead | admin | President/VP (implisit lead) | super admin |
|------|:-----:|:------:|:----:|:-----:|:----------------------------:|:-----------:|
| Lihat dashboard ringkasan divisinya | ✅ | ✅ | ✅ | ✅ | ✅ semua divisi | ✅ semua |
| Baca data detail divisi | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tambah/ubah data | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hapus data | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tambah `member`/`viewer` di divisinya | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Naikkan ke `lead`/`admin`, ubah `org_role` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (President/VP hanya naikkan sampai `lead`) |
| Atur `is_active`, `is_super_admin`, `org_role` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (manual SQL / service_role) |

Semua perubahan akses dilakukan lewat server action/route handler dengan service_role dan dicatat di `audit_log`. Klien tidak pernah menulis langsung ke `user_divisions`.

### 3.4 Divisi sensitif (HR, FnL)

- Kolom `divisions.is_sensitive = true`.
- **Setiap akses** (baca maupun tulis) ke divisi sensitif otomatis dicatat di `audit_log` oleh `requireDivisionAccess` (tidak bisa lupa).
- Data pribadi (NIK, nomor rekening, gaji, dokumen identitas) **tidak disimpan plaintext**: enkripsi kolom di level aplikasi atau simpan minimal; jangan simpan scan KTP di database.
- Gunakan peran `lead`/`admin` seperlunya; default anggota baru `viewer`.
- Jika President/VP tidak seharusnya melihat detail tertentu (mis. data pribadi staf HR), batasi dengan menu/endpoint terpisah (mis. hanya agregat) dan bukan lewat peran implisit.

---

## 4. Registry Divisi & Konfigurasi Bertahap

### 4.1 Konvensi env

```
# HUB
HUB_SUPABASE_URL=
HUB_SUPABASE_ANON_KEY=            # boleh NEXT_PUBLIC_ (untuk client login hub)
HUB_SUPABASE_SERVICE_KEY=         # server-only, JANGAN pakai prefix NEXT_PUBLIC_

# SPOKE (kosongkan yang belum dipakai)
SPOKE_SNG_URL=
SPOKE_SNG_SERVICE_KEY=
SPOKE_FNL_URL=
SPOKE_FNL_SERVICE_KEY=
SPOKE_HR_URL=
SPOKE_HR_SERVICE_KEY=
SPOKE_MCIT_URL=
SPOKE_MCIT_SERVICE_KEY=
SPOKE_EE_URL=
SPOKE_EE_SERVICE_KEY=
SPOKE_CONSULTING_URL=
SPOKE_CONSULTING_SERVICE_KEY=

CRON_SECRET=                      # untuk endpoint /api/cron/*
```

Nama env = `SPOKE_` + slug huruf besar (`-` jadi `_`) + `_URL` / `_SERVICE_KEY`.

### 4.2 Aturan "flexible / boleh belum lengkap"

Sebuah divisi dianggap **aktif** hanya jika SEMUA benar:
- env URL + service key tersedia, DAN
- baris di tabel hub `divisions` punya `is_active = true`.

Divisi tidak aktif → UI menampilkan status "Belum terhubung", route handler mengembalikan `503 division_not_configured`. **Tidak ada throw saat startup/build.** Hub saja sudah cukup untuk menjalankan login dan dashboard kosong. Divisi diaktifkan **satu per satu, urutan bebas**.

### 4.3 `lib/divisions/registry.ts`

```ts
import 'server-only';

export const DIVISIONS = [
  { slug: 'sng', name: 'Strategy & Growth' },
  { slug: 'fnl', name: 'Legal & Finance' },
  { slug: 'hr', name: 'Human Resource' },
  { slug: 'mcit', name: 'Marketing, Communication & IT' },
  { slug: 'ee', name: 'External Engagement' },
  { slug: 'consulting', name: 'Consulting' },
] as const;

export type DivisionSlug = (typeof DIVISIONS)[number]['slug'];

const envKey = (slug: string) => slug.toUpperCase().replace(/-/g, '_');

export function isDivisionSlug(s: string): s is DivisionSlug {
  return DIVISIONS.some((d) => d.slug === s);
}

export function getDivisionEnv(slug: DivisionSlug) {
  const k = envKey(slug);
  const url = process.env[`SPOKE_${k}_URL`];
  const key = process.env[`SPOKE_${k}_SERVICE_KEY`];
  return url && key ? { url, key } : null;
}

export function isConfigured(slug: DivisionSlug) {
  return getDivisionEnv(slug) !== null;
}

export function configuredDivisions() {
  return DIVISIONS.filter((d) => isConfigured(d.slug));
}
```

### 4.4 `lib/divisions/client.ts`

```ts
import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DivisionSlug, getDivisionEnv } from './registry';

export class DivisionNotConfigured extends Error {
  constructor(public slug: string) {
    super(`division_not_configured:${slug}`);
  }
}

const cache = new Map<DivisionSlug, SupabaseClient>();

export function db(slug: DivisionSlug): SupabaseClient {
  const hit = cache.get(slug);
  if (hit) return hit;
  const env = getDivisionEnv(slug);
  if (!env) throw new DivisionNotConfigured(slug);
  const client = createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  cache.set(slug, client);
  return client;
}
```

---

## 5. Skema Hub (SQL)

Jalankan di project hub (`supabase/hub/migrations/0001_init.sql`).

```sql
-- Peran organisasi (global)
create type public.org_role as enum ('member', 'vice_president', 'president');
-- Peran per divisi
create type public.division_role as enum ('viewer', 'member', 'lead', 'admin');

-- Profil user (1:1 dengan auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  org_role public.org_role not null default 'member',
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Daftar divisi (sumber kebenaran status aktif)
create table public.divisions (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  is_active boolean not null default false,
  is_sensitive boolean not null default false,
  schema_version int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.divisions (slug, name, is_sensitive) values
  ('sng',        'Strategy & Growth',             false),
  ('fnl',        'Legal & Finance',               true),
  ('hr',         'Human Resource',                true),
  ('mcit',       'Marketing, Communication & IT', false),
  ('ee',         'External Engagement',           false),
  ('consulting', 'Consulting',                    false);

-- Hak akses user ke divisi
create table public.user_divisions (
  user_id uuid not null references auth.users(id) on delete cascade,
  division_slug text not null references public.divisions(slug) on delete cascade,
  role public.division_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (user_id, division_slug)
);

-- Ringkasan progres per divisi (di-push dari spoke)
create table public.division_progress (
  division_slug text primary key references public.divisions(slug) on delete cascade,
  total_items int not null default 0,
  done_items int not null default 0,
  percent numeric(5,2) generated always as
    (case when total_items = 0 then 0 else round(done_items * 100.0 / total_items, 2) end) stored,
  last_synced_at timestamptz,
  last_error text
);

-- Audit log
create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid,
  division_slug text,
  action text not null,
  detail jsonb
);

-- Trigger: buat profile otomatis saat user baru (org_role selalu 'member')
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ===== Helper =====
-- Super admin, President, atau Vice President = akses lintas divisi
create function public.has_global_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select is_super_admin or org_role in ('president', 'vice_president')
    from public.profiles where id = auth.uid()
  ), false)
$$;

-- ===== RLS (wajib semua tabel) =====
alter table public.profiles enable row level security;
alter table public.divisions enable row level security;
alter table public.user_divisions enable row level security;
alter table public.division_progress enable row level security;
alter table public.audit_log enable row level security;

-- profiles: baca diri sendiri atau akses global
create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or public.has_global_access());

-- profiles: user biasa hanya boleh mengubah kolom full_name (blokir org_role / is_super_admin)
revoke update on public.profiles from authenticated, anon;
grant update (full_name) on public.profiles to authenticated;
create policy "profiles_update_self" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- CATATAN: org_role dan is_super_admin hanya diubah manual via SQL / service_role.

-- divisions: user melihat divisi miliknya (akses global: semua)
create policy "divisions_select" on public.divisions for select
  using (public.has_global_access() or exists (
    select 1 from public.user_divisions ud
    where ud.division_slug = divisions.slug and ud.user_id = auth.uid()));

-- user_divisions: user lihat miliknya; perubahan hanya via server (service_role)
create policy "ud_select" on public.user_divisions for select
  using (user_id = auth.uid() or public.has_global_access());

-- division_progress: baca jika punya akses divisi tsb; tulis hanya service_role
create policy "dp_select" on public.division_progress for select
  using (public.has_global_access() or exists (
    select 1 from public.user_divisions ud
    where ud.division_slug = division_progress.division_slug and ud.user_id = auth.uid()));

-- audit_log: tanpa policy → hanya service_role yang bisa baca/tulis
```

**Menetapkan President/VP/super admin (manual, service_role atau SQL editor, bukan lewat UI):**

```sql
update public.profiles set org_role = 'president'      where id = '<uuid user>';
update public.profiles set org_role = 'vice_president' where id = '<uuid user>';
update public.profiles set is_super_admin = true       where id = '<uuid pengembang>';
```

**Setting Auth di hub (dashboard Supabase):**
- Matikan **public sign-up** (invite-only / dibuat admin). Atau batasi domain email jika organisasi punya domain tertentu.
- Aktifkan konfirmasi email.
- Wajibkan/aktifkan MFA untuk President, Vice President, super admin, dan semua `lead`/`admin` HR dan FnL.

---

## 6. Skema Standar Spoke (SQL)

**Satu set migrasi yang IDENTIK dijalankan ke semua spoke.** Jangan ada divisi dengan tabel dasar yang berbeda. Kustomisasi per divisi ditaruh di migrasi terpisah yang diberi nomor dan dicatat versinya.

`supabase/spoke/migrations/0001_base.sql`:

```sql
-- Metadata skema (untuk cek versi & keep-alive ping)
create table public.schema_meta (
  id int primary key default 1 check (id = 1),
  version int not null,
  updated_at timestamptz not null default now()
);
insert into public.schema_meta (version) values (1);

-- Fungsi updated_at standar
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Tabel progres standar (wajib ada di semua divisi)
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'todo' check (status in ('todo','doing','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid            -- id user HUB (bukan FK, beda project)
);
create trigger progress_updated_at before update on public.progress
for each row execute function public.set_updated_at();

-- ===== Keamanan: RLS aktif, TANPA policy =====
-- Artinya anon/authenticated key tidak bisa akses apa pun.
-- Hanya service_role (dari server Next.js) yang bisa, karena bypass RLS.
alter table public.schema_meta enable row level security;
alter table public.progress enable row level security;
```

Aturan kolom standar untuk **setiap** tabel baru di spoke: `id`, `created_at`, `updated_at`, `created_by` (uuid user hub, tanpa FK).

Setelah migrasi sukses di sebuah spoke, update `divisions.schema_version` di hub.

---

## 7. Alur Akses (Wajib Diikuti)

Setiap request yang menyentuh data divisi:

```
1. Validasi input (slug, body) → zod
2. Ambil user dari HUB (auth.getUser(), BUKAN getSession())
3. Hitung peran efektif (org_role + user_divisions + super admin) → bandingkan dengan role minimum
4. Cek divisi aktif & terkonfigurasi
5. Jika divisi sensitif → catat audit
6. Baru panggil db(slug)
7. Catat audit untuk operasi tulis/sensitif
8. Return data terbatas (jangan bocorkan error mentah/URL/key)
```

### `lib/hub/admin.ts` dan `lib/hub/server.ts`

```ts
// lib/hub/admin.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;
export function hubAdmin() {
  if (!client) {
    client = createClient(process.env.HUB_SUPABASE_URL!, process.env.HUB_SUPABASE_SERVICE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
```

```ts
// lib/hub/server.ts  (sesi user via cookie, memakai @supabase/ssr)
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createHubServerClient() {
  const store = await cookies();
  return createServerClient(process.env.HUB_SUPABASE_URL!, process.env.HUB_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {}
      },
    },
  });
}
```

### `lib/audit.ts`

```ts
import 'server-only';
import { hubAdmin } from '@/lib/hub/admin';

export async function audit(e: { userId?: string; slug?: string; action: string; detail?: Record<string, unknown> }) {
  try {
    await hubAdmin().from('audit_log').insert({
      user_id: e.userId, division_slug: e.slug, action: e.action, detail: e.detail ?? null,
    });
  } catch (err) {
    console.error('audit_failed', err); // jangan bocorkan ke client
  }
}
```

### `lib/auth/access.ts`

```ts
import 'server-only';
import { createHubServerClient } from '@/lib/hub/server';
import { hubAdmin } from '@/lib/hub/admin';
import { audit } from '@/lib/audit';
import { DivisionSlug, isConfigured, isDivisionSlug } from '@/lib/divisions/registry';

export type Role = 'viewer' | 'member' | 'lead' | 'admin';
export type OrgRole = 'member' | 'vice_president' | 'president';

const RANK: Record<Role, number> = { viewer: 1, member: 2, lead: 3, admin: 4 };

// Peran implisit lintas divisi dari peran organisasi.
// Ubah ke 'viewer' jika President/VP hanya boleh membaca.
const IMPLICIT_ROLE: Record<OrgRole, Role | null> = {
  member: null,
  vice_president: 'lead',
  president: 'lead',
};

export class HttpError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

export async function requireUser() {
  const supabase = await createHubServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(); // verifikasi ke server Auth
  if (error || !user) throw new HttpError(401, 'unauthenticated');
  return user;
}

export async function requireDivisionAccess(rawSlug: string, min: Role = 'viewer') {
  if (!isDivisionSlug(rawSlug)) throw new HttpError(404, 'division_not_found');
  const slug: DivisionSlug = rawSlug;
  const user = await requireUser();
  const admin = hubAdmin();

  const [{ data: profile }, { data: ud }, { data: div }] = await Promise.all([
    admin.from('profiles').select('is_super_admin, org_role').eq('id', user.id).maybeSingle(),
    admin.from('user_divisions').select('role').eq('user_id', user.id).eq('division_slug', slug).maybeSingle(),
    admin.from('divisions').select('is_active, is_sensitive').eq('slug', slug).maybeSingle(),
  ]);

  // Peran efektif = yang tertinggi dari semua sumber
  const candidates: Role[] = [];
  if (profile?.is_super_admin === true) candidates.push('admin');
  const implicit = IMPLICIT_ROLE[(profile?.org_role as OrgRole) ?? 'member'];
  if (implicit) candidates.push(implicit);
  if (ud?.role) candidates.push(ud.role as Role);
  const role = candidates.sort((a, b) => RANK[b] - RANK[a])[0];

  if (!role || RANK[role] < RANK[min]) throw new HttpError(403, 'forbidden');
  if (!div?.is_active || !isConfigured(slug)) throw new HttpError(503, 'division_not_configured');

  // Divisi sensitif (HR, FnL): setiap akses tercatat
  if (div.is_sensitive) await audit({ userId: user.id, slug, action: 'access.sensitive', detail: { min, role } });

  return { user, slug, role };
}
```

Untuk aksi kelola akses (`admin/access`), buat helper serupa `requireAccessManager(slug, targetRole)` yang menerapkan matriks di 3.3: `lead` hanya boleh menetapkan `member`/`viewer` di divisinya sendiri; President/VP sampai `lead`; hanya super admin yang boleh menetapkan `admin`/`org_role`. Tulis semua perubahan ke `audit_log`.

### Contoh route handler

`app/api/d/[slug]/progress/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireDivisionAccess, HttpError } from '@/lib/auth/access';
import { db } from '@/lib/divisions/client';
import { syncProgress } from '@/lib/sync/progress';
import { audit } from '@/lib/audit';

const createSchema = z.object({ title: z.string().trim().min(1).max(200) }).strict();

const fail = (e: unknown) => {
  if (e instanceof HttpError) return NextResponse.json({ error: e.code }, { status: e.status });
  if (e instanceof z.ZodError) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  console.error(e); // log detail di server saja
  return NextResponse.json({ error: 'internal_error' }, { status: 500 });
};

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { slug: s } = await requireDivisionAccess(slug, 'viewer');
    const { data, error } = await db(s).from('progress').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { slug: s, user } = await requireDivisionAccess(slug, 'member');
    const body = createSchema.parse(await req.json());
    const { data, error } = await db(s).from('progress')
      .insert({ title: body.title, created_by: user.id }).select().single();
    if (error) throw error;
    await audit({ userId: user.id, slug: s, action: 'progress.create', detail: { id: data.id } });
    void syncProgress(s); // push ringkasan ke hub (jangan blok response)
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) { return fail(e); }
}
```

---

## 8. Dashboard: Pola Push (utama) + Pull (detail)

- **Dashboard utama** membaca **hanya** `division_progress` dari hub → 1 query, cepat, tidak terpengaruh spoke yang di-pause. RLS otomatis membatasi: anggota hanya melihat divisinya, President/VP/super admin melihat semua 6 divisi (tampilan ringkasan eksekutif).
- **Halaman detail divisi** (`/d/[slug]`) baru menarik langsung dari spoke.
- Ringkasan di-push ke hub setelah operasi tulis (`syncProgress`) dan juga oleh cron berkala sebagai pengaman.
- Untuk divisi sensitif (HR, FnL), dashboard hanya menampilkan **agregat** (jumlah/persentase), bukan detail.

### `lib/sync/progress.ts`

```ts
import 'server-only';
import { db } from '@/lib/divisions/client';
import { hubAdmin } from '@/lib/hub/admin';
import { DivisionSlug, configuredDivisions } from '@/lib/divisions/registry';

export async function syncProgress(slug: DivisionSlug) {
  const hub = hubAdmin();
  try {
    const spoke = db(slug);
    const [{ count: total }, { count: done }] = await Promise.all([
      spoke.from('progress').select('*', { count: 'exact', head: true }),
      spoke.from('progress').select('*', { count: 'exact', head: true }).eq('status', 'done'),
    ]);
    await hub.from('division_progress').upsert({
      division_slug: slug,
      total_items: total ?? 0,
      done_items: done ?? 0,
      last_synced_at: new Date().toISOString(),
      last_error: null,
    });
  } catch (e) {
    await hub.from('division_progress').upsert({
      division_slug: slug,
      last_error: e instanceof Error ? e.message.slice(0, 300) : 'unknown',
    });
  }
}

export async function syncAll() {
  // allSettled: satu divisi down tidak menjatuhkan yang lain
  return Promise.allSettled(configuredDivisions().map((d) => syncProgress(d.slug)));
}
```

Pada halaman yang menarik beberapa spoke sekaligus, selalu pakai `Promise.allSettled` dan tampilkan status per divisi (OK / paused / belum terhubung).

---

## 9. Aturan Keamanan (Checklist Wajib)

**Key & rahasia**
- [ ] `service_role` hub & semua spoke **hanya** di env server. Dilarang diawali `NEXT_PUBLIC_`. Dilarang di-commit, di-log, atau dikirim ke client.
- [ ] Semua modul yang memegang key diawali `import 'server-only'`.
- [ ] `.env*` ada di `.gitignore`. Sediakan `.env.example` tanpa nilai asli.
- [ ] Rotasi key jika ada kebocoran atau pergantian kepengurusan (President, VP, kepala divisi). Key spoke berbeda per project, jadi dampak bocor terisolasi.

**Autentikasi & otorisasi**
- [ ] Gunakan `auth.getUser()` di server (bukan `getSession()`) untuk memutuskan identitas.
- [ ] Setiap route handler / server action yang menyentuh spoke **wajib** memanggil `requireDivisionAccess(slug, minRole)` sebelum `db(slug)`.
- [ ] `slug` dari URL **wajib** divalidasi terhadap whitelist `DIVISIONS` (`isDivisionSlug`). Jangan pernah merakit nama env dari input mentah.
- [ ] Peran efektif dihitung di server dari `profiles.org_role`, `user_divisions`, dan `is_super_admin`. Jangan percaya peran dari client, cookie non-terverifikasi, atau body request.
- [ ] `org_role` dan `is_super_admin` hanya diubah manual (SQL/service_role); kolomnya di-`revoke update` untuk role `authenticated`.
- [ ] Sign-up publik di hub dimatikan; user dibuat/diundang admin.
- [ ] MFA untuk President, Vice President, super admin, serta `lead`/`admin` HR dan FnL.
- [ ] Saat jabatan berganti (pergantian President/VP/kepala divisi): cabut `org_role`/`user_divisions` lama, tambahkan yang baru, dan catat di audit log. Serah terima dilakukan via hub, bukan berbagi akun.

**Database**
- [ ] RLS **aktif di semua tabel**, hub maupun spoke.
- [ ] Spoke: RLS aktif **tanpa policy** (deny-all untuk anon/authenticated). Kalau anon key spoke bocor pun, data tetap tertutup.
- [ ] Jangan expose tabel spoke ke client browser (tidak ada `createClient` spoke di komponen client).
- [ ] Hub: `user_divisions`, `division_progress`, `audit_log` tidak boleh ditulis dari client; hanya via server (service_role).
- [ ] Fungsi `security definer` wajib `set search_path = ''`.

**Data sensitif (HR, FnL)**
- [ ] Akses selalu masuk `audit_log` (otomatis di `requireDivisionAccess`).
- [ ] Jangan simpan gaji, NIK, nomor rekening, atau dokumen identitas dalam plaintext; enkripsi di level aplikasi atau hindari menyimpannya.
- [ ] Dashboard lintas divisi hanya menampilkan agregat untuk divisi ini.
- [ ] Batasi jumlah `lead`/`admin` di divisi ini; tinjau daftar akses tiap pergantian periode.
- [ ] Backup dump divisi ini disimpan terenkripsi dengan akses terbatas.

**Aplikasi**
- [ ] Validasi semua input dengan zod (tipe, panjang, enum), gunakan `.strict()` agar field tak dikenal ditolak.
- [ ] Jangan pernah merakit SQL mentah dari input user. Pakai query builder Supabase.
- [ ] Error ke client generik (`forbidden`, `internal_error`). Detail hanya di log server. Jangan bocorkan URL/key/pesan Postgres.
- [ ] Rate limiting untuk endpoint tulis dan login (mis. Upstash Ratelimit atau middleware sederhana).
- [ ] Endpoint cron dilindungi header `Authorization: Bearer ${CRON_SECRET}`.
- [ ] Cookie sesi `httpOnly`, `secure`, `sameSite=lax` (default `@supabase/ssr`). Tambahkan security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`) di `next.config`.
- [ ] Audit log untuk operasi tulis, perubahan akses, dan aksi admin.

**Akun & operasional**
- [ ] Tiap project Supabase punya **minimal 2 orang** dengan akses owner/admin (hindari single point of failure saat pengurus lulus/berganti periode). Idealnya salah satunya pemegang jabatan (kepala divisi) dan satu lagi pengurus inti.
- [ ] Aktifkan 2FA di akun supabase.com masing-masing pemilik.
- [ ] Project hub sebaiknya berada di akun yang stabil lintas periode (bukan akun pribadi anggota biasa).
- [ ] Simpan kredensial divisi di password manager bersama, bukan chat.

---

## 10. Operasional Free Tier

Kondisi free tier saat dokumen ini ditulis: 2 project aktif per akun, DB 500 MB, 5 GB egress, 50 ribu MAU, **auto-pause setelah 7 hari tanpa aktivitas**, **tanpa backup otomatis**. Cek ulang <https://supabase.com/pricing> secara berkala.

### 10.1 Keep-alive (cegah pause)

`app/api/cron/ping/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { configuredDivisions } from '@/lib/divisions/registry';
import { db } from '@/lib/divisions/client';

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const results = await Promise.allSettled(
    configuredDivisions().map(async (d) => {
      const { error } = await db(d.slug).from('schema_meta').select('version').limit(1);
      if (error) throw error;
      return d.slug;
    }),
  );
  return NextResponse.json({
    ok: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  });
}
```

Jadwalkan 1–2 kali per minggu (Vercel Cron atau GitHub Actions `schedule`). Sekalian panggil `syncAll()` di cron yang sama. Ping hub juga (query ringan ke `divisions`) agar hub tidak ikut ter-pause.

### 10.2 Backup (WAJIB karena tidak ada backup otomatis)

- GitHub Actions terjadwal mingguan menjalankan `pg_dump` ke tiap project (connection string disimpan di **GitHub Secrets**), hasilnya diunggah ke penyimpanan terpisah (Google Drive/R2/Backblaze) dengan retensi mis. 8 minggu.
- Uji **restore** minimal sekali di awal. Backup yang belum pernah di-restore belum bisa dianggap backup.
- Prioritas: hub (`profiles`, `user_divisions`, `audit_log`), lalu FnL dan HR.
- Dump FnL/HR dienkripsi dan aksesnya dibatasi.

### 10.3 Menangani project yang ter-pause

- UI menampilkan status per divisi: `ok`, `paused/unreachable`, `belum terhubung`.
- Pemulihan dilakukan pemilik project via dashboard Supabase (data tidak hilang). Catat PIC-nya di dokumentasi internal.
- Selalu `Promise.allSettled`; jangan `Promise.all` untuk fan-out ke banyak spoke.

### 10.4 Batas ukuran

- Pantau ukuran DB (500 MB per project). Jangan simpan file/gambar besar di database; pakai Supabase Storage (1 GB) atau layanan eksternal. MCIT dan EE paling berpotensi menyimpan aset media, jadi simpan file di luar database.

### 10.5 Jalur upgrade

Karena akses spoke dibungkus `db(slug)`, pindah ke paket berbayar atau menggabungkan sebagian divisi ke satu project cukup mengubah env dan registry tanpa mengubah kode fitur.

---

## 11. Migrasi Skema Semua Project

- Simpan semua migrasi di `supabase/spoke/migrations/` (satu set untuk semua spoke) dan `supabase/hub/migrations/`.
- Jalankan dengan Supabase CLI per project: `supabase link --project-ref <ref>` lalu `supabase db push`. Buat script `scripts/migrate-all.sh` yang loop ke tiap divisi **yang aktif saja**.
- Setelah sukses: update `divisions.schema_version` di hub. Aplikasi boleh menolak/menandai divisi yang `schema_version`-nya tertinggal.
- Migrasi selalu **additive dan backward-compatible** sebisa mungkin (tambah kolom nullable, jangan rename/drop langsung).
- Tidak ada migrasi manual lewat SQL editor di satu divisi saja tanpa dicatat di folder migrasi.

---

## 12. Roadmap Bertahap (Boleh Dipakai Sebagian, Urutan Divisi Bebas)

| Fase | Isi | Syarat jalan |
|------|-----|--------------|
| 1 | Hub: login, `profiles` (+`org_role`), `divisions` (6 baris seed), `user_divisions`, dashboard kosong | Hub saja |
| 2 | Registry + `db(slug)` + `requireDivisionAccess` + halaman divisi "belum terhubung" + penetapan President/VP/super admin | Hub saja |
| 3 | Aktifkan **divisi pertama** (pilih yang paling siap/dipakai): migrasi spoke, route `progress`, sync ke hub | Hub + 1 spoke |
| 4 | Tambah divisi satu per satu (set env → migrasi → `is_active = true`) | Tanpa ubah kode |
| 5 | Halaman kelola akses (matriks 3.3) + audit log + rate limit | Hub + spoke aktif |
| 6 | Cron ping + sync berkala | Sebelum dipakai rutin |
| 7 | Backup otomatis + uji restore | **Sebelum data HR/FnL masuk** |
| 8 | Fitur lanjutan per divisi (migrasi tambahan bernomor) | Per divisi |

Menambah/mengaktifkan divisi = (1) buat project Supabase, (2) jalankan migrasi spoke, (3) isi 2 env, (4) set `divisions.is_active = true`, (5) beri akses di `user_divisions`. **Tidak ada perubahan kode.** Menambah divisi yang benar-benar baru = tambah satu baris di `DIVISIONS` dan satu baris seed di `divisions`.

---

## 13. Larangan (Jangan Dilakukan)

- Jangan `createClient` spoke di komponen client atau mengirim URL/key spoke ke browser.
- Jangan memakai `NEXT_PUBLIC_` untuk `service_role`.
- Jangan memanggil `db(slug)` sebelum `requireDivisionAccess`.
- Jangan menaruh logika "boleh/tidak" hanya di UI (sembunyikan tombol saja tidak cukup).
- Jangan meng-hardcode President/VP berdasarkan email di kode; gunakan `profiles.org_role`.
- Jangan membiarkan klien menulis `org_role`, `is_super_admin`, atau `user_divisions`.
- Jangan `throw` saat env divisi kosong di startup; divisi yang belum aktif harus dilewati.
- Jangan mengandalkan join/FK lintas project.
- Jangan mem-bypass `requireDivisionAccess` untuk "sementara".
- Jangan menyimpan data pribadi HR/FnL dalam plaintext.
- Jangan membuat banyak akun Supabase pribadi hanya untuk mengakali kuota; satu akun per divisi/pemilik nyata.

---

## 14. Catatan Keputusan

- Hub-and-spoke dipilih karena tiap divisi memang memiliki akun Supabase sendiri (isolasi kepemilikan data & kuota free tier).
- President dan Vice President dimodelkan sebagai **peran lintas divisi di hub**, bukan spoke, karena mereka mengawasi semua divisi dan tidak memiliki data operasional sendiri. Asumsi ini bisa diubah: tambah slug baru bila ternyata butuh database terpisah.
- Konsekuensinya: biaya operasional (7 project untuk dirawat, di-migrasi, dijaga aktif). Jika kelak kendala kepemilikan/kuota hilang, alternatif lebih sederhana adalah **satu project dengan schema/tabel per divisi + RLS**, yang memungkinkan join. Arsitektur `db(slug)` di atas membuat perpindahan itu murah.
- Karena spoke diakses via `service_role`, keamanan bergantung pada kode server. Alternatif yang lebih ketat (JWT hub diverifikasi oleh spoke lewat third-party auth) lebih rumit dan tidak dibutuhkan untuk skala organisasi saat ini.
