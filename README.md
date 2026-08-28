# jagadshalawat

Landing page pencatatan kas & donasi **Jagad Shalawat** — mobile-first, bertema emerald-gold dengan ornamen islami. Donor memilih kanal pembayaran (transfer bank, e-money, virtual account), mencatat donasi, dan pengurus memverifikasinya lewat panel admin.

> 🚀 **Live**: [jagadshalawat.vercel.app](https://jagadshalawat.vercel.app/)

## Fitur

- Landing page mobile-first (Rekening → Donasi → Riwayat)
- Flow donasi 3 langkah ala payment gateway (Nominal → Metode/Instruksi bayar → Konfirmasi)
- Pilihan anonim (tampil sebagai "Hamba Allah")
- Upload bukti transfer
- Riwayat donasi dalam format tabel
- Panel admin (`/admin`) untuk verifikasi / edit / hapus / anonimkan entri
- Background islami (pola bintang-8) + animasi halus

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Drizzle ORM** + **Neon (Postgres)** via `postgres`
- **iron-session** untuk sesi admin
- **lucide-react** untuk ikon

## Menjalankan lokal

```bash
npm install
```

Siapkan `.env` (lihat `.env.example`):

```
DATABASE_URL=postgresql://...        # dari Neon (pooled)
ADMIN_PASSWORD=...                   # password login panel admin
SESSION_SECRET=...                   # minimal 32 karakter
```

Buat tabel & jalankan:

```bash
npm run db:push      # membuat tabel dari db/schema.ts
npm run dev          # http://localhost:3000
```

- Halaman publik: `/`
- Panel pengurus: `/admin`
- Kitab Kuning: `/kitab` (dan `/kitab/[slug]`)

### Info Login Admin

| Field            | Nilai           |
| ---------------- | --------------- |
| URL              | `/admin`        |
| Password         | `Pengurus adminJS123` |

## Deploy ke Vercel

1. Push repo ke GitHub, lalu import di Vercel.
2. Set **Environment Variables** di Vercel (Settings → Environment Variables):

   | Variable        | Keterangan                          |
   | --------------- | ----------------------------------- |
   | `DATABASE_URL`  | Connection string pooled dari Neon  |
   | `ADMIN_PASSWORD` | Password login panel admin         |
   | `SESSION_SECRET` | Random string, minimal 32 karakter  |

   `SESSION_SECRET` **harus ≥ 32 karakter** — nilai yang lebih pendek akan menggagalkan build (`lib/auth.ts` melempar error saat build).
3. Deploy. Build akan membaca env vars, tidak mengandalkan file `.env` lokal.

## Script

| Script              | Fungsi                              |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server                          |
| `npm run build`     | Build produksi + typecheck          |
| `npm run lint`      | ESLint                              |
| `npm run db:push`   | Push skema Drizzle ke database      |
| `npm run db:generate` | Generate file migrasi             |
| `npm run kitab:fetch` | Ambil data Kitab Kuning → `kitab-data.json` |
| `npm run db:seed-kitab` | Seed data Kitab Kuning ke database |

## Data Kitab Kuning (api.ahmadsanusi.com)

Data kitab diambil dari API eksternal [api.ahmadsanusi.com](https://api.ahmadsanusi.com) (butuh `X-API-Key`). Alur: **fetch → migrasi data (`kitab-data.json`) → seed ke database**.

1. Siapkan API key di `.env` (lihat `.env.example`):

   ```
   AHMAD_SANUSI_API_KEY=ask_xxxxxxxxxxxx
   ```

2. Ambil & kelompokkan data ke file migrasi `kitab-data.json`:

   ```bash
   npm run kitab:fetch
   ```

   Script menyimpan progres per-kitab, sehingga aman dijalankan bertahap apabila
   terkena rate-limit (akun gratis ≈ 100 request/hari; total ~964 bab).

3. Seed ke database:

   ```bash
   npm run db:seed-kitab
   ```

   Tabel yang digunakan: `kitab_categories`, `kitab`, `kitab_bab`.

## Catatan

- Donasi bersifat **pencatatan manual** (bukan charge otomatis). Status default `pending`, diverifikasi pengurus.
- Upload bukti disimpan ke folder `uploads/` (lokal). Saat deploy ke serverless tanpa disk persisten (mis. Vercel), migrasikan ke object storage (Cloudinary/S3).
- Siapa pun dapat melihat riwayat donasi di `/` secara publik; kelola entri lewat panel `/admin`.
