# H0: menyalakan semuanya sungguhan (daftar centang)

Untuk pemilik produk dan admin cadangan. Semua kode H1 sampai H8 sudah ada dan diuji di komputer ini (Postgres di dalam proses, bukan Supabase). Daftar ini mengurus **bagian yang tidak bisa saya kerjakan**: akun, project, kunci, dan menjalankan semuanya untuk pertama kali. Rencana lengkapnya: [.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md](../../.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md). Catat hasil tiap tahap di [LOG.md](LOG.md).

**Penanda.** `[Anda]` pemilik produk. `[Cadangan]` admin cadangan. `[Pemegang]` pemegang akun divisi (jabatan kepala divisi). `[Saya]` pekerjaan kode yang saya kerjakan setelah Anda memberi tahu. Perintah di blok kode dijalankan dari folder repositori.

**Aturan keras selama semua langkah ini.**
- Jangan menulis password, kunci, atau connection string di chat, issue, commit, atau berkas yang masuk git. Simpan di password manager bersama. Berkas `.env.local` sudah diabaikan git.
- Kunci "service" melewati semua aturan akses. Kunci itu hanya boleh ada di `server/.env.local`, `scripts/.env.local`, dan pengaturan rahasia host/GitHub. Jangan pernah di `frontend/.env*` atau variabel berawalan `VITE_`.
- Latihan dulu, produksi kemudian. Jangan memasukkan data anggota sungguhan ke project yang belum lolos Tahap 7.

**Hal yang belum pernah saya jalankan terhadap Supabase sungguhan** (jadi ada kemungkinan kejutan, catat di LOG): login Google lewat hook, `auth.getUser` dari server, PostgREST untuk semua fungsi, hak bawaan peran di Supabase, `pg_dump` dan `pg_restore`, dan alur kerja GitHub. Tahap 5 sampai 9 adalah pertama kalinya. Nama menu Supabase di bawah ditulis dari ingatan; bila berbeda, ikuti dokumentasi Supabase, bukan daftar ini.

---

## Tahap 0. Keputusan dan orang

- [ ] `[Anda]` Nama **admin cadangan** (satu orang, jabatannya) sudah ditentukan. Ia akan menjadi pemilik kedua di ketujuh project.
- [ ] `[Anda]` Tentukan pemegang akun tiap divisi (jabatan): EE, MCIT, HR, FnL, SnG, Cons. Hub di akun organisasi yang dipegang President/VP (M28).
- [ ] `[Semua]` Setiap pemegang akun dan admin cadangan: **verifikasi 2 langkah (2FA)** aktif di akun Google, akun GitHub, dan akun supabase.com mereka.
- [ ] `[Anda]` Password manager bersama sudah ada, dan hanya pemegang akun dan admin cadangan yang bisa membukanya. Buat satu entri per project dan satu untuk `CRON_SECRET`, satu untuk `BACKUP_ENCRYPTION_KEY`.
- [ ] `[Anda]` Putuskan **latihan atau langsung**. Saran saya: latihan. Free tier mengizinkan 2 project aktif per akun (periksa halaman harga Supabase; angka itu dari dokumen ERP), jadi tiap akun bisa memegang satu project **latihan** di samping project **produksi**. Tahap 1 sampai 9 dikerjakan dulu di set latihan (dengan data demo yang dikarang), lalu diulang untuk set produksi yang kosong (Tahap 10). Tanpa set latihan, Anda harus mengosongkan project sebelum data sungguhan masuk, dan belum ada skrip untuk itu.
- [ ] `[Anda]` Putuskan **di mana server berjalan** (lihat Tahap 8). Sampai itu diputuskan saya tidak bisa menulis berkas penerapannya.
- [ ] `[Anda]` Putuskan **di mana salinan backup di luar GitHub** disimpan (Google Drive organisasi, Cloudflare R2, atau Backblaze). Backup mingguan otomatis hanya menyimpan 56 hari di GitHub; itu salinan kedua, bukan satu-satunya.

