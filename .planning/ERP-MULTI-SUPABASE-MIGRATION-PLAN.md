# Rencana migrasi ke hub-and-spoke (ERP-MULTI-SUPABASE)

Langkah menyalakan semuanya sungguhan (H0 dan sisa cutover H8): [docs/deployment/H0-CHECKLIST.md](../docs/deployment/H0-CHECKLIST.md), dengan catatan hasil di [docs/deployment/LOG.md](../docs/deployment/LOG.md).

Status: **HS-1 sampai HS-7 diputuskan pemilik (2026-10-17) dan dicatat sebagai M25 sampai M28 di `docs/architecture/decision-log.md`.** Terbuka hanya nama admin cadangan dan pemegang tiap akun (untuk H0). H1 selesai di repositori (lihat §6, H1). Aplikasi belum berubah dan belum ada project Supabase yang disentuh.
Acuan: [ERP-MULTI-SUPABASE.md](ERP-MULTI-SUPABASE.md) (selanjutnya "dokumen ERP"). Kondisi sekarang: `docs/architecture/architecture.md`, `database/`, `frontend/src/lib/workspace/`.

Pemilik memilih **mengikuti dokumen ERP penuh**: 1 hub + 6 spoke divisi (7 project Supabase) dan **server perantara** yang jadi satu-satunya pemegang URL dan key spoke.

---

## 1. Ringkasan

| | Sekarang | Target |
|---|---|---|
| Project Supabase | 1 | 7 (1 hub + `ee`, `mcit`, `hr`, `fnl`, `sng`, `cons`) |
| Browser bicara ke | Supabase langsung (publishable key, RLS) | Supabase **hanya untuk login** (hub); semua data lewat server perantara `/api/*` |
| Pembatas akses data | RLS di Postgres (61 tabel, 61 uji) | Hub: RLS tetap (JWT user diteruskan). Spoke: RLS deny-all + aturan akses di server (TypeScript) |
| Muat data | `load_workspace()` satu panggilan | `GET /api/workspace` → hub + spoke paralel (`allSettled`) → bentuk `Workspace` yang sama |
| Simpan data | `apply_changes()` satu transaksi | `POST /api/changes` → dipecah per database; tiap database satu transaksi idempoten |
| Yang tidak berubah | | Store Immer, undo/redo, `shape.ts`, semua komponen UI, mode demo, login Google invite-only |

Inti rencana: **ganti satu antarmuka, `WorkspaceRepository`**. UI dan store tidak tahu datanya dari mana. Jadi sebagian besar pekerjaan ada di database, server baru, dan port aturan akses, bukan di React.

---

## 2. Keputusan yang saya ambil (mohon dikoreksi bila salah)

Dokumen ERP ditulis untuk Next.js dan untuk model data yang berbeda dari DWDG'ONE. Tujuh titik di bawah tidak bisa diikuti harfiah. Tiap baris punya default yang dipakai rencana ini.

| # | Soal | Default rencana | Alasan |
|---|---|---|---|
| HS-1 | Kerangka server perantara | **Server `Hono` terpisah (folder `server/`)**, jalan sebagai Vercel Functions di `/api/*`, SPA Vite tetap. Bukan Next.js | Dokumen ERP minta Next.js, tapi 39 halaman React Router + store klien sudah jadi (keputusan M2). Semua pola penting di dokumen ERP (`requireDivisionAccess`, `db(slug)`, audit, sync) tidak bergantung pada Next. Hono juga bisa dipindah ke Cloudflare (D3) tanpa tulis ulang |
| HS-2 | Di mana data kerja lintas divisi (tasks, projects, meetings, programs, offers, resources…) | **Di hub** (16 tabel inti) | Dokumen ERP: tidak ada join/FK lintas project. Tapi My Work, Schedule, Updates dan proyek gabungan menggabungkan semua divisi. Kalau dipecah per spoke, satu spoke yang ter-pause mematikan My Work semua orang. Ini **memperluas** daftar "Hub menyimpan" di §1 dokumen ERP; dokumen itu perlu dikoreksi |
| HS-3 | Slug divisi | Tetap **`cons`** (bukan `consulting`) | `DivisionId`, awalan tabel, dan data demo sudah pakai `cons`. Env jadi `SPOKE_CONS_URL`. Registry ditulis ulang, tidak ada yang lain berubah |
| HS-4 | Tabel `profiles` dan `user_divisions` | **Tidak dibuat.** Dipetakan dari `people` (role, div, status, admin) | Aturan akses sekarang satu rumah per orang: `people.div`, plus President/VP/Board/Admin lintas divisi (`app.sees_div`). Lihat §4 |
| HS-5 | Tabel `progress` standar di tiap spoke | **Tidak dipakai.** `division_progress` dihitung dari `tasks` di hub (per `div`), ditambah angka antrean dari spoke bila perlu. `schema_meta` tetap ada di tiap spoke (versi + keep-alive) | Tugas sudah ada di hub. Tabel `progress` di spoke akan duplikat dan bisa berselisih |
| HS-6 | `created_by` berupa uuid | Tetap **id orang** (`people.id`, teks), tanpa FK | Seluruh data sekarang menyimpan id orang, bukan uuid auth |
| HS-7 | Sebaran akun Supabase | **Diputuskan pemilik 2026-10-17:** hub di akun organisasi yang dipegang President/VP; satu akun per divisi (6 akun), dipegang jabatan kepala divisi; satu admin cadangan bersama jadi pemilik kedua di ketujuh project; belum ada project sama sekali (project yang dipakai sekarang menjadi hub). **Masih terbuka:** nama admin cadangan dan pemegang tiap akun | Satu project per akun, jadi batas free tier (2 project aktif per akun) tidak berlaku. Dokumen ERP: ≥2 pemilik per project, hub di akun yang stabil lintas periode |

Keputusan lain yang perlu dicatat di `docs/architecture/decision-log.md` (nomor lanjut dari M24): **M5 digantikan** ("tidak ada server" tidak berlaku lagi), HS-1 sampai HS-7 di atas, dan penyesuaian D3/M13 bila hosting server berubah.

---

## 3. Pemetaan tabel

Dari `database/schema/schema-spec.mjs` (60 tabel data + `divisions`):

