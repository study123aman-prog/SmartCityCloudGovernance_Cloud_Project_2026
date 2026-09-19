import { whatIfSimulator } from '../services/simulation/whatIfSimulator.js';
import { repositories } from '../repositories/index.js';

export function createSimulationController() {
  const buildingRepo = repositories.buildings;

  return {
    async runFireSimulation(request, response) {
      try {
        const {
          building_id,
          origin_zone_id,
          initial_severity = 'HIGH',
          temperature = 38.0,
          humidity = 22.0,
          wind = 12.0,
          occupancy,
          duration = 6,
        } = request.body;

        if (!building_id || !origin_zone_id) {
          return response.status(400).json({
            error: 'Missing required parameters: building_id and origin_zone_id are required.',
          });
        }

        const building = await buildingRepo.getBuildingById(building_id);
        if (!building) {
          return response.status(404).json({ error: `Building '${building_id}' not found` });
        }

        const simulation = whatIfSimulator.runSimulation(building, {
          origin_zone_id,
          initial_severity,
          temperature,
          humidity,
          wind,
          occupancy,
          duration,
        });

        return response.json({ status: 'success', simulation });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },
  };
}
