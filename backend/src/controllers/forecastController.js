import { forecastEngine } from '../services/forecast/forecastEngine.js';
import { repositories } from '../repositories/index.js';

export function createForecastController() {
  const telemetryRepo = repositories.telemetry;

  return {
    async getForecast(request, response) {
      try {
        const latestTelemetry = await telemetryRepo.getLatestAll();
        const regionalConditions = latestTelemetry['regional_forest_station'] || {
          temperature: 32.5,
          humidity: 32.0,
          wind_speed: 16.0,
          rainfall: 0.0,
          smoke_index: 0.8,
          electrical_load: 65.0,
        };

        const forecast = await forecastEngine.generateForecast(regionalConditions);
        return response.json({ status: 'success', forecast });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },
  };
}