| Rumah | Tabel | Jumlah |
|---|---|---|
| **Hub** (inti kerja) | `people`, `tasks`, `offers`, `projects`, `milestones`, `blockers`, `decisions`, `meetings`, `unavailable`, `gbusy`, `resources`, `updates`, `changes`, `programs`, `routines`, `pins` | 16 |
| **Hub** (akun & pengawasan) | `acct_invites`, `acct_grants`, `acct_memberships`, `acct_actions`, `acct_handovers`, `acct_log`, `acct_hidden`, `perf_escalations` | 8 |
| **Hub** (baru dari dokumen ERP) | `division_progress`, `audit_log`; `divisions` dapat kolom `is_active`, `is_sensitive`, `schema_version` | 2 |
| **Hub** `store_values` | nilai global: `v`, `lookV`, `rmSeeded`, `pgSeeded`, `perf.v`, `acct.v`, `acct.office` | 1 |
| Spoke `hr` | `hr_registers`, `hr_notices`, `hr_cycles`, `hr_assessments`, `hr_actions`, `hr_rounds`, `hr_packets`, `hr_onboarding_templates`, `hr_onboarding_instances` | 9 |
| Spoke `sng` | `sng_initiatives`, `sng_packets` | 2 |
| Spoke `ee` | `ee_orgs`, `ee_contacts`, `ee_interactions`, `ee_fu`, `ee_postpones`, `ee_opps`, `ee_handoffs` | 7 |
| Spoke `cons` | `cons_engagements`, `cons_dlv`, `cons_staff`, `cons_kn`, `cons_cohorts` | 5 |
| Spoke `fnl` | `fnl_legal`, `fnl_register`, `fnl_allocations`, `fnl_requests`, `fnl_payments`, `fnl_incoming`, `fnl_periods` | 7 |
| Spoke `mcit` | `mcit_campaigns`, `mcit_content`, `mcit_briefs`, `mcit_it`, `mcit_accounts` | 5 |
| Tiap spoke | `store_values` (milik divisi: `hr.v`, `fnl.grants`, `fnl.policy`, `fnl.drafts`, `mcit.grants`, `mcit.drafts`, …) dan `schema_meta` | 2 × 6 |

Pemeriksaan yang sudah saya lakukan di spesifikasi: **satu-satunya foreign key yang menyeberang** adalah `sng_initiatives.project → projects`. Kunci ini dibuang di spoke (kolom `project` tetap, tanpa FK). Semua FK lain (`hr_notices.reg`, `fnl_requests.alloc`, `ee_opps.org`, `mcit_content.campaign`, …) berada di dalam satu divisi. Tahap H1 membuktikannya dengan uji otomatis, bukan dugaan.

Satu perubahan yang saya sarankan sekaligus: `acct_log` sekarang bisa ditulis siapa pun yang punya hak tulis (`write: app.can_write()`), jadi tidak bisa dipercaya sebagai catatan audit. `audit_log` yang baru ditulis server saja. Rencananya `acct_log` dipensiunkan setelah layar Audit memakai `audit_log`.

---

## 4. Pemetaan akses

### 4.1 Peran

| Aplikasi sekarang | Setara di dokumen ERP |
|---|---|
| `people.admin = true` | `is_super_admin` (admin di semua divisi + kelola akses) |
| `role = president` / `vp` | `org_role` `president` / `vice_president`, peran implisit `lead` di semua divisi |
| `role = director` / `codirector` di `people.div` | `lead` di divisi rumahnya |
| `role = member` di `people.div` | `member` di divisi rumahnya |
| `role = board` | **tidak ada padanannya.** Tambah `org_role = board`: tanpa akses implisit, hanya baca, dan hanya di `mcit` (aturan `NB` / `mcFull` yang sekarang) |
| `status ≠ active` | tanpa akses sama sekali (kecuali barisnya sendiri) |

`IMPLICIT_ROLE` untuk President/VP tetap `lead`, sesuai perilaku sekarang (mereka bisa menulis di semua divisi).

### 4.2 Satu hal yang tidak cukup di dokumen ERP

Dokumen ERP mengandalkan `requireDivisionAccess(slug, minRole)` per divisi. Di DWDG'ONE banyak baris spoke yang **boleh dibaca orang di luar divisi**:

| Pola | Contoh | Aturan sekarang |
|---|---|---|
| A. Khusus divisi | `sng_*`, `ee_contacts`, `cons_*` (sebagian), `fnl_register`, `fnl_payments`, `mcit_campaigns` | anggota divisi, President, VP, Admin; Board ditolak (kecuali `mcit` baca) |
| B. Swalayan / baris sendiri | `fnl_legal`, `fnl_requests`, `mcit_briefs`, `mcit_it` | anggota divisi **atau** pemohon / pembuat baris itu |
| C. Orang yang bersangkutan | `hr_notices`, `hr_actions`, `hr_assessments`, `hr_onboarding_instances`, `hr_cycles` (roster) | HR lead, top/admin, **atau orang yang dibahas** |
| D. Bergantung data hub | `cons_engagements`, `cons_dlv`, `cons_staff` (`is_project_lead`), `ee_handoffs` (unit penerima) | butuh baris `projects` atau unit dari hub |
| E. Seluruh organisasi | `cons_kn` dengan `audience = 'org'` | semua orang aktif |

Maka `requireDivisionAccess` diperluas jadi **`resolvePrincipal()` + predikat per tabel**:

- `resolvePrincipal(jwt)` memeriksa token lewat `auth.getUser()` (bukan `getSession()`), lalu membaca dari hub satu kali per permintaan: baris `people`, pangkat, divisi yang boleh dilihat, daftar proyek yang dia pimpin (`lead`/`pm`), dan unit yang dia pimpin.
- Tiap tabel spoke punya `{ read(principal, row), write(principal, oldRow, newRow) }` yang diterjemahkan satu-satu dari `read`/`write` di `schema-spec.mjs`. Fungsi `app.*` (`sees_div`, `unit_lead`, `hr_lead`, `is_project_lead`, `hr_reviews`) menjadi fungsi TypeScript murni.
- Baca: ambil tabel lewat `service_role`, saring di server dengan predikat yang sama. Dengan sekitar 40 anggota ini cukup; tabel besar bisa diberi filter kolom (`requester = me`) kemudian.
- Dokumen ERP memintanya, jadi tetap: divisi sensitif (`hr`, `fnl`) mencatat satu entri `audit_log` per permintaan muat/simpan (bukan per baris, supaya tidak menghabiskan 500 MB).

