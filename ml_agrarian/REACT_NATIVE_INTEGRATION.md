# 📱 React Native Integration Guide

## Update API URL untuk Production

Setelah ML API berhasil di-deploy ke Hugging Face, Anda perlu update URL di aplikasi React Native.

### File yang perlu diupdate: `lib/api.ts`

#### ✅ Contoh konfigurasi yang baik:

```typescript
// lib/api.ts

// PRODUCTION ML API (Hugging Face Spaces)
const ML_API_BASE_URL = 'https://YOUR_USERNAME-agrarian-ml-api.hf.space';

// DEVELOPMENT: Uncomment salah satu sesuai kebutuhan
// const ML_API_BASE_URL = 'http://10.0.2.2:8000';         // Android Emulator
// const ML_API_BASE_URL = 'http://localhost:8000';        // iOS Simulator
// const ML_API_BASE_URL = 'http://YOUR_PC_IP:8000';       // Physical Device

export const mlApi = {
  cropRecommendation: async (data: CropRecommendationInput) => {
    const response = await fetch(`${ML_API_BASE_URL}/crop_recommendation_fastapi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throwError(`Crop recommendation failed: ${response.statusText}`);
    return response.json();
  },

  yieldPrediction: async (data: YieldPredictionInput) => {
    const response = await fetch(`${ML_API_BASE_URL}/yield_prediction_fastapi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Yield prediction failed: ${response.statusText}`);
    return response.json();
  },
};
```

### 🔄 Workflow Development ke Production

```typescript
// Buat environment variable (recommended)
import Constants from 'expo-constants';

const ML_API_BASE_URL = 
  Constants.expoConfig?.extra?.mlApiUrl || 
  'https://YOUR_USERNAME-agrarian-ml-api.hf.space';
```

Lalu di `app.json`:
```json
{
  "expo": {
    "extra": {
      "mlApiUrl": "https://YOUR_USERNAME-agrarian-ml-api.hf.space"
    }
  }
}
```

---

## 🧪 Testing Sebelum Build APK

### 1. Test di Development Mode

```bash
# Jalankan expo/react-native
npm start
# atau
npx expo start
```

### 2. Test API Connection

Buat screen testing sederhana atau gunakan console untuk verify:

```typescript
// Test crop recommendation
const testCropRecommendation = async () => {
  try {
    const result = await mlApi.cropRecommendation({
      tingkat_komitmen: "rendah",
      location: { lat: -6.9175, lon: 107.6191 },
      sun_exposure: "full",
      area: 20
    });
    console.log("✅ Crop Recommendation:", result);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

// Test yield prediction
const testYieldPrediction = async () => {
  try {
    const result = await mlApi.yieldPrediction({
      plant: {
        name: "Rice",
        base_temp: 10,
        growing_days: 120
      },
      location: { lat: -6.9175, lon: 107.6191 },
      startDate: "2025-01-15",
      area: 100
    });
    console.log("✅ Yield Prediction:", result);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
```

---

## 📦 Build APK untuk Production

### 1. Pastikan URL Production sudah benar

Check `lib/api.ts`:
```typescript
const ML_API_BASE_URL = 'https://YOUR_USERNAME-agrarian-ml-api.hf.space';
```

### 2. Build APK dengan EAS

```bash
# Install EAS CLI jika belum
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build APK untuk Android
eas build --platform android --profile preview
```

Atau untuk production:
```bash
eas build --platform android --profile production
```

### 3. Download APK

Setelah build selesai, download APK dari dashboard Expo atau link yang diberikan.

---

## 🔍 Debugging Production Issues

### Issue: API timeout / tidak bisa connect

**Solusi:**
1. Verify ML API masih running di Hugging Face
   - Buka: `https://huggingface.co/spaces/YOUR_USERNAME/agrarian-ml-api`
   - Status harus "Running" (bola hijau)

2. Test endpoint dengan browser:
   ```
   https://YOUR_USERNAME-agrarian-ml-api.hf.space/
   ```
   Harus return: `{"status": "API is running"}`

3. Check network di device:
   - Pastikan device punya internet
   - Try di WiFi berbeda

### Issue: CORS Error

Jika ada CORS error, tambahkan CORS middleware di FastAPI:

```python
# ml_agrarian/app/main_alt.py

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Atau specify domain React Native app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Lalu re-deploy:
```bash
deploy.bat  # Windows
# atau
./deploy.sh  # Linux/Mac
```

### Issue: Response lambat

**Normal untuk first request** - Hugging Face akan "wake up" instance.
- First request: 5-15 detik
- Subsequent requests: < 2 detik

**Solusi untuk improve UX:**
```typescript
// Add loading state dan retry logic
const [isLoading, setIsLoading] = useState(false);

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { ...options, timeout: 30000 });
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
    }
  }
};
```

---

## ✅ Pre-Launch Checklist

Sebelum distribute APK, pastikan:

- [ ] ML API status "Running" di Hugging Face
- [ ] Test semua endpoint dengan curl/Postman berhasil
- [ ] `ML_API_BASE_URL` di kode sudah production URL
- [ ] Test crop recommendation di app berhasil
- [ ] Test yield prediction di app berhasil  
- [ ] Test dengan koneksi WiFi berbeda
- [ ] Test dengan data HP (bukan WiFi)
- [ ] APK sudah di-build dengan production config
- [ ] APK sudah di-test di minimal 1 device fisik

---

## 🎉 You're Ready!

Sekarang aplikasi Agrarian sudah siap untuk production dengan ML API yang hosted gratis 24/7!

**Production Setup:**
- ✅ ML API: Hugging Face Spaces (gratis, 24/7)
- ✅ Backend: Sudah ada (Supabase/Firebase)
- ✅ Mobile App: React Native + Expo
- ✅ APK: Ready untuk distribute

**Next Steps:**
1. Distribute APK ke tester
2. Gather feedback
3. Publish ke Google Play Store (optional)

Good luck! 🚀🌾
