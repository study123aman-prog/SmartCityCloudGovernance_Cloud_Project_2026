import { mlClient } from '../services/mlClient.js';
import { repositories } from '../repositories/index.js';

export function createAnalyticsController() {
  const buildingRepo = repositories.buildings;
  const telemetryRepo = repositories.telemetry;

  return {
    async getAnalytics(request, response) {
      try {
        const buildings = await buildingRepo.getAllBuildings();
        const mlMetrics = await mlClient.getMetrics();
        const featureImportances = await mlClient.getFeatureImportance();

        // 24-hour historical sensor trend series
        const now = Date.now();
        const sensorTrends = [];
        for (let i = 23; i >= 0; i--) {
          const timestamp = new Date(now - i * 3600 * 1000);
          const hour = timestamp.getHours();
          // Diurnal wave for temperature peaking at 15:00
          const diurnalPhase = Math.sin(((hour - 8) / 24) * 2 * Math.PI);
          const temp = Number((24.0 + diurnalPhase * 9.5).toFixed(1));
          const humidity = Number((Math.max(12, 60.0 - diurnalPhase * 28.0)).toFixed(1));
          const wind = Number((10.0 + Math.abs(diurnalPhase) * 11.0).toFixed(1));
          const smoke = Number((0.4 + (hour >= 11 && hour <= 17 ? 1.8 : 0.2)).toFixed(2));
          const electricalLoad = Number((45.0 + (hour >= 9 && hour <= 19 ? 35.0 : 5.0)).toFixed(1));
          const rainfall = hour >= 2 && hour <= 5 ? 1.2 : 0.0;
          
          // Synthesized hazard score
          const riskScore = Math.max(5, Math.min(95, Math.round((temp * 1.4) - (humidity * 0.4) + (wind * 1.1) + (smoke * 5.0) - 15)));

          sensorTrends.push({
            timestamp: timestamp.toISOString(),
            hour_label: `${hour.toString().padStart(2, '0')}:00`,
            temperature: temp,
            humidity,
            wind_speed: wind,
            smoke_index: smoke,
            electrical_load: electricalLoad,
            rainfall,
            fire_risk_score: riskScore,
          });
        }

        // Building comparison statistics
        const buildingComparison = buildings.map((b) => {
          let totalOccupancy = 0;
          let sumRisk = 0;
          let maxTemp = 0;
          let maxSmoke = 0;
          let maxLoad = 0;

          b.zones.forEach((z) => {
            totalOccupancy += (z.occupancy || 0);
            const r = z.initial_risk || 10;
            sumRisk += r;
            if (z.type === 'electrical') maxLoad = 135;
            if (z.type === 'kitchen') maxTemp = 36.5;
            if (z.type === 'lab') maxSmoke = 2.4;
          });

          return {
            building_id: b.id,
            name: b.name,
            code: b.code,
            zone_count: b.zones.length,
            total_occupancy: totalOccupancy,
            average_risk_score: Number((sumRisk / b.zones.length).toFixed(1)),
            peak_temperature: maxTemp || 28.4,
            peak_smoke: maxSmoke || 0.8,
            peak_electrical_load: maxLoad || 78.0,
            area_sqm: b.total_area_sqm,
          };
        });

        // Risk distribution statistics
        const riskDistribution = [
          { category: 'LOW', count: 14, percentage: 56.0, color: '#10b981' },
          { category: 'MEDIUM', count: 7, percentage: 28.0, color: '#f59e0b' },
          { category: 'HIGH', count: 3, percentage: 12.0, color: '#f97316' },
          { category: 'CRITICAL', count: 1, percentage: 4.0, color: '#ef4444' },
        ];

        // Regional risk comparison
        const regionalComparison = [
          { region: 'Sierra Foothills', risk_score: 72.4, status: 'HIGH', temp: 36.2, wind: 18.5 },
          { region: 'High Desert Plateau', risk_score: 84.1, status: 'CRITICAL', temp: 39.5, wind: 26.4 },
          { region: 'Pacific Coast Ridge', risk_score: 48.6, status: 'MEDIUM', temp: 29.8, wind: 22.0 },
          { region: 'Cascades Valley', risk_score: 28.2, status: 'MEDIUM', temp: 28.5, wind: 11.2 },
          { region: 'Redwood Coastal Basin', risk_score: 11.5, status: 'LOW', temp: 21.4, wind: 8.0 },
          { region: 'Angeles Forest Ridge', risk_score: 76.8, status: 'CRITICAL', temp: 37.0, wind: 20.5 },
        ];

        return response.json({
          status: 'success',
          sensor_trends: sensorTrends,
          building_comparison: buildingComparison,
          risk_distribution: riskDistribution,
          regional_comparison: regionalComparison,
          ml_performance: mlMetrics,
          feature_importances: featureImportances,
        });
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    },
  };
}
