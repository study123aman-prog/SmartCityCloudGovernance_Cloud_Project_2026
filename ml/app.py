"""
FireGuard AI - FastAPI Dual-Domain ML Inference Service
"""

import os
import sys
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from predict_forest import get_forest_predictor, ForestPredictor
from predict_building import get_building_predictor, BuildingPredictor
from feature_importance import get_feature_importances

forest_predictor: Optional[ForestPredictor] = None
building_predictor: Optional[BuildingPredictor] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global forest_predictor, building_predictor
    try:
        forest_predictor = get_forest_predictor()
        print("[ML Service] Forest predictor initialized successfully.")
    except Exception as e:
        print(f"[ML Service] Warning: Forest predictor failed to load: {e}")

    try:
        building_predictor = get_building_predictor()
        print("[ML Service] Building predictor initialized successfully.")
    except Exception as e:
        print(f"[ML Service] Warning: Building predictor failed to load: {e}")

    yield
    forest_predictor = None
    building_predictor = None


app = FastAPI(
    title="FireGuard AI - Dual-Domain ML Prediction Engine",
    description="Multi-Source Machine Learning Inference for Forest and Infrastructure Fire Risk",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ForestPredictionRequest(BaseModel):
    temperature: float = Field(..., ge=-20.0, le=60.0, description="Ambient temperature (°C)")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity (%)")
    wind_speed: float = Field(..., ge=0.0, le=100.0, description="Wind speed (km/h)")
    pressure: Optional[float] = Field(1013.25, description="Atmospheric pressure (hPa)")
    rainfall: Optional[float] = Field(0.0, ge=0.0, description="Recent precipitation (mm)")
    oxygen_level: Optional[float] = Field(20.95, description="Atmospheric oxygen (%)")
    latitude: Optional[float] = Field(None, description="Geographic latitude")
    longitude: Optional[float] = Field(None, description="Geographic longitude")
    ffmc: Optional[float] = Field(None, description="Fine Fuel Moisture Code")
    dmc: Optional[float] = Field(None, description="Duff Moisture Code")
    dc: Optional[float] = Field(None, description="Drought Code")
    isi: Optional[float] = Field(None, description="Initial Spread Index")
    bui: Optional[float] = Field(None, description="Buildup Index")
    fwi: Optional[float] = Field(None, description="Fire Weather Index")


class BuildingPredictionRequest(BaseModel):
    temperature: float = Field(..., ge=-10.0, le=120.0, description="Zone temperature (°C)")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Zone relative humidity (%)")
    smoke_index: float = Field(..., ge=0.0, le=100.0, description="Optical smoke density index")
    electrical_load: float = Field(..., ge=0.0, description="Power load percentage or kW")
    occupancy: int = Field(..., ge=0, description="Number of occupants present")
    wind_speed: Optional[float] = Field(5.0, ge=0.0, description="External/ventilation airflow (km/h)")
    zone_type: str = Field(..., description="Zone classification (electrical, server_room, kitchen, lab, etc.)")
    flammability: Optional[float] = Field(2.5, ge=1.0, le=5.0, description="Material fire hazard coefficient (1-5)")


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "service": "FireGuard AI ML Service",
        "version": "2.0.0",
        "models_loaded": {
            "forest": forest_predictor is not None,
            "building": building_predictor is not None,
        }
    }


@app.post("/predict/forest")
def predict_forest_fire(payload: ForestPredictionRequest) -> Dict[str, Any]:
    if forest_predictor is None:
        raise HTTPException(status_code=503, detail="Forest fire model not loaded")
    try:
        data = payload.model_dump()
        result = forest_predictor.predict(data)
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/building")
def predict_building_fire(payload: BuildingPredictionRequest) -> Dict[str, Any]:
    if building_predictor is None:
        raise HTTPException(status_code=503, detail="Building fire model not loaded")
    try:
        data = payload.model_dump()
        result = building_predictor.predict(data)
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Backward compatibility with legacy /predict endpoint
@app.post("/predict")
def predict_legacy(payload: ForestPredictionRequest) -> Dict[str, Any]:
    if forest_predictor is None:
        raise HTTPException(status_code=503, detail="Forest fire model not loaded")
    data = payload.model_dump()
    res = forest_predictor.predict(data)
    return {
        "fire_occurrence": int(res["forest_fire_probability"] >= 0.5),
        "probability": res["forest_fire_probability"],
        "confidence": round(max(res["forest_fire_probability"], 1.0 - res["forest_fire_probability"]), 4),
        "model_version": "2.0.0",
        "risk_category": res["forest_risk_category"],
        "risk_score": res["forest_risk_score"],
    }


@app.get("/feature-importance")
def feature_importance() -> Dict[str, Any]:
    try:
        return {"status": "success", "importances": get_feature_importances()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metrics")
def metrics() -> Dict[str, Any]:
    forest_metrics = getattr(forest_predictor, "metrics", {}) if forest_predictor else {}
    building_metrics = getattr(building_predictor, "metrics", {}) if building_predictor else {}
    return {
        "status": "success",
        "forest": forest_metrics,
        "building": building_metrics,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
