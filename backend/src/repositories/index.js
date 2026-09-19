import { LocalBuildingRepository } from "./local/LocalBuildingRepository.js";
import { LocalTelemetryRepository } from "./local/LocalTelemetryRepository.js";
import { LocalRiskRepository } from "./local/LocalRiskRepository.js";
import { LocalAlertRepository } from "./local/LocalAlertRepository.js";
import { LocalStorageService } from "../services/storage/LocalStorageService.js";
import { LocalAlertService } from "../services/alerts/LocalAlertService.js";
import { LocalEventPublisher } from "../services/events/LocalEventPublisher.js";

// Canonical singleton repository instances for runtime local operation
export const repositories = {
  buildings: new LocalBuildingRepository(),
  telemetry: new LocalTelemetryRepository(),
  risks: new LocalRiskRepository(),
  alerts: new LocalAlertRepository(),
};

/**
 * Initializes and wires together all repositories and services for local operation.
 * 
 * NOTE FOR FUTURE AWS INTEGRATION:
 * To swap in AWS services later:
 * - Replace LocalTelemetryRepository with DynamoDBTelemetryRepository
 * - Replace LocalRiskRepository with DynamoDBRiskRepository
 * - Replace LocalAlertService with SNSIoTAlertService
 * - Replace LocalStorageService with S3ObjectStorageService
 * - Replace LocalEventPublisher with IoTCoreEventPublisher
 * See docs/aws-integration-guide.md for step-by-step instructions.
 */
export function createRepositoriesAndServices(config = {}) {
  const buildingRepository = repositories.buildings;
  const telemetryRepository = repositories.telemetry;
  const riskRepository = repositories.risks;
  const alertRepository = repositories.alerts;

  const storageService = new LocalStorageService(config.storageDir);
  const alertService = new LocalAlertService(alertRepository, config.alertThresholds);
  const eventPublisher = new LocalEventPublisher();

  return {
    buildingRepository,
    telemetryRepository,
    riskRepository,
    alertRepository,
    storageService,
    alertService,
    eventPublisher,
  };
}
