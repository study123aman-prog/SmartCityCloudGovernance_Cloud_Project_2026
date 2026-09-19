import { mlClient } from '../services/mlClient.js';
import { ruleRiskEngine } from '../services/risk/ruleEngine.js';
import { riskFusionEngine } from '../services/risk/riskFusionEngine.js';
import { repositories } from '../repositories/index.js';

export function createRiskController() {
  const telemetryRepo = repositories.telemetry;
  const buildingRepo = repositories.buildings;
  const alertService = repositories.alerts; // alert repository

  return {
    async getCurrentRisk(request, response) {
      try {
        const latestTelemetry = await telemetryRepo.getLatestAll();
        // Extract sample forest reading
        const forestTelemetry = latestTelemetry['regional_forest_station'] || {
          temperature: 31.5,
          humidity: 34.0,
          wind_speed: 16.0,
          pressure: 1008.0,
          rainfall: 0.0,
          oxygen_level: 20.95,
          fwi: 24.5,
        };

        const forestMl = await mlClient.predictForest(forestTelemetry);
        const forestRule = ruleRiskEngine.evaluateForestRules(forestTelemetry);

        // Building aggregate risk
        const buildings = await buildingRepo.getAllBuildings();
        let maxBldgScore = 0;
        let criticalZonesCount = 0;
        let totalOccupantsAtRisk = 0;

        for (const b of buildings) {
          for (const z of b.zones) {
            const zTelemetry = latestTelemetry[z.id] || {
              temperature: 22.0,
              humidity: 45.0,
              smoke_index: 0.5,
              electrical_load: 40.0,
              occupancy: z.occupancy || 0,
              zone_type: z.type,
              flammability: z.flammability || 2.5,
            };
            const bPred = await mlClient.predictBuilding({
              ...zTelemetry,
              zone_type: z.type,
              flammability: z.flammability || 2.5,
            });
            if (bPred.risk_score > maxBldgScore) {
              maxBldgScore = bPred.risk_score;
            }
            if (bPred.risk_category === 'HIGH' || bPred.risk_category === 'CRITICAL') {
              criticalZonesCount++;
              totalOccupantsAtRisk += (z.occupancy || 0);
            }
          }
        }

        const weatherScore = Math.min(100, Math.max(0, (forestTelemetry.temperature * 1.3) - (forestTelemetry.humidity * 0.4) + (forestTelemetry.wind_speed * 1.4)));
        const exposureScore = Math.min(100, (forestMl.risk_score * 0.5) + (maxBldgScore * 0.5));

        const fused = riskFusionEngine.fuse({
          forestScore: forestMl.risk_score,
          weatherScore,
          buildingScore: maxBldgScore,
          exposureScore,
        });

        return response.json({
          status: 'success',
          overall_fire_hazard_score: fused.overall_fire_hazard_score,
          overall_fire_hazard_level: fused.overall_fire_hazard_level,
          weights: fused.weights_applied,
          domain_scores: fused.domain_scores,
          domain_contributions: fused.domain_contributions,
          summary: {
            forest_risk_category: forestMl.risk_category,
            building_peak_risk: Number(maxBldgScore.toFixed(1)),
            critical_zones_count: criticalZonesCount,
            occupants_at_risk: totalOccupantsAtRisk,
          },
          methodology: fused.methodology,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async getForestRisk(request, response) {
      try {
        const payload = Object.keys(request.body || {}).length > 0 ? request.body : request.query;
        const telemetry = {
          temperature: Number(payload.temperature ?? 31.0),
          humidity: Number(payload.humidity ?? 35.0),
          wind_speed: Number(payload.wind_speed ?? 15.0),
          pressure: Number(payload.pressure ?? 1010.0),
          rainfall: Number(payload.rainfall ?? 0.0),
          oxygen_level: Number(payload.oxygen_level ?? 20.95),
          latitude: payload.latitude !== undefined ? Number(payload.latitude) : 38.5,
          longitude: payload.longitude !== undefined ? Number(payload.longitude) : -121.5,
          fwi: payload.fwi !== undefined ? Number(payload.fwi) : null,
          ffmc: payload.ffmc !== undefined ? Number(payload.ffmc) : null,
          dmc: payload.dmc !== undefined ? Number(payload.dmc) : null,
          dc: payload.dc !== undefined ? Number(payload.dc) : null,
          isi: payload.isi !== undefined ? Number(payload.isi) : null,
          bui: payload.bui !== undefined ? Number(payload.bui) : null,
        };

        const mlResult = await mlClient.predictForest(telemetry);
        const ruleResult = ruleRiskEngine.evaluateForestRules(telemetry);

        return response.json({
          status: 'success',
          domain: 'forest',
          ml_assessment: mlResult,
          rule_assessment: ruleResult,
          comparison: {
            ml_score: mlResult.risk_score,
            rule_score: ruleResult.score,
            ml_category: mlResult.risk_category,
            rule_category: ruleResult.category,
            delta_score: Number((mlResult.risk_score - ruleResult.score).toFixed(2)),
          },
          inputs: telemetry,
        });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async getBuildingRisk(request, response) {
      try {
        const payload = Object.keys(request.body || {}).length > 0 ? request.body : request.query;
        const telemetry = {
          temperature: Number(payload.temperature ?? 24.0),
          humidity: Number(payload.humidity ?? 45.0),
          smoke_index: Number(payload.smoke_index ?? 0.8),
          electrical_load: Number(payload.electrical_load ?? 45.0),
          occupancy: Number(payload.occupancy ?? 6),
          wind_speed: Number(payload.wind_speed ?? 4.0),
          zone_type: String(payload.zone_type ?? 'corridor'),
          flammability: Number(payload.flammability ?? 2.5),
        };

        const mlResult = await mlClient.predictBuilding(telemetry);
        const ruleResult = ruleRiskEngine.evaluateBuildingRules(telemetry);

        return response.json({
          status: 'success',
          domain: 'building',
          ml_assessment: mlResult,
          rule_assessment: ruleResult,
          comparison: {
            ml_score: mlResult.risk_score,
            rule_score: ruleResult.score,
            ml_category: mlResult.risk_category,
            rule_category: ruleResult.category,
            delta_score: Number((mlResult.risk_score - ruleResult.score).toFixed(2)),
          },
          inputs: telemetry,
        });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async getOverallRisk(request, response) {
      try {
        const {
          forest_score = 45,
          weather_score = 40,
          building_score = 30,
          exposure_score = 25,
        } = request.query;

        const fused = riskFusionEngine.fuse({
          forestScore: Number(forest_score),
          weatherScore: Number(weather_score),
          buildingScore: Number(building_score),
          exposureScore: Number(exposure_score),
        });

        return response.json({ status: 'success', ...fused });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },

    async updateWeights(request, response) {
      try {
        const { forest, weather, building, exposure } = request.body;
        riskFusionEngine.setWeights({
          forestWeight: forest !== undefined ? Number(forest) : undefined,
          weatherWeight: weather !== undefined ? Number(weather) : undefined,
          buildingWeight: building !== undefined ? Number(building) : undefined,
          exposureWeight: exposure !== undefined ? Number(exposure) : undefined,
        });
        return response.json({
          status: 'success',
          message: 'Risk fusion weights successfully updated',
          weights: riskFusionEngine.getWeights(),
        });
      } catch (error) {
        return response.status(400).json({ error: error.message });
      }
    },
  };
}
