# Situs Ulang Tahun Interaktif

Situs perayaan ulang tahun yang responsif dan interaktif, dengan Supabase untuk mengelola konten.

## Fitur

- Kue ulang tahun dan lilin yang bisa ditiup dengan mikrofon atau tombol.
- Permainan memecahkan balon.
- Hadiah 3D dan voucher.
- Pemutar musik dengan lagu bawaan Nadin Amizah, **Tawa**.
- Galeri foto dengan tampilan foto penuh.
- Surat untuk penerima ulang tahun.
- Panel admin untuk mengelola konten melalui Supabase Auth dan RLS.

## Persiapan Supabase

1. Buat project di [Supabase](https://supabase.com).
2. Buka SQL Editor, lalu jalankan `supabase/migrations/001_initial_schema.sql`.
3. Jalankan `supabase/seed.sql` jika ingin memasukkan contoh surat dan voucher.
4. Di Storage, buat bucket bernama `gallery` dan jadikan publik.
5. Jalankan kebijakan storage dari `supabase/storage/README.md` di SQL Editor.

## Membuat akun admin

1. Di Supabase, buka Authentication → Users dan buat akun admin.
2. Salin User UID akun tersebut.
3. Jalankan perintah berikut di SQL Editor, ganti UID dengan milik akunmu:

   ```sql
   INSERT INTO admin_users (user_id) VALUES ('YOUR_USER_UID_HERE');
   ```

## Konfigurasi frontend

Project Supabase dan kunci anon publik diatur di `frontend/js/config.js`. Gunakan URL dan anon key dari Settings → API di Supabase.

Nama bawaan situs adalah **Fitri Ramadani Arif (Mba Pit)**. Pengaturan nama yang masih memakai nilai contoh seperti “Friend” akan mengikuti nama bawaan ini. Nama lain yang sudah disimpan di Supabase tetap digunakan.

## Mengganti lagu

- Pemutar lagu memakai embed Spotify resmi untuk **Tawa - Nadin Amizah**. Tekan tombol putar pada pemutar Spotify untuk mendengarkan; Spotify mungkin meminta akun atau aplikasi.
- Untuk mengganti lagu bagi semua pengunjung, ubah `DEFAULT_MUSIC_URL` dan `DEFAULT_MUSIC_TITLE` di `frontend/js/config.js` dengan tautan lagu Spotify yang menuju ke satu track.
- Untuk memakai file musik sendiri bagi semua pengunjung, letakkan file audio di `frontend/assets/`, lalu isi `DEFAULT_MUSIC_URL` dengan jalur file, misalnya `assets/lagu-favorit.mp3`.
- Pengunjung juga bisa memilih file audio atau tautan langsung lewat menu **Ganti lagu**. Pilihan tautan hanya tersimpan di browser tersebut.

## Menjalankan secara lokal

Jalankan server web dari folder `frontend`, misalnya dengan Python:

```bash
cd frontend
python -m http.server 8000
```

Buka `http://localhost:8000/` untuk situs utama atau `http://localhost:8000/admin/` untuk panel admin.

## Deployment

Situs dipublikasikan melalui GitHub Pages: <https://pixeldwarftwt.github.io/Birthday/>. Sumber Pages adalah branch `main`, folder `/docs`.

Folder `docs` merupakan salinan siap-publikasi dari `frontend`. Setelah mengubah situs, sinkronkan salinannya dari root repositori dengan PowerShell:

```powershell
Get-ChildItem frontend -Force | Copy-Item -Destination docs -Recurse -Force
New-Item -ItemType File docs/.nojekyll -Force | Out-Null
git add frontend docs
git commit -m "Update birthday site"
git push
```

Perubahan pada `docs` akan diterbitkan GitHub Pages setelah di-push ke branch `main`.
