# kasjagad

Landing page pencatatan kas & donasi **Jagad Shalawat** — mobile-first, bertema emerald-gold dengan ornamen islami. Donor memilih kanal pembayaran (transfer bank, e-money, virtual account), mencatat donasi, dan pengurus memverifikasinya lewat panel admin.

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

## Script

| Script              | Fungsi                              |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server                          |
| `npm run build`     | Build produksi + typecheck          |
| `npm run lint`      | ESLint                              |
| `npm run db:push`   | Push skema Drizzle ke database      |
| `npm run db:generate` | Generate file migrasi             |

## Catatan

- Donasi bersifat **pencatatan manual** (bukan charge otomatis). Status default `pending`, diverifikasi pengurus.
- Upload bukti disimpan ke folder `uploads/` (lokal). Saat deploy ke serverless tanpa disk persisten (mis. Vercel), migrasikan ke object storage (Cloudinary/S3).
