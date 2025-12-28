# Agrarian - Smart Farming Companion

Agrarian adala aplikasi mobile berbasis AI dan Machine Learning yang dirancang untuk membantu generasi muda dan petani pemula dalam dunia pertanian modern. Temukan cara bercocok tanam yang cerdas, efisien, dan produktif langsung dari genggaman Anda!

## Fitur Utama

### Home Dashboard
- **Weather Widget**: Menampilkan informasi cuaca real-time untuk lokasi Anda.
- **My Garden Overview**: Lihat semua tanaman aktif dengan pelacakan progres.
- **Quick Access Menu**: Akses cepat ke semua fitur utama.

### AgraAI Chatbot
- **AI Assistant 24/7**: Tanya jawab seputar pertanian, hama, pupuk, dan perawatan.
- **Chat History**: Simpan riwayat percakapan untuk referensi nanti.
- **Smart Responses**: Mendapat jawaban cerdas berdasarkan konteks pertanyaan.

### Plant Recommendation System
- **Wizard-based Flow**: Panduan langkah demi langkah untuk memilih tanaman terbaik.
- **Location-based**: Rekomendasi berdasarkan lokasi, cuaca, dan kondisi lahan.
- **Experience Level**: Disesuaikan dengan tingkat pengalaman Anda (Pemula/Menengah/Ahli).

### Mission System (Daily Tasks)
- **Daily Missions**: Tugas harian untuk merawat tanaman (siram, pupuk, cek hama).
- **Streak System**: Bonus XP untuk konsistensi merawat tanaman.
- **Progress Tracking**: Lihat perkembangan tanaman dari hari ke hari.
- **Gamification**: Sistem level dan XP untuk motivasi lebih.

### Virtual Garden
- **My Garden View**: Kelola semua tanaman Anda di satu tempat.
- **Explore Gardens**: Lihat kebun virtual petani lain untuk inspirasi.
- **Plant Cards**: Info lengkap setiap tanaman dengan visual menarik.

### User Profile
- **Achievement System**: Koleksi lencana dan pencapaian.
- **Statistics**: Total tanaman, streak, level, dan XP.
- **Account Management**: Kelola profil dan preferensi.

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
- **Storage**: AsyncStorage (Local data persistence)
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
│   ├── themed-text.tsx           # Themed text component
│   ├── themed-button.tsx         # Themed button component
│   ├── themed-view.tsx           # Themed view component
│   └── parallax-scroll-view.tsx  # Parallax scrolling effect
├── constants/                    # App constants & theme
│   └── Colors.ts                 # Color palette
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

### Reset Development Data
- **Reset Onboarding**: Tekan tombol "Log Out (Dev)" di Home untuk reset
- **Clear AsyncStorage**:
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