Hub **tidak** ikut diporting: BFF meneruskan JWT user ke hub dan memakai `load_workspace()` / `apply_changes()` yang ada, sehingga RLS hub dan uji `rls_smoke.sql` bagian inti tetap berlaku. Yang diporting hanya 35 tabel spoke.

---

## 5. Arsitektur target

```
Browser (SPA Vite, tetap statis)
  supabase-js ──► HUB   (login Google saja; publishable key)
  fetch /api/* ──► Server perantara (Hono, Vercel Functions)
                     ├─ resolvePrincipal(jwt)         auth.getUser() ke hub
                     ├─ hub:   klien dengan JWT user  → load_workspace / apply_changes (RLS hub utuh)
                     ├─ spoke: db(slug) service_role  → load_rows / apply_rows (RLS deny-all)
                     ├─ policy/ aturan akses 35 tabel spoke (TypeScript)
                     └─ audit, sync progres, cron ping, backup
```

Struktur baru:

```
server/
  src/lib/divisions/{registry,client}.ts   # dari dokumen ERP §4, slug `cons`
  src/lib/hub/{admin,user}.ts              # service_role (server saja) dan klien JWT-user
  src/lib/auth/principal.ts                # pengganti requireDivisionAccess
  src/lib/policy/<tabel>.ts + index.ts     # read/write per tabel spoke
  src/lib/audit.ts, src/lib/sync/progress.ts
  src/routes/{workspace,changes,me,access,health,cron}.ts
database/
  hub/migrations/                          # skema hub (dari yang sekarang, tanpa tabel spoke)
  spoke/base/migrations/0001_base.sql      # IDENTIK di semua spoke: schema_meta, store_values, load_rows, apply_rows
  spoke/<slug>/migrations/0002_<slug>_tables.sql
  schema/schema-spec.mjs                   # dapat kolom `home` per tabel; build-sql menghasilkan semuanya
frontend/src/lib/workspace/bff-repository.ts   # implementasi ketiga WorkspaceRepository
```

Struktur ini memakai `database/` yang sudah ada, bukan `supabase/` seperti di dokumen ERP. Tidak ada beda fungsional.

### 5.1 Muat

`GET /api/workspace` → hub dan semua spoke yang `is_active` dan terkonfigurasi dipanggil paralel dengan `Promise.allSettled`. Hasilnya digabung menjadi satu objek `rowsByTable` yang sama persis dengan keluaran `load_workspace()` hari ini, lalu `compose()` di `shape.ts` dipakai tanpa diubah. Respons membawa status per divisi: `ok | paused | not_configured | forbidden`. Divisi yang tidak `ok` menghasilkan irisan kosong, bukan error; UI menampilkan "Belum terhubung / sedang tidur" di halaman divisi itu dan mengunci penyimpanan untuk tabelnya.

### 5.2 Simpan

Tidak ada transaksi lintas database, jadi `apply_changes` yang atomik hari ini menjadi:

1. Validasi (zod): nama tabel masuk daftar putih, tiap baris `{id, pos, doc}`, ukuran dibatasi.
2. Pecah per rumah tabel. Otorisasi **setiap baris** (spoke: predikat §4; hub: dikerjakan RLS).
3. Cek cepat: kalau ada spoke yang tujuan tapi sedang `paused`, **seluruh perubahan ditolak di awal** sebelum ada yang ditulis. Ini menutup kasus gagal yang paling sering.
4. Tiap database dipanggil dengan `apply_rows`, satu transaksi per database, upsert dan delete idempoten.
5. Kegagalan di tengah jalan (jarang): respons memuat `applied[]` dan `failed[]`; klien **memuat ulang** workspace dari server (kebenaran), tidak sekadar membatalkan lokal. Toast "Could not save" tetap sama.
6. Tulis `audit_log` untuk operasi tulis di divisi sensitif dan semua perubahan akses.

Perubahan yang menyentuh lebih dari satu database hanya muncul pada alur lintas divisi (mis. `ee_handoffs` yang memicu tugas di hub), jadi kasus ini kecil.

### 5.3 Login

Tetap Google OAuth PKCE lewat supabase-js ke **hub** dan hook `before_user_created` (invite-only; sudah lebih ketat dari "matikan sign-up"). Browser mengirim `Authorization: Bearer <access_token>` ke `/api/*` (same-origin lewat rewrite Vercel, tanpa CORS). Server tidak pernah menerima peran dari klien; semuanya dihitung ulang dari hub.

### 5.4 Mode demo

`VITE_DEMO_MODE=true` tetap memakai repositori memori. Playwright demo dan uji visual tidak berubah.

---

## 6. Tahap kerja

Ukuran: S = sekitar 1 sesi, M = 2 sampai 4 sesi, L = lebih dari itu. Perkiraan kasar, bukan janji.

### H0. Keputusan dan prasyarat (tanpa kode) · S
- Pemilik menjawab HS-1 sampai HS-7; saya catat di `decision-log.md` (M5 digantikan).
- Buat 6 project Supabase baru dan tetapkan siapa memegang akun mana. Hub di akun yang stabil. Minimal 2 pemilik per project; nama admin cadangan (D4).
- Siapkan: Supabase CLI, `psql`, Docker atau project scratch (saat ini tidak ada di mesin; uji RLS dan migrasi butuh ini). Simpan kredensial di password manager bersama, bukan chat.
- Kerangka hosting server: Vercel Functions (M13). Catat bahwa paket Hobby Vercel dibatasi untuk non-komersial dan cron-nya harian.

**Gerbang:** HS-1 sampai HS-7 terjawab; 7 project ada dengan `URL`, `service_role`, dan connection string tersimpan aman.

### H1. Pecah skema (hanya database) · M
- Tambah `home` ke tiap tabel di `schema-spec.mjs` (turunan dari awalan, kecuali `acct_*`, `perf_*`, `store_values`).
- Perluas `scripts/database/build-sql.mjs`: hasilkan `hub/`, `spoke/base/`, dan `spoke/<slug>/`. Di spoke: `enable row level security` **tanpa policy**, hapus `app.*` dari policy, buang FK `sng_initiatives.project`, tambah `load_rows(tables)` / `apply_rows(p)` yang hanya boleh dipanggil `service_role`.
- Hub: `load_workspace()` / `apply_changes()` diterbitkan ulang hanya untuk tabel hub. Tambah `division_progress`, `audit_log`, kolom di `divisions`, enum `board` bila perlu.
- Satu keluaran lama (`legacy` satu database) tetap dihasilkan sampai H8 supaya mode lama bisa dibandingkan.
- Uji (perluas `shape.test.mjs`): tiap tabel punya tepat satu rumah; hanya satu FK menyeberang dan itu sudah dibuang; muat+gabung dari 7 potongan sama dengan muat dari satu database.

