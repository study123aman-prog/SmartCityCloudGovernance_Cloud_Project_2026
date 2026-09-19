/**
 * FireGuard AI - 6-Hour Time-Series Fire Risk Forecast Engine
 * 
 * Computes deterministic meteorological diurnal progression (temperature curves,
 * humidity desiccation, convective wind shifts) and evaluates forward fire risk
 * for Current, +1h, +2h, +3h, +4h, +5h, and +6h intervals.
 */

import { mlClient } from '../mlClient.js';
import { riskFusionEngine } from '../risk/riskFusionEngine.js';

export class ForecastEngine {
  /**
   * Generate 6-hour forward fire risk forecasts
   * @param {Object} currentConditions - Current telemetry readings
   * @param {string} [domain] - 'overall' | 'forest' | 'building'
   */
  async generateForecast(currentConditions = {}, domain = 'overall') {
    const baseTemp = Number(currentConditions.temperature ?? 30.0);
    const baseHumidity = Number(currentConditions.humidity ?? 35.0);
    const baseWind = Number(currentConditions.wind_speed ?? 12.0);
    const baseRainfall = Number(currentConditions.rainfall ?? 0.0);
    const baseSmoke = Number(currentConditions.smoke_index ?? 1.0);
    const baseLoad = Number(currentConditions.electrical_load ?? 65.0);

    const now = new Date();
    const forecastTimeline = [];

    // Horizon offsets in hours: 0, 1, 2, 3, 4, 5, 6
    const hours = [0, 1, 2, 3, 4, 5, 6];

    for (const h of hours) {
      const forecastTime = new Date(now.getTime() + h * 3600 * 1000);
      const label = h === 0 ? 'Current' : `+${h}h (${forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

      // Atmospheric diurnal curve adjustments (peak heat around mid-afternoon, humidity drop)
      // sinusoidal cycle modeling diurnal swing
      const diurnalFactor = Math.sin((h / 6) * Math.PI);
      const projTemp = Number((baseTemp + (diurnalFactor * 3.5)).toFixed(1));
      const projHumidity = Number((Math.max(10, baseHumidity - (diurnalFactor * 6.0))).toFixed(1));
      const projWind = Number((baseWind + (diurnalFactor * 2.8)).toFixed(1));
      const projSmoke = Number((Math.max(0.1, baseSmoke + (h * 0.25 * (baseTemp > 32 ? 1 : -0.2)))).toFixed(1));
      const projLoad = Number((baseLoad + (h % 2 === 0 ? 5.0 : -3.0)).toFixed(1));

      // Forest prediction for projected weather
      const forestPred = await mlClient.predictForest({
        temperature: projTemp,
        humidity: projHumidity,
        wind_speed: projWind,
        rainfall: baseRainfall,
        oxygen_level: 20.95,
        pressure: 1012.0,
      });

      // Building prediction
      const bldgPred = await mlClient.predictBuilding({
        temperature: projTemp,
        humidity: projHumidity,
        smoke_index: projSmoke,
        electrical_load: projLoad,
        occupancy: 10,
        wind_speed: projWind,
        zone_type: 'corridor',
        flammability: 2.5,
      });

      // Compute weather risk index from humidity & wind
      const weatherRiskScore = Math.min(100, Math.max(0, (projTemp * 1.2) - (projHumidity * 0.4) + (projWind * 1.5)));

      // Multi-domain fusion
      const fused = riskFusionEngine.fuse({
        forestScore: forestPred.risk_score,
        weatherScore: weatherRiskScore,
        buildingScore: bldgPred.risk_score,
        exposureScore: Math.min(100, forestPred.risk_score * 0.8),
      });

      forecastTimeline.push({
        hour_offset: h,
        label,
        timestamp: forecastTime.toISOString(),
        projected_weather: {
          temperature: projTemp,
          humidity: projHumidity,
          wind_speed: projWind,
          rainfall: baseRainfall,
          smoke_index: projSmoke,
        },
        forest_risk: {
          score: forestPred.risk_score,
          probability: forestPred.probability,
          category: forestPred.risk_category,
        },
        building_risk: {
          score: bldgPred.risk_score,
          probability: bldgPred.probability,
          category: bldgPred.risk_category,
        },
        weather_risk_score: Number(weatherRiskScore.toFixed(1)),
        overall_hazard_score: fused.overall_fire_hazard_score,
        overall_hazard_level: fused.overall_fire_hazard_level,
      });
    }

    // Determine peak risk period
    const peakInterval = [...forecastTimeline].sort((a, b) => b.overall_hazard_score - a.overall_hazard_score)[0];

    return {
      generated_at: now.toISOString(),
      horizon_hours: 6,
      current_level: forecastTimeline[0].overall_hazard_level,
      peak_level: peakInterval.overall_hazard_level,
      peak_label: peakInterval.label,
      timeline: forecastTimeline,
    };
  }
}

export const forecastEngine = new ForecastEngine();
