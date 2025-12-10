# 🌾 Agrarian ML API

Machine Learning API untuk rekomendasi tanaman dan prediksi hasil panen.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ml_agrarian
pip install -r requirements.txt
```

### 2. Jalankan Server
```bash
uvicorn app.main_alt:app --host 0.0.0.0 --port 8000 --reload
```

Server akan berjalan di `http://localhost:8000`

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
  "tingkat_komitmen": "rendah",
  "location": {
    "lat": -6.9175,
    "lon": 107.6191
  },
  "sun_exposure": "full",
  "area": 20
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tingkat_komitmen` | string | `"rendah"`, `"sedang"`, atau `"tinggi"` |
| `location.lat` | float | Latitude lokasi |
| `location.lon` | float | Longitude lokasi |
| `sun_exposure` | string | `"full"`, `"partial"`, atau `"shade"` |
| `area` | int | Luas lahan (m²) |

**Response:**
```json
{
  "plant": "Padi"
}
```

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
├── saved_models/          # Model ML yang sudah dilatih
├── notebooks/             # Jupyter notebooks (development)
├── scripts/               # Training scripts
└── requirements.txt       # Python dependencies
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
- **Open Elevation API** - Data elevasi/ketinggian lokasi
