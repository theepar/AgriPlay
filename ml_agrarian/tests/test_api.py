"""Test API tanpa model asli & tanpa internet.

Model dibuat dari sklearn dengan struktur yang sama seperti script training,
dan semua request ke NASA POWER / API elevasi di-mock.

Jalankan dari folder ml_agrarian:  pytest
"""
import datetime
import importlib
import sys

import joblib
import numpy as np
import pytest
import requests
from fastapi.testclient import TestClient
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder

CROPS = ["potatoes", "tomatoes", "vanilla"]
SUN = ["Full Sun", "Partial Shade", "Shade"]


def _build_models(model_dir):
    rng = np.random.default_rng(0)

    # Rekomendasi: [avg_temp, precip, rh, par, elevation, sun_exposure]
    X = np.array(
        [[*rng.uniform(15, 30, 1), *rng.uniform(1, 10, 1), *rng.uniform(60, 90, 1),
          *rng.uniform(300, 500, 1), *rng.uniform(0, 2000, 1), SUN[i % 3]] for i in range(30)],
        dtype=object,
    )
    ct = ColumnTransformer([("ordinalencoding", OrdinalEncoder(), [-1])], remainder="passthrough")
    le = LabelEncoder().fit(CROPS)
    y = le.transform([CROPS[i % 3] for i in range(30)])
    clf = RandomForestClassifier(n_estimators=5, random_state=0).fit(ct.fit_transform(X), y)

    # Hasil panen: [name, tmin, tmax, avg_temp, diurnal, gdd, precip, par]
    Xr = np.array(
        [["Rice" if i % 2 else "Maize", *rng.uniform(10, 30, 7)] for i in range(20)], dtype=object
    )
    ct_reg = ColumnTransformer([("encoder", OneHotEncoder(), [0])], remainder="passthrough")
    reg = RandomForestRegressor(n_estimators=5, random_state=0).fit(ct_reg.fit_transform(Xr), rng.uniform(1, 5, 20))

    joblib.dump(clf, model_dir / "crop_recommendation_classifier.joblib")
    joblib.dump(ct, model_dir / "crop_recommendation_transformer.joblib")
    joblib.dump(le, model_dir / "crop_recommendation_labelencoder.joblib")
    joblib.dump(reg, model_dir / "yield_prediction_regressor.joblib")
    joblib.dump(ct_reg, model_dir / "yield_prediction_transformer.joblib")


def _nasa_csv(params):
    """CSV harian 13 tahun terakhir, T2M_MAX=30 kecuali beberapa nilai hilang (-999)."""
    this_year = datetime.date.today().year
    rows = ["YEAR,DOY," + ",".join(params)]
    for year in range(this_year - 13, this_year + 1):
        for doy in range(1, 366):
            values = {"T2M_MAX": 30.0, "T2M_MIN": 20.0, "PRECTOTCORR": 5.0, "RH2M": 80.0,
                      "ALLSKY_SFC_PAR_TOT": 400.0, "GWETROOT": 0.6}
            if doy % 10 == 0:
                values["T2M_MAX"] = -999
            rows.append(f"{year},{doy}," + ",".join(str(values[p]) for p in params))
    return "\n".join(rows)


class FakeResponse:
    def __init__(self, text="", json_data=None, status=200):
        self.text, self._json, self.status_code = text, json_data, status

    def raise_for_status(self):
        if self.status_code >= 400:
            raise requests.HTTPError(f"status {self.status_code}")

    def json(self):
        return self._json


@pytest.fixture
def api(tmp_path, monkeypatch):
    _build_models(tmp_path)
    monkeypatch.setenv("MODEL_DIR", str(tmp_path))
    sys.modules.pop("app.main_alt", None)
    module = importlib.import_module("app.main_alt")

    calls = []

    def fake_get(url, timeout=None):
        calls.append(url)
        if "power.larc.nasa.gov" in url:
            params = url.split("parameters=")[1].split("&")[0].split("%2C")
            return FakeResponse(text=_nasa_csv(params))
        if "open-elevation" in url:
            return FakeResponse(json_data={"results": [{"elevation": 750}]})
        if "open-meteo" in url:
            return FakeResponse(json_data={"elevation": [800.0]})
        raise AssertionError(f"unexpected url {url}")

    monkeypatch.setattr(module.requests, "get", fake_get)
    module.fake_calls = calls
    return module


@pytest.fixture
def client(api):
    return TestClient(api.app)


RECOMMEND_BODY = {
    "tingkat_komitmen": "beginner",
    "location": {"lat": -6.9175, "lon": 107.6191},
    "sun_exposure": "Full Sun",
    "area": 20,
}


def test_health(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "API is running"


def test_crop_recommendation_returns_known_crop(client):
    response = client.post("/crop_recommendation_fastapi", json=RECOMMEND_BODY)
    assert response.status_code == 200
    assert response.json()["plant"] in CROPS


def test_missing_nasa_values_are_ignored(api):
    data = api.recommend_data_process(api.Input_cla(**RECOMMEND_BODY))
    # -999 harus dibuang, bukan ikut dirata-rata (sebelumnya menghasilkan ~-72).
    assert data["T2M_MAX"] == pytest.approx(30.0)
    assert data["avg_temperature"] == pytest.approx(25.0)
    assert data["elevation"] == 750


def test_nasa_response_is_cached(client, api):
    client.post("/crop_recommendation_fastapi", json=RECOMMEND_BODY)
    client.post("/crop_recommendation_fastapi", json=RECOMMEND_BODY)
    nasa_calls = [u for u in api.fake_calls if "power.larc.nasa.gov" in u]
    assert len(nasa_calls) == 1


def test_elevation_falls_back_to_open_meteo(client, api, monkeypatch):
    original = api.requests.get

    def flaky_get(url, timeout=None):
        if "open-elevation" in url:
            raise requests.Timeout("down")
        return original(url, timeout=timeout)

    monkeypatch.setattr(api.requests, "get", flaky_get)
    data = api.recommend_data_process(api.Input_cla(**RECOMMEND_BODY))
    assert data["elevation"] == 800.0


def test_nasa_failure_returns_502(client, api, monkeypatch):
    def failing_get(url, timeout=None):
        raise requests.ConnectionError("no network")

    monkeypatch.setattr(api.requests, "get", failing_get)
    response = client.post("/crop_recommendation_fastapi", json=RECOMMEND_BODY)
    assert response.status_code == 502


@pytest.mark.parametrize(
    "override",
    [
        {"sun_exposure": "Moonlight"},
        {"location": {"lat": 123, "lon": 107}},
        {"location": {"lat": -6.9}},
    ],
)
def test_invalid_input_returns_422(client, override):
    response = client.post("/crop_recommendation_fastapi", json={**RECOMMEND_BODY, **override})
    assert response.status_code == 422


def test_yield_prediction_handles_leap_day(client):
    response = client.post("/yield_prediction_fastapi", json={
        "plant": {"name": "Rice", "base_temp": 10, "growing_days": 120},
        "location": {"lat": -6.9175, "lon": 107.6191},
        "startDate": "2024-02-29",
        "area": 100,
    })
    assert response.status_code == 200
    assert response.json()["predicted_yield"] > 0


def test_lru_cache_evicts_oldest(api):
    cache = api.LRUCache(max_entries=2)
    cache.set("a", 1)
    cache.set("b", 2)
    cache.get("a")
    cache.set("c", 3)
    assert cache.get("b") is None
    assert cache.get("a") == 1 and cache.get("c") == 3
