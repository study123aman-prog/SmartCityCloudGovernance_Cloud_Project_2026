/**
 * FireGuard AI - Algorithmic Fire Hazard Propagation Engine
 * 
 * NOTE: This is an algorithmic risk-propagation model for spatial awareness
 * and rapid response decision-support. It is not physically accurate
 * computational fluid dynamics (CFD) or combustion thermodynamics.
 */

export class HazardPropagationEngine {
  constructor(options = {}) {
    this.decayFactor = options.decayFactor ?? 0.72; // attenuation per hop
    this.highRiskThreshold = options.highRiskThreshold ?? 50.0;
    this.criticalRiskThreshold = options.criticalRiskThreshold ?? 75.0;
  }

  /**
   * Propagate risk across building zones from high/critical hotspots
   * @param {Object} building - Building object with zones and connections
   * @param {Object} [currentRisks] - Map of zone_id -> current risk score (0-100)
   * @param {Object} [options] - Simulation environmental factors (wind, humidity, etc.)
   */
  propagateRisk(building, currentRisks = {}, options = {}) {
    if (!building || !Array.isArray(building.zones)) {
      throw new Error('Valid building with zones array is required');
    }

    const {
      externalWindSpeed = 5.0,
      relativeHumidity = 45.0,
      maxHops = 3,
    } = options;

    // Environmental propagation modifier: dry air and wind increase propagation
    const humidityDamping = Math.max(0.6, 1.0 - (relativeHumidity - 30) * 0.005);
    const windMultiplier = Math.min(1.4, 1.0 + (externalWindSpeed * 0.015));
    const globalMultiplier = humidityDamping * windMultiplier;

    // Build zone lookup map
    const zoneMap = new Map();
    const zoneRisks = new Map();

    building.zones.forEach((zone) => {
      zoneMap.set(zone.id, zone);
      const initial = currentRisks[zone.id] !== undefined
        ? Number(currentRisks[zone.id])
        : (zone.initial_risk || 5.0);
      zoneRisks.set(zone.id, initial);
    });

    // Identify primary hazard source zones (HIGH or CRITICAL)
    const activeHotspots = [];
    zoneRisks.forEach((score, zoneId) => {
      if (score >= this.highRiskThreshold) {
        activeHotspots.push({ zoneId, score });
      }
    });

    const affectedPropagation = {};
    const impactedOccupancy = new Set();

    // Multi-hop breadth-first propagation
    activeHotspots.forEach(({ zoneId: sourceId, score: sourceScore }) => {
      const visited = new Set([sourceId]);
      // Queue element: { currentZoneId, currentImpulse, hopCount, path }
      const queue = [{
        currentZoneId: sourceId,
        impulse: sourceScore,
        hop: 0,
        path: [sourceId],
      }];

      while (queue.length > 0) {
        const { currentZoneId, impulse, hop, path } = queue.shift();
        if (hop >= maxHops) continue;

        const currentZone = zoneMap.get(currentZoneId);
        if (!currentZone || !Array.isArray(currentZone.connected_zones)) continue;

        currentZone.connected_zones.forEach((conn) => {
          const targetId = conn.target_id;
          const targetZone = zoneMap.get(targetId);
          if (!targetZone) return;

          // Flammability factor (1.0 to 5.0 normalized)
          const flammabilityFactor = (targetZone.flammability || 2.5) / 3.0;
          // Connection link hazard factor
          const linkHazard = conn.hazard_factor || 1.0;
          // Distance attenuation (closer = faster transfer)
          const distMeters = conn.distance_meters || 5.0;
          const distFactor = 1.0 / (1.0 + (distMeters * 0.08));

          // Transferred risk impulse
          const deltaImpulse = impulse * this.decayFactor * flammabilityFactor * linkHazard * distFactor * globalMultiplier;

          if (deltaImpulse > 8.0) { // meaningful threshold
            const existingRisk = zoneRisks.get(targetId) || 0;
            const newCalculatedRisk = Math.min(100.0, Math.max(existingRisk, existingRisk + deltaImpulse * 0.5));
            zoneRisks.set(targetId, newCalculatedRisk);

            if (!affectedPropagation[targetId]) {
              affectedPropagation[targetId] = {
                zone_id: targetId,
                zone_name: targetZone.name,
                is_exit: !!targetZone.is_exit,
                base_risk: existingRisk,
                propagated_risk: Number(newCalculatedRisk.toFixed(1)),
                risk_level: this.scoreToCategory(newCalculatedRisk),
                occupancy: targetZone.occupancy || 0,
                spread_sources: [],
              };
            } else {
              affectedPropagation[targetId].propagated_risk = Math.max(
                affectedPropagation[targetId].propagated_risk,
                Number(newCalculatedRisk.toFixed(1))
              );
              affectedPropagation[targetId].risk_level = this.scoreToCategory(affectedPropagation[targetId].propagated_risk);
            }

            affectedPropagation[targetId].spread_sources.push({
              from_zone_id: currentZoneId,
              hop: hop + 1,
              transfer_impulse: Number(deltaImpulse.toFixed(1)),
              path: [...path, targetId],
            });

            if (targetZone.occupancy > 0) {
              impactedOccupancy.add(targetId);
            }

            if (!visited.has(targetId) && hop + 1 < maxHops) {
              visited.add(targetId);
              queue.push({
                currentZoneId: targetId,
                impulse: deltaImpulse,
                hop: hop + 1,
                path: [...path, targetId],
              });
            }
          }
        });
      }
    });

    // Compile full building state after propagation
    const zoneStates = building.zones.map((zone) => {
      const finalScore = Number((zoneRisks.get(zone.id) || 0).toFixed(1));
      return {
        id: zone.id,
        name: zone.name,
        type: zone.type,
        flammability: zone.flammability,
        occupancy: zone.occupancy,
        is_exit: !!zone.is_exit,
        coordinates: zone.coordinates,
        risk_score: finalScore,
        risk_level: this.scoreToCategory(finalScore),
        is_origin_hotspot: activeHotspots.some((h) => h.zoneId === zone.id),
        is_propagated_impact: !!affectedPropagation[zone.id],
      };
    });

    const totalOccupancyAtRisk = Array.from(impactedOccupancy).reduce((sum, zid) => {
      const z = zoneMap.get(zid);
      return sum + (z ? (z.occupancy || 0) : 0);
    }, 0);

    return {
      building_id: building.id,
      building_name: building.name,
      hotspots_identified: activeHotspots.length,
      affected_connected_zones: Object.values(affectedPropagation),
      total_occupancy_at_risk: totalOccupancyAtRisk,
      environmental_multiplier: Number(globalMultiplier.toFixed(2)),
      zone_states: zoneStates,
      simulation_note: 'Algorithmic risk propagation model for emergency decision-making, not CFD combustion physics.',
    };
  }

  scoreToCategory(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
}

export const hazardPropagationEngine = new HazardPropagationEngine();
