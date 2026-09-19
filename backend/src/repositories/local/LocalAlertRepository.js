import { IAlertRepository } from "../interfaces/contracts.js";

export class LocalAlertRepository extends IAlertRepository {
  constructor() {
    super();
    this.alerts = [];
    this.maxAlerts = 1000;

    // Seed realistic starting alerts
    this.seedInitialAlerts();
  }

  seedInitialAlerts() {
    const now = Date.now();
    this.alerts = [
      {
        id: 'alert_init_01',
        timestamp: new Date(now - 12 * 60 * 1000).toISOString(),
        source: 'building',
        source_id: 'bldg_a_elec',
        building_id: 'building_a',
        zone_id: 'bldg_a_elec',
        severity: 'WARNING',
        title: 'Thermal Index Spike: Electrical Room',
        message: 'Electrical load reached 92 kW with ambient temp 28.5°C in Building A Electrical Room.',
        score: 62.5,
        acknowledged: false,
        acknowledged_at: null,
        acknowledged_by: null,
        metadata: { building: 'Building A', zone: 'Electrical Room' },
      },
      {
        id: 'alert_init_02',
        timestamp: new Date(now - 34 * 60 * 1000).toISOString(),
        source: 'forest',
        source_id: 'geo_high_desert_plateau',
        building_id: null,
        zone_id: null,
        severity: 'CRITICAL',
        title: 'High Desert Plateau Red Flag Warning',
        message: 'Relative humidity dropped to 14% with wind gusts exceeding 26 km/h. Severe wildfire propagation potential.',
        score: 78.4,
        acknowledged: false,
        acknowledged_at: null,
        acknowledged_by: null,
        metadata: { region: 'High Desert Plateau', fwi: 48.0 },
      },
      {
        id: 'alert_init_03',
        timestamp: new Date(now - 95 * 60 * 1000).toISOString(),
        source: 'building',
        source_id: 'bldg_c_kitchen',
        building_id: 'building_c',
        zone_id: 'bldg_c_kitchen',
        severity: 'INFO',
        title: 'Routine Exhaust Ventilation Check',
        message: 'Kitchen particulate sensor calibrated normally.',
        score: 18.0,
        acknowledged: true,
        acknowledged_at: new Date(now - 60 * 60 * 1000).toISOString(),
        acknowledged_by: 'safety_officer',
        metadata: { building: 'Building C', zone: 'Kitchen' },
      }
    ];
  }

  async saveAlert(alertData) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: alertData.timestamp || new Date().toISOString(),
      source: alertData.source || "system",
      source_id: alertData.source_id || null,
      building_id: alertData.building_id || null,
      zone_id: alertData.zone_id || null,
      severity: alertData.severity || "WARNING",
      title: alertData.title,
      message: alertData.message,
      score: alertData.score || 0,
      acknowledged: false,
      acknowledged_at: null,
      acknowledged_by: null,
      metadata: alertData.metadata || {},
    };

    this.alerts.unshift(alert);
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.pop();
    }
    return alert;
  }

  async getActiveAlerts() {
    return this.alerts;
  }

  async getAlerts(filters = {}) {
    let result = this.alerts;

    if (filters.severity) {
      result = result.filter((a) => a.severity.toLowerCase() === filters.severity.toLowerCase());
    }
    if (filters.source) {
      result = result.filter((a) => a.source === filters.source);
    }
    if (filters.building_id) {
      result = result.filter((a) => a.building_id === filters.building_id);
    }
    if (filters.acknowledged !== undefined) {
      result = result.filter((a) => a.acknowledged === filters.acknowledged);
    }

    const limit = Math.min(Number(filters.limit || 100), 500);
    return result.slice(0, limit);
  }

  async acknowledgeAlert(alertId, acknowledgedBy = "operator") {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return null;

    alert.acknowledged = true;
    alert.acknowledged_at = new Date().toISOString();
    alert.acknowledged_by = acknowledgedBy;
    return alert;
  }

  async getActiveAlertsCount() {
    return this.alerts.filter((a) => !a.acknowledged).length;
  }
}