## Tahap 1. Membuat project Supabase

Untuk **tiap** project (hub + 6 divisi; set latihan dulu, nama berakhiran `-latihan`):

- [ ] `[Pemegang]` Masuk ke supabase.com dengan akun divisi, buat organisasi bila belum ada, buat project baru. Nama: `dwdg-hub`, `dwdg-ee`, `dwdg-mcit`, `dwdg-hr`, `dwdg-fnl`, `dwdg-sng`, `dwdg-cons`.
- [ ] Wilayah (region) **sama** untuk ketujuhnya, dan yang terdekat dengan pengguna (Singapura bila tersedia). Server memanggil semuanya; wilayah berbeda menambah lambat.
- [ ] Password database: buat yang panjang dan acak, simpan di password manager. Jangan dipakai ulang.
- [ ] `[Pemegang]` Undang **admin cadangan** sebagai Owner/Admin project (menu anggota organisasi/project).
- [ ] Catat untuk tiap project (di password manager, bukan di chat): **Project URL**, **publishable (anon) key**, **service_role/secret key**, dan **connection string** (Project Settings → Database; pilih session pooler agar bisa dipakai dari GitHub).
- [ ] Pastikan ketujuh project statusnya aktif (tidak "paused").

## Tahap 2. Menerapkan migrasi (satu berkas per project)

- [ ] `[Anda]` Buat berkas paket:
  ```bash
  npm run db:bundle        # menulis database/bundles/hub.sql, ee.sql, mcit.sql, hr.sql, fnl.sql, sng.sql, cons.sql
  ```
- [ ] Untuk tiap project: buka SQL Editor project itu, tempel **seluruh isi berkas yang sesuai** (hub → `hub.sql`, divisi HR → `hr.sql`, dan seterusnya), jalankan **sekali**. Berkas hanya untuk project baru yang kosong; menjalankannya dua kali gagal (itu disengaja).
  - Cara lain bila `psql` terpasang: `psql "$CONNECTION_STRING" -f database/bundles/hub.sql`.
- [ ] Tidak ada galat merah. Bila ada, **berhenti**, jangan menjalankan ulang, catat pesannya di LOG, dan kabari saya.
- [ ] Periksa di Table Editor: hub punya tabel `people`, `tasks`, `divisions`, `division_progress`, `audit_log`, dan seterusnya; tiap divisi punya `schema_meta` dan tabel divisinya.
- [ ] **Uji akses di project yang masih kosong** (aman: seluruhnya dibatalkan di akhir). Tempel ke SQL Editor lalu jalankan:
  - hub: isi `database/tests/rls_smoke_hub.sql`
  - tiap divisi: isi `database/tests/spoke_smoke.sql`
  Hasilnya daftar baris `ok = true` dan **tidak ada galat di akhir**. Satu galat `... failed: <label>` berarti ada yang menyimpang: catat labelnya, berhenti, kabari saya. (Uji yang sama sudah lulus di Postgres dalam-proses; ini membuktikan Supabase berperilaku sama.)

## Tahap 3. Mengatur login di hub

Hanya project hub.

