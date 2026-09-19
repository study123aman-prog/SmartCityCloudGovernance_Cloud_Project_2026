import unittest

from fastapi import HTTPException

import app as ml_app
from schemas.prediction import PredictionRequest


class StubModel:
    classes_ = [0, 1]

    def predict(self, features):
        self.features = features
        return [1]

    def predict_proba(self, features):
        return [[0.18, 0.82]]


class MlServiceTests(unittest.TestCase):
    def setUp(self):
        self.original_model = ml_app.model
        ml_app.model = StubModel()

    def tearDown(self):
        ml_app.model = self.original_model

    def test_prediction_preserves_model_feature_order_and_probability(self):
        request = PredictionRequest(
            temperature=35,
            oxygenLevel=20,
            humidity=30,
            windSpeed=20,
            pressure=1000,
            rainfall=2,
        )
        result = ml_app.predict(request)
        self.assertEqual(result.prediction, 1)
        self.assertEqual(result.probability, 0.82)
        self.assertEqual(list(ml_app.model.features.columns), ml_app.FEATURE_COLUMNS)

    def test_missing_model_returns_service_unavailable(self):
        ml_app.model = None
        with self.assertRaises(HTTPException) as context:
            ml_app.health()
        self.assertEqual(context.exception.status_code, 503)

    def test_invalid_input_is_rejected(self):
        with self.assertRaises(ValueError):
            PredictionRequest(
                temperature=35,
                oxygenLevel=20,
                humidity=30,
                windSpeed=20,
                pressure=1000,
                rainfall=-1,
            )


if __name__ == "__main__":
    unittest.main()