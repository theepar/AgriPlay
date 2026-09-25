from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from collections import OrderedDict
import joblib
import numpy as np
import pandas as pd
import datetime
import requests
import logging
import io
import os

logger = logging.getLogger("agrarian-ml-api")
logging.basicConfig(level=logging.INFO)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.environ.get("MODEL_DIR", os.path.join(BASE_DIR, "..", "saved_models"))

DATA_YEARS = 11
NASA_FILL_VALUE = -999  # NASA POWER memakai -999 untuk data yang hilang
NASA_TIMEOUT_S = 60
ELEVATION_TIMEOUT_S = 10


class LRUCache:
    """Cache in-memory dengan batas jumlah entri agar memori server tidak terus bertambah."""

    def __init__(self, max_entries):
        self.max_entries = max_entries
        self._data = OrderedDict()

    def get(self, key):
        if key not in self._data:
            return None
        self._data.move_to_end(key)
        return self._data[key]

    def set(self, key, value):
        self._data[key] = value
        self._data.move_to_end(key)
        while len(self._data) > self.max_entries:
            self._data.popitem(last=False)

    def __len__(self):
        return len(self._data)


nasa_cache = LRUCache(max_entries=128)
elevation_cache = LRUCache(max_entries=1024)

try:
    regressor = joblib.load(os.path.join(MODEL_DIR, "yield_prediction_regressor.joblib"))
    ct_reg = joblib.load(os.path.join(MODEL_DIR, "yield_prediction_transformer.joblib"))
    classifier = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation_classifier.joblib"))
    ct_cla = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation_transformer.joblib"))
    le = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation_labelencoder.joblib"))
except FileNotFoundError as e:
    raise SystemExit(f"Model file not found: {e}")


def _known_sun_exposures():
    """Kategori sun_exposure yang dipelajari model (None jika tidak bisa dibaca)."""
    try:
        return [str(c) for c in ct_cla.named_transformers_["ordinalencoding"].categories_[0]]
    except (AttributeError, KeyError, IndexError):
        return None


SUN_EXPOSURES = _known_sun_exposures()

app = FastAPI(title="Agrarian ML API")
# Tanpa cookie/autentikasi, jadi aman dibuka untuk semua origin (dibutuhkan versi web).
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])


@app.get("/")
def root():
    return {"status": "API is running", "cache_stats": {"nasa": len(nasa_cache), "elevation": len(elevation_cache)}}


class Location(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class PlantInput(BaseModel):
    name: str
    base_temp: float
    growing_days: int = Field(gt=0, le=730)


class Input(BaseModel):
    plant: PlantInput
    location: Location
    startDate: datetime.date
    area: float = Field(gt=0)


class Input_cla(BaseModel):
    # tingkat_komitmen & area belum dipakai model, tetap diterima untuk kompatibilitas aplikasi.
    tingkat_komitmen: str | None = None
    location: Location
    sun_exposure: str
    area: float | None = None


def _mean(values, what):
    values = [v for v in values if pd.notna(v)]
    if not values:
        raise HTTPException(status_code=422, detail=f"Data iklim ({what}) tidak tersedia untuk lokasi ini")
    return float(sum(values) / len(values))


def _shift_year(date_obj, years):
    try:
        return date_obj.replace(year=date_obj.year + years)
    except ValueError:  # 29 Februari di tahun bukan kabisat
        return date_obj.replace(year=date_obj.year + years, day=28)


def fetch_nasa_data(lat, lon, start, end, params):
    # Koordinat dibulatkan 2 desimal (~1 km); resolusi grid NASA POWER jauh lebih kasar.
    lat, lon = round(lat, 2), round(lon, 2)
    cache_key = (lat, lon, start, end, tuple(params))

    cached = nasa_cache.get(cache_key)
    if cached is not None:
        logger.info("[CACHE HIT] NASA data for %s, %s", lat, lon)
        return cached

    logger.info("[CACHE MISS] Fetching NASA data for %s, %s...", lat, lon)
    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"start={start}&end={end}&latitude={lat}&longitude={lon}"
        f"&community=ag&parameters={'%2C'.join(params)}"
        f"&format=csv&header=false"
    )
    try:
        response = requests.get(url, timeout=NASA_TIMEOUT_S)
        response.raise_for_status()
        df = pd.read_csv(io.StringIO(response.text))
    except (requests.RequestException, pd.errors.ParserError, ValueError) as exc:
        logger.warning("NASA POWER request failed: %s", exc)
        raise HTTPException(status_code=502, detail="Gagal mengambil data iklim dari NASA POWER") from exc

    missing = [c for c in ["YEAR", "DOY", *params] if c not in df.columns]
    if missing:
        raise HTTPException(status_code=502, detail=f"Respons NASA POWER tidak lengkap: {missing}")

    df = df.replace(NASA_FILL_VALUE, np.nan)
    nasa_cache.set(cache_key, df)
    return df


ELEVATION_SOURCES = (
    ("open-elevation", "https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}",
     lambda data: data["results"][0]["elevation"]),
    # Cadangan: Open-Elevation sering lambat/down.
    ("open-meteo", "https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lon}",
     lambda data: data["elevation"][0]),
)


