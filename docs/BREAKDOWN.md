# Breakdown & Roadmap Agrarian

Dokumen ini merangkum kondisi proyek, perbaikan yang sudah dilakukan, dan langkah
selanjutnya yang disarankan.

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

## 2. Yang Sudah Diperbaiki

| Area | Masalah sebelumnya | Sekarang |
|------|--------------------|----------|
| Gamifikasi | "Tandai Selesai" hanya `console.log`; progres, XP, level, dan status semua angka statis; "hari tersisa" acak | Progres tugas, XP, dan level tersimpan dan dipakai konsisten di semua layar; tugas berikutnya terbuka otomatis |
| Login | Input apa pun langsung masuk, password dicetak ke log, sesi hilang saat app ditutup, tidak ada logout | Validasi, sesi tersimpan, tombol Keluar, nama & avatar inisial pengguna |
| Navigasi | Home ter-mount (dan minta izin lokasi) sebelum cek login; tombol back di Home kembali ke onboarding | `/` jadi gerbang via `<Redirect>`, stack dibersihkan saat login/logout |
| Hasil rekomendasi | Label ML (Inggris) tidak pernah cocok, detail selalu "Kentang Granola"; "98% Match" palsu; error disembunyikan; tombol "Mulai Bertanam" kosong | Label dipetakan ke nama Indonesia, error state + Coba Lagi, peringatan tanaman sulit untuk pemula, tombol membuka misi |
| Peta lokasi | WebView reload setiap pin digeser; teks lokasi tidak mengubah koordinat (selalu Bandung) | Peta dibuat sekali, ada pencarian lokasi, alamat & cuaca ikut pin, wajib memilih titik |
| Cuaca Home | `AbortSignal.timeout` tidak ada di React Native → selalu fallback "Bandung 27°" | Timeout via `AbortController` (`lib/http.ts`) |
| ML API | Nilai kosong NASA (-999) ikut dirata-rata; request tanpa timeout; elevasi tanpa cadangan; cache tanpa batas & hanya berlaku sehari; error mentah 500 | Semua diperbaiki + validasi input (422/502) + 11 test otomatis |
| Training | `StandardScaler` menskalakan 5 baris (bukan kolom) & tidak disimpan; data uji tidak dipakai | Scaler dihapus, akurasi data uji ditampilkan |
| Kualitas kode | 4 error TypeScript, 10 warning lint | 0 error, 0 warning |
| Konfigurasi | Mode gelap membuat teks tak terbaca; key `permissions` tidak valid; tanpa pesan izin lokasi iOS | Mode terang, plugin `expo-location` dengan pesan izin |

## 3. Roadmap

### Prioritas Tinggi
1. **Redeploy ML API.** Perubahan `ml_agrarian/app/main_alt.py` baru berlaku setelah deploy
   ulang ke Hugging Face. Catatan: `upload_to_hf.py` meng-upload folder `./agrarian-ml-api`,
   bukan `ml_agrarian/`, jadi samakan sumbernya dulu.
2. **Latih ulang model** dengan script yang sudah diperbaiki, lalu catat akurasinya.
3. **Backend akun & sinkronisasi** (mis. Supabase/Firebase): login sungguhan, progres tidak
   hilang saat ganti HP. `SessionProvider` dan `GardenProvider` sudah jadi satu pintu,
   jadi tinggal mengganti implementasi penyimpanannya.
4. **Model memakai preferensi pengguna.** `tingkat_komitmen` dan `area` dikirim tapi tidak
   dipakai model. Opsi cepat: kembalikan top-3 + probabilitas (`predict_proba`) lalu filter
   berdasarkan tingkat kesulitan di aplikasi; ini juga memberi "skor kecocokan" yang nyata.
5. **Misi untuk semua tanaman hasil rekomendasi.** Baru 3 dari 14 label ML yang punya
   rangkaian misi (kentang, tomat, cabai). Pindahkan data misi ke JSON/backend agar mudah ditambah.

### Prioritas Menengah
6. **Chatbot AgraAI**: sambungkan ke LLM lewat server proxy (API key jangan pernah di dalam
   aplikasi), lalu tampilkan lagi menu-nya di Home.
7. **Safe area**: ganti padding `Platform.OS === 'ios' ? 60 : 40` dengan
   `useSafeAreaInsets()` (Android edge-to-edge punya tinggi status bar berbeda-beda).
8. **Design tokens**: warna seperti `#059669` ditulis ulang di setiap file; pindahkan ke
   `constants/theme.ts`, baru setelah itu dukung mode gelap.
9. **Misi harian & streak** (dijanjikan README lama): pengingat via `expo-notifications`.
10. **Test & CI**: unit test `garden-store` (jest-expo) dan GitHub Actions untuk
    `npm run lint`, `npm run typecheck`, dan `pytest`.

### Rapikan Repo
11. Folder `.idea/` masih ter-commit walau sudah di `.gitignore` (`git rm -r --cached .idea`;
    koordinasikan dulu dengan tim karena file lokal mereka ikut terhapus saat pull).
12. `ml_agrarian/saved_models/main.py` & `test.py` adalah versi lama yang tidak dipakai;
    dependensi `soiltexture` hanya dipakai file tersebut.
13. Nama paket Android `com.unemployment.agrarian` tidak bisa diganti setelah terbit di
    Play Store, jadi putuskan sebelum rilis.
14. Fitur yang masih dummy: tab "Jelajahi" di Virtual Garden, tombol "Kunjungi", "Edit Profil",
    dan login Google/Apple/Facebook (sekarang menampilkan "segera hadir").
