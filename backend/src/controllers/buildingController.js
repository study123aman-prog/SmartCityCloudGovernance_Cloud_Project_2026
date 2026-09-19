import { repositories } from '../repositories/index.js';
import { evacuationRouter } from '../services/evacuation/evacuationRouter.js';
import { hazardPropagationEngine } from '../services/propagation/hazardPropagation.js';

export function createBuildingController() {
  const buildingRepo = repositories.buildings;
  const telemetryRepo = repositories.telemetry;
  const riskRepo = repositories.risks;

  return {
    async getBuildings(request, response) {
      try {
        const buildings = await buildingRepo.getAllBuildings();
        const telemetryMap = await telemetryRepo.getLatestAll();
        const latestRisks = await riskRepo.getLatestRisks();

        // Enrich buildings with summary statistics
        const enriched = buildings.map((b) => {
          const zoneRisks = {};
          let totalOccupancy = 0;
          let maxRiskScore = 0;
          let maxRiskLevel = 'LOW';

          b.zones.forEach((z) => {
            totalOccupancy += (z.occupancy || 0);
            const risk = latestRisks[z.id]?.score ?? z.initial_risk ?? 5.0;
            zoneRisks[z.id] = risk;
            if (risk > maxRiskScore) {
              maxRiskScore = risk;
              maxRiskLevel = latestRisks[z.id]?.level ?? 'LOW';
            }
          });

          return {
            id: b.id,
            name: b.name,
            code: b.code,
            campus: b.campus,
            total_area_sqm: b.total_area_sqm,
            coordinates: b.coordinates,
            zone_count: b.zones.length,
            total_occupancy: totalOccupancy,
            highest_risk_score: Number(maxRiskScore.toFixed(1)),
            highest_risk_level: maxRiskLevel,
          };
        });

        return response.json({ status: 'success', buildings: enriched });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async getBuildingById(request, response) {
      try {
        const { building_id } = request.params;
        const building = await buildingRepo.getBuildingById(building_id);
        if (!building) {
          return response.status(404).json({ error: `Building '${building_id}' not found` });
        }

        const telemetryMap = await telemetryRepo.getLatestAll();
        const latestRisks = await riskRepo.getLatestRisks();

        // Calculate propagation state
        const currentRisks = {};
        building.zones.forEach((z) => {
          currentRisks[z.id] = latestRisks[z.id]?.score ?? z.initial_risk ?? 5.0;
        });

        const propagation = hazardPropagationEngine.propagateRisk(building, currentRisks);

        const enrichedZones = building.zones.map((z) => {
          const telemetry = telemetryMap[z.id] || {
            temperature: 22.0,
            humidity: 50.0,
            smoke_index: 0.5,
            electrical_load: 40.0,
          };
          const propState = propagation.zone_states.find((zs) => zs.id === z.id);

          return {
            ...z,
            telemetry,
            risk_score: propState?.risk_score ?? currentRisks[z.id],
            risk_level: propState?.risk_level ?? 'LOW',
            is_origin_hotspot: propState?.is_origin_hotspot ?? false,
            is_propagated_impact: propState?.is_propagated_impact ?? false,
          };
        });

        return response.json({
          status: 'success',
          building: {
            ...building,
            zones: enrichedZones,
            propagation_summary: {
              hotspots: propagation.hotspots_identified,
              affected_zones: propagation.affected_connected_zones.length,
              occupancy_at_risk: propagation.total_occupancy_at_risk,
            },
          },
        });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async getZones(request, response) {
      try {
        const { building_id } = request.query;
        let buildings = await buildingRepo.getAllBuildings();
        if (building_id) {
          buildings = buildings.filter((b) => b.id === building_id);
        }

        const telemetryMap = await telemetryRepo.getLatestAll();
        const latestRisks = await riskRepo.getLatestRisks();

        const allZones = [];
        buildings.forEach((b) => {
          b.zones.forEach((z) => {
            const telemetry = telemetryMap[z.id] || null;
            const risk = latestRisks[z.id] || { score: z.initial_risk ?? 5.0, level: 'LOW' };
            allZones.push({
              ...z,
              building_id: b.id,
              building_name: b.name,
              telemetry,
              risk_score: risk.score,
              risk_level: risk.level,
            });
          });
        });

        return response.json({ status: 'success', total: allZones.length, zones: allZones });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async getEvacuationRoute(request, response) {
      try {
        const { building_id } = request.params;
        const { start_zone_id } = request.query;

        const building = await buildingRepo.getBuildingById(building_id);
        if (!building) {
          return response.status(404).json({ error: `Building '${building_id}' not found` });
        }

        const originZoneId = start_zone_id || building.zones.find((z) => !z.is_exit)?.id;
        if (!originZoneId) {
          return response.status(400).json({ error: 'start_zone_id is required' });
        }

        const latestRisks = await riskRepo.getLatestRisks();
        const zoneRisks = {};
        building.zones.forEach((z) => {
          zoneRisks[z.id] = latestRisks[z.id]?.score ?? z.initial_risk ?? 5.0;
        });

        const routeResult = evacuationRouter.findSafestRoute(building, originZoneId, zoneRisks);
        return response.json({ status: 'success', evacuation_plan: routeResult });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },
  };
}
