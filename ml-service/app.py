import os
import pickle
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException

from schemas.prediction import PredictionRequest, PredictionResponse


MODEL_PATH = Path(__file__).parent / "model" / "model.pkl"
MODEL_VERSION = os.getenv("MODEL_VERSION", "1.0")
FEATURE_COLUMNS = [
    "Temperature",
    "Oxygen Level",
    "Humidity",
    "Wind Speed",
    "Pressure",
    "Rainfall",
]

model: Any | None = None


def load_model() -> Any:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

    with MODEL_PATH.open("rb") as model_file:
        return pickle.load(model_file)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    try:
        model = load_model()
    except Exception as exc:
        print(f"Warning: model could not be loaded on startup: {exc}")
    yield
    model = None


app = FastAPI(
    title="FireGuard ML Service",
    version=MODEL_VERSION,
    description="Software-only forest fire classification service.",
    lifespan=lifespan,
)


@app.get("/health")
def health() -> dict[str, Any]:
    if model is None:
        raise HTTPException(status_code=503, detail="ML model is not loaded")
    return {
        "status": "ok",
        "model_version": MODEL_VERSION,
        "model_loaded": True,
        "features": FEATURE_COLUMNS,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    if model is None:
        raise HTTPException(status_code=503, detail="ML model is not loaded")

    features = pd.DataFrame(
        [
            {
                "Temperature": request.temperature,
                "Oxygen Level": request.oxygenLevel,
                "Humidity": request.humidity,
                "Wind Speed": request.windSpeed,
                "Pressure": request.pressure,
                "Rainfall": request.rainfall,
            }
        ],
        columns=FEATURE_COLUMNS,
    )

    try:
        prediction_value = int(model.predict(features)[0])
        class_probabilities = model.predict_proba(features)[0]
        class_labels = model.classes_
    except Exception as error:
        raise HTTPException(status_code=500, detail="Model prediction failed") from error

    probabilities = {
        str(int(label)): round(float(probability), 6)
        for label, probability in zip(class_labels, class_probabilities)
    }

    return PredictionResponse(
        prediction=prediction_value,
        probability=probabilities.get("1", 0.0),
        probabilities=probabilities,
        model_version=MODEL_VERSION,
    )
