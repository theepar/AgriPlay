# Agrarian - Smart Farming Companion

Agrarian adalah aplikasi mobile berbasis AI dan Machine Learning yang dirancang untuk membantu generasi muda dan petani pemula dalam dunia pertanian modern. Temukan cara bercocok tanam yang cerdas, efisien, dan produktif langsung dari genggaman Anda!

## Fitur Utama

### Home Dashboard
- **Weather Widget**: Menampilkan informasi cuaca real-time untuk lokasi Anda.
- **My Garden Overview**: Lihat semua tanaman aktif dengan pelacakan progres.
- **Quick Access Menu**: Akses cepat ke semua fitur utama.

### AgraAI Chatbot *(dalam pengembangan)*
- **UI & Chat History** sudah ada (riwayat tersimpan di perangkat).
- Jawaban masih berupa respons contoh dan menu-nya disembunyikan dari Home; integrasi LLM ada di roadmap (`docs/BREAKDOWN.md`).

### Plant Recommendation System
- **Wizard-based Flow**: Panduan langkah demi langkah untuk memilih tanaman terbaik.
- **Location-based**: Rekomendasi berdasarkan lokasi, cuaca, dan kondisi lahan.
- **Experience Level**: Disesuaikan dengan tingkat pengalaman Anda (Pemula/Menengah/Ahli).

### Mission System
- **Rangkaian Misi**: Tugas bertahap per tanaman; menyelesaikan satu tugas membuka tugas berikutnya.
- **Progress Tracking**: Progres, XP, dan level tersimpan di perangkat (AsyncStorage).
- **Gamification**: Level naik setiap 500 XP, pencapaian terbuka berdasarkan progres nyata.

### Virtual Garden
- **My Garden View**: Kelola semua tanaman Anda di satu tempat.
- **Explore Gardens**: Lihat kebun virtual petani lain untuk inspirasi.
- **Plant Cards**: Info lengkap setiap tanaman dengan visual menarik.

### User Profile
- **Achievement System**: Lencana terbuka otomatis dari progres misi.
- **Statistics**: Level, jumlah tanaman, tugas selesai, dan XP.
- **Sesi Login**: Login/daftar dengan validasi, sesi tersimpan, tombol Keluar.
  (Autentikasi masih lokal di perangkat, belum ada server akun.)

## Tech Stack

- **Framework**: React Native dengan Expo
- **Router**: Expo Router (File-based routing)
- **TypeScript**: Type-safe development
- **Styling**:
  - StyleSheet (Vanilla CSS-in-JS)
  - Themed Components (ThemedText, ThemedButton, ThemedView)
- **UI/UX**:
  - Ionicons
  - Expo Image (Optimized image loading)
  - Custom animations (LayoutAnimation)
- **Storage**: AsyncStorage (sesi login, progres misi, riwayat chat)
- **State**: React Context (`lib/session.tsx`, `lib/garden-store.tsx`)
- **Maps/Location**: Expo Location
- **WebView**: React Native WebView (untuk integrasi ML)

## Cara Menjalankan Aplikasi

### Prerequisites
- Node.js (v16 atau lebih baru)
- npm atau yarn
- Expo CLI
- Android Studio / Xcode (untuk emulator)
- Expo Go app (untuk testing di device fisik)

### Installation Steps

1. **Clone Repository** (jika ada) atau download source code.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi**:
   ```bash
   npx expo start
   ```

4. **Pilih Platform**:
   - Scan QR Code dengan **Expo Go** di Android/iOS
   - Tekan `a` untuk Android Emulator
   - Tekan `i` untuk iOS Simulator
   - Tekan `w` untuk Web Browser (fitur terbatas)

## Struktur Folder

