/**
 * FireGuard AI - Risk Fusion Engine
 * 
 * Synthesizes multi-source hazard inputs:
 * 1. Forest Fire Risk (from ML/weather forest model)
 * 2. Weather Risk (atmospheric humidity, dry lightning, wind gust severity)
 * 3. Building Risk (zone telemetry, smoke density, electrical overload)
 * 4. Exposure Risk (proximity to wildland-urban interface, occupant density)
 * 
 * Computes:
 * - overall_fire_hazard_score (0.0 to 100.0)
 * - overall_fire_hazard_level (LOW, MEDIUM, HIGH, CRITICAL)
 * - contribution breakdowns and methodology metadata
 */

import { env } from '../../config/env.js';

export class RiskFusionEngine {
  constructor(weights = {}) {
    this.setWeights(weights);
  }

  setWeights({
    forestWeight = env.FOREST_WEIGHT ?? 0.35,
    weatherWeight = env.WEATHER_WEIGHT ?? 0.20,
    buildingWeight = env.BUILDING_WEIGHT ?? 0.30,
    exposureWeight = env.EXPOSURE_WEIGHT ?? 0.15,
  } = {}) {
    const total = forestWeight + weatherWeight + buildingWeight + exposureWeight;
    if (total <= 0) {
      throw new Error('Total fusion weights must be strictly positive');
    }
    // Normalize weights to sum to 1.0
    this.weights = {
      forest: Number((forestWeight / total).toFixed(4)),
      weather: Number((weatherWeight / total).toFixed(4)),
      building: Number((buildingWeight / total).toFixed(4)),
      exposure: Number((exposureWeight / total).toFixed(4)),
    };
  }

  getWeights() {
    return { ...this.weights };
  }

  /**
   * Fuse multi-domain risks into a unified hazard assessment
   * @param {Object} input
   * @param {number} input.forestScore - (0 - 100)
   * @param {number} input.weatherScore - (0 - 100)
   * @param {number} input.buildingScore - (0 - 100)
   * @param {number} input.exposureScore - (0 - 100)
   * @param {Object} [input.context] - Extra diagnostic info
   */
  fuse({
    forestScore = 0,
    weatherScore = 0,
    buildingScore = 0,
    exposureScore = 0,
    context = {},
  }) {
    const fScore = Math.max(0, Math.min(100, Number(forestScore)));
    const wScore = Math.max(0, Math.min(100, Number(weatherScore)));
    const bScore = Math.max(0, Math.min(100, Number(buildingScore)));
    const eScore = Math.max(0, Math.min(100, Number(exposureScore)));

    const forestContribution = fScore * this.weights.forest;
    const weatherContribution = wScore * this.weights.weather;
    const buildingContribution = bScore * this.weights.building;
    const exposureContribution = eScore * this.weights.exposure;

    const overallScore = Number((
      forestContribution +
      weatherContribution +
      buildingContribution +
      exposureContribution
    ).toFixed(2));

    const overallLevel = this.scoreToLevel(overallScore);

    return {
      overall_fire_hazard_score: overallScore,
      overall_fire_hazard_level: overallLevel,
      methodology: 'Multi-Source Weighted Linear Convex Combination',
      weights_applied: { ...this.weights },
      domain_scores: {
        forest_risk: fScore,
        weather_risk: wScore,
        building_risk: bScore,
        exposure_risk: eScore,
      },
      domain_contributions: {
        forest: Number(forestContribution.toFixed(2)),
        weather: Number(weatherContribution.toFixed(2)),
        building: Number(buildingContribution.toFixed(2)),
        exposure: Number(exposureContribution.toFixed(2)),
      },
      timestamp: new Date().toISOString(),
      context,
    };
  }

  scoreToLevel(score) {
    if (score >= 75.0) return 'CRITICAL';
    if (score >= 50.0) return 'HIGH';
    if (score >= 25.0) return 'MEDIUM';
    return 'LOW';
  }
}

export const riskFusionEngine = new RiskFusionEngine();