**Gerbang:** `node --test` hijau; semua migrasi berjalan di project scratch; `rls_smoke.sql` bagian inti tetap lulus di hub.
**Pemulihan:** hanya file baru; hapus saja.

**Hasil H1 (2026-10-17):** selesai, dengan satu penyimpangan dari rencana: migrasi dijalankan di Postgres dalam-proses (PGlite) di luar repositori, bukan di project Supabase scratch, karena belum ada project dan tidak ada `psql`/Docker di mesin ini.
- Keluaran lama tidak berubah (migrasi 2 dan 3, `tables.json`): tidak ada selisih isi menurut git.
- Baseline `rls_smoke.sql` di PGlite: 61/61. Hub (4 migrasi) + `rls_smoke_hub.sql`: 58/58 (47 pemeriksaan inti yang tersisa + 11 baru untuk `division_progress` dan `audit_log`). Tiap dari 6 spoke (base + tabel divisi) + `spoke_smoke.sql`: 33 sampai 61 pemeriksaan, semua lulus. Uji mutasi: memberi `authenticated` hak `select` pada satu tabel spoke langsung membuat `spoke_smoke.sql` gagal.
- `npm run db:test`: 23 uji lulus (16 baru di `partition.test.mjs`).
- Belum dibuktikan: eksekusi di Postgres Supabase sungguhan (peran, `auth.*`, hook). PGlite memakai peran dan fungsi `auth.uid()` tiruan.
- Temuan sampingan: `build-sql.mjs` menulis ulang `frontend/src/lib/workspace/tables.generated.ts` tanpa format Prettier, jadi berbeda dari berkas yang di-commit. Itu sudah begitu sebelum H1; berkasnya saya kembalikan, jadi tidak ada selisih. Cek `anon` di `rls_smoke.sql` ("signed-out visitors cannot read tables") hanya lulus bila `anon` tidak punya hak tabel bawaan; di Supabase asli `anon` punya hak bawaan sehingga hasilnya 0 baris, bukan galat.

### H2. Server perantara + aplikasi jalan di hub saja · L
- Buat `server/` (Hono) dengan `registry`, `db(slug)`, `hub/admin`, `hub/user`, `principal`, `audit`, rute `/api/health`, `/api/me`, `/api/workspace`, `/api/changes` (baru hub).
- Pemisahan keras: `server/` tidak boleh di-import dari `frontend/` (aturan ESLint `no-restricted-imports` + tsconfig terpisah). Pengganti `import 'server-only'` yang khusus Next.
- Frontend: `bff-repository.ts` + saklar `VITE_DATA_MODE = demo | supabase | bff`. Klien Supabase di browser tetap ada **hanya untuk auth**.
- `load` mengembalikan juga status per divisi; `WorkspaceProvider` menyimpannya; halaman divisi menampilkan "Belum terhubung" bila tidak `ok`.
- Env bertahap: spoke yang belum diisi dilewati, tidak ada throw saat build atau start (§4.2 dokumen ERP).

**Gerbang:** dengan hanya hub terhubung, semua fitur inti (My Work, Projects, Schedule, Updates, Accounts) jalan seperti sekarang; halaman divisi menampilkan "Belum terhubung"; uji paritas hub lulus (lihat §7).
**Pemulihan:** `VITE_DATA_MODE=supabase` mengembalikan jalur lama selama H8 belum jalan.

**Hasil H2 (2026-10-17): kode selesai dan diuji tanpa Supabase; gerbang belum terpenuhi.**
- Dibangun: `server/` (Hono; `registry`, `db(slug)`, `hub/gateway`, `principal`, `audit`, rute `health`, `me`, `workspace`, `changes`), `database` → `server/src/generated/partition.ts` dari `build-sql.mjs`, `lib/bff/*` di frontend, `VITE_DATA_MODE=demo|supabase|bff`, proksi `/api` di Vite, pemberitahuan "belum terhubung" di halaman divisi, dan aturan lint yang melarang frontend mengimpor server. Panduan: `server/README.md`.
- Uji: server 51 (rute dengan hub tiruan; gateway asli supabase-js terhadap Supabase tiruan yang memeriksa **kunci siapa** yang dipakai tiap panggilan; isolasi frontend), frontend 51 (13 baru), database 23. Bundel frontend dalam mode `bff` bebas dari `SERVICE_KEY`, `SPOKE_*`, `HUB_SUPABASE`. Server nyata dijalankan dan `/api/health` serta penolakan 401 dicoba lewat curl. Mode demo diperiksa di browser (My Work dan HR/Attendance tampil, tanpa galat konsol).
- **Belum terbukti:** jalannya terhadap project Supabase sungguhan (login Google, `getUser`, `load_workspace` lewat PostgREST) dan paritas persona (§7), karena belum ada project (H0). Itu yang menutup gerbang H2.
- Perilaku yang perlu Anda ketahui: dalam mode `bff` pada hub berskema lama, tabel dan nilai divisi sengaja dibuang dari hasil muat dan simpan ke tabel divisi ditolak 409, jadi halaman divisi menampilkan "belum terhubung" walaupun datanya masih ada di database lama. Mode default `supabase` tidak terpengaruh.
- Dua hal yang sudah ada sebelum H2 dan tidak saya ubah: `tsc -b` di frontend gagal pada `vite.config.ts` (properti `test`, vite 8 melawan vite 7 di akar), dan `tests/e2e/run.mjs` yang dirujuk skrip `test:e2e` tidak ada.
- Terbuka: entri penerapan server (Vercel Functions atau lainnya) belum dibuat; Hono mendukung keduanya.

### H3. Mesin akses + spoke pertama: `sng` · M
- Tulis `resolvePrincipal` dan `policy/` dengan jenis predikat A dulu. Spoke pertama `sng` karena hanya 2 tabel dan aturannya pola A murni: membuktikan seluruh pipa (migrasi, env, `is_active`, muat, simpan, audit) dengan risiko terkecil.
- Uji tabel-demi-tabel: matriks persona × tabel × aksi dari `RLS_RULES.md`, dijalankan terhadap predikat TypeScript.
- Prosedur aktivasi divisi (jadi daftar periksa tetap): buat project → migrasi base + divisi → isi 2 env → `divisions.is_active = true` → pindahkan data (`move-data.mjs --target spoke:<slug>`) → uji paritas → buka.