- [ ] `[Anda]` Di Google Cloud: buat OAuth client (jenis Web). **Authorized redirect URI** = `https://<ref-hub>.supabase.co/auth/v1/callback`. Catat Client ID dan Client Secret di password manager.
- [ ] Hub → Authentication → Providers → Google: aktifkan, isi Client ID dan Secret.
- [ ] Hub → Authentication → URL Configuration: **Site URL** = alamat aplikasi (untuk latihan lokal `http://127.0.0.1:5173`); tambahkan **Redirect URL** `<alamat aplikasi>/auth/callback` (dan `http://127.0.0.1:5173/auth/callback` selama latihan).
- [ ] Hub → Authentication → Hooks → **Before User Created**: tipe Postgres function, pilih `private.before_user_created`. Dari sini hanya email yang diundang yang bisa membuat akun. (Biarkan "sign-up baru" tetap aktif: login Google membuat akun lewat jalur yang sama, dan hook-lah yang menolak orang tak diundang. Mematikannya akan menolak semua orang.)
- [ ] Hub → Authentication → Rate Limits: periksa angka bawaannya dan turunkan yang berkaitan dengan percobaan masuk dan pengiriman email bila terlalu longgar. Login tidak lewat server kita, jadi **ini satu-satunya pembatas laju untuk login**.
- [ ] **Administrator pertama.** Ganti `email-anda@gmail.com` dan namanya, lalu jalankan di SQL Editor hub (pernyataan ini sudah diuji di `server/tests/parity/bundles.test.ts`):
  ```sql
  insert into private.bootstrap_settings (key, value) values ('first_admin_email', 'email-anda@gmail.com');
  insert into public.people (id, pos, doc, email) values (
    'admin', 0,
    '{"id":"admin","name":"Nama Anda","first":"Nama","div":null,"role":"president","admin":true,"board":false,"status":"active","title":"","photo":null,"hasSchedule":true,"gcal":false,"joined":"2026-10-17","linkedin":null,"phone":null,"hidePhone":false}',
    'email-anda@gmail.com');
  ```
  (Untuk set latihan dengan data demo, lewati blok `insert into public.people`; Tahap 6 memetakan seorang tokoh demo ke email Anda.)

## Tahap 4. Mengisi pengaturan (env)

Buat tiga berkas dari contohnya. Semuanya diabaikan git.

- [ ] `server/.env.local` (dari `server/.env.example`):
  - `HUB_SUPABASE_URL`, `HUB_SUPABASE_PUBLISHABLE_KEY`, `HUB_SUPABASE_SERVICE_KEY` (hub)
  - `SPOKE_<DIVISI>_URL` dan `SPOKE_<DIVISI>_SERVICE_KEY` untuk EE, MCIT, HR, FNL, SNG, CONS. Biarkan kosong yang belum dinyalakan.
  - `CRON_SECRET`: buat dengan `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] `scripts/.env.local` (dari `scripts/.env.example`):
  - `DATABASE_URL_HUB`, `DATABASE_URL_EE`, `_MCIT`, `_HR`, `_FNL`, `_SNG`, `_CONS` (connection string)
  - `BACKUP_ENCRYPTION_KEY`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` (simpan juga di password manager, **terpisah dari backup**)
  - `SUPABASE_URL_<P>` dan `SUPABASE_SERVICE_KEY_<P>` untuk tiap project (untuk pemindahan data)
  - `SCRATCH_DATABASE_URL`: untuk latihan restore. Bisa project latihan, **bukan** project produksi.
- [ ] `frontend/.env.local` (dari `frontend/.env.example`):
  - `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` milik **hub saja**
  - `VITE_DATA_MODE=bff`
  - tidak ada kunci service di sini, dan tidak ada variabel `VITE_` selain yang di atas
- [ ] Periksa: `git status` tidak menampilkan berkas `.env.local` mana pun.

## Tahap 5. Menjalankan secara lokal

> **Set latihan:** Anda belum punya baris `people` (blok `insert` Tahap 3 dilewati), jadi masuk akan ditolak. Kerjakan dulu tiga butir pertama Tahap 6 (`emails.json`, periksa, lihat dulu) dan butir "Pindahkan hub", lalu kembali ke sini. Set produksi memakai blok `insert` Tahap 3 dan tidak perlu itu.

- [ ] Terminal 1: `npm run dev:server` (harus mencetak `dwdg server listening on http://127.0.0.1:8787/api`). Bila ada galat "Server settings are missing", nama variabel yang kurang disebut; nilainya tidak.
- [ ] Terminal 2: `npm run dev`, buka `http://127.0.0.1:5173`.
- [ ] `curl http://127.0.0.1:8787/api/health` menjawab `{"ok":true,...}` dengan divisi yang sudah terisi bertanda `configured:true`.
- [ ] Masuk dengan Google memakai `email-anda@gmail.com`. Berhasil bila Anda sampai ke My Work. Gagal "belum diundang" berarti Tahap 3 (hook atau baris `people`) belum benar.
- [ ] Di konsol browser (F12) **tidak ada** galat CSP atau jaringan merah.

