import { repositories } from '../repositories/index.js';

export function createTelemetryController() {
  const telemetryRepo = repositories.telemetry;

  return {
    async getLatestTelemetry(request, response) {
      try {
        const { zone_id, building_id } = request.query;
        if (zone_id) {
          const telemetry = await telemetryRepo.getLatestByZone(zone_id);
          return response.json({ status: 'success', telemetry });
        }

        const allTelemetry = await telemetryRepo.getLatestAll();
        return response.json({
          status: 'success',
          count: Object.keys(allTelemetry).length,
          telemetry: allTelemetry,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async recordTelemetry(request, response) {
      try {
        const payload = request.body;
        const saved = await telemetryRepo.recordTelemetry(payload);
        return response.status(201).json({ status: 'success', telemetry: saved });
      } catch (error) {
        return response.status(400).json({ error: error.message });
      }
    },
  };
}
