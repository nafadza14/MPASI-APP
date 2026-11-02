# Menu MPASI Personal 30 Hari — Flourish Care

Web app funnel + aplikasi menu MPASI personal: kuis 10 langkah → pratinjau gratis hari 1–3 → paywall QRIS (Sumopod) → aplikasi menu 30 hari (jadwal harian, resep, daftar belanja, favorit, ganti menu, cetak PDF), upsell setelah bayar, dan perpanjangan bulan berikutnya.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Motion (animasi & transisi ala iOS) · Supabase (Postgres) · Sumopod QRIS · Meta Pixel + Conversions API · Vercel.

- **Desain**: gaya aplikasi bayi Kiddo (teal + oranye, foto piring bundar, angka hari besar, kartu oranye, bottom nav).
- **Transisi**: halaman masuk dari kanan / kembali dari kiri (kurva iOS), langkah kuis bergeser, bottom sheet bisa ditarik, tombol "tekan", daftar muncul berurutan.
- **Foto**: makanan & bahan dari Unsplash (lisensi komersial), kredit di `/kredit-foto`. Daftar foto di `src/lib/photos.ts`.
- **Resep**: 1.600+ resep dari kombinasi bahan (protein × sayur × karbo × cara olah) — rata-rata hanya 11–17% resep yang sama antar dua anak seusia.

## Struktur

```
src/app/                 Halaman (landing, kuis, hasil+paywall, bayar, sukses, aplikasi /m/[token])
src/app/api/             checkout, webhook/sumopod, orders/[code], upsell, swap, favorite, demo/pay
src/lib/recipes.ts       Katalog bahan + generator 1.600+ resep (DRAF — wajib ditinjau ahli gizi)
src/lib/photos.ts        Foto Unsplash (id + fotografer)
src/lib/generator.ts     Mesin penyusun menu 30 hari + aturan keamanan + daftar belanja
src/lib/pricing.ts       Paket, order bump, upsell, perpanjangan
src/lib/server/          Supabase, Sumopod, Meta CAPI, WhatsApp, fulfilment pembayaran
supabase/migrations/     SQL skema database
tests/                   Uji aturan generator + uji keamanan webhook
```

## 1. Siapkan Supabase (5 menit)

1. Buka Supabase → project `hycxkiyqobtdofpvopst` → **SQL Editor** → New query.
2. Tempel isi `supabase/migrations/001_init.sql` → **Run**.
3. Buka **Project Settings → API Keys** → salin **Secret key** (`sb_secret_...`).
   Publishable key (`sb_publishable_...`) tidak dipakai: semua akses database lewat server.

## 2. Siapkan Sumopod

1. Dashboard Sumopod → **Settings → Webhook URL**: `https://mpasi.flourishcare.id/api/webhook/sumopod`
2. Salin **Webhook signing secret** (`whsec_...`) → env `SUMOPOD_WEBHOOK_SECRET`.
   (Alternatif lebih sederhana: webhook token `whtok_...` → env `SUMOPOD_WEBHOOK_TOKEN`.)
3. Tekan **Send test event** → harus mendapat respons 200 `{"status":"ignored"}`.
4. **Rotate / buat ulang API key** yang pernah dibagikan di chat, lalu pakai key baru di env `SUMOPOD_API_KEY`.

## 3. Push ke GitHub

```bash
cd mpasi-app
git remote add origin https://github.com/nafadza14/MPASI-APP.git
git push -u origin main
```

## 4. Deploy di Vercel

1. Vercel → **Add New → Project** → import `nafadza14/MPASI-APP` (framework otomatis Next.js).
2. **Environment Variables** (Production + Preview) — lihat `.env.example`:

| Nama | Isi |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://mpasi.flourishcare.id` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hycxkiyqobtdofpvopst.supabase.co` |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` |
| `SUMOPOD_API_KEY` | API key Sumopod (yang baru) |
| `SUMOPOD_BASE_URL` | `https://api-pay.sumopod.com/api/v1` |
| `SUMOPOD_WEBHOOK_SECRET` | `whsec_...` |
| `NEXT_PUBLIC_ADMIN_WA` | `628xxxxxxxxxx` (tanpa +) |
| `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID` | ID Pixel |
| `META_CAPI_TOKEN` | Token Conversions API (Events Manager → Settings) |

3. Deploy → **Settings → Domains** → tambah `mpasi.flourishcare.id`, lalu buat CNAME `mpasi` → `cname.vercel-dns.com` di DNS domain.
4. Jangan pernah mengisi `DEMO_MODE` di Production.

## 5. Tes sebelum beriklan

1. Isi kuis sampai halaman hasil, pilih paket, isi WA, bayar QRIS **Rp 59.000** dengan e-wallet sendiri.
2. Pastikan otomatis pindah ke halaman sukses → menu terbuka.
3. Cek Supabase → tabel `orders` status `paid`, `meta_sent = true` (jika CAPI diisi).
4. Cek Events Manager → event Purchase masuk (pakai `META_TEST_EVENT_CODE` saat uji).
5. Refund transaksi uji dari dashboard Sumopod bila perlu.

## Coba lokal tanpa kredensial (mode demo)

```bash
npm install
DEMO_MODE=1 npm run dev
```
Pembayaran disimulasikan (tombol "[DEMO] Simulasikan pembayaran berhasil"), data disimpan di memori.

```bash
npm test                      # uji aturan menu (alergen, madu <12 bln, protein hewani harian, variasi, 3 hari per alergen)
node tests/webhook.e2e.js     # uji webhook (butuh server demo di port 3005, lihat komentar di file)
```

## Alur pembayaran

1. `/hasil` → `POST /api/checkout` → simpan `customers` + `orders` (pending) → Sumopod `POST /payments` → redirect ke halaman QRIS Sumopod.
2. Pembeli bayar → Sumopod mengirim `payment.completed` ke `/api/webhook/sumopod` → verifikasi tanda tangan svix + nominal → order `paid` (idempoten) → menu dibuat & disimpan → Meta CAPI Purchase (`event_id` = kode order) → WA (opsional).
3. Sumopod mengembalikan pembeli ke `/bayar/[kode]` → halaman mengecek status tiap 3 detik → `/sukses/[kode]` (upsell) → `/m/[token]`.

## Yang masih perlu Anda lengkapi

- **Review ahli gizi** untuk `src/lib/recipes.ts`: katalog bahan, takaran per porsi, langkah per cara olah, dan tabel kebutuhan harian. Karena resep dibentuk dari template, ahli gizi cukup meninjau ±60 bahan dan ±30 cara olah, bukan 1.600 resep satu per satu.
- **WhatsApp otomatis**: isi `WA_PROVIDER` (`fonnte` atau `webhook`). Tanpa ini, link akses tetap tampil di halaman sukses dan profil.
- **Pengecekan status ke Sumopod**: dokumentasi Sumopod belum menyebut endpoint cek status, jadi sistem mengandalkan webhook. Bila webhook gagal, kirim ulang dari tab Webhooks di dashboard Sumopod.
- Halaman legal: isi nama badan usaha di `NEXT_PUBLIC_COMPANY_NAME`.
