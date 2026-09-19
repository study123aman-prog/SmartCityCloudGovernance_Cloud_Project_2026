#!/usr/bin/env python3
"""
FireGuard AI - Synthetic Building Fire Risk Dataset Generator
Generates correlated, physics-informed building telemetry across realistic operational scenarios.

Scenarios:
1. normal: baseline office/lab/classroom operations (19-24°C, 45-60% humidity, 0 smoke, normal load)
2. hot_weather: elevated ambient temps, low humidity, elevated heat baseline
3. dry_conditions: very low humidity (<20%), heightened flammability risk
4. electrical_overload: heavy power draw (95-140%), localized thermal spikes in server/electrical zones
5. smoke_increase: rising particulate detection (40-80), rising temperature, high risk
6. critical: extreme temperature (>55°C), high smoke (>80), imminent combustion

Usage:
  python ml/generate_building_dataset.py --samples 20000 --seed 42
"""

import argparse
import datetime
from pathlib import Path
import numpy as np
import pandas as pd

BUILDINGS = {
    "building_a": {
        "name": "Building A - Research Facility",
        "zones": [
            {"id": "bldg_a_elec", "type": "electrical", "flammability": 4.8, "base_occ": 2},
            {"id": "bldg_a_lab1", "type": "lab", "flammability": 4.2, "base_occ": 12},
            {"id": "bldg_a_lab2", "type": "lab", "flammability": 3.5, "base_occ": 8},
            {"id": "bldg_a_corridor", "type": "corridor", "flammability": 1.8, "base_occ": 5},
            {"id": "bldg_a_storage", "type": "storage", "flammability": 4.9, "base_occ": 1},
            {"id": "bldg_a_exit_a", "type": "exit", "flammability": 1.0, "base_occ": 0},
            {"id": "bldg_a_exit_b", "type": "exit", "flammability": 1.0, "base_occ": 0},
        ],
    },
    "building_b": {
        "name": "Building B - Academic Complex",
        "zones": [
            {"id": "bldg_b_server", "type": "server_room", "flammability": 4.6, "base_occ": 3},
            {"id": "bldg_b_class1", "type": "classroom", "flammability": 2.2, "base_occ": 65},
            {"id": "bldg_b_class2", "type": "classroom", "flammability": 2.2, "base_occ": 45},
            {"id": "bldg_b_corridor", "type": "corridor", "flammability": 1.5, "base_occ": 15},
            {"id": "bldg_b_storage", "type": "storage", "flammability": 4.1, "base_occ": 1},
            {"id": "bldg_b_exit_a", "type": "exit", "flammability": 1.0, "base_occ": 0},
            {"id": "bldg_b_exit_b", "type": "exit", "flammability": 1.0, "base_occ": 0},
        ],
    },
    "building_c": {
        "name": "Building C - Operations Center",
        "zones": [
            {"id": "bldg_c_kitchen", "type": "kitchen", "flammability": 4.7, "base_occ": 8},
            {"id": "bldg_c_office", "type": "office", "flammability": 2.5, "base_occ": 28},
            {"id": "bldg_c_corridor", "type": "corridor", "flammability": 1.9, "base_occ": 4},
            {"id": "bldg_c_storage", "type": "storage", "flammability": 4.3, "base_occ": 2},
            {"id": "bldg_c_exit_a", "type": "exit", "flammability": 1.0, "base_occ": 0},
            {"id": "bldg_c_exit_b", "type": "exit", "flammability": 1.0, "base_occ": 0},
        ],
    },
}

SCENARIOS = ["normal", "hot_weather", "dry_conditions", "electrical_overload", "smoke_increase", "critical"]
SCENARIO_PROBS = [0.52, 0.15, 0.12, 0.10, 0.07, 0.04]


