from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import joblib
import pandas as pd
import datetime
import requests
from soiltexture import getTexture


try:
  regressor = joblib.load("../saved_models/yield_prediction_regressor.joblib")
  ct_reg = joblib.load("../saved_models/yield_prediction_transformer.joblib")

  classifier = joblib.load("../saved_models/crop_recommendation_classifier.joblib")
  ct_cla = joblib.load("../saved_models/crop_recommendation_transformer.joblib")
  le = joblib.load("../saved_models/crop_recommendation_labelencoder.joblib")
except:
  print("file tidak ditemukan")
  regressor = None
  ct_reg = None

  classifier = None
  ct_cla = None
  le = None


app = FastAPI()

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

def dataProcess(input_):

    # --- Date and Location Processing ---
    year = int(input_.startDate[0:4])
    date_object = datetime.datetime.strptime(input_.startDate, "%Y-%m-%d").date()
    doy = date_object.timetuple().tm_yday

    start_date_str = (date_object.replace(year=year - 11)).strftime("%Y%m%d")
    end_date_str = (date_object.replace(year=year - 1)).strftime("%Y%m%d")

    LA = input_.location["lat"]
    LO = input_.location["lon"]

    # --- NASA POWER API Data Fetching ---
    endpoint = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"start={start_date_str}&end={end_date_str}"
        f"&latitude={LA}&longitude={LO}"
        f"&community=ag"
        f"&parameters=T2M_MAX%2CT2M_MIN%2CPRECTOTCORR%2CGWETROOT%2CALLSKY_SFC_PAR_TOT"
        f"&format=csv&header=false"
    )

    try:
        df = pd.read_csv(endpoint)
    except Exception as e:
        return {"error": f"Failed to fetch or read data from NASA POWER API. Details: {e}"}

    # --- Growing Season Parameters ---
    base_temp = input_.plant["base_temp"]
    end_day = doy + input_.plant["growing_days"]

    # --- Calculation of Averages ---
    parameters = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "GWETROOT", "ALLSKY_SFC_PAR_TOT"]
    yearly_averages = {param: [] for param in parameters}
    yearly_avg_temps = []
    yearly_diurnal_ranges = []
    yearly_total_gdds = []

    for i in range(11):
        current_year = year - 11 + i

        if end_day > 365:
            is_leap = (current_year % 4 == 0 and current_year % 100 != 0) or (current_year % 400 == 0)
            days_in_year = 366 if is_leap else 365
            end_day_next_year = end_day - days_in_year

            df1 = df[(df["YEAR"] == current_year) & (df["DOY"] >= doy)]
            df2 = df[(df["YEAR"] == current_year + 1) & (df["DOY"] <= end_day_next_year)]
            env_df = pd.concat([df1, df2])
        else:
            env_df = df[(df["YEAR"] == current_year) & (df["DOY"] >= doy) & (df["DOY"] <= end_day)]

        if not env_df.empty:
            for param in parameters:
                if param in env_df.columns:
                    yearly_averages[param].append(env_df[param].mean())

            if "T2M_MAX" in env_df.columns and "T2M_MIN" in env_df.columns:
                avg_daily_temp = (env_df["T2M_MAX"] + env_df["T2M_MIN"]) / 2
                yearly_avg_temps.append(avg_daily_temp.mean())

                diurnal_range = env_df["T2M_MAX"] - env_df["T2M_MIN"]
                yearly_diurnal_ranges.append(diurnal_range.mean())

                daily_gdd = avg_daily_temp - base_temp
                daily_gdd[daily_gdd < 0] = 0
                yearly_total_gdds.append(daily_gdd.sum())

    # --- Final 11-Year Average Calculation ---
    eleven_year_averages = {}
    for param, avgs in yearly_averages.items():
        if avgs:
            eleven_year_averages[param] = sum(avgs) / len(avgs)

    if yearly_avg_temps:
        eleven_year_averages["avg_temperature"] = sum(yearly_avg_temps) / len(yearly_avg_temps)
    if yearly_diurnal_ranges:
        eleven_year_averages["diurnal_temp_range"] = sum(yearly_diurnal_ranges) / len(yearly_diurnal_ranges)
    if yearly_total_gdds:
        eleven_year_averages["avg_total_gdd"] = sum(yearly_total_gdds) / len(yearly_total_gdds)

    # --- JSON Output ---
    result_json = {
        "calculation_period": {
            "start_year": year - 11,
            "end_year": year - 1,
            "duration_years": 11,
        },
        "growing_season_averages": eleven_year_averages,
    }

    return result_json