## Tahap 6. Isi data latihan dan nyalakan divisi satu per satu

Hanya set latihan. Urutan ini sama dengan rencana: dari yang paling aman ke yang paling sensitif.

- [ ] Buat `emails.json`: `{ "mahdy": "email-anda@gmail.com" }` (memetakan tokoh admin demo ke Anda; tambah pemetaan untuk orang uji lain bila sudah punya akun Google).
- [ ] **Periksa** tanpa jaringan: `node scripts/database/move-data.mjs --demo`. Harus mengakhiri dengan "Check only" tanpa galat.
- [ ] **Lihat dulu**: `node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --target hub`. Harus menunjukkan project kosong dan jumlah yang akan ditambah.
- [ ] **Pindahkan hub**: `node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --target hub --apply --emails emails.json`. Akhir keluaran: "moved and verified".
- [ ] Untuk tiap divisi, **berurutan: `sng`, `mcit`, `ee`, `cons`**:
  - [ ] pindahkan: `... --target spoke:sng --apply`
  - [ ] nyalakan di hub (SQL Editor hub): `update public.divisions set is_active = true where id = 'sng';`
  - [ ] pastikan `server/.env.local` berisi `SPOKE_SNG_*`, mulai ulang server
  - [ ] di aplikasi, halaman divisi itu menampilkan datanya (bukan "belum terhubung")
- [ ] **Jangan** menyentuh `hr` dan `fnl` sebelum Tahap 9 lolos (restore backup terenkripsi sudah dicoba).

## Tahap 7. Memeriksa bahwa aturan akses benar

Aturan sudah dibuktikan sama dengan aturan lama di Postgres dalam-proses. Di sini Anda membuktikan perilaku di aplikasi yang sungguhan.

- [ ] `[Anda]` Buat 4 akun Google uji (atau pinjam orang) dan undang lewat aplikasi: seorang **anggota SnG**, seorang **anggota divisi lain** (mis. EE), seorang **direktur HR**, dan seorang **Board** (peran `board`).
- [ ] Anggota SnG melihat data SnG, tidak melihat data HR/FnL. Anggota EE tidak melihat data SnG kecuali yang menyebut namanya.
- [ ] Board tidak bisa mengubah apa pun (semua simpan ditolak) dan tidak melihat HR, FnL, EE, Cons.
- [ ] Orang yang belum disetujui (status `pending`) tidak melihat apa pun selain dirinya.
- [ ] `curl` ke project divisi dengan kunci **publishable** divisi itu harus ditolak:
  ```bash
  curl -s "https://<ref-sng>.supabase.co/rest/v1/sng_initiatives?select=*" -H "apikey: <PUBLISHABLE-KEY-SNG>" -H "Authorization: Bearer <PUBLISHABLE-KEY-SNG>"
  ```
  Jawabannya galat izin (`permission denied`) atau daftar kosong, **tidak boleh** berisi data.
- [ ] Bundel produksi tidak membawa rahasia server: `npm run build -w frontend` lalu cari kata `SERVICE_KEY`, `SPOKE_`, `service_role` di `frontend/dist` (harus tidak ada).

## Tahap 8. Tempat server berjalan (butuh keputusan Anda)

Server (`server/`) adalah aplikasi Hono. Pilihan, dengan akibatnya:

| Pilihan | Cocok bila | Catatan |
|---|---|---|
| **Satu proses Node di host kecil** (Render, Railway, Fly, atau VPS) | Anda ingin yang paling sederhana dan tanpa "cold start" | Pembatas laju di memori berlaku penuh karena hanya ada satu proses. Gratis biasanya "tidur" bila diam: kunjungan pertama lambat. Aplikasi statisnya dihosting terpisah dan meneruskan `/api` ke server |
| **Vercel Functions** | Aplikasi statis sudah di Vercel (M13) dan Anda ingin satu tempat | Paket Hobby untuk non-komersial dan cron hariannya terbatas (kita memakai GitHub Actions). Pembatas laju di memori lemah antar-instance |
| **Cloudflare (Pages + Workers)** | Anda memakai Cloudflare (D3) | Hono jalan di sana; perlu mode kompatibilitas Node untuk `node:crypto`. Belum saya coba |

