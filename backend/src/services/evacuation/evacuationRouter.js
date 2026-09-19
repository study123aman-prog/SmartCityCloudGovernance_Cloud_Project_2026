/**
 * FireGuard AI - Dynamic Safest Evacuation Router (Dijkstra / A*)
 * 
 * Computes the safest, lowest-hazard egress route from any origin zone to the safest available exit.
 * Penalizes high-risk zones, bypasses blocked/critical zones, and factors in distance & congestion.
 */

export class EvacuationRouter {
  constructor(options = {}) {
    this.riskWeight = options.riskWeight ?? 2.5;
    this.congestionWeight = options.congestionWeight ?? 0.15;
    this.criticalThreshold = options.criticalThreshold ?? 75.0;
  }

  /**
   * Find safest evacuation path from a specific zone to the nearest safe exit
   * @param {Object} building - Building topology with zones
   * @param {string} startZoneId - Origin zone ID
   * @param {Object} [zoneRiskScores] - Map of zone_id -> risk score (0-100)
   * @param {Array<string>} [blockedZoneIds] - Explicitly blocked zones
   */
  findSafestRoute(building, startZoneId, zoneRiskScores = {}, blockedZoneIds = []) {
    if (!building || !Array.isArray(building.zones)) {
      throw new Error('Valid building with zones is required');
    }

    const zoneMap = new Map();
    const exits = [];

    building.zones.forEach((z) => {
      zoneMap.set(z.id, z);
      if (z.is_exit || z.type === 'exit') {
        exits.push(z);
      }
    });

    const startZone = zoneMap.get(startZoneId);
    if (!startZone) {
      throw new Error(`Start zone '${startZoneId}' not found in building '${building.id}'`);
    }

    // If start is already an exit
    if (startZone.is_exit || startZone.type === 'exit') {
      return {
        building_id: building.id,
        start_zone: { id: startZone.id, name: startZone.name },
        destination_exit: { id: startZone.id, name: startZone.name },
        route: [startZone.id],
        route_details: [{ id: startZone.id, name: startZone.name, risk: 0 }],
        total_distance_meters: 0,
        risk: 0,
        safety_rating: 'OPTIMAL',
        warnings: ['Already located at designated exit'],
        alternate_routes: [],
      };
    }

    if (exits.length === 0) {
      throw new Error(`Building '${building.id}' has no registered evacuation exits`);
    }

    const blockedSet = new Set(blockedZoneIds);
    const warnings = [];

    // Dynamically flag zones with CRITICAL risk as dangerous/blocked
    building.zones.forEach((z) => {
      const r = zoneRiskScores[z.id] !== undefined ? Number(zoneRiskScores[z.id]) : (z.initial_risk || 0);
      if (r >= this.criticalThreshold && z.id !== startZoneId) {
        blockedSet.add(z.id);
        warnings.push(`Zone '${z.name}' is heavily compromised (${r.toFixed(0)} risk) — marked impassable`);
      }
    });

    // Execute Dijkstra to find safest routes to all available exits
    const candidateRoutes = [];

    exits.forEach((exit) => {
      const pathResult = this._dijkstra(building, startZoneId, exit.id, zoneRiskScores, blockedSet);
      if (pathResult) {
        candidateRoutes.push(pathResult);
      } else if (blockedSet.has(exit.id)) {
        warnings.push(`Exit '${exit.name}' is unsafe due to fire propagation`);
      }
    });

    // Fallback: If all exits blocked by critical zones, retry allowing critical zones with extreme penalty
    if (candidateRoutes.length === 0) {
      warnings.push('CRITICAL: Direct primary egress blocked. Computing emergency bypass path through highest available survivability corridor.');
      exits.forEach((exit) => {
        const pathResult = this._dijkstra(building, startZoneId, exit.id, zoneRiskScores, new Set());
        if (pathResult) {
          candidateRoutes.push(pathResult);
        }
      });
    }

    if (candidateRoutes.length === 0) {
      return {
        building_id: building.id,
        start_zone: { id: startZone.id, name: startZone.name },
        destination_exit: null,
        route: [],
        route_details: [],
        total_distance_meters: 0,
        risk: 100,
        safety_rating: 'CRITICAL_NO_PATH',
        warnings: [...warnings, 'No viable evacuation route found. Direct rescue required.'],
        alternate_routes: [],
      };
    }

    // Sort candidates by total cost (safest first)
    candidateRoutes.sort((a, b) => a.totalCost - b.totalCost);
    const best = candidateRoutes[0];

    // Determine safety rating
    let safetyRating = 'OPTIMAL';
    if (best.maxRiskAlongPath >= 50) {
      safetyRating = 'HAZARDOUS';
    } else if (best.maxRiskAlongPath >= 25) {
      safetyRating = 'CAUTION';
    }

    return {
      building_id: building.id,
      start_zone: { id: startZone.id, name: startZone.name },
      destination_exit: { id: best.destinationId, name: best.destinationName },
      route: best.path,
      route_details: best.path.map((zid) => {
        const z = zoneMap.get(zid);
        const r = zoneRiskScores[zid] !== undefined ? Number(zoneRiskScores[zid]) : (z?.initial_risk || 0);
        return {
          id: zid,
          name: z?.name || zid,
          type: z?.type,
          risk: Number(r.toFixed(1)),
          coordinates: z?.coordinates,
        };
      }),
      total_distance_meters: Number(best.totalDistance.toFixed(1)),
      risk: Number(best.avgRisk.toFixed(1)),
      max_risk_encountered: Number(best.maxRiskAlongPath.toFixed(1)),
      safety_rating: safetyRating,
      warnings,
      alternate_routes: candidateRoutes.slice(1).map((c) => ({
        exit_id: c.destinationId,
        exit_name: c.destinationName,
        total_distance_meters: Number(c.totalDistance.toFixed(1)),
        avg_risk: Number(c.avgRisk.toFixed(1)),
        route: c.path,
      })),
    };
  }