def crop_recommend_data_process(input_: Input_cla):
    year = int(datetime.datetime.now().year)
    month = datetime.datetime.now().month
    day = datetime.datetime.now().day

    start_date_str = f"{str(year-11)}0101"
    end_date_str = f"{str(year)}{month}{day}"

    LA = input_.location["lat"]
    LO = input_.location["lon"]

    endpoint = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"start={start_date_str}&end={end_date_str}"
        f"&latitude={LA}&longitude={LO}"
        f"&community=ag"
        f"&parameters=T2M_MAX%2CT2M_MIN%2CPRECTOTCORR%2CRH2M%2CALLSKY_SFC_PAR_TOT"
        f"&format=csv&header=false"
    )

    df = pd.read_csv(endpoint)


    parameters = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "RH2M", "ALLSKY_SFC_PAR_TOT"]
    yearly_averages = {param: [] for param in parameters}
    yearly_avg_temps = []

    for i in range(11):
      current_year = year - 11 + i
      env_df = df[df["YEAR"] == current_year]

      for param in parameters:
        if param in env_df.columns:
           yearly_averages[param].append(env_df[param].mean())
        if "T2M_MAX" in env_df.columns and "T2M_MIN" in env_df.columns:
          avg_daily_temp = (env_df["T2M_MAX"] + env_df["T2M_MIN"]) / 2
          yearly_avg_temps.append(avg_daily_temp.mean())
    
    eleven_year_averages = {}
    for param, avgs in yearly_averages.items():
        if avgs:
            eleven_year_averages[param] = sum(avgs) / len(avgs)
    
    if yearly_avg_temps:
        eleven_year_averages["avg_temperature"] = sum(yearly_avg_temps) / len(yearly_avg_temps)

    elevation = requests.get(
                             f"https://api.open-elevation.com/api/v1/lookup?locations={LA},{LO}")
    elevation = elevation.json()
    elevation = elevation["results"][0]["elevation"]
  
    eleven_year_averages["elevation"] = elevation

    return eleven_year_averages

  

             



@app.post("/crop_recommendation_fastapi")
def crop_recommendation(input_: Input_cla):
  msg = {"error": "Model not loaded. Please check server logs."}
  json_msg = jsonable_encoder(msg)
  if regressor is None or ct_cla is None:
    return JSONResponse(content=json_msg, status_code=500)
  
  data = crop_recommend_data_process(input_)

  try:

    input_df = [[
      data["avg_temperature"].item(),
      data["PRECTOTCORR"].item(),
      data["RH2M"].item(),
      data["ALLSKY_SFC_PAR_TOT"].item(),
      data["elevation"],
      input_.sun_exposure 
    ]]
    transformed_input = ct_cla.transform(input_df)
    pred = classifier.predict(transformed_input)
    pred = le.inverse_transform(pred)

    
    res = {
       "msg": "good",
       "plant": pred[0]
    }

    json_data = jsonable_encoder(res)

    return JSONResponse(content=json_data, status_code=200)

  except:
    msg = {"status": 500}
    return JSONResponse(content=msg, status_code=500)

@app.post("/yield_prediction_fastapi")
def yield_prediction(input_: Input):
  print(input)
  msg = {"error": "Model not loaded. Please check server logs."}
  json_msg = jsonable_encoder(msg)
  if regressor is None or ct_reg is None:
    return JSONResponse(content=json_msg, status_code=500)
  data = dataProcess(input_)
  data = data["growing_season_averages"]
  inputs = [[
      input_.plant["name"], 
      data["T2M_MIN"].item(), 
      data["T2M_MAX"].item(), 
      data["avg_temperature"].item(), 
      data["diurnal_temp_range"].item(), 
      data["avg_total_gdd"].item(), 
      data['PRECTOTCORR'].item(), 
      data["ALLSKY_SFC_PAR_TOT"].item()]]
    

  transformed_input = ct_reg.transform(inputs)
  
  y_pred = regressor.predict(transformed_input)
  data = {
      "predicted_yield": y_pred[0] * 1000 * input_.area,
      "units": "sq_meters"
  }

  json_data = jsonable_encoder(data)
  print(json_data)
  return JSONResponse(content=json_data)