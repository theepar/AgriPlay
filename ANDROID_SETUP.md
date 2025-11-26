# 🚀 Cara Menjalankan React Native (Expo) di Android

## ✅ Setup Berhasil! Emulator Terdeteksi ✅

**Status:** Emulator `Medium_Phone_API_36.0` sudah berjalan dan terdeteksi sebagai `emulator-5554`

Sekarang Anda bisa menjalankan app dengan **3 cara mudah**:

---

## 🎯 Metode 1: Auto Start (RECOMMENDED) ⭐

**Seperti Flutter - Otomatis start emulator + run app!**

```bash
npm run android:auto
```

Script ini akan:
1. ✅ Cek apakah emulator sudah running
2. ✅ Jika belum, otomatis start emulator `Medium_Phone_API_36.0`
3. ✅ Tunggu sampai emulator siap
4. ✅ Jalankan Expo di emulator

---

## 🎯 Metode 2: Manual Start Emulator

### Step 1: Buka emulator terlebih dahulu

**Via Batch File (Double-click):**
- Double-click file: `start-android.bat`

**Via Command Line:**
```bash
"C:\Users\Deva\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.0
```

### Step 2: Tunggu emulator selesai booting (~30-60 detik)

### Step 3: Jalankan Expo
```bash
npm run android
```

---

## 🎯 Metode 3: Gunakan Expo Go (Real Device)

1. Download **Expo Go** dari Play Store
2. Pastikan HP dan laptop di WiFi yang sama
3. Jalankan:
   ```bash
   npm start
   ```
4. Scan QR code dengan Expo Go app

---

## 🛠️ Troubleshooting

### Error: "adb tidak ditemukan"

**Jika masih error, tambahkan Android SDK ke PATH:**

1. Buka **Environment Variables** di Windows
2. Edit **Path** (User variables)
3. Tambahkan 2 path ini:
   ```
   C:\Users\Deva\AppData\Local\Android\Sdk\platform-tools
   C:\Users\Deva\AppData\Local\Android\Sdk\emulator
   ```
4. **Restart terminal/VSCode**

### Emulator lambat/tidak muncul

- Pastikan Virtualization aktif di BIOS
- Cek RAM: emulator butuh minimal 4GB RAM
- Buka via Android Studio → Device Manager → Play button

### Check ADB devices

```bash
"C:\Users\Deva\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
```

---

## 📝 Quick Commands

| Perintah | Keterangan |
|----------|------------|
| `npm run android:auto` | **Auto start emulator + run app** ⭐ |
| `npm run android` | Run di Android (manual start emulator dulu) |
| `npm start` | Dev server saja (tekan 'a' untuk Android) |
| `npm run ios` | Run di iOS (Mac only) |
| `npm run web` | Run di browser |

---

## 🎉 Sekarang Lebih Mudah dari Flutter!

**Flutter:**
```bash
flutter run
```

**React Native (Anda):**
```bash
npm run android:auto
```

Sama mudahnya! 🚀

---

## 📱 Emulator yang Tersedia

- **Medium_Phone_API_36.0** (Android 14 / API 36)

Butuh emulator lain? Buat via Android Studio → Device Manager.

