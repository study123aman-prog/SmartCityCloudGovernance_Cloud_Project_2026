"""
FireGuard AI - Building Fire Inference Engine
"""

import os
import sys
from typing import Dict, Any, Union
import joblib
import pandas as pd
import numpy as np

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from preprocessing.building_preprocessor import BuildingPreprocessor, NUMERICAL_BUILDING_FEATURES

DEFAULT_MODEL_PATH = os.path.join(current_dir, "models", "building_model.joblib")


def score_to_category(score: float) -> str:
    if score >= 75.0:
        return "CRITICAL"
    elif score >= 50.0:
        return "HIGH"
    elif score >= 25.0:
        return "MEDIUM"
    return "LOW"


class BuildingPredictor:
    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Building model file not found at: {model_path}. Train model first.")
        
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

        # Risk score calculation
        if self.regressor is not None:
            raw_score = float(self.regressor.predict(X_proc)[0])
            blended_score = max(0.0, min(100.0, (raw_score * 0.7) + (hazard_prob * 100.0 * 0.3)))
        else:
            blended_score = hazard_prob * 100.0

        risk_category = score_to_category(blended_score)

        inputs_clean = {}
        for k in df.columns:
            if k in NUMERICAL_BUILDING_FEATURES or k == "zone_type":
                val = df[k].iloc[0]
                if hasattr(val, "item"):
                    val = val.item()
                inputs_clean[k] = val

        return {
            "building_fire_probability": round(hazard_prob, 4),
            "building_risk_score": round(blended_score, 2),
            "building_risk_category": risk_category,
            "inputs_used": inputs_clean
        }


# Singleton instance helper
_building_predictor = None

def get_building_predictor(model_path: str = DEFAULT_MODEL_PATH) -> BuildingPredictor:
    global _building_predictor
    if _building_predictor is None:
        _building_predictor = BuildingPredictor(model_path)
    return _building_predictor


if __name__ == "__main__":
    predictor = get_building_predictor()
    sample = {
        "temperature": 45.0,
        "humidity": 18.0,
        "smoke_index": 12.5,
        "electrical_load": 140.0,
        "occupancy": 8,
        "wind_speed": 4.0,
        "zone_type": "electrical",
        "flammability": 4.5
    }
    result = predictor.predict(sample)
    print("Building Inference Output:", result)
