import { IAlertService } from "../../repositories/interfaces/contracts.js";

export class LocalAlertService extends IAlertService {
  constructor(alertRepository, thresholds = { warning: 60, critical: 85 }) {
    super();
    this.alertRepository = alertRepository;
    this.thresholds = thresholds;
    this.subscribers = new Set();
  }

  onAlert(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  async checkAndDispatch({ source, source_id, building_id, zone_id, score, details = {} }) {
    if (score >= this.thresholds.critical) {
      return this.dispatchAlert({
        source,
        source_id,
        building_id,
        zone_id,
        severity: "CRITICAL",
        title: `CRITICAL FIRE HAZARD: ${details.name || source_id || source}`,
        message: `Fire hazard score reached ${Math.round(score)}% (Critical threshold: ${this.thresholds.critical}%). Immediate response required.`,
        score,
        metadata: details,
      });
    } else if (score >= this.thresholds.warning) {
      return this.dispatchAlert({
        source,
        source_id,
        building_id,
        zone_id,
        severity: "WARNING",
        title: `ELEVATED FIRE RISK: ${details.name || source_id || source}`,
        message: `Fire hazard score reached ${Math.round(score)}% (Warning threshold: ${this.thresholds.warning}%). Monitor zone closely.`,
        score,
        metadata: details,
      });
    }
    return null;
  }

  async dispatchAlert(alertPayload) {
    const saved = await this.alertRepository.saveAlert(alertPayload);
    console.log(`[LocalAlertService] [${saved.severity}] ${saved.title} - ${saved.message}`);

    // Notify any registered in-process listeners (e.g. WebSocket or polling store)
    for (const callback of this.subscribers) {
      try {
        callback(saved);
      } catch (err) {
        console.error("Alert subscriber error:", err);
      }
    }
    return saved;
  }

  async getActiveAlerts() {
    return this.alertRepository.getAlerts({ acknowledged: false });
  }

  async acknowledgeAlert(alertId, acknowledgedBy = "operator") {
    return this.alertRepository.acknowledgeAlert(alertId, acknowledgedBy);
  }
}
