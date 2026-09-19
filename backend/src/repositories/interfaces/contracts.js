/**
 * FireGuard AI - Abstract Repository & Service Contracts
 * 
 * These contracts define the interface specifications for data persistence,
 * telemetry ingestion, risk records, alerts, and object storage.
 * 
 * In local development, these are fulfilled by the Local* implementations.
 * When integrating AWS later, create corresponding AWS* implementations (e.g.
 * DynamoDBRiskRepository, S3ObjectStorage, SNSIoTAlertService) adhering to these interfaces.
 */

export class ITelemetryRepository {
  async saveTelemetry(telemetry) { throw new Error("Method not implemented"); }
  async getLatestTelemetry(filters = {}) { throw new Error("Method not implemented"); }
  async getTelemetryHistory(filters = {}, limit = 100) { throw new Error("Method not implemented"); }
}

export class IRiskRepository {
  async saveRiskAssessment(assessment) { throw new Error("Method not implemented"); }
  async getLatestRisk(filters = {}) { throw new Error("Method not implemented"); }
  async getRiskHistory(filters = {}, limit = 100) { throw new Error("Method not implemented"); }
  async getRiskStats(filters = {}) { throw new Error("Method not implemented"); }
}

export class IAlertRepository {
  async saveAlert(alert) { throw new Error("Method not implemented"); }
  async getAlerts(filters = {}) { throw new Error("Method not implemented"); }
  async acknowledgeAlert(alertId, acknowledgedBy) { throw new Error("Method not implemented"); }
  async getActiveAlertsCount() { throw new Error("Method not implemented"); }
}

export class IBuildingRepository {
  async getAllBuildings() { throw new Error("Method not implemented"); }
  async getBuildingById(buildingId) { throw new Error("Method not implemented"); }
  async getAllZones(buildingId = null) { throw new Error("Method not implemented"); }
  async getZoneById(buildingId, zoneId) { throw new Error("Method not implemented"); }
  async updateZoneStatus(buildingId, zoneId, status) { throw new Error("Method not implemented"); }
}

export class IObjectStorageService {
  async storeFile(filename, buffer, contentType) { throw new Error("Method not implemented"); }
  async getFile(key) { throw new Error("Method not implemented"); }
  async listFiles(prefix = "") { throw new Error("Method not implemented"); }
  async createUploadUrl(filename, contentType) { throw new Error("Method not implemented"); }
}

export class IAlertService {
  async dispatchAlert(alertPayload) { throw new Error("Method not implemented"); }
  async getActiveAlerts() { throw new Error("Method not implemented"); }
  async acknowledgeAlert(alertId) { throw new Error("Method not implemented"); }
}

export class IEventPublisher {
  async publishEvent(topic, payload) { throw new Error("Method not implemented"); }
  async subscribe(topic, handler) { throw new Error("Method not implemented"); }
}