- [ ] `[Anda]` Pilih satu. **Pilihan Anda: satu proses Node di host kecil.** Berkasnya sudah ada (`server/Dockerfile`, `render.yaml`, `server/fly.toml`, `server/src/main.ts`); langkah per host (Render, Fly, Railway, server sendiri) ada di [SERVER.md](SERVER.md), ikuti bagian host yang Anda pilih.
- [ ] `[Anda]` Isi pengaturan server di host (nilai yang sama dengan `server/.env.local`, termasuk `CRON_SECRET`).
- [ ] `[Anda]` Hubungkan aplikasi statis ke server dengan satu perintah (lihat SERVER.md, "Penerusan `/api`"): `node scripts/deploy/set-api-origin.mjs https://<alamat-server>` (cara A, aplikasi di Vercel, tanpa `VITE_API_URL`) atau dengan `--mode direct` (cara B; lalu `VITE_API_URL` saat build dan `CORS_ORIGIN` di server). Commit `frontend/vercel.json` yang berubah.
- [ ] Bangun dan terapkan aplikasi statis dengan `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (hub), `VITE_DATA_MODE=bff` sebagai variabel build di host.
- [ ] `curl https://<alamat-server>/api/health` menjawab `ok`.
- [ ] Tambahkan alamat aplikasi sungguhan ke **Site URL** dan **Redirect URL** di hub (Tahap 3).

## Tahap 9. Cron, backup, dan latihan restore

- [ ] `[Anda]` Di GitHub → Settings → Secrets and variables → Actions, buat secret: `SERVER_URL` (tanpa garis miring akhir), `CRON_SECRET`, `DATABASE_URL_HUB`, `DATABASE_URL_EE`, `DATABASE_URL_MCIT`, `DATABASE_URL_HR`, `DATABASE_URL_FNL`, `DATABASE_URL_SNG`, `DATABASE_URL_CONS`, `BACKUP_ENCRYPTION_KEY`.
- [ ] Jalankan alur kerja **Keep projects awake** secara manual (Actions → Run workflow). Harus hijau. Merah berarti ada project yang tidak menjawab; baca keluarannya (nama divisi yang gagal tertulis).
- [ ] Setelah itu: `division_progress` di hub terisi 6 baris dengan `last_synced_at` baru.
- [ ] Pasang klien PostgreSQL 17 di komputer Anda (`pg_dump` dan `pg_restore`; di Windows lewat pemasang PostgreSQL, pilih hanya "Command Line Tools"). `pg_dump --version` menjawab.
- [ ] Backup lokal: `node --env-file=scripts/.env.local scripts/backup/backup-database.mjs --project all`. Tujuh berkas `.dump.enc` muncul di `database/backups/`, ringkasan "7 of 7 backups made and verified".
- [ ] Jalankan alur kerja **Weekly backup** secara manual; unduh artefaknya dan pastikan ada tujuh berkas `.dump.enc`.
- [ ] **Latihan restore, satu per project, HR dan FnL lebih dulu.** Ke project latihan atau database lokal, **bukan produksi**:
  ```bash
  node --env-file=scripts/.env.local scripts/backup/restore-database.mjs --file database/backups/hr-backup-<tanggal>.dump.enc --target "$SCRATCH_DATABASE_URL" --i-understand-this-replaces-data
  ```
  Harus berakhir dengan "Restored." dan jumlah baris/versi skema. Catat tanggal, project, dan hasilnya di LOG. Ulangi untuk tiap project.
