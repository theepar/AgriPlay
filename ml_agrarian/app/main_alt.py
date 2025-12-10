from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import joblib
import pandas as pd
import datetime
import requests
import os
from functools import lru_cache
import hashlib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "saved_models")

# In-memory cache for API responses
nasa_cache = {}
elevation_cache = {}
DATA_YEARS = 11

try:
    regressor = joblib.load(os.path.join(MODEL_DIR, "yield_prediction_regressor.joblib"))
    ct_reg = joblib.load(os.path.join(MODEL_DIR, "yield_prediction_transformer.joblib"))
    classifier = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation_classifier.joblib"))
    ct_cla = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation_transformer.joblib"))
    le = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation_labelencoder.joblib"))
except FileNotFoundError as e:
    raise SystemExit(f"Model file not found: {e}")


app = FastAPI()

@app.get("/")
def root():
    return {"status": "API is running", "cache_stats": {"nasa": len(nasa_cache), "elevation": len(elevation_cache)}}


class Input(BaseModel):
    plant: dict
    location: dict
    startDate: str
    area: int


class Input_cla(BaseModel):
    tingkat_komitmen: str
    location: dict
    sun_exposure: str
    area: int


def fetch_nasa_data(lat, lon, start, end, params):
    # Round coordinates to 2 decimals for cache efficiency
    lat_key = round(lat, 2)
    lon_key = round(lon, 2)
    cache_key = f"{lat_key}_{lon_key}_{start}_{end}_{'_'.join(params)}"
    
    if cache_key in nasa_cache:
        print(f"[CACHE HIT] NASA data for {lat_key}, {lon_key}")
        return nasa_cache[cache_key]
    
    print(f"[CACHE MISS] Fetching NASA data for {lat_key}, {lon_key}...")
    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"start={start}&end={end}&latitude={lat}&longitude={lon}"
        f"&community=ag&parameters={'%2C'.join(params)}"
        f"&format=csv&header=false"
    )
    df = pd.read_csv(url)
    nasa_cache[cache_key] = df
    return df


def get_elevation(lat, lon):
    # Round coordinates for cache
    lat_key = round(lat, 2)
    lon_key = round(lon, 2)
    cache_key = f"{lat_key}_{lon_key}"
    
    if cache_key in elevation_cache:
        print(f"[CACHE HIT] Elevation for {lat_key}, {lon_key}")
        return elevation_cache[cache_key]
    
    print(f"[CACHE MISS] Fetching elevation for {lat_key}, {lon_key}...")
    r = requests.get(
        f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}",
        timeout=10
    )
    elevation = r.json()["results"][0]["elevation"]
    elevation_cache[cache_key] = elevation
    return elevation


def yield_data_process(input_: Input):
    year = int(input_.startDate[0:4])
    date_obj = datetime.datetime.strptime(input_.startDate, "%Y-%m-%d").date()
    doy = date_obj.timetuple().tm_yday

    start_str = (date_obj.replace(year=year - 11)).strftime("%Y%m%d")
    end_str = (date_obj.replace(year=year - 1)).strftime("%Y%m%d")

    params = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "GWETROOT", "ALLSKY_SFC_PAR_TOT"]
    df = fetch_nasa_data(input_.location["lat"], input_.location["lon"], start_str, end_str, params)

    base_temp = input_.plant["base_temp"]
    end_day = doy + input_.plant["growing_days"]

    yearly_averages, yearly_avg_temps, yearly_diurnal_ranges, yearly_total_gdds = (
        {p: [] for p in params}, [], [], []
    )

    for i in range(11):
        curr_year = year - 11 + i
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

            gdd = avg_temp - base_temp
            gdd[gdd < 0] = 0
            yearly_total_gdds.append(gdd.sum())

    averages = {p: sum(v) / len(v) for p, v in yearly_averages.items() if v}
    averages["avg_temperature"] = sum(yearly_avg_temps) / len(yearly_avg_temps)
    averages["diurnal_temp_range"] = sum(yearly_diurnal_ranges) / len(yearly_diurnal_ranges)
    averages["avg_total_gdd"] = sum(yearly_total_gdds) / len(yearly_total_gdds)

    return averages


def recommend_data_process(input_: Input_cla):
    year, month, day = datetime.datetime.now().year, datetime.datetime.now().month, datetime.datetime.now().day
    start_str = f"{year-DATA_YEARS}0101"
    end_str = f"{year}{month:02d}{day:02d}"

    params = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "RH2M", "ALLSKY_SFC_PAR_TOT"]
    df = fetch_nasa_data(input_.location["lat"], input_.location["lon"], start_str, end_str, params)

    yearly_averages, yearly_avg_temps = {p: [] for p in params}, []
    for i in range(DATA_YEARS):
        curr_year = year - DATA_YEARS + i
        env_df = df[df["YEAR"] == curr_year]
        for p in params:
            yearly_averages[p].append(env_df[p].mean())
        avg_temp = (env_df["T2M_MAX"] + env_df["T2M_MIN"]) / 2
        yearly_avg_temps.append(avg_temp.mean())

    averages = {p: sum(v) / len(v) for p, v in yearly_averages.items() if v}
    averages["avg_temperature"] = sum(yearly_avg_temps) / len(yearly_avg_temps)
    averages["elevation"] = get_elevation(input_.location["lat"], input_.location["lon"])
    return averages


@app.post("/yield_prediction_fastapi")
def yield_prediction(input_: Input):
    data = yield_data_process(input_)
    inputs = [[
        input_.plant["name"],
        float(data["T2M_MIN"]),
        float(data["T2M_MAX"]),
        float(data["avg_temperature"]),
        float(data["diurnal_temp_range"]),
        float(data["avg_total_gdd"]),
        float(data["PRECTOTCORR"]),
        float(data["ALLSKY_SFC_PAR_TOT"])
    ]]
    y_pred = regressor.predict(ct_reg.transform(inputs))[0]
    result = {
        "predicted_yield": y_pred * 1000 * input_.area,
        "units": "sq_meters"
    }
    return JSONResponse(content=jsonable_encoder(result))


@app.post("/crop_recommendation_fastapi")
def crop_recommendation(input_: Input_cla):
    data = recommend_data_process(input_)
    inputs = [[
        float(data["avg_temperature"]),
        float(data["PRECTOTCORR"]),
        float(data["RH2M"]),
        float(data["ALLSKY_SFC_PAR_TOT"]),
        float(data["elevation"]),
        input_.sun_exposure
    ]]
    pred = classifier.predict(ct_cla.transform(inputs))
    plant_name = le.inverse_transform(pred)[0]
    return JSONResponse(content=jsonable_encoder({"plant": plant_name}))