def get_elevation(lat, lon):
    cache_key = (round(lat, 2), round(lon, 2))
    cached = elevation_cache.get(cache_key)
    if cached is not None:
        logger.info("[CACHE HIT] Elevation for %s, %s", *cache_key)
        return cached

    for name, url, extract in ELEVATION_SOURCES:
        try:
            r = requests.get(url.format(lat=lat, lon=lon), timeout=ELEVATION_TIMEOUT_S)
            r.raise_for_status()
            elevation = float(extract(r.json()))
        except (requests.RequestException, KeyError, IndexError, TypeError, ValueError) as exc:
            logger.warning("Elevation source %s failed: %s", name, exc)
            continue
        elevation_cache.set(cache_key, elevation)
        return elevation

    raise HTTPException(status_code=502, detail="Gagal mengambil data ketinggian lokasi")


def yield_data_process(input_: Input):
    date_obj = input_.startDate
    year = date_obj.year
    doy = date_obj.timetuple().tm_yday

    start_str = _shift_year(date_obj, -DATA_YEARS).strftime("%Y%m%d")
    end_str = _shift_year(date_obj, -1).strftime("%Y%m%d")

    params = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "GWETROOT", "ALLSKY_SFC_PAR_TOT"]
    df = fetch_nasa_data(input_.location.lat, input_.location.lon, start_str, end_str, params)

    base_temp = input_.plant.base_temp
    end_day = doy + input_.plant.growing_days

    yearly_averages, yearly_avg_temps, yearly_diurnal_ranges, yearly_total_gdds = (
        {p: [] for p in params}, [], [], []
    )

    for curr_year in range(year - DATA_YEARS, year):
        if end_day > 365:
            leap = (curr_year % 4 == 0 and curr_year % 100 != 0) or (curr_year % 400 == 0)
            days_in_year = 366 if leap else 365
            end_day_next = end_day - days_in_year

            df1 = df[(df["YEAR"] == curr_year) & (df["DOY"] >= doy)]
            df2 = df[(df["YEAR"] == curr_year + 1) & (df["DOY"] <= end_day_next)]
            env_df = pd.concat([df1, df2])
        else:
            env_df = df[(df["YEAR"] == curr_year) & (df["DOY"] >= doy) & (df["DOY"] <= end_day)]

        if not env_df.empty:
            for p in params:
                yearly_averages[p].append(env_df[p].mean())

            avg_temp = (env_df["T2M_MAX"] + env_df["T2M_MIN"]) / 2
            yearly_avg_temps.append(avg_temp.mean())
            yearly_diurnal_ranges.append((env_df["T2M_MAX"] - env_df["T2M_MIN"]).mean())

            gdd = (avg_temp - base_temp).clip(lower=0)
            yearly_total_gdds.append(gdd.sum())

    averages = {p: _mean(v, p) for p, v in yearly_averages.items()}
    averages["avg_temperature"] = _mean(yearly_avg_temps, "suhu rata-rata")
    averages["diurnal_temp_range"] = _mean(yearly_diurnal_ranges, "rentang suhu harian")
    averages["avg_total_gdd"] = _mean(yearly_total_gdds, "GDD")

    return averages


def recommend_data_process(input_: Input_cla):
    # Pakai tahun penuh terakhir saja agar cache berlaku sepanjang tahun (bukan hanya sehari).
    year = datetime.date.today().year
    start_str = f"{year - DATA_YEARS}0101"
    end_str = f"{year - 1}1231"

    params = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "RH2M", "ALLSKY_SFC_PAR_TOT"]
    df = fetch_nasa_data(input_.location.lat, input_.location.lon, start_str, end_str, params)

    yearly_averages, yearly_avg_temps = {p: [] for p in params}, []
    for curr_year in range(year - DATA_YEARS, year):
        env_df = df[df["YEAR"] == curr_year]
        if env_df.empty:
            continue
        for p in params:
            yearly_averages[p].append(env_df[p].mean())
        avg_temp = (env_df["T2M_MAX"] + env_df["T2M_MIN"]) / 2
        yearly_avg_temps.append(avg_temp.mean())

    averages = {p: _mean(v, p) for p, v in yearly_averages.items()}
    averages["avg_temperature"] = _mean(yearly_avg_temps, "suhu rata-rata")
    averages["elevation"] = get_elevation(input_.location.lat, input_.location.lon)
    return averages


@app.post("/yield_prediction_fastapi")
def yield_prediction(input_: Input):
    data = yield_data_process(input_)
    inputs = [[
        input_.plant.name,
        data["T2M_MIN"],
        data["T2M_MAX"],
        data["avg_temperature"],
        data["diurnal_temp_range"],
        data["avg_total_gdd"],
        data["PRECTOTCORR"],
        data["ALLSKY_SFC_PAR_TOT"],
    ]]
    try:
        y_pred = regressor.predict(ct_reg.transform(inputs))[0]
    except ValueError as exc:  # mis. nama tanaman tidak dikenal encoder
        raise HTTPException(status_code=422, detail=f"Input tidak dapat diproses model: {exc}") from exc
    return {
        "predicted_yield": float(y_pred) * 1000 * input_.area,
        "units": "sq_meters",
    }


@app.post("/crop_recommendation_fastapi")
def crop_recommendation(input_: Input_cla):
    if SUN_EXPOSURES and input_.sun_exposure not in SUN_EXPOSURES:
        raise HTTPException(
            status_code=422,
            detail=f"sun_exposure harus salah satu dari: {', '.join(SUN_EXPOSURES)}",
        )

    data = recommend_data_process(input_)
    inputs = [[
        data["avg_temperature"],
        data["PRECTOTCORR"],
        data["RH2M"],
        data["ALLSKY_SFC_PAR_TOT"],
        data["elevation"],
        input_.sun_exposure,
    ]]
    pred = classifier.predict(ct_cla.transform(inputs))
    plant_name = le.inverse_transform(pred)[0]
    return {"plant": str(plant_name)}