**Gerbang:** untuk setiap persona demo (41 orang), baris `sng_*` yang terlihat lewat BFF identik dengan lewat RLS lama.

**Hasil H3 (2026-10-17): selesai dan gerbangnya terpenuhi di Postgres dalam-proses (PGlite); belum di Supabase sungguhan.**
- Dibangun: `resolvePrincipal` lengkap (peran, pangkat, `baseRank`, proyek yang dipimpin), `lib/auth/rules.ts` (padanan TypeScript dari fungsi `app.*`), `lib/policy/` (aturan `sng_initiatives`, `sng_packets`, `store_values`; sebuah divisi dilayani hanya bila semua tabelnya punya aturan), `lib/spoke/` (gateway `load_rows`/`apply_rows` dan layanan baca/otorisasi per baris), muat paralel hub + divisi dengan `allSettled`, simpan lintas proyek (hub dulu, lalu divisi paralel, 502 `partial_save` bila ada yang gagal setelah yang lain tersimpan), dan muat ulang di browser setelah `partial_save`.
- **Gerbang (§7 uji paritas):** fungsi `app.*` asli dan aturan TypeScript memberi jawaban sama untuk 20 orang (semua peran, Board, admin, orang tidak aktif, orang tanpa peran). Kebijakan RLS asli `sng_*` dan `store_values` versus aturan server: sama untuk baca, insert, update (dinilai pada baris lama dan baru) dan delete, pada 20 orang **dan** 41 orang demo dengan data sng demo. Tiap perbandingan memeriksa bahwa kedua hasil (boleh dan tidak) benar-benar terjadi, jadi tidak lulus karena membandingkan dua jawaban kosong. Dua uji mutasi (hapus `createdBy` dari aturan; izinkan Board) langsung digagalkan, lalu dipulihkan.
- Uji ujung ke ujung: seluruh server di atas project divisi sng sungguhan (migrasi spoke di PGlite lewat `load_rows`/`apply_rows` sebagai service role): siapa dapat baris apa, simpan ditolak sebelum menulis, divisi mati, `partial_save`, simpan ulang aman. Hasil total: server 307 uji, frontend 53, database 23; tipe dan lint bersih.
- Perbedaan yang diterima dari database (dicatat di M29 dan `RLS_RULES.md`): menghapus baris yang ada tetapi tidak boleh ditulis kini ditolak 403 (dulu diabaikan diam-diam bila barisnya tak terlihat); orang aktif tanpa peran valid tidak mendapat apa pun; simpan lintas proyek bukan satu transaksi.
- Belum terbukti: jalan terhadap Supabase sungguhan (PostgREST, Auth, JWT, hak bawaan peran), seperti H1 dan H2. Aturan tabel divisi lain (`mcit`, `ee`, `cons`, `hr`, `fnl`) belum ditulis, jadi keempatnya tetap `unavailable` bila diaktifkan.
- Satu hal yang saya temukan di tengah jalan: `not is_board()` bernilai null (ditolak) untuk orang aktif yang catatannya tanpa peran; versi pertama kode TypeScript mengizinkannya. Uji paritas menangkapnya setelah orang tanpa peran dimasukkan ke dalam daftar uji.

### H4. Fan-out workspace, simpan lintas database, mode degradasi · M
- `/api/workspace` paralel dengan `allSettled`; status per divisi; cache sirkuit ringan (hasil ping terakhir) untuk penolakan awal di §5.2 langkah 3.
- `/api/changes` memecah per database dan melaporkan `applied/failed`; klien memuat ulang saat gagal sebagian.
- Uji injeksi kegagalan: matikan satu spoke (env salah) dan pastikan aplikasi tetap terbuka, divisi itu "tidur", simpan ke divisi lain tetap jalan, simpan ke divisi itu ditolak bersih.

**Gerbang:** skenario gagal di atas lulus di Playwright (mode `bff` dengan server uji).

### H5. Aktifkan spoke satu per satu: `mcit`, lalu `ee`, lalu `cons` · L
Urutan ini sengaja: tiap langkah menambah satu pola akses baru.
- `mcit`: pola B (pemohon bisa baca/tulis baris sendiri tanpa anggota divisi) + pengecualian Board baca saja.
- `ee`: pola D (`ee_handoffs` dibaca lead unit penerima; `ee_orgs`/`ee_opps` dibaca juga oleh `cons`).
- `cons`: pola D dan E (`is_project_lead` dari hub; `cons_kn` `audience = 'org'`).
- Tiap divisi diaktifkan dengan daftar periksa H3 dan gerbang paritas yang sama.

**Hasil H5 (2026-10-17): aturan `mcit`, `ee`, `cons` selesai, gerbang paritas terpenuhi di PGlite; belum di Supabase sungguhan.**
- Aturan ditulis di `server/src/lib/policy/` (`mcit.ts`, `ee.ts`, `cons.ts`): pola swalayan (pemohon dan pembuat melihat dan mengubah barisnya sendiri, ketua unit tujuan), Board baca saja di `mcit`, serah-terima EE yang dilihat unit penerima setelah terkirim, `cons` yang bergantung pada proyek hub (`is_project_lead`) dan orang yang disebut di artikel pengetahuan (`jsonb_exists`: elemen larik, kunci objek, atau teks sama).
- Gerbang: untuk 21 orang (ditambah satu orang aktif tanpa peran di MCIT, karena aturan MCIT tidak memakai `not is_board()`) dan 41 orang demo, kebijakan RLS asli dan aturan server memberi jawaban sama untuk baca, simpan (jalur nyata aplikasi: `apply_changes`) dan hapus, pada seluruh tabel keempat divisi. Uji ujung ke ujung: demo dimuat dua kali (skema satu-database sebagai kebenaran; empat project divisi nyata di belakang server), dan untuk 41 orang `GET /api/workspace` mengembalikan tepat baris yang diberikan RLS, serta simpan melalui `POST /api/changes` diterima tepat saat database akan menyimpannya (13 orang yang mencakup setiap peran dan divisi × semua baris). Uji mutasi: tujuh perubahan sengaja pada aturan (Board dikeluarkan dari MCIT, ketua unit atau pembuat diabaikan, draf serah-terima terlihat penerima, orang bernama diabaikan, ketua proyek diabaikan, orang tanpa peran) semuanya digagalkan; satu mutasi ternyata setara dan bukan perubahan perilaku (`|| p.board` berlebihan karena `sees_div` sudah memuat Board).
- Temuan: dengan jalur simpan yang sebenarnya (`insert … on conflict do update`), PostgreSQL menilai catatan baru terhadap aturan tulis **dan** aturan baca, dan catatan lama harus bisa dibaca dan ditulis. Perbandingan pertama dengan perintah `insert`/`update` biasa memberi hasil berbeda untuk draf serah-terima; aturan server kini mengikuti jalur yang sebenarnya (M30, `mayUpsert`, `mayDelete`).
- Total: server 1120 uji (sekitar 25 detik), frontend 53, database 23; tipe dan lint bersih. Divisi `hr` dan `fnl` masih `unavailable` bila diaktifkan sampai H7.

