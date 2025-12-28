# 🚀 Deployment Guide - Agrarian ML API

## Platform Hosting Gratis yang Direkomendasikan

### 🏆 Opsi 1: Hugging Face Spaces (PALING RECOMMENDED)

**Kelebihan:**
- ✅ Gratis unlimited untuk public spaces
- ✅ Support ML models (joblib, scikit-learn)
- ✅ Tidak ada sleep/downtime (24/7)
- ✅ Support FastAPI langsung
- ✅ Deploy via Git push

#### Langkah-langkah Deployment:

1. **Buat akun di Hugging Face**
   - Kunjungi: https://huggingface.co/join
   - Daftar dengan email/GitHub

2. **Buat New Space**
   - Klik "New Space" di https://huggingface.co/new-space
   - Nama space: `agrarian-ml-api` (atau sesuai keinginan)
   - License: MIT
   - SDK: **Docker**
   - Visibility: **Public** (gratis)

3. **Clone space repository**
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/agrarian-ml-api
   cd agrarian-ml-api
   ```

4. **Copy file-file yang diperlukan**
   ```bash
   # Dari folder ml_agrarian, copy:
   cp -r app/ agrarian-ml-api/
   cp -r saved_models/ agrarian-ml-api/
   cp requirements.txt agrarian-ml-api/
   cp Dockerfile agrarian-ml-api/
   ```

5. **Push ke Hugging Face**
   ```bash
   cd agrarian-ml-api
   git add .
   git commit -m "Initial deployment"
   git push
   ```

6. **API akan otomatis di-build dan deploy!**
   - URL API: `https://YOUR_USERNAME-agrarian-ml-api.hf.space`
   - Endpoint: `https://YOUR_USERNAME-agrarian-ml-api.hf.space/crop_recommendation_fastapi`

---

### 🔵 Opsi 2: Railway.app (Alternatif)

**Kelebihan:**
- ✅ Free tier: 500 jam/bulan, 100GB transfer
- ✅ Auto-deploy dari GitHub
- ✅ Simple setup

**Kekurangan:**
- ⚠️ Limited hours (cukup untuk testing/development)
- ⚠️ Akan sleep jika tidak dipakai

#### Langkah-langkah:

1. **Buat akun di Railway**
   - Kunjungi: https://railway.app
   - Login dengan GitHub

2. **Buat New Project**
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Pilih folder `ml_agrarian`

3. **Railway akan auto-detect Dockerfile dan build**

4. **Get deployment URL dari Railway dashboard**

---

### 🟢 Opsi 3: Render.com (Alternatif)

**Kelebihan:**
- ✅ Free tier permanent
- ✅ Auto-deploy dari GitHub
- ✅ SSL certificate gratis

**Kekurangan:**
- ⚠️ Cold start (sleep after 15 min inactive)
- ⚠️ Build time limited pada free tier

#### Langkah-langkah:

1. **Buat akun di Render**
   - Kunjungi: https://render.com
   - Sign up dengan GitHub

2. **New Web Service**
   - Klik "New +"
   - Pilih "Web Service"
   - Connect GitHub repository
   - Pilih folder `ml_agrarian`

3. **Konfigurasi:**
   - Name: `agrarian-ml-api`
   - Environment: **Docker**
   - Instance Type: **Free**

4. **Deploy!**
   - Render akan auto-build dari Dockerfile
   - Get URL dari dashboard

---

## 📝 File-file yang Sudah Disiapkan

### Dockerfile
File `Dockerfile` sudah dibuat untuk deployment. Isi:
- Base image: Python 3.11
- Install requirements
- Copy model files dan aplikasi
- Expose port 7860 (Hugging Face default)
- Run dengan uvicorn

### .dockerignore (Optional)
Buat file `.dockerignore` untuk exclude file yang tidak perlu:
```
__pycache__
*.pyc
*.pyo
.git
.gitignore
notebooks/
scripts/
*.md
```

---

## 🔧 Testing Setelah Deploy

### Test Endpoint Crop Recommendation:
```bash
curl -X POST "https://YOUR_API_URL/crop_recommendation_fastapi" \
  -H "Content-Type: application/json" \
  -d '{
    "tingkat_komitmen": "rendah",
    "location": {
      "lat": -6.9175,
      "lon": 107.6191
    },
    "sun_exposure": "full",
    "area": 20
  }'
```

### Test Endpoint Yield Prediction:
```bash
curl -X POST "https://YOUR_API_URL/yield_prediction_fastapi" \
  -H "Content-Type: application/json" \
  -d '{
    "plant": {
      "name": "Rice",
      "base_temp": 10,
      "growing_days": 120
    },
    "location": {
      "lat": -6.9175,
      "lon": 107.6191
    },
    "startDate": "2025-01-15",
    "area": 100
  }'
```

---

## 📱 Integrasi dengan React Native

Setelah deploy, update API URL di aplikasi React Native Anda:

```typescript
// Ganti dari localhost ke production URL
const API_URL = "https://YOUR_USERNAME-agrarian-ml-api.hf.space";

// Atau untuk Railway:
const API_URL = "https://agrarian-ml-api.up.railway.app";
```

---

## 🎯 Rekomendasi Akhir

**Untuk APK Production:** Gunakan **Hugging Face Spaces**
- Gratis unlimited
- No sleep/downtime
- Reliable untuk production

**Untuk Testing/Development:** Railway atau Render juga OK, tapi ada sleep time.

---

## 🐛 Troubleshooting

### Error: Model files too large
- Compress model files
- Atau gunakan Git LFS (Large File Storage)

### Error: Build timeout
- Optimize Dockerfile
- Reduce image size

### Cold start lambat
- Normal untuk free tier
- Hugging Face tidak punya masalah ini

---

## 📞 Support

Jika ada masalah deployment, dokumentasi lengkap ada di:
- Hugging Face: https://huggingface.co/docs/hub/spaces-overview
- Railway: https://docs.railway.app
- Render: https://render.com/docs
