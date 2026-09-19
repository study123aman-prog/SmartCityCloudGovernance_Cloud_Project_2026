import { Router } from 'express';
import { createBuildingController } from '../controllers/buildingController.js';
import { createRiskController } from '../controllers/riskController.js';
import { createForecastController } from '../controllers/forecastController.js';
import { createSimulationController } from '../controllers/simulationController.js';
import { createGeospatialController } from '../controllers/geospatialController.js';
import { createAlertController } from '../controllers/alertController.js';
import { createAnalyticsController } from '../controllers/analyticsController.js';
import { createTelemetryController } from '../controllers/telemetryController.js';

export function createFireGuardRoutes() {
  const router = Router();

  const buildingController = createBuildingController();
  const riskController = createRiskController();
  const forecastController = createForecastController();
  const simulationController = createSimulationController();
  const geospatialController = createGeospatialController();
  const alertController = createAlertController();
  const analyticsController = createAnalyticsController();
  const telemetryController = createTelemetryController();

  // Buildings & Zones
  router.get('/buildings', buildingController.getBuildings);
  router.get('/buildings/:building_id', buildingController.getBuildingById);
  router.get('/zones', buildingController.getZones);
  router.get('/buildings/:building_id/evacuation-route', buildingController.getEvacuationRoute);

  // Risk Assessment
  router.get('/risk/current', riskController.getCurrentRisk);
  router.get('/risk/forest', riskController.getForestRisk);
  router.post('/risk/forest', riskController.getForestRisk);
  router.get('/risk/building', riskController.getBuildingRisk);
  router.post('/risk/building', riskController.getBuildingRisk);
  router.get('/risk/overall', riskController.getOverallRisk);
  router.post('/risk/weights', riskController.updateWeights);

  // Time-Series Forecasting
  router.get('/forecast', forecastController.getForecast);

  // What-If Simulation
  router.post('/simulation/fire', simulationController.runFireSimulation);

  // Geospatial Risk Map
  router.get('/geospatial/risk', geospatialController.getGeospatialRisk);

  // Local Alerts
  router.get('/alerts', alertController.getAlerts);
  router.post('/alerts/:id/ack', alertController.acknowledgeAlert);
  router.post('/alerts', alertController.createAlert);

  // Multi-Sensor Analytics
  router.get('/analytics', analyticsController.getAnalytics);

  // Telemetry
  router.get('/telemetry/latest', telemetryController.getLatestTelemetry);
  router.post('/telemetry', telemetryController.recordTelemetry);

  return router;
}
