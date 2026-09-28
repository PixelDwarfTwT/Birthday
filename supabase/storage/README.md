# Supabase Storage untuk galeri

1. Di Supabase Dashboard, buka **Storage**.
2. Buat bucket bernama `gallery` dan atur sebagai **Public** agar foto terbit dapat dibuka di situs.
3. Jalankan `supabase/migrations/002_gallery_storage_policies.sql` melalui **SQL Editor**.

Kebijakan tersebut hanya mengizinkan akun yang UID-nya tercatat di `public.admin_users` untuk mengunggah, melihat metadata, mengubah, dan menghapus objek di bucket `gallery`. Kebijakan SELECT untuk admin diperlukan agar Supabase dapat mengembalikan metadata objek setelah upload. Pengunjung hanya dapat membaca objek yang memiliki baris galeri berstatus terbit.

Jika upload masih ditolak, pastikan akun yang dipakai masuk ke Supabase Auth dan UID yang sama sudah ditambahkan ke `public.admin_users`. Login saja tidak memberi hak admin.
