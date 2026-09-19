# Weather Data Source Reference

This directory contains meteorological observations and diurnal progression baselines utilized by the FireGuard AI Risk Fusion and Forecasting engines.

## Telemetry Attributes
- `temperature`: Ambient dry-bulb temperature (°C)
- `humidity`: Relative atmospheric humidity (%)
- `wind_speed`: 10-meter sustained wind velocity (km/h)
- `pressure`: Sea-level atmospheric barometric pressure (hPa)
- `rainfall`: 24-hour cumulative precipitation (mm)
- `oxygen_level`: Ambient oxygen concentration percentage (%)

## Diurnal Modeling
Diurnal solar cycles and atmospheric thermal swings are modeled dynamically in `backend/src/services/forecast/forecastEngine.js`.