```
Agrarian/
├── app/                          # Source code utama (Expo Router)
│   ├── _layout.tsx               # Root layout & navigation
│   ├── index.tsx                 # Home screen (Dashboard)
│   ├── onboarding.tsx            # Onboarding flow (3 slides)
│   ├── login.tsx                 # Login screen
│   ├── register.tsx              # Register screen
│   ├── profile.tsx               # User profile & achievements
│   ├── chatbot.tsx               # AI Chatbot with history
│   ├── plant-recommendation.tsx  # ML-based plant recommendation
│   ├── plant-detail.tsx          # Plant detail page
│   ├── virtual-garden.tsx        # Virtual garden (My Garden + Explore)
│   ├── missions/
│   │   ├── index.tsx             # Mission list (Daily tasks)
│   │   ├── [id].tsx              # Mission detail page
│   │   └── task/
│   │       └── [taskId].tsx      # Individual task detail
│   └── ...
├── assets/                       # Images, fonts, and icons
│   ├── images/
│   └── fonts/
├── components/                   # Reusable components
│   ├── avatar.tsx                # Avatar inisial nama
│   ├── not-found-state.tsx       # Tampilan "tidak ditemukan"
│   ├── themed-text.tsx           # Themed text component
│   ├── themed-button.tsx         # Themed button component
│   └── themed-view.tsx           # Themed view component
├── constants/
│   ├── plants.ts                 # Data tanaman & rangkaian misi
│   ├── crops.ts                  # Label model ML -> info tanaman (ID)
│   └── theme.ts                  # Color palette
├── lib/
│   ├── api.ts                    # Client ML API
│   ├── garden-store.tsx          # Progres misi, XP, level (tersimpan)
│   ├── session.tsx               # Onboarding & sesi login (tersimpan)
│   ├── http.ts                   # fetch + timeout
│   ├── navigation.ts             # goBack dengan fallback (deep link / URL web)
│   ├── alert.ts                  # Alert lintas platform (native & web)
│   └── weather.ts                # Cuaca Open-Meteo
├── __tests__/, lib/__tests__/    # Test Jest (unit & layar)
├── e2e/                          # Test Playwright (alur utama)
├── ml_agrarian/                  # ML API (FastAPI) + training scripts + tests
├── docs/BREAKDOWN.md             # Analisis proyek & roadmap
└── scripts/                      # Build & automation scripts
```

## ML API Integration

Aplikasi terintegrasi dengan ML API (FastAPI) untuk fitur cerdas:

| Endpoint | Status | Deskripsi |
|----------|--------|-----------|
| `/crop_recommendation_fastapi` | **Aktif** | Rekomendasi tanaman berdasarkan lokasi, cuaca, dan preferensi |
| `/yield_prediction_fastapi` | **Maintenance** | Prediksi hasil panen (sedang dalam pengembangan) |

Lihat dokumentasi lengkap di `ml_agrarian/README.md`

## Debugging & Development

### Pengecekan Kode
```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # Jest: logika & layar
npm run e2e         # Playwright: alur utama di build web (butuh browser Playwright)
cd ml_agrarian && pip install -r requirements-dev.txt && python -m pytest   # test ML API
```

`npm run e2e` membangun versi web (`expo export`) lalu menjalankannya dengan `expo serve`.
API ML dan cuaca di-mock, jadi tidak butuh internet. Jika browser belum terpasang:
`npx playwright install chromium`.

### Reset Development Data
- **Keluar akun**: Profil → tombol "Keluar"
- **Reset onboarding & progres misi**: hapus data aplikasi (Android: Settings → Apps → Agrarian → Clear storage) atau uninstall Expo Go app data.
- **Clear Metro cache**:
  ```bash
  npx expo start --clear
  ```

### Common Issues
1. **Metro bundler error**: Hapus cache dengan `npx expo start -c`
2. **Module not found**: Jalankan `npm install` lagi
3. **Android build failed**: Pastikan ANDROID_HOME sudah di-set

## License

Aplikasi ini dibuat untuk tujuan edukasi dan demonstrasi.

Versi: 1.0.0 (Beta)
Last Updated: Desember 2025

## Credits

- **ML Model Agrarian**: [fadhilr2/ml_model_agrarian](https://github.com/fadhilr2/ml_model_agrarian) - Machine Learning model untuk rekomendasi tanaman dan prediksi hasil panen

