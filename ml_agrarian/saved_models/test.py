import joblib
regressor = joblib.load("../saved_models/yield_prediction_regressor.joblib")
ct_reg = joblib.load("../saved_models/yield_prediction_transformer.joblib")

classifier = joblib.load("../saved_models/crop_recommendation_classifier.joblib")
ct_cla = joblib.load("../saved_models/crop_recommendation_transformer.joblib")
le = joblib.load("../saved_models/crop_recommendation_labelencoder.joblib")

input_ = [[25.231445804326675, 6.022300355905791, 82.35322716044341, 450.0, 'Full Sun']]

ct_cla.transform(input_)
