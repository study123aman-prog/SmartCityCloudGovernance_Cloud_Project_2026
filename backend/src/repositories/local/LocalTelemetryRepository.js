import { ITelemetryRepository } from "../interfaces/contracts.js";
import { INITIAL_BUILDINGS } from "../../config/buildingTopology.js";

export class LocalTelemetryRepository extends ITelemetryRepository {
  constructor() {
    super();
    this.telemetryStore = [];
    this.maxHistory = 3000;
    this.latestByZone = new Map();

    // Pre-seed realistic baseline telemetry for all building zones and forest station
    this.seedInitialTelemetry();
  }

  seedInitialTelemetry() {
    const now = new Date().toISOString();

    // Regional forest station
    const forestStation = {
      zone_id: 'regional_forest_station',
      source_id: 'regional_forest_station',
      temperature: 32.5,
      humidity: 28.0,
      wind_speed: 15.0,
      pressure: 1008.5,
      rainfall: 0.0,
      oxygen_level: 20.95,
      fwi: 28.4,
      timestamp: now,
    };
    this.latestByZone.set('regional_forest_station', forestStation);
    this.telemetryStore.push(forestStation);

    // Seed zones from topology
    INITIAL_BUILDINGS.forEach((bldg) => {
      bldg.zones.forEach((zone) => {
        let temp = 22.0;
        let humidity = 48.0;
        let smoke = 0.3;
        let load = 35.0;

        if (zone.type === 'electrical') {
          temp = 28.5;
          load = 92.0;
          smoke = 1.2;
        } else if (zone.type === 'kitchen') {
          temp = 31.0;
          humidity = 55.0;
          smoke = 1.8;
          load = 75.0;
        } else if (zone.type === 'server_room') {
          temp = 19.5;
          humidity = 40.0;
          load = 88.0;
        } else if (zone.type === 'lab') {
          temp = 23.5;
          load = 55.0;
          smoke = 0.6;
        }

        const reading = {
          zone_id: zone.id,
          source_id: zone.id,
          building_id: bldg.id,
          temperature: temp,
          humidity,
          smoke_index: smoke,
          electrical_load: load,
          occupancy: zone.occupancy || 0,
          wind_speed: 4.5,
          zone_type: zone.type,
          flammability: zone.flammability || 2.5,
          timestamp: now,
        };

        this.latestByZone.set(zone.id, reading);
        this.telemetryStore.push(reading);
      });
    });
  }

  async saveTelemetry(telemetry) {
    const record = {
      id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: telemetry.timestamp || new Date().toISOString(),
      ...telemetry,
    };
    this.telemetryStore.unshift(record);
    if (telemetry.zone_id || telemetry.source_id) {
      this.latestByZone.set(telemetry.zone_id || telemetry.source_id, record);
    }
    if (this.telemetryStore.length > this.maxHistory) {
      this.telemetryStore.pop();
    }
    return record;
  }

  async recordTelemetry(telemetry) {
    return this.saveTelemetry(telemetry);
  }

  async getLatestAll() {
    const map = {};
    this.latestByZone.forEach((v, k) => {
      map[k] = v;
    });
    return map;
  }

  async getLatestByZone(zoneId) {
    return this.latestByZone.get(zoneId) || null;
  }

  async getLatestTelemetry(filters = {}) {
    if (Object.keys(filters).length === 0) {
      return this.telemetryStore[0] || null;
    }
    return (
      this.telemetryStore.find((item) => {
        return Object.entries(filters).every(([k, v]) => item[k] === v);
      }) || null
    );
  }

  async getTelemetryHistory(filters = {}, limit = 100) {
    let result = this.telemetryStore;
    if (Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([k, v]) => item[k] === v);
      });
    }
    return result.slice(0, limit);
  }
}
