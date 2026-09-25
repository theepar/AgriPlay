# 🌾 Agrarian ML API

Machine Learning API untuk rekomendasi tanaman dan prediksi hasil panen.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ml_agrarian
pip install -r requirements.txt
```

### 2. Siapkan Model
File model (`*.joblib`) tidak disimpan di git. Letakkan 5 file berikut di `saved_models/`
(hasil `scripts/*_train.py` atau salin dari Space Hugging Face), atau arahkan ke folder lain
dengan environment variable `MODEL_DIR`:

- `crop_recommendation_classifier.joblib`, `crop_recommendation_transformer.joblib`, `crop_recommendation_labelencoder.joblib`
- `yield_prediction_regressor.joblib`, `yield_prediction_transformer.joblib`

### 3. Jalankan Server
```bash
uvicorn app.main_alt:app --host 0.0.0.0 --port 8000 --reload
```

Server akan berjalan di `http://localhost:8000` (dokumentasi interaktif: `/docs`)

### 4. Jalankan Test
Test memakai model tiruan dan mock jaringan, jadi tidak butuh file model maupun internet.
```bash
pip install -r requirements-dev.txt
python -m pytest
```

## 📡 API Endpoints

### Health Check
```
GET /
```
Response: `{"status": "API is running"}`

---

### 🌱 Crop Recommendation (Rekomendasi Tanaman)
```
POST /crop_recommendation_fastapi
```

**Request Body:**
```json
{
  "tingkat_komitmen": "beginner",
  "location": {
    "lat": -6.9175,
    "lon": 107.6191
  },
  "sun_exposure": "Full Sun",
  "area": 20
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `location.lat` | float | Latitude lokasi (-90 s/d 90) |
| `location.lon` | float | Longitude lokasi (-180 s/d 180) |
| `sun_exposure` | string | Kategori yang dikenal model: `"Full Sun"`, `"Partial Shade"`, `"Shade"` |
| `tingkat_komitmen` | string | Opsional, **belum dipakai model** (`"beginner"`, `"intermediate"`, `"expert"`) |
| `area` | number | Opsional, **belum dipakai model** (m²) |

Model memakai rata-rata iklim 11 tahun penuh terakhir (NASA POWER) + ketinggian lokasi.

**Response:** label tanaman (bahasa Inggris, 14 kelas, mis. `tomatoes`, `potatoes`,
`chillies and peppers`). Aplikasi menerjemahkannya lewat `constants/crops.ts`.
```json
{
  "plant": "tomatoes"
}
```

**Error:**
| Status | Arti |
|--------|------|
| `422` | Input tidak valid (koordinat di luar rentang, `sun_exposure` tidak dikenal, data iklim kosong) |
| `429` | Terlalu banyak permintaan dari klien yang sama (default 60/menit) |
| `502` | Sumber data eksternal (NASA POWER / API elevasi) gagal diakses |

### Konfigurasi

| Env | Default | Fungsi |
|-----|---------|--------|
| `MODEL_DIR` | `saved_models/` | Folder file model `*.joblib` |
| `RATE_LIMIT_PER_MINUTE` | `60` | Batas request POST per klien per menit (`0` = nonaktif). Klien dikenali dari entri paling kanan `X-Forwarded-For` (dari reverse proxy). |

---

### 📊 Yield Prediction (Prediksi Hasil Panen)
```
POST /yield_prediction_fastapi
```

**Request Body:**
```json
{
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
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `plant.name` | string | Nama tanaman (English) |
| `plant.base_temp` | int | Suhu dasar pertumbuhan (°C) |
| `plant.growing_days` | int | Durasi pertumbuhan (hari) |
| `location.lat` | float | Latitude lokasi |
| `location.lon` | float | Longitude lokasi |
| `startDate` | string | Tanggal mulai tanam (YYYY-MM-DD) |
| `area` | int | Luas lahan (m²) |

**Response:**
```json
{
  "predicted_yield": 450.5,
  "units": "sq_meters"
}
```

## 📁 Struktur Folder

```
ml_agrarian/
├── app/
│   └── main_alt.py        # FastAPI server
├── saved_models/          # Model ML yang sudah dilatih (*.joblib, tidak di-commit)
├── scripts/               # Training scripts
├── tests/                 # Test API (pytest)
├── requirements.txt       # Python dependencies
└── requirements-dev.txt   # + dependencies untuk test
```

## ⚙️ Konfigurasi untuk React Native

Untuk Android Emulator, gunakan:
```
http://10.0.2.2:8000
```

Untuk iOS Simulator atau device fisik di jaringan yang sama:
```
http://<IP_KOMPUTER>:8000
```

## 📝 Data Sources

API ini menggunakan data dari:
- **NASA POWER API** - Data cuaca historis (suhu, curah hujan, radiasi matahari)
- **Open Elevation API** - Data elevasi/ketinggian lokasi (cadangan: Open-Meteo Elevation API)
