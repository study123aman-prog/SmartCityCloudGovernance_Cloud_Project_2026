from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    temperature: float = Field(ge=-10, le=50)
    oxygenLevel: float = Field(ge=10, le=30)
    humidity: float = Field(ge=0, le=100)
    windSpeed: float = Field(ge=0, le=50)
    pressure: float = Field(ge=900, le=1050)
    rainfall: float = Field(ge=0, le=500)


class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    probabilities: dict[str, float]
    model_version: str
