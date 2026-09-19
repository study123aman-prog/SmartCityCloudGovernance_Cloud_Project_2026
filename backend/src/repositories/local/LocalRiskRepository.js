import { IRiskRepository } from "../interfaces/contracts.js";
import { INITIAL_BUILDINGS } from "../../config/buildingTopology.js";

export class LocalRiskRepository extends IRiskRepository {
  constructor() {
    super();
    this.assessments = [];
    this.maxHistory = 2000;
    this.latestById = new Map();

    // Seed baseline risks from building topology
    INITIAL_BUILDINGS.forEach((bldg) => {
      bldg.zones.forEach((zone) => {
        const score = zone.initial_risk || 5.0;
        let level = 'LOW';
        if (score >= 75) level = 'CRITICAL';
        else if (score >= 50) level = 'HIGH';
        else if (score >= 25) level = 'MEDIUM';

        const rec = {
          id: `risk_seed_${zone.id}`,
          zone_id: zone.id,
          source_id: zone.id,
          building_id: bldg.id,
          score,
          level,
          probability: score / 100.0,
          timestamp: new Date().toISOString(),
        };
        this.latestById.set(zone.id, rec);
        this.assessments.push(rec);
      });
    });
  }

  async saveRiskAssessment(assessment) {
    const record = {
      id: `risk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: assessment.timestamp || new Date().toISOString(),
      ...assessment,
    };
    this.assessments.unshift(record);
    if (assessment.zone_id || assessment.source_id) {
      this.latestById.set(assessment.zone_id || assessment.source_id, record);
    }
    if (this.assessments.length > this.maxHistory) {
      this.assessments.pop();
    }
    return record;
  }

  async getLatestRisks() {
    const map = {};
    this.latestById.forEach((v, k) => {
      map[k] = v;
    });
    return map;
  }

  async getLatestRisk(filters = {}) {
    if (Object.keys(filters).length === 0) {
      return this.assessments[0] || null;
    }
    return (
      this.assessments.find((item) => {
        return Object.entries(filters).every(([k, v]) => item[k] === v);
      }) || null
    );
  }

  async getRiskHistory(filters = {}, limit = 100) {
    let result = this.assessments;
    if (Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([k, v]) => item[k] === v);
      });
    }
    return result.slice(0, limit);
  }

  async getRiskStats(filters = {}) {
    const records = await this.getRiskHistory(filters, 500);
    const total = records.length;
    const criticalCount = records.filter((r) => r.level === "CRITICAL").length;
    const highCount = records.filter((r) => r.level === "HIGH").length;
    const mediumCount = records.filter((r) => r.level === "MEDIUM").length;
    const lowCount = records.filter((r) => r.level === "LOW").length;
    const avgScore = total > 0 ? records.reduce((s, r) => s + (r.score || 0), 0) / total : 0;

    return {
      total,
      breakdown: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      averageScore: Number(avgScore.toFixed(1)),
    };
  }
}
