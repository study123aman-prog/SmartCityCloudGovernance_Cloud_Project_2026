/**
 * FireGuard AI - What-If Fire Simulation Engine
 * 
 * Simulates discrete-time hazard propagation and dynamic evacuation routing
 * across building topologies based on user-defined environmental & origin parameters.
 */

import crypto from 'crypto';
import { hazardPropagationEngine } from '../propagation/hazardPropagation.js';
import { evacuationRouter } from '../evacuation/evacuationRouter.js';

export class WhatIfSimulator {
  /**
   * Run multi-step fire propagation simulation
   * @param {Object} building - Building topology
   * @param {Object} params
   * @param {string} params.origin_zone_id
   * @param {string} [params.initial_severity] - 'MEDIUM', 'HIGH', 'CRITICAL'
   * @param {number} [params.temperature] - °C
   * @param {number} [params.humidity] - %
   * @param {number} [params.wind] - km/h
   * @param {number} [params.occupancy] - Optional override
   * @param {number} [params.duration] - Number of discrete intervals (default: 6)
   */
  runSimulation(building, params) {
    if (!building || !Array.isArray(building.zones)) {
      throw new Error('Valid building topology is required for simulation');
    }

    const originZone = building.zones.find((z) => z.id === params.origin_zone_id);
    if (!originZone) {
      throw new Error(`Origin zone '${params.origin_zone_id}' not found in building '${building.id}'`);
    }

    const simulationId = `sim_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const initialSeverity = params.initial_severity || 'HIGH';
    const temp = Number(params.temperature ?? 38.0);
    const humidity = Number(params.humidity ?? 22.0);
    const wind = Number(params.wind ?? 12.0);
    const duration = Math.max(3, Math.min(12, Number(params.duration ?? 6)));

    // Map initial severity to base score
    let baseOriginScore = 65.0;
    if (initialSeverity === 'CRITICAL') baseOriginScore = 95.0;
    else if (initialSeverity === 'HIGH') baseOriginScore = 75.0;
    else if (initialSeverity === 'MEDIUM') baseOriginScore = 45.0;
    else baseOriginScore = 25.0;

    // Track state over discrete time steps
    const currentZoneRisks = {};
    building.zones.forEach((z) => {
      currentZoneRisks[z.id] = z.id === originZone.id ? baseOriginScore : 5.0;
    });

    const steps = [];

    for (let t = 0; t <= duration; t++) {
      // Step 0 is initial state, subsequent steps apply growth + propagation
      if (t > 0) {
        // Growth at origin zone
        currentZoneRisks[originZone.id] = Math.min(100.0, currentZoneRisks[originZone.id] + 5.0);

        // Run algorithmic propagation
        const propResult = hazardPropagationEngine.propagateRisk(building, currentZoneRisks, {
          externalWindSpeed: wind,
          relativeHumidity: humidity,
          maxHops: Math.min(4, Math.floor(t * 0.8) + 1),
        });

        // Update working risks from propagation
        propResult.zone_states.forEach((zs) => {
          currentZoneRisks[zs.id] = Math.max(currentZoneRisks[zs.id], zs.risk_score);
        });
      }

      // Compute evacuation routes from non-exit zones at current step
      const egressSampleZones = building.zones.filter((z) => !z.is_exit && z.type !== 'exit');
      const sampleEvacRoutes = {};
      let primaryRecommendedExit = null;

      egressSampleZones.forEach((sz) => {
        try {
          const routeRes = evacuationRouter.findSafestRoute(building, sz.id, currentZoneRisks);
          sampleEvacRoutes[sz.id] = routeRes;
          if (!primaryRecommendedExit && routeRes.destination_exit) {
            primaryRecommendedExit = routeRes.destination_exit;
          }
        } catch (e) {
          sampleEvacRoutes[sz.id] = { error: e.message };
        }
      });

      // Snapshot zone statuses for this step
      const zoneSnapshots = building.zones.map((z) => {
        const score = currentZoneRisks[z.id];
        return {
          id: z.id,
          name: z.name,
          type: z.type,
          is_exit: !!z.is_exit,
          coordinates: z.coordinates,
          flammability: z.flammability,
          occupancy: z.occupancy,
          risk_score: Number(score.toFixed(1)),
          risk_level: this.scoreToCategory(score),
          is_origin: z.id === originZone.id,
        };
      });

      const highRiskZones = zoneSnapshots.filter((zs) => zs.risk_score >= 50.0);
      const totalOccupantsInHazard = highRiskZones.reduce((acc, zs) => acc + (zs.occupancy || 0), 0);

      steps.push({
        step_index: t,
        elapsed_minutes: t * 2,
        narrative: t === 0
          ? `Ignition detected at ${originZone.name} (Severity: ${initialSeverity})`
          : `Step ${t}: Hazard progressed across ${highRiskZones.length} elevated zones. High-risk occupancy: ${totalOccupantsInHazard}.`,
        affected_zones_count: highRiskZones.length,
        occupancy_at_risk: totalOccupantsInHazard,
        primary_recommended_exit: primaryRecommendedExit,
        zone_states: zoneSnapshots,
        evacuation_routes: sampleEvacRoutes,
      });
    }

    const finalStep = steps[steps.length - 1];

    return {
      simulation_id: simulationId,
      created_at: new Date().toISOString(),
      building: {
        id: building.id,
        name: building.name,
        code: building.code,
      },
      parameters: {
        origin_zone_id: originZone.id,
        origin_zone_name: originZone.name,
        initial_severity: initialSeverity,
        temperature: temp,
        humidity,
        wind,
        duration_steps: duration,
      },
      total_steps: steps.length,
      final_affected_zones: finalStep.affected_zones_count,
      final_occupancy_at_risk: finalStep.occupancy_at_risk,
      recommended_exit: finalStep.primary_recommended_exit,
      steps,
      disclaimer: 'Algorithmic simulation model intended for training and evacuation planning. Not computational fluid dynamics.',
    };
  }

  scoreToCategory(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
}

export const whatIfSimulator = new WhatIfSimulator();
