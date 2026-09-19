import axios from 'axios';
import { env } from '../config/env.js';

const ML_BASE_URL = env.mlServiceUrl || 'http://localhost:8000';

class MLClient {
  constructor(baseUrl = ML_BASE_URL) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 4000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async predictForest(telemetry) {
    try {
      const payload = {
        temperature: Number(telemetry.temperature ?? 25.0),
        humidity: Number(telemetry.humidity ?? 45.0),
        wind_speed: Number(telemetry.wind_speed ?? 10.0),
        pressure: Number(telemetry.pressure ?? 1013.25),
        rainfall: Number(telemetry.rainfall ?? 0.0),
        oxygen_level: Number(telemetry.oxygen_level ?? 20.95),
        latitude: telemetry.latitude !== undefined ? Number(telemetry.latitude) : null,
        longitude: telemetry.longitude !== undefined ? Number(telemetry.longitude) : null,
        ffmc: telemetry.ffmc !== undefined ? Number(telemetry.ffmc) : null,
        dmc: telemetry.dmc !== undefined ? Number(telemetry.dmc) : null,
        dc: telemetry.dc !== undefined ? Number(telemetry.dc) : null,
        isi: telemetry.isi !== undefined ? Number(telemetry.isi) : null,
        bui: telemetry.bui !== undefined ? Number(telemetry.bui) : null,
        fwi: telemetry.fwi !== undefined ? Number(telemetry.fwi) : null,
      };

      const response = await this.client.post('/predict/forest', payload);
      return {
        source: 'ml_model',
        probability: response.data.forest_fire_probability,
        risk_score: response.data.forest_risk_score,
        risk_category: response.data.forest_risk_category,
        inputs: response.data.inputs_used,
      };
    } catch (error) {
      console.warn('[MLClient] Forest ML inference call failed, using heuristic fallback:', error.message);
      return this.fallbackForest(telemetry);
    }
  }

  async predictBuilding(telemetry) {
    try {
      const payload = {
        temperature: Number(telemetry.temperature ?? 22.0),
        humidity: Number(telemetry.humidity ?? 45.0),
        smoke_index: Number(telemetry.smoke_index ?? 0.5),
        electrical_load: Number(telemetry.electrical_load ?? 50.0),
        occupancy: Number(telemetry.occupancy ?? 5),
        wind_speed: Number(telemetry.wind_speed ?? 5.0),
        zone_type: String(telemetry.zone_type ?? 'corridor'),
        flammability: Number(telemetry.flammability ?? 2.0),
      };

      const response = await this.client.post('/predict/building', payload);
      return {
        source: 'ml_model',
        probability: response.data.building_fire_probability,
        risk_score: response.data.building_risk_score,
        risk_category: response.data.building_risk_category,
        inputs: response.data.inputs_used,
      };
    } catch (error) {
      console.warn('[MLClient] Building ML inference call failed, using heuristic fallback:', error.message);
      return this.fallbackBuilding(telemetry);
    }
  }

  async getFeatureImportance() {
    try {
      const response = await this.client.get('/feature-importance');
      return response.data.importances;
    } catch (error) {
      return { forest: [], building: [] };
    }
  }

  async getMetrics() {
    try {
      const response = await this.client.get('/metrics');
      return response.data;
    } catch (error) {
      return { forest: {}, building: {} };
    }
  }

  fallbackForest(t) {
    const temp = Number(t.temperature ?? 25);
    const hum = Math.max(1, Number(t.humidity ?? 45));
    const wind = Number(t.wind_speed ?? 10);
    const rain = Number(t.rainfall ?? 0);
    let raw = (temp * 1.5) - (hum * 0.4) + (wind * 1.2) - (rain * 8.0);
    const score = Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
    let cat = 'LOW';
    if (score >= 75) cat = 'CRITICAL';
    else if (score >= 50) cat = 'HIGH';
    else if (score >= 25) cat = 'MEDIUM';

    return {
      source: 'heuristic_fallback',
      probability: Math.round((score / 100) * 1000) / 1000,
      risk_score: score,
      risk_category: cat,
      inputs: t,
    };
  }

  fallbackBuilding(t) {
    const temp = Number(t.temperature ?? 22);
    const smoke = Number(t.smoke_index ?? 0.5);
    const load = Number(t.electrical_load ?? 40);
    const flam = Number(t.flammability ?? 2.0);
    let raw = (smoke * 4.0) + (temp * 0.8) + (load * 0.15) + (flam * 3.0) - 20;
    const score = Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
    let cat = 'LOW';
    if (score >= 75) cat = 'CRITICAL';
    else if (score >= 50) cat = 'HIGH';
    else if (score >= 25) cat = 'MEDIUM';

    return {
      source: 'heuristic_fallback',
      probability: Math.round((score / 100) * 1000) / 1000,
      risk_score: score,
      risk_category: cat,
      inputs: t,
    };
  }
}

export const mlClient = new MLClient();
