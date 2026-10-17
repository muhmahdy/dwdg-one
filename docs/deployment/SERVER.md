# Menjalankan server di satu host kecil

Server (`server/`) berjalan sebagai **satu proses Node** di dalam satu container. Keputusannya: [M35 di decision-log](../architecture/decision-log.md). Langkah menyalakan seluruh sistem: [H0-CHECKLIST.md](H0-CHECKLIST.md), Tahap 8.

## Apa yang sudah ada

| Berkas | Fungsi |
|---|---|
| `server/src/main.ts` | Entri produksi. Membaca pengaturan dari environment, mendengarkan `PORT` di semua antarmuka (`HOST` untuk mengubahnya), berhenti rapi saat `SIGTERM`, keluar dengan kode 1 bila ada galat tak tertangkap supaya host memulai proses baru |
| `server/Dockerfile` | Image: hanya dependensi server (sekitar 20 MB) dan `server/src`; tanpa frontend, tanpa berkas database, tanpa alat pengembangan; berjalan sebagai pengguna `node`; ada `HEALTHCHECK` |
| `.dockerignore` | Daftar putih: hanya berkas yang disalin Dockerfile yang masuk ke konteks build, jadi tidak ada `.env` atau dump yang bisa terbawa ke image |
| `render.yaml` | Blueprint Render |
| `server/fly.toml` | Pengaturan Fly.io |
| `scripts/deploy/set-api-origin.mjs` | Mengatur penerusan `/api` dari aplikasi statis ke server |
| `GET /api/health` | Pemeriksaan kesehatan: `200` bila server hidup. Tidak memanggil Supabase dan tidak membuka rahasia |

**Yang belum pernah saya jalankan:** `docker build` (Docker tidak terpasang di mesin ini), Render, Fly, dan Railway. Yang sudah diuji: `main.ts` sebagai proses sungguhan (mulai, health, 401 tanpa token, menolak mulai tanpa pengaturan, berhenti rapi), dan langkah-langkah Dockerfile dijalankan manual di folder bersih (`npm ci --omit=dev --workspace server --ignore-scripts` memasang 20 MB dan hanya paket runtime, lalu `node server/src/main.ts` berjalan dan menjawab health). Perintah `HEALTHCHECK` dicoba hidup dan mati. Bila `docker build` pertama gagal, catat galatnya di [LOG.md](LOG.md); kemungkinan besar perbaikannya kecil.

## Pengaturan (environment)

Semua dari `server/.env.example`; di host diisi lewat pengaturan rahasia host, **bukan** berkas.

| Variabel | Wajib | Isi |
|---|---|---|
| `HUB_SUPABASE_URL`, `HUB_SUPABASE_PUBLISHABLE_KEY`, `HUB_SUPABASE_SERVICE_KEY` | ya | Project hub |
| `SPOKE_<DIVISI>_URL`, `SPOKE_<DIVISI>_SERVICE_KEY` | per divisi yang sudah dinyalakan | EE, MCIT, HR, FNL, SNG, CONS. Kosong = "belum terhubung" |
| `CRON_SECRET` | untuk keep-alive | Rahasia alur kerja GitHub; kosong = rute `/api/cron/ping` mati |
| `PORT` | tidak | Biasanya diatur host sendiri. Bawaan 8787 |
| `HOST` | tidak | Bawaan `0.0.0.0` |
| `CORS_ORIGIN` | hanya bila browser memanggil server di alamat lain | Alamat aplikasi |
| `CLIENT_IP_HEADER` | tidak | Header tempat host menaruh alamat pengunjung. Bawaan `x-forwarded-for`; Fly: `fly-client-ip`; Cloudflare: `cf-connecting-ip`. Dipakai hanya untuk rem pada token yang ditolak. Pakai header yang **ditimpa** oleh host; pengunjung bisa mengirim header apa saja ke server yang bisa dijangkau langsung |

## Membangun dan mencoba di komputer (bila Docker terpasang)

Dari akar repositori:

```bash
docker build -f server/Dockerfile -t dwdg-server .
docker run --rm -p 8787:8787 --env-file server/.env.local dwdg-server
curl http://127.0.0.1:8787/api/health
```

Tanpa Docker, hal yang sama: `npm run start -w server` (butuh Node 24 dan pengaturan di environment atau `node --env-file=server/.env.local server/src/main.ts`).

## Pilih satu host

**Satu hal berlaku untuk semuanya: jalankan tepat satu salinan.** Pembatas laju menyimpan hitungannya di memori proses; dua salinan berarti dua hitungan. Server tidak menyimpan hal lain di antara permintaan.

### Render

1. Dasbor Render → New → Blueprint → pilih repositori ini (berkas `render.yaml` di akar).
2. Isi semua variabel yang ditandai `sync: false` (rahasia, tidak ada di berkas). Yang divisinya belum dinyalakan boleh dikosongkan.
3. Pemeriksaan kesehatan sudah di blueprint: `/api/health`.
4. Paket gratis Render **tidur bila tidak ada lalu lintas** dan bangun dengan lambat pada kunjungan pertama. Alur kerja keep-alive (dua kali seminggu) tidak cukup untuk mencegahnya; untuk server yang selalu siap pakai paket berbayar terkecil. Blueprint memakai `plan: starter`; ubah sesuai pilihan Anda.
5. Alamat server: `https://<nama>.onrender.com`. Pakai itu di langkah "Penerusan `/api`" di bawah.
6. Render meneruskan alamat pengunjung di `X-Forwarded-For`; `CLIENT_IP_HEADER` sudah `x-forwarded-for` di blueprint.

