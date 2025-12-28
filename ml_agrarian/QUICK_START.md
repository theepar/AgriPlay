# 🚀 Quick Start - Deploy ML API ke Hugging Face (GRATIS)

## Langkah Cepat (5 Menit)

### 1️⃣ Buat Akun Hugging Face
1. Buka https://huggingface.co/join
2. Daftar dengan email atau GitHub
3. Verifikasi email Anda

### 2️⃣ Install Hugging Face CLI
```bash
pip install huggingface_hub
```

### 3️⃣ Login ke Hugging Face
```bash
huggingface-cli login
```
- Paste token dari: https://huggingface.co/settings/tokens
- Buat token baru jika belum punya (pilih "Write" access)

### 4️⃣ Buat Space Baru
1. Buka https://huggingface.co/new-space
2. Isi form:
   - **Space name:** `agrarian-ml-api`
   - **License:** MIT
   - **Select the Space SDK:** **Docker** ⚠️ PENTING!
   - **Space hardware:** CPU basic (Free)
   - **Visibility:** Public (Free)
3. Klik "Create Space"

### 5️⃣ Deploy dengan Script Otomatis

#### Windows:
```cmd
set HF_USERNAME=your_username_disini
deploy.bat
```

#### Linux/Mac:
```bash
export HF_USERNAME=your_username_disini
chmod +x deploy.sh
./deploy.sh
```

Ganti `your_username_disini` dengan username Hugging Face Anda!

### 6️⃣ Tunggu Build Selesai
- Buka URL space Anda: `https://huggingface.co/spaces/YOUR_USERNAME/agrarian-ml-api`
- Lihat tab "App" - akan ada proses building (5-10 menit pertama kali)
- Status "Running" = API siap digunakan! ✅

---

## 🧪 Testing API

### Test dengan curl:
```bash
curl -X POST "https://YOUR_USERNAME-agrarian-ml-api.hf.space/crop_recommendation_fastapi" \
  -H "Content-Type: application/json" \
  -d '{"tingkat_komitmen":"rendah","location":{"lat":-6.9175,"lon":107.6191},"sun_exposure":"full","area":20}'
```

### Response yang diharapkan:
```json
{
  "plant": "Padi"
}
```

---

## 📱 Integrasi ke React Native App

### Update API URL di aplikasi Anda:

Cari file yang menggunakan API ML (biasanya di `lib/` atau `hooks/`), lalu update:

```typescript
// SEBELUM (localhost):
const ML_API_URL = "http://10.0.2.2:8000";

// SESUDAH (production):
const ML_API_URL = "https://YOUR_USERNAME-agrarian-ml-api.hf.space";
```

Contoh penggunaan:
```typescript
const recommendCrop = async (data) => {
  const response = await fetch(
    `${ML_API_URL}/crop_recommendation_fastapi`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};
```

---

## ✅ Checklist Build APK

Sebelum build APK, pastikan:
- [ ] ML API sudah deploy dan status "Running" di Hugging Face
- [ ] Test endpoint dengan curl/Postman berhasil
- [ ] Update `ML_API_URL` di React Native app
- [ ] Test app di development mode dulu
- [ ] Baru build APK production

---

## 🐛 Troubleshooting

### ❌ "Space not found" saat git clone
**Solusi:** Pastikan Space sudah dibuat di Hugging Face dan nama persis sama

### ❌ Build gagal dengan error "port already in use"
**Solusi:** Dockerfile sudah menggunakan port 7860 (default HF), tidak perlu diubah

### ❌ API response lambat/timeout
**Solusi:** 
- Normal saat pertama kali (cold start)
- Setelah beberapa detik akan lebih cepat
- Hugging Face free tier cukup untuk production ringan

### ❌ Model files too large
**Solusi:**
- Hugging Face support file besar dengan Git LFS (otomatis)
- Max 150GB untuk free tier

---

## 🎉 Selamat!

API ML Anda sekarang online 24/7 GRATIS dan siap untuk APK production!

**Production URL:**
```
https://YOUR_USERNAME-agrarian-ml-api.hf.space
```

**Endpoints:**
- `POST /crop_recommendation_fastapi` - Rekomendasi tanaman
- `POST /yield_prediction_fastapi` - Prediksi hasil panen

---

## 📚 Resources

- Hugging Face Spaces Docs: https://huggingface.co/docs/hub/spaces-overview
- FastAPI Docs: https://fastapi.tiangolo.com
- Docker Docs: https://docs.docker.com

Butuh bantuan? Tanya di Hugging Face Discord: https://hf.co/join/discord