def generate_samples(num_samples: int, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    
    # Flatten building-zone pairs
    all_zones = []
    for b_id, b_info in BUILDINGS.items():
        for z in b_info["zones"]:
            all_zones.append({
                "building_id": b_id,
                "zone_id": z["id"],
                "zone_type": z["type"],
                "flammability": z["flammability"],
                "base_occ": z["base_occ"],
            })

    chosen_indices = np.random.choice(len(all_zones), size=num_samples)
    chosen_scenarios = np.random.choice(SCENARIOS, size=num_samples, p=SCENARIO_PROBS)

    start_date = datetime.datetime(2026, 1, 1, 8, 0, 0)
    time_deltas = np.sort(np.random.randint(0, 180 * 24 * 3600, size=num_samples))

    records = []
    for i in range(num_samples):
        zone_info = all_zones[chosen_indices[i]]
        scenario = chosen_scenarios[i]
        ts = start_date + datetime.timedelta(seconds=int(time_deltas[i]))
        hour = ts.hour

        # Diurnal occupancy modifier
        if 8 <= hour <= 18:
            occ_multiplier = np.random.uniform(0.7, 1.3)
        else:
            occ_multiplier = np.random.uniform(0.05, 0.25)
        occupancy = max(0, int(zone_info["base_occ"] * occ_multiplier + np.random.normal(0, 1)))

        # Ambient wind speed (influences air exchange in corridors/exits)
        wind_speed = round(float(np.clip(np.random.weibull(2.0) * 8.0, 0.5, 38.0)), 1)

        # Baseline correlated physics per scenario
        if scenario == "normal":
            temp = float(np.random.normal(21.5, 1.5))
            humidity = float(np.random.normal(52.0, 5.0))
            smoke = float(np.clip(np.random.exponential(0.8), 0.0, 4.0))
            elec_load = float(np.random.normal(35.0, 10.0))
        elif scenario == "hot_weather":
            temp = float(np.random.normal(36.0, 2.5))
            humidity = float(np.random.normal(24.0, 4.0))
            smoke = float(np.clip(np.random.exponential(1.5), 0.0, 8.0))
            elec_load = float(np.random.normal(68.0, 12.0))  # A/C load elevated
        elif scenario == "dry_conditions":
            temp = float(np.random.normal(28.0, 3.0))
            humidity = float(np.clip(np.random.normal(12.0, 3.0), 4.0, 20.0))
            smoke = float(np.clip(np.random.exponential(1.2), 0.0, 7.0))
            elec_load = float(np.random.normal(48.0, 12.0))
        elif scenario == "electrical_overload":
            # Elevated electrical load, especially severe in electrical and server zones
            load_boost = 35.0 if zone_info["zone_type"] in ["electrical", "server_room"] else 15.0
            elec_load = float(np.clip(np.random.normal(105.0 + load_boost, 14.0), 85.0, 160.0))
            temp_boost = (elec_load - 80.0) * 0.25
            temp = float(np.random.normal(28.0 + temp_boost, 3.0))
            humidity = float(np.random.normal(38.0, 6.0))
            smoke = float(np.clip(np.random.normal(18.0, 8.0), 2.0, 45.0))
        elif scenario == "smoke_increase":
            smoke = float(np.clip(np.random.normal(58.0, 12.0), 35.0, 85.0))
            temp = float(np.random.normal(38.0, 5.0))
            humidity = float(np.random.normal(26.0, 6.0))
            elec_load = float(np.random.normal(70.0, 15.0))
        else:  # critical
            temp = float(np.clip(np.random.normal(68.0, 10.0), 52.0, 98.0))
            smoke = float(np.clip(np.random.normal(88.0, 6.0), 75.0, 99.5))
            humidity = float(np.clip(np.random.normal(14.0, 4.0), 3.0, 22.0))
            elec_load = float(np.random.normal(90.0, 25.0))

        # Flammability influence on zone temperature threshold
        flammability = zone_info["flammability"]
        temp += (flammability - 2.5) * 0.8

        # Ground-truth continuous risk calculation (0 - 100)
        # Physics formula incorporating temperature, smoke, dryness, electrical stress, and flammability
        temp_factor = np.clip((temp - 20.0) / 45.0, 0.0, 1.0) * 35.0
        smoke_factor = (smoke / 100.0) * 35.0
        humidity_factor = np.clip((40.0 - humidity) / 35.0, 0.0, 1.0) * 12.0
        elec_factor = np.clip((elec_load - 60.0) / 70.0, 0.0, 1.0) * 10.0
        flamm_factor = (flammability / 5.0) * 8.0

        raw_score = temp_factor + smoke_factor + humidity_factor + elec_factor + flamm_factor
        noise = np.random.normal(0, 2.0)
        risk_score = round(float(np.clip(raw_score + noise, 0.0, 100.0)), 2)

        # Discrete risk category mapping
        if risk_score < 30.0:
            risk_level = "LOW"
            fire_label = 0
        elif risk_score < 60.0:
            risk_level = "MEDIUM"
            fire_label = 0
        elif risk_score < 85.0:
            risk_level = "HIGH"
            fire_label = 1
        else:
            risk_level = "CRITICAL"
            fire_label = 1

        records.append({
            "timestamp": ts.isoformat() + "Z",
            "building_id": zone_info["building_id"],
            "zone_id": zone_info["zone_id"],
            "zone_type": zone_info["zone_type"],
            "flammability": round(flammability, 2),
            "temperature": round(temp, 2),
            "humidity": round(max(1.0, min(100.0, humidity)), 2),
            "smoke_index": round(smoke, 2),
            "electrical_load": round(max(0.0, elec_load), 2),
            "occupancy": occupancy,
            "wind_speed": wind_speed,
            "scenario": scenario,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "fire_hazard_label": fire_label,
        })

    df = pd.DataFrame(records)
    return df


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic building fire risk dataset.")
    parser.add_argument("--samples", type=int, default=20000, help="Number of samples to generate")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--output", type=str, default="data/building/building_fire_dataset.csv", help="Output CSV path")
    args = parser.parse_args()

    print(f"Generating {args.samples} synthetic building records (seed={args.seed})...")
    df = generate_samples(args.samples, seed=args.seed)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)

    print(f"Successfully saved {len(df)} samples to {out_path}")
    print("\nDataset Summary by Risk Level:")
    print(df["risk_level"].value_counts(normalize=True).map(lambda p: f"{p*100:.2f}%"))
    print("\nScenario Breakdown:")
    print(df["scenario"].value_counts())


if __name__ == "__main__":
    main()
