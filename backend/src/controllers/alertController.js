import { repositories } from '../repositories/index.js';

export function createAlertController() {
  const alertRepo = repositories.alerts;

  return {
    async getAlerts(request, response) {
      try {
        const { severity, building_id } = request.query;
        let alerts = await alertRepo.getActiveAlerts();

        if (severity) {
          alerts = alerts.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
        }
        if (building_id) {
          alerts = alerts.filter((a) => a.building_id === building_id);
        }

        const counts = {
          total: alerts.length,
          critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
          warning: alerts.filter((a) => a.severity === 'WARNING').length,
          info: alerts.filter((a) => a.severity === 'INFO').length,
        };

        return response.json({
          status: 'success',
          counts,
          alerts,
        });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async acknowledgeAlert(request, response) {
      try {
        const { id } = request.params;
        const success = await alertRepo.acknowledgeAlert(id);
        if (!success) {
          return response.status(404).json({ error: `Alert '${id}' not found` });
        }
        return response.json({ status: 'success', message: `Alert '${id}' acknowledged` });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async createAlert(request, response) {
      try {
        const { title, message, severity = 'WARNING', building_id, zone_id, score = 65 } = request.body;
        const created = await alertRepo.saveAlert({
          title,
          message,
          severity,
          building_id,
          zone_id,
          score,
          source: 'manual_operator',
        });
        return response.status(201).json({ status: 'success', alert: created });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },
  };
}