### Fly.io

Dari akar repositori:

```bash
fly launch --no-deploy --copy-config --config server/fly.toml --dockerfile server/Dockerfile
fly secrets set --config server/fly.toml HUB_SUPABASE_URL=... HUB_SUPABASE_PUBLISHABLE_KEY=... HUB_SUPABASE_SERVICE_KEY=... CRON_SECRET=...
fly deploy --config server/fly.toml --dockerfile server/Dockerfile
```

`fly.toml` mengatur wilayah Singapura (`sin`), satu mesin yang tidak dihentikan otomatis, pemeriksaan kesehatan, dan `CLIENT_IP_HEADER=fly-client-ip`. Tambahkan `SPOKE_*` ke `fly secrets set` untuk tiap divisi yang dinyalakan. Alamat server: `https://dwdg-server.fly.dev` (atau nama aplikasi Anda).

### Railway

Dari dasbor: New Project → Deploy from GitHub repo → pilih repositori. Atur: root directory = akar repositori, jalur Dockerfile = `server/Dockerfile` (variabel `RAILWAY_DOCKERFILE_PATH=server/Dockerfile`), pemeriksaan kesehatan `/api/health`, dan semua variabel di atas. Bawaan `X-Forwarded-For` berlaku. (Dari ingatan; ikuti dokumentasi Railway bila nama pengaturannya berbeda.)

### Server sendiri (VPS)

Pasang Docker dan Caddy. Simpan pengaturan di `/etc/dwdg/server.env` (hanya bisa dibaca root, `chmod 600`).

```bash
docker build -f server/Dockerfile -t dwdg-server .
docker run -d --name dwdg-server --restart unless-stopped \
  -p 127.0.0.1:8787:8787 --env-file /etc/dwdg/server.env dwdg-server
```

`/etc/caddy/Caddyfile` (Caddy mengurus sertifikat HTTPS sendiri):

```
api.contoh.org {
	reverse_proxy 127.0.0.1:8787
}
```

Hanya `127.0.0.1` yang mendengarkan port 8787, jadi satu-satunya jalan masuk dari luar adalah Caddy. Perbarui: bangun image baru, `docker rm -f dwdg-server`, jalankan lagi dengan perintah di atas (server berhenti rapi saat menerima `SIGTERM`).

## Penerusan `/api` dari aplikasi statis

Browser memanggil `/api/...` di alamat aplikasi. Ada dua cara agar sampai ke server:

**A. Aplikasi statis di Vercel meneruskan (disarankan: satu alamat, tanpa CORS).**

```bash
node scripts/deploy/set-api-origin.mjs https://dwdg-server.onrender.com
```

Ini memasang aturan pertama di `frontend/vercel.json`: `/api/:path*` → `<alamat server>/api/:path*`. Aturan itu harus pertama supaya halaman aplikasi tidak pernah menjawab `/api`; skrip menjaganya, dan menggantinya bila dijalankan lagi dengan alamat lain. Commit berkasnya, terapkan aplikasi statis, dan **bangun aplikasi tanpa `VITE_API_URL`**. Belum saya coba di Vercel sungguhan: pastikan header `Authorization` sampai ke server (`curl -H "Authorization: Bearer x" https://<app>/api/me` harus dijawab `401 {"error":"unauthenticated"}` dari server kita, bukan halaman HTML).

**B. Browser memanggil server di alamatnya sendiri (host statis mana pun).**

```bash
node scripts/deploy/set-api-origin.mjs https://dwdg-server.onrender.com --mode direct
```

Menambahkan alamat server ke `connect-src` pada Content-Security-Policy. Lalu: bangun aplikasi dengan `VITE_API_URL=https://dwdg-server.onrender.com` dan pasang `CORS_ORIGIN=<alamat aplikasi>` di server. Server hanya mengizinkan alamat itu.

Mengembalikan ke keadaan semula: `node scripts/deploy/set-api-origin.mjs --reset`.

## Setelah penerapan

- [ ] `curl https://<alamat-server>/api/health` menjawab `{"ok":true,...}`.
- [ ] `curl -i https://<alamat-server>/api/me` menjawab `401` (dan header `x-content-type-options: nosniff`).
- [ ] Dari alamat aplikasi: `curl https://<alamat-aplikasi>/api/health` menjawab hal yang sama (cara A) atau aplikasi masuk dan memuat data (cara B).
- [ ] Di GitHub, isi secret `SERVER_URL` (alamat yang dipakai browser atau alamat server; tanpa garis miring akhir) dan jalankan alur kerja keep-alive secara manual: hijau.
- [ ] Di hub, **Site URL** dan **Redirect URL** berisi alamat aplikasi yang sebenarnya.
- [ ] Log server tidak berisi kunci atau isi catatan. (Log hanya memuat kode galat dan nama tabel; periksa satu kali.)

## Batas yang perlu Anda ketahui

- **Satu salinan.** Pembatas laju di memori. Untuk lebih dari satu salinan, pembatas bersama (Upstash) perlu ditulis; antarmukanya sudah siap (`hit` dan `count`).
- **Pemulihan.** Bila server mati, aplikasi tidak bisa memuat atau menyimpan; data aman di Supabase. Host menyalakannya ulang sendiri (Render, Fly, Docker dengan `--restart`).
- **Pembaruan.** Pemasangan versi baru memutus koneksi sebentar; permintaan yang sedang berjalan diselesaikan dulu (hingga 10 detik).
