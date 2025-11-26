# 🌱 AgriPlay - Smart Farming Companion

AgriPlay adalah aplikasi mobile berbasis AI dan Machine Learning yang dirancang untuk membantu generasi muda dan petani pemula dalam dunia pertanian modern. Temukan cara bercocok tanam yang cerdas, efisien, dan produktif langsung dari genggaman Anda!

## ✨ Fitur Utama

- **🤖 AgriAI Assistant**: Asisten cerdas untuk menjawab pertanyaan seputar pertanian.
- **🌿 Rekomendasi Tanaman**: Dapatkan rekomendasi tanaman terbaik berdasarkan lokasi, pengalaman, dan kondisi lahan Anda.
- **📅 Smart Schedule & Reminder**: Pengingat otomatis untuk menyiram, memupuk, dan merawat tanaman.
- **🎮 Gamification**: Sistem level dan XP (seperti Duolingo) untuk membuat belajar bertani lebih menyenangkan.
- **🏡 Virtual Garden**: Simulasikan kebun impian Anda sebelum mulai menanam.
- **👥 Komunitas Petani**: Terhubung dengan petani lain untuk berbagi tips dan pengalaman.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: StyleSheet (Vanilla CSS-in-JS)
- **Icons**: Ionicons (@expo/vector-icons)
- **Storage**: AsyncStorage
- **Maps/Location**: Expo Location

## 🚀 Cara Menjalankan Aplikasi

1. **Clone Repository** (jika ada) atau download source code.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi**:
   ```bash
   npx expo start
   ```

4. **Scan QR Code**:
   - Gunakan aplikasi **Expo Go** di Android/iOS untuk scan QR code yang muncul di terminal.
   - Atau tekan `a` untuk membuka di Android Emulator.
   - Atau tekan `i` untuk membuka di iOS Simulator.

## 📱 Struktur Folder

```
AgriPlay/
├── app/                    # Source code utama (Expo Router)
│   ├── (tabs)/             # Tab navigation (jika ada)
│   ├── _layout.tsx         # Root layout & navigation setup
│   ├── index.tsx           # Homepage
│   ├── login.tsx           # Login screen
│   ├── register.tsx        # Register screen
│   ├── onboarding.tsx      # Onboarding flow
│   ├── plant-detail.tsx    # Halaman detail tanaman & tasks
│   ├── plant-recommendation.tsx # Wizard rekomendasi tanaman
│   └── ...
├── assets/                 # Gambar, font, dan icon
├── components/             # Reusable components
└── ...
```

## 📝 Catatan Pengembangan

- **Reset Onboarding**: Di Homepage terdapat tombol "Reset (Dev Only)" untuk mereset status onboarding agar bisa testing flow dari awal.
- **Dummy Data**: Saat ini aplikasi menggunakan dummy data untuk demonstrasi fitur.

---

