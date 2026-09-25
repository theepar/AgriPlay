# Breakdown & Roadmap Agrarian

Dokumen ini merangkum kondisi proyek, perbaikan yang sudah dilakukan, cara memverifikasinya,
dan langkah selanjutnya yang disarankan.

## 1. Arsitektur Singkat

```
Aplikasi (Expo / React Native, Expo Router)
├── Onboarding → Login / Daftar            SessionProvider  (lib/session.tsx, AsyncStorage)
├── Home: cuaca, kebun saya, menu          Open-Meteo (lib/weather.ts)
├── Rekomendasi: wizard 3 langkah + peta   Leaflet di WebView
│     └── POST /crop_recommendation_fastapi ──► ML API (FastAPI @ Hugging Face Spaces)
│                                                 ├── NASA POWER: iklim harian 11 tahun
│                                                 ├── Open-Elevation / Open-Meteo: ketinggian
│                                                 └── RandomForest: 14 kelas tanaman
├── Misi → Detail Tugas                    GardenProvider   (lib/garden-store.tsx: tugas, XP, level)
├── Virtual Garden, Profil
└── Chatbot AgraAI                         UI saja, jawaban masih contoh
```

Semua data pengguna (akun, progres, riwayat chat) saat ini **hanya tersimpan di perangkat**.

## 2. Cara Memverifikasi

| Perintah | Isi |
|----------|-----|
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm test` | 75 test Jest: logika progres, sesi, HTTP, data, dan layar (wizard, hasil, chatbot) |
| `npm run e2e` | 18 test Playwright di build web (375 & 390 px), API di-mock |
| `cd ml_agrarian && python -m pytest` | 19 test API ML dengan model tiruan dan mock jaringan |

Setiap bug di bawah ini direproduksi dengan test yang gagal sebelum diperbaiki.

## 3. Yang Sudah Diperbaiki

### Logika & data
| Area | Masalah sebelumnya | Sekarang |
|------|--------------------|----------|
| Gamifikasi | "Tandai Selesai" hanya `console.log`; progres, XP, level, dan status semua angka statis; "hari tersisa" acak | Progres, XP, dan level tersimpan dan konsisten di semua layar; tugas berikutnya terbuka otomatis; tugas baru di data lama tidak terkunci selamanya |
| Login | Input apa pun langsung masuk, password dicetak ke log, sesi hilang saat app ditutup, tidak ada logout; profil tersimpan yang rusak membuat login gagal terus | Validasi, sesi tersimpan, tombol Keluar, nama & avatar inisial; data rusak diabaikan |
| Navigasi | Home ter-mount sebelum cek login; back di Home kembali ke onboarding; tombol back tidak berfungsi saat dibuka dari deep link / URL web; deep link ke ID tidak ada menampilkan tanaman lain | `/` jadi gerbang via `<Redirect>`, `goBack` dengan fallback, halaman "tidak ditemukan" |
| Hasil rekomendasi | Label ML tidak pernah cocok ("Kentang Granola" terus); "98% Match" palsu; error disembunyikan; koordinat 0 (khatulistiwa) dan parameter hilang diam-diam diganti Bandung | Nama Indonesia, error state + Coba Lagi, peringatan untuk pemula, tombol ke misi terkait, validasi koordinat |
| Peta lokasi | WebView reload tiap pin digeser; teks lokasi tidak mengubah koordinat; respons cuaca titik lama menimpa titik baru | Peta dibuat sekali, pencarian lokasi, respons usang diabaikan, wajib memilih titik |
| Cuaca Home | `AbortSignal.timeout` tidak ada di React Native → selalu "Bandung 27°" palsu | Timeout via `AbortController`; status jujur + ketuk untuk coba lagi |
| Chatbot | Riwayat lama bisa tertimpa; balasan tertunda masuk ke topik baru; hapus tanpa konfirmasi | Diperbaiki, hapus minta konfirmasi |
| Web | `Alert.alert` tidak tampil; halaman misi/tugas "Not Found" pada static export | `showAlert` lintas platform; `generateStaticParams` |

### UI & aksesibilitas (Apple HIG / WCAG AA)
- Warna brand `#059669` (kontras 3,77:1) → `#047857` (5,48:1); semua pasangan teks/latar informatif ≥ 4,5:1.
- 15 padding `iOS ? 60 : 40` diganti safe area insets; footer tombol memberi ruang gesture bar.
- Semua elemen yang bisa ditekan punya role, label, dan state; input punya label; gambar punya
  teks alternatif atau ditandai dekoratif; judul berperan sebagai heading; pesan error diumumkan.