  _dijkstra(building, startId, targetId, zoneRiskScores, blockedSet) {
    const zoneMap = new Map();
    building.zones.forEach((z) => zoneMap.set(z.id, z));

    if (blockedSet.has(targetId) || (blockedSet.has(startId) && blockedSet.size > 1)) {
      return null;
    }

    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    const distanceMetersTraveled = new Map();

    building.zones.forEach((z) => {
      distances.set(z.id, Infinity);
      distanceMetersTraveled.set(z.id, 0);
      if (!blockedSet.has(z.id) || z.id === startId) {
        unvisited.add(z.id);
      }
    });

    distances.set(startId, 0);

    while (unvisited.size > 0) {
      // Find node with min distance
      let currentId = null;
      let minDistance = Infinity;
      unvisited.forEach((id) => {
        const d = distances.get(id);
        if (d < minDistance) {
          minDistance = d;
          currentId = id;
        }
      });

      if (!currentId || minDistance === Infinity) break;
      if (currentId === targetId) break;

      unvisited.delete(currentId);
      const currentZone = zoneMap.get(currentId);
      if (!currentZone || !Array.isArray(currentZone.connected_zones)) continue;

      currentZone.connected_zones.forEach((conn) => {
        const neighborId = conn.target_id;
        if (!unvisited.has(neighborId)) return;

        const neighborZone = zoneMap.get(neighborId);
        if (!neighborZone) return;

        const distM = conn.distance_meters || 5.0;
        const neighborRisk = zoneRiskScores[neighborId] !== undefined
          ? Number(zoneRiskScores[neighborId])
          : (neighborZone.initial_risk || 5.0);

        const occ = neighborZone.occupancy || 0;

        // Cost formula: Distance * (1 + (risk/20)^2) + occupancy congestion
        const riskFactor = Math.pow(neighborRisk / 20.0, 2) * this.riskWeight;
        const congestion = occ * this.congestionWeight;
        const stepCost = distM * (1.0 + riskFactor) + congestion;

        const altDistance = distances.get(currentId) + stepCost;

        if (altDistance < distances.get(neighborId)) {
          distances.set(neighborId, altDistance);
          distanceMetersTraveled.set(neighborId, distanceMetersTraveled.get(currentId) + distM);
          previous.set(neighborId, currentId);
        }
      });
    }

    if (distances.get(targetId) === Infinity) {
      return null;
    }

    // Reconstruct path
    const path = [];
    let curr = targetId;
    while (curr) {
      path.unshift(curr);
      curr = previous.get(curr);
    }

    if (path[0] !== startId) return null;

    let sumRisk = 0;
    let maxRisk = 0;
    path.forEach((zid) => {
      const z = zoneMap.get(zid);
      const r = zoneRiskScores[zid] !== undefined ? Number(zoneRiskScores[zid]) : (z?.initial_risk || 0);
      sumRisk += r;
      if (r > maxRisk) maxRisk = r;
    });

    const targetZone = zoneMap.get(targetId);

    return {
      destinationId: targetId,
      destinationName: targetZone?.name || targetId,
      path,
      totalCost: distances.get(targetId),
      totalDistance: distanceMetersTraveled.get(targetId),
      avgRisk: path.length > 0 ? sumRisk / path.length : 0,
      maxRiskAlongPath: maxRisk,
    };
  }
}

export const evacuationRouter = new EvacuationRouter();