### H6. Operasional (wajib sebelum data HR/FnL masuk) · M
- **Keep-alive**: `/api/cron/ping` (dilindungi `CRON_SECRET`) ping `schema_meta` tiap spoke **dan** hub, 1 sampai 2 kali seminggu; sekalian `syncAll()` untuk `division_progress`. Jadwal lewat GitHub Actions (cron Vercel Hobby hanya harian dan terbatas).
- **Backup**: perluas `scripts/backup/backup-database.mjs` ke 7 database, GitHub Actions mingguan, hasil ke penyimpanan terpisah, retensi 8 minggu, **uji restore sekali per database**. Prioritas hub, lalu `fnl` dan `hr` (dienkripsi).
- **Akses lewat server**: pindahkan penulisan `acct_grants`, `acct_memberships`, `acct_invites` ke rute `/api/access/*` dengan matriks §3.3 dokumen ERP (`requireAccessManager`), dan tulis `audit_log`. Klien tidak lagi menulis tabel itu lewat `apply_changes`.
- **Rate limit** untuk `/api/changes` dan login (Upstash), **header keamanan** (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`) di `vercel.json`.
- **MFA** untuk President, VP, admin, dan lead/admin `hr` dan `fnl`; konfirmasi email aktif; 2FA di akun supabase.com.

**Gerbang:** satu restore berhasil per database; ping membangunkan spoke yang sengaja dibiarkan >7 hari di scratch; checklist §9 dokumen ERP terisi.

**Hasil H6 (2026-10-17): kode, alur kerja, dan uji selesai; gerbangnya belum terpenuhi (butuh project nyata).**
- Dibangun: `GET /api/cron/ping` (dilindungi `CRON_SECRET`, perbandingan waktu-tetap; membangunkan hub dan tiap divisi lewat `schema_meta` dan menyimpan hitungan tugas sebagai `division_progress`; `ok:false` bila ada yang tidak menjawab), pembatas laju (per orang untuk simpan dan muat, per alamat hanya untuk token yang ditolak; antarmuka dua metode agar bisa diganti Upstash), audit perubahan akses ke `audit_log` dan `GET /api/audit` untuk Admin dan President, `frontend/vercel.json` (CSP dan header lain, SPA rewrite tanpa `/api`), backup tujuh project (HR dan FnL tidak pernah ditulis tanpa kunci; semuanya dienkripsi AES-256-GCM bila kunci ada; hasil enkripsi didekripsi ulang untuk diperiksa), restore yang mendekripsi dan menolak semua URL produksi, dan dua alur kerja GitHub Actions (`keepalive.yml` Senin dan Kamis, `backup.yml` tiap Minggu, simpanan 56 hari).
- **Penyimpangan dari rencana (M31):** "rute akses" tidak dipindah menjadi rute aksi `/api/access/*`. Layar akun menyimpan lewat `/api/changes`, dan kebijakan hub serta penjaga `people` sudah menegakkan matriks §3.3; yang ditambahkan server adalah pencatatan setiap perubahan wewenang beserta pelakunya dan rute baca audit. Menulis ulang tiap aksi akun sebagai rute akan menambah risiko tanpa menambah penegakan. Pembatasan laju untuk login diserahkan ke pengaturan Supabase Auth (login tidak lewat server ini).
- Diuji: server 1176 uji (cron, batas laju, audit akses, gateway asli terhadap Supabase tiruan untuk hitung tugas, upsert progres, baca audit, baca orang; SQL hub nyata di PGlite untuk hitungan tugas, upsert progres, `audit_log` hanya untuk service role, ping `schema_meta`), backup 10 uji (enkripsi nyata, kunci salah, byte diubah, berkas terpotong, seluruh proses dengan pengganti `pg_dump`), alur kerja dan `vercel.json` diurai. Lima uji mutasi (rahasia cron diabaikan, batas laju mati, token ditolak tidak dihitung, peran tidak diaudit, dump HR/FnL tanpa enkripsi) semuanya digagalkan.
- CSP diperiksa di browser: build mode demo disajikan dengan header dari `vercel.json`; aplikasi tampil, masuk sebagai persona, halaman Work, Programs, Projects, Resources, Schedule terbuka, gambar tidak rusak, **nol pelanggaran**; skrip inline, `eval`, dan `fetch` ke host asing sengaja dicoba dan ditolak. Belum diuji: koneksi ke Supabase sungguhan di bawah CSP (`connect-src` mengizinkan `*.supabase.co`) dan `VITE_API_URL` ke origin lain (harus ditambahkan ke `connect-src`).
- Belum terbukti dan perlu H0: alur kerja belum pernah dijalankan; `pg_dump` dan `pg_restore` tidak ada di mesin ini sehingga satu backup dan satu restore nyata per project (HR dan FnL dulu) harus dilakukan dan dicatat di `docs/deployment/`; salinan di luar GitHub belum ditentukan lokasinya.
- Yang masih kurang untuk gerbang H6: MFA dan 2FA (pengaturan dasbor Supabase, bukan kode) serta pembatasan laju login (dasbor Supabase Auth). Itu tugas pemilik saat H0.

### H7. Divisi sensitif: `hr`, lalu `fnl` · L
- Pola C (orang yang dibahas) dan audit otomatis per permintaan.
- **Audit data pribadi dulu**: periksa semua `doc` di tabel `hr_*` dan `fnl_*` untuk NIK, nomor rekening, gaji, dokumen identitas. D5 menyebut hanya catatan dan tautan, tapi belum ada yang memeriksa isinya. Kalau ada, hapus atau enkripsi di aplikasi sebelum cutover.
- Dashboard lintas divisi hanya menampilkan agregat untuk dua divisi ini (`division_progress`).
- Tinjau jumlah `lead`/`admin` di kedua divisi.

**Gerbang:** persona non-HR tidak bisa membaca satu baris `hr_assessments` lewat BFF (uji negatif), audit tercatat, backup terenkripsi sudah di-restore.

**Hasil H7 (2026-10-17): aturan, audit baca/tulis, dan pemeriksaan data pribadi selesai; dua syarat gerbang belum bisa dipenuhi (backup terenkripsi yang sudah di-restore, data nyata).**
- Aturan `hr` (9 tabel) dan `fnl` (7 tabel) di `server/src/lib/policy/`. Dua hal yang dibutuhkan HR: aturan boleh melihat baris lain di divisinya sendiri (`needs`; penilaian dibaca oleh peninjau yang disebut di roster siklusnya), dan urutan operator spesifikasi (`hrPrivate(x) or y` berarti `(bukan-Board dan (...)) atau y`, jadi Board tetap membaca penilaian yang ia skor sendiri). Semua enam divisi kini dilayani; `tests/policy-coverage.test.ts` gagal bila ada tabel divisi tanpa aturan.
- Gerbang paritas: aturan server dan kebijakan RLS asli sama untuk baca, simpan dan hapus pada 21 orang uji (396 uji HR, 308 uji FnL), pada 41 orang demo di 35 tabel enam divisi, dan lewat seluruh server di atas enam project divisi nyata (PGlite) untuk 41 orang. Uji mutasi pada aturan HR (urutan operator Board, peninjau dari siklus, pemilik tindakan, panel ronde) semuanya digagalkan; satu mutasi pada aturan tulis `fnl_requests` ternyata setara (pembuat yang bukan pemohon tidak bisa membaca hasilnya, dan jalur simpan butuh hak baca).
- Audit: setiap pembacaan yang menyerahkan catatan HR/FnL, dan setiap perubahan, ditulis ke `audit_log` (`access.sensitive`, `op`, jumlah, nama tabel; tanpa isi). Orang yang tidak mendapat apa pun tidak meninggalkan baris. HR dan FnL selalu dianggap sensitif walau hub belum menandainya (M32).
- Pemeriksaan data pribadi (`npm run db:personal-data`): data demo **tidak berisi** nomor identitas, pajak, rekening, gaji, email, atau telepon di HR dan FnL; yang ditemukan hanya 26 tautan ke berkas (bukti pembayaran, dokumen hukum, laporan penilaian), dilaporkan sebagai tingkat rendah. Itu bukti tentang data **demo yang dikarang**, bukan tentang data nyata: pemindai diuji dengan data sintetis (NIK, NPWP, rekening, gaji, email, telepon; tanggal dan id tidak dianggap) dan harus dijalankan pada ekspor data nyata sebelum masuk project HR/FnL. Tautan berkas tetap perlu dicek manual: apakah ada yang mengarah ke pindaian KTP atau slip gaji.
- Tinjauan wewenang (keluaran pemindai): 5 orang punya wewenang atas HR (President, VP, satu Admin yang juga direktur, direktur HR, ko-direktur HR) dan 5 atas FnL. Batas `--max-authority` (default 8) belum terlampaui. Itu angka demo; hitung ulang dengan data nyata.
- Belum dilakukan dan butuh H0: restore backup terenkripsi HR dan FnL (gerbang), MFA untuk lead/admin HR dan FnL (pengaturan Supabase), dan enkripsi per kolom aplikasi untuk data pribadi bila pemindaian data nyata menemukannya.
- Total: server 1897 uji, frontend 53, database 31, backup 10; tipe dan lint bersih.

### H8. Cutover dan pembersihan · M
- Tentukan jendela: bekukan penulisan, `move-data.mjs` terakhir, uji paritas penuh, ganti default `VITE_DATA_MODE=bff`.
- Project lama menjadi **hub**. Hapus tabel spoke dari hub **hanya setelah** backup terverifikasi dan satu minggu berjalan tanpa masalah.
- Cabut izin langsung: `anon`/`authenticated` tidak lagi punya akses data selain RPC hub yang diperlukan; browser tidak punya jalur ke spoke. Hapus keluaran `legacy` dan mode `supabase`.
- Perbarui dokumen: `architecture.md` (hapus "no custom server"), `backend/README.md` (kini berisi server), `database-design.md`, `RLS_RULES.md` (hub RLS + tabel aturan server untuk spoke), `docs/deployment/`, catatan di `AGENTS.md`, dan koreksi §1 dokumen ERP (HS-2, HS-3).

**Gerbang:** semua gerbang sebelumnya hijau; `npm run typecheck/lint/test/test:e2e/build` hijau.

**Hasil H8, bagian alat (2026-10-17): skrip pindah data selesai dan diuji; cutover sendiri belum bisa dilakukan (butuh project nyata).**
- `scripts/database/move-data.mjs` (+ `lib/move.mjs`) memotong satu workspace menurut hub dan divisi lalu memindahkan tiap potongan ke project-nya. Tiga tahap: **periksa** tanpa jaringan (baris per project dan tabel; bukti tidak ada yang hilang; rujukan antar-project yang menunjuk ke ketiadaan), **lihat dulu** (`--target`, membaca project, tidak menulis; melaporkan apa yang akan ditambah atau diubah dan baris tambahan), **pindah** (`--apply`, satu transaksi per project, baca ulang, bandingkan setiap baris termasuk urutan kunci; kode keluar 1 bila ada beda). `--target hub|spoke:<slug>|daftar|all|legacy`; `--apply` wajib dengan `--target` eksplisit; tidak pernah menghapus; project yang sudah berisi baris asing dibiarkan kecuali `--allow-extra`; rujukan antar-project yang menggantung menghentikan pemindahan kecuali `--allow-dangling`; dua project beralamat sama ditolak sebelum menyambung; kredensial `SUPABASE_URL_<P>` dan `SUPABASE_SERVICE_KEY_<P>`.
- Diuji (server/tests/parity/move-data.test.ts, 27 uji): demo dipindah ke hub nyata dan enam project divisi nyata (migrasi sungguhan di PGlite, lewat `import_workspace`/`apply_rows`, dibaca lewat `load_workspace`/`load_rows`) dan terbaca kembali baris demi baris; jumlah baris dihitung dengan kueri terpisah; kunci tetap berurutan; nilai tersimpan masuk ke project yang benar; lihat-dulu pada project kosong dan terisi; ulang dua kali aman; baris asing, kegagalan di tengah lalu ulang, hasil baca ulang yang berbeda, email hanya ke hub; mode `legacy` tetap jalan; alamat dan kunci tiap project diperiksa lewat server HTTP tiruan; perintahnya dijalankan sebagai proses. Empat mutasi (urutan kunci diabaikan, nilai tersimpan semua ke hub, pindah meski ada baris asing, verifikasi tidak membaca ulang) digagalkan.
- Sisa cutover (butuh H0, dikerjakan pemilik dengan saya): (1) bekukan penulisan; (2) backup terenkripsi semua project dan satu restore; (3) `--target all` lihat-dulu, lalu `--apply` per project, hub dulu; (4) jalankan `npm run db:personal-data -- --input` pada ekspor nyata sebelum `hr` dan `fnl` diisi; (5) jalankan uji paritas terhadap data nyata (bandingkan `load_workspace` lama dan `/api/workspace` baru per orang); (6) ubah `VITE_DATA_MODE` bawaan menjadi `bff` di penerapan; (7) project lama menjadi hub: hapus tabel divisi darinya **hanya setelah** backup terverifikasi dan satu minggu tanpa masalah (migrasi baru, bukan menyunting yang lama); (8) hapus keluaran `legacy` dan mode `supabase` dari kode, perbarui `architecture.md`, `backend/README.md`, `RLS_RULES.md`, `database-design.md`. Catatan: fungsi `load_workspace` dan `apply_changes` di hub tidak boleh dicabut dari `authenticated`, karena server memanggilnya sebagai orang itu; akses langsung dari browser ke hub tidak membuka apa pun yang tidak sudah lewat server (hanya baris inti yang disaring RLS).

---

## 7. Cara membuktikan benar

1. **Uji paritas persona** (alat terpenting): untuk tiap dari 41 persona demo, bandingkan hasil `load_workspace()` lama (RLS) dengan hasil `/api/workspace` baru. Harus identik baris-per-baris untuk tabel hub dan spoke. Dijalankan di tiap tahap aktivasi divisi dan sebelum cutover.
2. **Uji aturan tulis**: matriks persona × tabel × (insert/update/delete) dari `RLS_RULES.md`, termasuk 61 pemeriksaan `rls_smoke.sql` yang dipetakan ke predikat TypeScript.
3. **Uji kebocoran**: (a) cari `SPOKE_`, `service_role`, dan URL spoke di `frontend/dist`; (b) panggil tiap spoke dengan publishable key dan pastikan 0 baris; (c) panggil `/api/*` tanpa token, dengan token tidak valid, dan dengan token orang `status ≠ active`.
4. **Uji kegagalan**: spoke mati, spoke tidur, hub lambat, penyimpanan lintas database yang gagal sebagian.
5. **Uji yang sudah ada tetap hijau**: Vitest, Playwright demo, paritas visual.

---

## 8. Risiko

| Risiko | Dampak | Penanganan |
|---|---|---|
| Penyimpanan tidak atomik lintas database | Data separuh tertulis | Penolakan awal untuk spoke tidur, upsert idempoten, muat ulang saat gagal sebagian; kasus lintas database memang jarang |
| Aturan akses diporting dengan salah | Kebocoran atau penolakan keliru | Uji paritas persona sebagai gerbang tiap divisi; spoke tetap deny-all untuk anon/authenticated sehingga salah-port tidak membuka jalur dari luar |
| Kehilangan lapisan RLS di spoke | Pembatas tunggal adalah kode server (§0.4 dokumen ERP) | Diterima oleh dokumen ERP; kurangi dengan uji, review kode, dan `server/` tak boleh di-import frontend |
| Spoke tidur (7 hari tanpa aktivitas) | Divisi tak terbaca; bangun lambat | Cron ping, mode degradasi, status per divisi di UI; PIC pemulihan dicatat |
| Batas free tier: 500 MB, tanpa backup otomatis, 2 project per akun | Data hilang atau divisi tak bisa dibuat | H6 backup + restore; akun tersebar (HS-7); pantau ukuran; media di luar database (D5 sudah catatan dan tautan saja) |
| Muat data lebih lambat (fungsi serverless + 7 database) | Buka aplikasi terasa lambat | Paralel; ukur di H4; bila perlu muat divisi lazy per halaman (pola "tarik detail" §8 dokumen ERP) tanpa mengubah kontrak |
| Biaya dan kerumitan: 7 project dirawat, dimigrasi, dijaga aktif | Beban operasional pengurus tiap periode | Skrip `migrate-all` hanya untuk divisi aktif; serah terima lewat hub; daftar PIC |
| Bergantung pada Vercel Functions | Batas paket Hobby (non-komersial, cron harian) | Hono portabel ke Cloudflare (D3); cron lewat GitHub Actions |
| Fitur yang sudah direncanakan butuh server (Kalender Google D24, favicon tautan D37, WebMCP D25) | Sebelumnya tidak punya tempat | Server perantara memberi tempatnya; bukan bagian migrasi ini, tapi tidak lagi terblokir |

---

## 9. Yang belum saya periksa

- Isi aktual kolom `doc` di tabel `hr_*` dan `fnl_*` (data pribadi): dijadwalkan di H7.
- Arti persis `acct_grants`/`acct_memberships` (hibah antar-divisi) terhadap `app.sees_div`. Fungsi SQL-nya hanya memakai `people.div`, jadi saya anggap grant tidak mengubah visibilitas baris spoke; perlu dikonfirmasi saat H3.
- Apakah project Supabase yang sekarang sudah berisi data nyata. Memori proyek mencatat tidak ada `.env` atau akses langsung di mesin ini, dan D8 mengatakan belum ada pilot langsung, jadi saya menganggap data masih demo. Bila ada data nyata, H8 butuh jendela migrasi yang lebih hati-hati.
- Ukuran muatan `load_workspace()` pada data penuh (belum diukur); mempengaruhi seberapa cepat muat lazy per divisi perlu dikerjakan.

---

## 10. Saran urutan kerja

Mulai dari **H0** (butuh keputusan dan akun dari pemilik) dan **H1** (murni di repositori, bisa langsung). H1 tidak mengubah perilaku aplikasi, jadi aman dikerjakan sambil menunggu H0.