- Area sentuh minimal 44 pt; tombol yang tidak melakukan apa-apa diberi aksi atau dihapus.

### Keamanan
- WebView peta hanya memuat halamannya sendiri; Leaflet memakai SRI; pesan dari WebView divalidasi.
- Izin Android minimal (lokasi + internet); tidak ada secret di kode maupun riwayat git.
- `npm audit`: 0 critical di dependensi produksi. Sisa temuan ada di tooling dev server Expo
  atau butuh upgrade major SDK.

### ML API
- Nilai kosong NASA (-999) tidak lagi ikut dirata-rata; timeout; fallback elevasi; cache LRU
  thread-safe; rate limit per klien (429); validasi input ketat (422); error upstream 502.
- Input `NaN` tidak lagi membuat server crash; respons error tidak memantulkan input mentah.
- Dependensi tanpa kerentanan (`pip-audit`); container berjalan sebagai user non-root.
- Script training: scaler yang menskalakan 5 baris data dihapus, akurasi data uji ditampilkan.

## 4. Roadmap

### Prioritas Tinggi
1. **Redeploy ML API.** Perubahan `ml_agrarian/app/main_alt.py` baru berlaku setelah deploy
   ulang ke Hugging Face. Catatan: `upload_to_hf.py` meng-upload folder `./agrarian-ml-api`,
   bukan `ml_agrarian/`, jadi samakan sumbernya dulu. Atur `RATE_LIMIT_PER_MINUTE` jika
   batas default (60/menit per klien) terlalu ketat di belakang proxy HF.
2. **Latih ulang model** dengan script yang sudah diperbaiki, lalu catat akurasinya.
3. **Uji di HP sungguhan.** Peta WebView, pencarian lokasi (geocoding), dan keyboard pada form
   login/daftar di Android edge-to-edge belum bisa diuji otomatis.
4. **Backend akun & sinkronisasi** (mis. Supabase/Firebase): login sungguhan, progres tidak
   hilang saat ganti HP. `SessionProvider` dan `GardenProvider` sudah jadi satu pintu,
   jadi tinggal mengganti implementasi penyimpanannya.
5. **Model memakai preferensi pengguna.** `tingkat_komitmen` dan `area` dikirim tapi tidak
   dipakai model. Opsi cepat: kembalikan top-3 + probabilitas (`predict_proba`) lalu filter
   berdasarkan tingkat kesulitan di aplikasi; ini juga memberi "skor kecocokan" yang nyata.
6. **Misi untuk semua tanaman hasil rekomendasi.** Baru 3 dari 14 label ML yang punya
   rangkaian misi (kentang, tomat, cabai). Pindahkan data misi ke JSON/backend agar mudah ditambah.

### Prioritas Menengah
7. **Chatbot AgraAI**: sambungkan ke LLM lewat server proxy (API key jangan pernah di dalam
   aplikasi), lalu tampilkan lagi menu-nya di Home.
8. **Design tokens**: warna masih ditulis ulang di setiap file; pindahkan ke
   `constants/theme.ts`, baru setelah itu dukung mode gelap.
9. **Misi harian & streak** (dijanjikan README lama): pengingat via `expo-notifications`.
10. **CI**: GitHub Actions untuk `npm run typecheck`, `npm run lint`, `npm test`,
    `npm run e2e`, dan `pytest`.
11. **Upgrade Expo SDK** untuk menutup sisa temuan `npm audit` yang butuh versi major.
12. **Hosting web** (jika dipakai): arahkan URL tak dikenal ke `+not-found.html`.

### Rapikan Repo
13. Folder `.idea/` masih ter-commit walau sudah di `.gitignore` (`git rm -r --cached .idea`;
    koordinasikan dulu dengan tim karena file lokal mereka ikut terhapus saat pull).
14. `ml_agrarian/saved_models/main.py` & `test.py` adalah versi lama yang tidak dipakai;
    dependensi `soiltexture` hanya dipakai file tersebut.
15. Nama paket Android `com.unemployment.agrarian` tidak bisa diganti setelah terbit di
    Play Store, jadi putuskan sebelum rilis.
16. Fitur yang masih dummy: tab "Jelajahi" di Virtual Garden, tombol "Kunjungi", "Edit Profil",
    "Lupa Password", dan login Google/Apple/Facebook (sekarang menampilkan "segera hadir").
