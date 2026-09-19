"""
FireGuard AI - Forest Fire Inference Engine
"""

import os
import sys
from typing import Dict, Any, Union
import joblib
import pandas as pd
import numpy as np

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from preprocessing.forest_preprocessor import ForestPreprocessor, ALL_FOREST_FEATURES

DEFAULT_MODEL_PATH = os.path.join(current_dir, "models", "forest_model.joblib")


def score_to_category(score: float) -> str:
    if score >= 75.0:
        return "CRITICAL"
    elif score >= 50.0:
        return "HIGH"
    elif score >= 25.0:
        return "MEDIUM"
    return "LOW"


class ForestPredictor:
    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Forest model file not found at: {model_path}. Train model first.")
        
        package = joblib.load(model_path)
        self.preprocessor = package["preprocessor"]
        self.classifier = package["classifier"]
        self.regressor = package.get("regressor")
        self.metrics = package.get("metrics", {})

    def predict(self, input_data: Union[Dict[str, Any], pd.DataFrame]) -> Dict[str, Any]:
        if isinstance(input_data, dict):
            df = pd.DataFrame([input_data])
        else:
            df = input_data.copy()

        # Transform features
        X_proc = self.preprocessor.transform(df)

        # Classification probability
        probabilities = self.classifier.predict_proba(X_proc)
        hazard_prob = float(probabilities[0][1])

        # Risk score calculation (using regressor + calibrated prob)
        if self.regressor is not None:
            raw_score = float(self.regressor.predict(X_proc)[0])
            # Blend regressor score with predicted probability for maximum consistency
            blended_score = max(0.0, min(100.0, (raw_score * 0.7) + (hazard_prob * 100.0 * 0.3)))
        else:
            blended_score = hazard_prob * 100.0

        risk_category = score_to_category(blended_score)

        inputs_clean = {}
        for k in df.columns:
            if k in ALL_FOREST_FEATURES:
                val = df[k].iloc[0]
                if hasattr(val, "item"):
                    val = val.item()
                inputs_clean[k] = val

        return {
            "forest_fire_probability": round(hazard_prob, 4),
            "forest_risk_score": round(blended_score, 2),
            "forest_risk_category": risk_category,
            "inputs_used": inputs_clean
        }


# Singleton instance helper
_forest_predictor = None

def get_forest_predictor(model_path: str = DEFAULT_MODEL_PATH) -> ForestPredictor:
    global _forest_predictor
    if _forest_predictor is None:
        _forest_predictor = ForestPredictor(model_path)
    return _forest_predictor


if __name__ == "__main__":
    predictor = get_forest_predictor()
    sample = {
        "temperature": 36.5,
        "humidity": 22.0,
        "wind_speed": 18.5,
        "pressure": 995.0,
        "rainfall": 0.0,
        "oxygen_level": 21.0,
        "fwi": 42.0,
        "ffmc": 91.2
    }
    result = predictor.predict(sample)
    print("Forest Inference Output:", result)
