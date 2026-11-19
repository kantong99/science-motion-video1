# Science Motion Studio

Generator 10 video motion graphic (sains, teknologi, data, dan korporat) berbasis **Remotion**.
Semua video dirender di **GitHub Actions** (cloud), tanpa perlu rendering di komputer lokal.

| Spesifikasi | Nilai |
|---|---|
| Resolusi final | 3840 × 2160 (4K UHD) |
| Resolusi preview | 1280 × 720 |
| Frame rate | 30 FPS |
| Durasi | 24 detik (720 frame) |
| Format | MP4 H.264, rasio 16:9 |

---

## 1. Cara membuat repository GitHub baru

1. Buka https://github.com lalu masuk ke akun Anda.
2. Klik tombol **+** di pojok kanan atas, lalu pilih **New repository**.
3. Isi **Repository name**, misalnya `science-motion-studio`.
4. Pilih **Private** atau **Public** sesuai kebutuhan.
5. **Jangan** centang "Add a README file", "Add .gitignore", atau "Choose a license". Biarkan kosong.
6. Klik **Create repository**.

## 2. Cara mengunggah isi ZIP ke root repository

1. Ekstrak `science-motion-studio.zip` di komputer Anda. Pastikan hasilnya berisi file dan folder
   `.github`, `src`, `package.json`, `README.md`, dan `.gitignore` langsung (bukan di dalam folder tambahan).
2. Di halaman repository yang baru dibuat, klik **uploading an existing file**.
3. Seret **seluruh isi** folder hasil ekstrak (termasuk folder `.github` dan `src`) ke area unggah.
   - Pada sebagian browser, folder tersembunyi seperti `.github` tidak ikut terpilih saat memilih lewat jendela file. Jika itu terjadi, gunakan cara **GitHub Desktop** atau `git push` (lihat bagian Catatan).
4. Tulis pesan commit, misalnya `Initial commit`, lalu klik **Commit changes**.
5. Pastikan di halaman utama repository terlihat folder `.github` dan `src` serta file `package.json`.

## 3. Cara membuka GitHub Actions

1. Di repository Anda, klik tab **Actions**.
2. Jika muncul tombol untuk mengaktifkan workflow, klik **I understand my workflows, go ahead and enable them**.
3. Di panel kiri, pilih **Render Motion Video**.

## 4. Cara memilih video 001–010

Pilihan video dibagi menjadi dua: **composition** dan **mode**.

| Composition | Tema |
|---|---|
| V001-AI | Future AI Technology (chip 3D, jalur data) |
| V002-DNA | DNA Molecular Science (heliks ganda) |
| V003-Heart | Human Heart Anatomy (detak jantung, pembuluh darah) |
| V004-Cell | Cell Biology (membran, nukleus, mitokondria, pembelahan) |
| V005-Space | Space and Planets (planet, satelit, medan bintang) |
| V006-Chemistry | Chemical Molecules (metana dan air) |
| V007-Quantum | Quantum Physics (interferensi gelombang) |
| V008-Data | Data Analytics (grafik batang, garis, donat, dashboard) |
| V009-Robotics | Robotics and Engineering (roda gigi, lengan robot) |
| V010-Abstract | Abstract Corporate Motion Graphics |

## 5. Cara menjalankan preview

Preview cepat (1280 × 720) cocok untuk memeriksa animasi sebelum render 4K.

1. Di halaman **Actions > Render Motion Video**, klik tombol **Run workflow**.
2. Pada **composition**, pilih video yang diinginkan, misalnya `V001-AI`.
3. Pada **mode**, pilih `preview`.
4. Klik **Run workflow** (tombol hijau).
5. Tunggu hingga status berubah menjadi hijau (biasanya beberapa menit).

## 6. Cara menjalankan final 4K

1. Klik **Run workflow** seperti langkah 5.
2. Pada **composition**, pilih video yang diinginkan.
3. Pada **mode**, pilih `final-4k`.
4. Klik **Run workflow**.

Render 4K membutuhkan waktu jauh lebih lama daripada preview. Job dibatasi hingga 180 menit.
Jalankan satu video per kali agar lebih mudah dipantau.

## 7. Cara mengunduh hasil MP4 dari Artifacts

1. Buka run yang sudah selesai (klik nama run di daftar **Actions**).
2. Gulir ke bagian bawah halaman, di bagian **Artifacts**.
3. Klik nama artifact, misalnya `V001-AI-final-4k`. Browser akan mengunduh file ZIP kecil.
4. Ekstrak ZIP tersebut untuk mendapatkan file `V001-AI_final-4k.mp4`.

Artifact disimpan selama 14 hari.

## 8. Cara mengatasi error umum

| Pesan error | Penyebab umum | Solusi |
|---|---|---|
| **Instalasi gagal** | `npm install` gagal, biasanya karena jaringan runner. | Jalankan ulang workflow. Periksa `package.json`. |
| **Render gagal** dengan pesan tentang *browser* atau *chrome* | Chromium headless belum siap atau terputus. | Jalankan ulang workflow. Coba mode `preview` dulu. |
| **Render gagal** dengan pesan tentang *composition* | ID komposisi tidak cocok. | Pastikan ID di `src/Root.jsx` sama dengan pilihan di `render.yml`. |
| **Timeout** pada `final-4k` | Render 4K melewati batas waktu. | Gunakan `preview` untuk pengecekan. Ulangi final render per video. |
| **Out of memory** | Render 4K memakai banyak memori. | Render satu video per run. Kurangi jumlah partikel di file proyek. |
| **No files were found** pada upload artifact | MP4 tidak terbentuk. | Buka log langkah *Render video* untuk melihat error pertama. |
| Folder `.github` tidak terlihat setelah unggah | Browser tidak mengunggah folder tersembunyi. | Gunakan GitHub Desktop atau `git push` dari terminal. |

### Catatan

- Jangan mengunggah folder `node_modules` atau file MP4 ke repository. File `.gitignore` sudah mengabaikannya.
- Jika ingin mengubah durasi, warna, atau objek, ubah file di folder `src/projects/`. Setiap file adalah satu komposisi.
- Komponen bersama ada di `src/components/`: `Background`, `Particles`, `Camera` (kamera 3D), dan `Transitions` (judul, label, dan fade).
