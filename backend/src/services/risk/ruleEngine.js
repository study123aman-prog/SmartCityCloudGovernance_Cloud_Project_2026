/**
 * FireGuard AI - Rule-Based Baseline Risk Engine
 * Provides deterministic, explainable baseline risk scores for comparison against ML models.
 */

export class RuleRiskEngine {
  constructor(options = {}) {
    this.thresholds = {
      forest: {
        tempCritical: options.forestTempCritical ?? 38.0,
        tempHigh: options.forestTempHigh ?? 32.0,
        tempMedium: options.forestTempMedium ?? 25.0,
        humidityCritical: options.forestHumidityCritical ?? 20.0,
        humidityHigh: options.forestHumidityHigh ?? 35.0,
        windHigh: options.forestWindHigh ?? 25.0,
        fwiCritical: options.forestFwiCritical ?? 30.0,
        fwiHigh: options.forestFwiHigh ?? 19.0,
      },
      building: {
        tempCritical: options.bldgTempCritical ?? 60.0,
        tempHigh: options.bldgTempHigh ?? 45.0,
        tempMedium: options.bldgTempMedium ?? 32.0,
        smokeCritical: options.bldgSmokeCritical ?? 15.0,
        smokeHigh: options.bldgSmokeHigh ?? 6.0,
        smokeMedium: options.bldgSmokeMedium ?? 2.5,
        loadCritical: options.bldgLoadCritical ?? 130.0,
        loadHigh: options.bldgLoadHigh ?? 90.0,
      }
    };
  }

  evaluateForestRules(telemetry) {
    const temp = Number(telemetry.temperature ?? 25.0);
    const humidity = Number(telemetry.humidity ?? 50.0);
    const wind = Number(telemetry.wind_speed ?? 10.0);
    const rain = Number(telemetry.rainfall ?? 0.0);
    const fwi = telemetry.fwi !== undefined && telemetry.fwi !== null ? Number(telemetry.fwi) : null;

    let score = 0;
    const rulesTriggered = [];

    // Rule 1: Temperature threshold
    if (temp >= this.thresholds.forest.tempCritical) {
      score += 35;
      rulesTriggered.push(`High ambient temperature (> ${this.thresholds.forest.tempCritical}°C)`);
    } else if (temp >= this.thresholds.forest.tempHigh) {
      score += 25;
      rulesTriggered.push(`Elevated ambient temperature (> ${this.thresholds.forest.tempHigh}°C)`);
    } else if (temp >= this.thresholds.forest.tempMedium) {
      score += 12;
    }

    // Rule 2: Low Humidity (Fuel desiccation)
    if (humidity <= this.thresholds.forest.humidityCritical) {
      score += 30;
      rulesTriggered.push(`Severe atmospheric aridity (humidity < ${this.thresholds.forest.humidityCritical}%)`);
    } else if (humidity <= this.thresholds.forest.humidityHigh) {
      score += 18;
      rulesTriggered.push(`Low humidity (< ${this.thresholds.forest.humidityHigh}%)`);
    }

    // Rule 3: Wind propagation velocity
    if (wind >= this.thresholds.forest.windHigh) {
      score += 20;
      rulesTriggered.push(`High wind spread potential (> ${this.thresholds.forest.windHigh} km/h)`);
    } else if (wind >= 15.0) {
      score += 10;
    }

    // Rule 4: Precipitation damping
    if (rain > 5.0) {
      score = Math.max(0, score - 35);
      rulesTriggered.push('Substantial rain dampening fire potential');
    } else if (rain > 0.5) {
      score = Math.max(0, score - 15);
    }

    // Rule 5: Canadian Fire Weather Index bonus if available
    if (fwi !== null) {
      if (fwi >= this.thresholds.forest.fwiCritical) {
        score = Math.max(score, 80);
        rulesTriggered.push(`Extreme Fire Weather Index (> ${this.thresholds.forest.fwiCritical})`);
      } else if (fwi >= this.thresholds.forest.fwiHigh) {
        score = Math.max(score, 55);
        rulesTriggered.push(`High Fire Weather Index (> ${this.thresholds.forest.fwiHigh})`);
      }
    }

    score = Math.max(0, Math.min(100, score));
    const category = this.scoreToCategory(score);

    return {
      model_type: 'rule_based',
      domain: 'forest',
      score: Math.round(score * 10) / 10,
      probability: Math.round((score / 100) * 100) / 100,
      category,
      rules_triggered: rulesTriggered,
      thresholds_used: this.thresholds.forest,
    };
  }

  evaluateBuildingRules(telemetry) {
    const temp = Number(telemetry.temperature ?? 22.0);
    const smoke = Number(telemetry.smoke_index ?? 0.5);
    const load = Number(telemetry.electrical_load ?? 40.0);
    const flammability = Number(telemetry.flammability ?? 2.0);
    const zoneType = String(telemetry.zone_type ?? 'corridor');

    let score = 0;
    const rulesTriggered = [];

    // Rule 1: Smoke optical density
    if (smoke >= this.thresholds.building.smokeCritical) {
      score += 50;
      rulesTriggered.push(`Critical smoke obscuration index (> ${this.thresholds.building.smokeCritical})`);
    } else if (smoke >= this.thresholds.building.smokeHigh) {
      score += 30;
      rulesTriggered.push(`Dense smoke detected (> ${this.thresholds.building.smokeHigh})`);
    } else if (smoke >= this.thresholds.building.smokeMedium) {
      score += 15;
      rulesTriggered.push(`Abnormal particulate smoke detected`);
    }

    // Rule 2: Zone Overheating
    if (temp >= this.thresholds.building.tempCritical) {
      score += 35;
      rulesTriggered.push(`Extreme thermal condition (> ${this.thresholds.building.tempCritical}°C)`);
    } else if (temp >= this.thresholds.building.tempHigh) {
      score += 20;
      rulesTriggered.push(`Zone overheating (> ${this.thresholds.building.tempHigh}°C)`);
    } else if (temp >= this.thresholds.building.tempMedium) {
      score += 10;
    }

    // Rule 3: Electrical Load overload
    if (load >= this.thresholds.building.loadCritical) {
      score += 25;
      rulesTriggered.push(`Severe electrical overload (> ${this.thresholds.building.loadCritical} kW/%)`);
    } else if (load >= this.thresholds.building.loadHigh) {
      score += 12;
      rulesTriggered.push(`High electrical strain (> ${this.thresholds.building.loadHigh} kW/%)`);
    }

    // Rule 4: High risk zone penalty (Electrical Room, Kitchen, Server Room)
    if (['electrical', 'kitchen', 'server_room'].includes(zoneType)) {
      score += Math.round(flammability * 3);
      rulesTriggered.push(`High hazard facility profile: ${zoneType} (flammability ${flammability})`);
    }

    score = Math.max(0, Math.min(100, score));
    const category = this.scoreToCategory(score);

    return {
      model_type: 'rule_based',
      domain: 'building',
      score: Math.round(score * 10) / 10,
      probability: Math.round((score / 100) * 100) / 100,
      category,
      rules_triggered: rulesTriggered,
      thresholds_used: this.thresholds.building,
    };
  }

  scoreToCategory(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
}

export const ruleRiskEngine = new RuleRiskEngine();
