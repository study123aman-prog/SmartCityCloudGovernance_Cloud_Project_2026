import { IBuildingRepository } from "../interfaces/contracts.js";
import { INITIAL_BUILDINGS } from "../../config/buildingTopology.js";

export class LocalBuildingRepository extends IBuildingRepository {
  constructor() {
    super();
    // Clone initial topology into local state
    this.buildings = JSON.parse(JSON.stringify(INITIAL_BUILDINGS));
  }

  async getAllBuildings() {
    return this.buildings.map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      campus: b.campus,
      total_area_sqm: b.total_area_sqm,
      coordinates: b.coordinates,
      zone_count: b.zones.length,
      current_occupancy: b.zones.reduce((sum, z) => sum + (z.occupancy || 0), 0),
      zones: b.zones,
    }));
  }

  async getBuildingById(buildingId) {
    const building = this.buildings.find((b) => b.id === buildingId);
    if (!building) return null;
    return JSON.parse(JSON.stringify(building));
  }

  async getAllZones(buildingId = null) {
    let zones = [];
    for (const building of this.buildings) {
      if (!buildingId || building.id === buildingId) {
        for (const zone of building.zones) {
          zones.push({
            ...zone,
            building_id: building.id,
            building_name: building.name,
          });
        }
      }
    }
    return zones;
  }

  async getZoneById(buildingId, zoneId) {
    const building = this.buildings.find((b) => b.id === buildingId);
    if (!building) return null;
    const zone = building.zones.find((z) => z.id === zoneId);
    if (!zone) return null;
    return { ...zone, building_id: building.id, building_name: building.name };
  }

  async updateZoneStatus(buildingId, zoneId, updateData) {
    const building = this.buildings.find((b) => b.id === buildingId);
    if (!building) return null;
    const zone = building.zones.find((z) => z.id === zoneId);
    if (!zone) return null;
    Object.assign(zone, updateData);
    return { ...zone, building_id: building.id };
  }
}