- [ ] Tentukan tempat penyimpanan salinan di luar GitHub dan **salin satu set backup ke sana** (`[Anda]`; langkah otomatisnya saya tambahkan setelah Anda memilih tempatnya).
- [ ] Tentukan **siapa yang memulihkan** project yang terhenti (paused) dan catat namanya di LOG: pemulihan dilakukan pemilik project lewat dasbor Supabase; datanya tidak hilang.

## Tahap 10. Set produksi (ulangi dengan project kosong)

Syarat: semua kotak Tahap 1 sampai 9 di set latihan sudah tercentang dan LOG-nya terisi.

- [ ] Ulangi **Tahap 1, 2, 3, 4** untuk project produksi (project kedua di tiap akun jika Anda memakai set latihan; kunci baru, jangan memakai ulang kunci latihan).
- [ ] Administrator pertama dengan blok `insert into public.people` di Tahap 3 (bukan data demo).
- [ ] Bila ada data dari prototipe lama yang ingin dibawa: ekspor dari browser (lihat kepala `scripts/database/move-data.mjs`), lalu:
  - [ ] periksa tanpa jaringan: `node scripts/database/move-data.mjs --input export.json`
  - [ ] **pemindai data pribadi**: `node scripts/database/check-personal-data.mjs --input export.json`. Harus lulus (tidak ada temuan tingkat tinggi). Buka satu per satu tautan berkas yang dilaporkan: tidak boleh ada pindaian KTP atau slip gaji. Tinjau daftar orang yang berwenang atas HR dan FnL; kurangi yang tidak perlu.
  - [ ] pindahkan hub dulu, lalu divisi berurutan seperti Tahap 6; **HR dan FnL terakhir**, dan hanya setelah backup produksi pertama dibuat dan restore-nya dicoba.
- [ ] Nyalakan divisi di hub (`is_active`) satu per satu, sama seperti Tahap 6.
- [ ] Ulangi Tahap 7 (pemeriksaan perilaku) di produksi dengan beberapa orang sungguhan.
- [ ] Pasang alur kerja dan secret GitHub untuk produksi (Tahap 9) dengan nilai produksi.
- [ ] Undang anggota lewat layar Accounts; mereka masuk dengan Google.
- [ ] Hapus project latihan **atau** biarkan sebagai latihan dan jangan pernah memasukkan data sungguhan ke sana.

## Tahap 11. Setelah berjalan

- [ ] Tiap minggu: alur kerja keep-alive hijau, ada kiriman backup, tidak ada project paused.
- [ ] Tiap bulan: satu latihan restore (bergantian project; HR dan FnL paling sering).
- [ ] Tiap pergantian kepengurusan (President, VP, kepala divisi): cabut peran lama di aplikasi (tercatat di log audit), ganti pemegang akun Supabase dan admin cadangan, **putar kunci** (service key dan `CRON_SECRET`, perbarui `.env.local`, host, dan secret GitHub), dan tinjau daftar orang yang berwenang atas HR dan FnL (`npm run db:personal-data -- --input ...`).
- [ ] Log audit bisa dibaca President dan Admin di `GET /api/audit` (belum ada layar; saya bisa membuatnya bila Anda mau).

---

## Yang masih kurang dan tidak bisa saya tutup dari sini

- **MFA di aplikasi.** Server tidak memeriksa tingkat MFA. Perlindungan yang ada: 2FA di akun Google (yang dipakai masuk) dan di akun supabase.com. Untuk President, VP, admin, dan lead HR/FnL, wajibkan 2FA Google lewat kebijakan organisasi; secara teknis hanya bisa dipaksakan bila organisasi memakai Google Workspace. Menambah MFA Supabase ke aplikasi adalah pekerjaan kode tersendiri (layar pendaftaran dan pemeriksaan di server) yang belum ada.
- **Enkripsi per kolom** untuk data pribadi. Data demo tidak memuat satu pun; lakukan keputusan ini setelah pemindai dijalankan pada data nyata (Tahap 10).
- **Pembatas laju bersama** (Upstash) bila server berjalan di lebih dari satu instance.
- **Skrip pengosongan project** (bila Anda tidak memakai set latihan).
