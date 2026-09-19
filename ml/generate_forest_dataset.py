#!/usr/bin/env python3
"""
FireGuard AI - Forest & Environmental Fire Risk Dataset Generator
Generates environmental fire condition records incorporating:
- Core features: Temperature, Oxygen Level, Humidity, Wind Speed, Pressure, Rainfall
- Geospatial coordinates: Latitude, Longitude, Region
- Canadian Fire Weather Index (FWI) components: FFMC, DMC, DC, ISI, BUI, FWI
- Historical fire frequency
"""

import argparse
from pathlib import Path
import numpy as np
import pandas as pd

REGIONS = [
    {"name": "Northern Boreal", "lat_center": 49.2, "lng_center": -122.9, "base_fuel": 4.5, "hist_freq": 0.22},
    {"name": "Pacific Coast Ridge", "lat_center": 37.8, "lng_center": -122.4, "base_fuel": 3.8, "hist_freq": 0.35},
    {"name": "Sierra Foothills", "lat_center": 38.5, "lng_center": -120.9, "base_fuel": 4.9, "hist_freq": 0.48},
    {"name": "Cascades Valley", "lat_center": 45.5, "lng_center": -121.7, "base_fuel": 3.2, "hist_freq": 0.18},
    {"name": "High Desert Plateau", "lat_center": 34.5, "lng_center": -117.2, "base_fuel": 2.5, "hist_freq": 0.28},
]


def generate_forest_data(samples: int = 15000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    region_idx = np.random.choice(len(REGIONS), size=samples)

    records = []
    for i in range(samples):
        reg = REGIONS[region_idx[i]]
        lat = float(np.random.normal(reg["lat_center"], 0.25))
        lng = float(np.random.normal(reg["lng_center"], 0.25))

        # Core environmental features
        temp = float(np.clip(np.random.normal(27.0, 8.5), -5.0, 48.0))
        humidity = float(np.clip(np.random.normal(48.0, 20.0), 5.0, 98.0))
        wind = float(np.clip(np.random.weibull(2.0) * 12.0, 0.0, 48.0))
        pressure = float(np.clip(np.random.normal(1013.0, 15.0), 960.0, 1045.0))
        rainfall = float(np.random.exponential(1.5) if np.random.rand() > 0.65 else 0.0)
        oxygen = float(np.clip(np.random.normal(20.9, 0.8), 16.0, 23.5))

        # Canadian Fire Weather Index components
        # FFMC (Fine Fuel Moisture Code): 0-101, sensitive to temp, humidity, wind, rainfall
        ffmc_raw = 85.0 + (temp - 25.0) * 0.8 - (humidity - 40.0) * 0.45 + wind * 0.25 - rainfall * 4.0
        ffmc = float(np.clip(ffmc_raw + np.random.normal(0, 3.0), 10.0, 99.5))

        # DMC (Duff Moisture Code) & DC (Drought Code)
        dmc = float(np.clip(np.random.gamma(3.0, 15.0) * (1.0 + (temp - 20) * 0.03), 1.0, 180.0))
        dc = float(np.clip(np.random.gamma(4.0, 80.0) * (1.0 + (temp - 20) * 0.02), 10.0, 850.0))

        # ISI (Initial Spread Index): drives fire spread velocity from FFMC and Wind
        isi = float(np.clip(0.208 * np.exp(0.05039 * ffmc) * (1.0 + 0.05 * wind), 0.0, 40.0))

        # BUI (Build Up Index) & FWI (Fire Weather Index)
        bui = float(np.clip(0.8 * dmc * dc / (dmc + 0.4 * dc + 1e-5), 0.0, 150.0))
        fwi = float(np.clip(np.exp(0.1 * isi) * (bui / 20.0), 0.0, 80.0))

        # Ground-truth continuous forest fire risk probability
        # Based on thermal, drought, wind, and vegetation fuel
        heat_term = np.clip((temp - 18.0) / 30.0, 0.0, 1.0) * 0.35
        dry_term = np.clip((70.0 - humidity) / 60.0, 0.0, 1.0) * 0.30
        wind_term = np.clip(wind / 35.0, 0.0, 1.0) * 0.20
        rain_suppress = np.clip(rainfall / 5.0, 0.0, 1.0) * 0.40
        fwi_term = np.clip(fwi / 40.0, 0.0, 1.0) * 0.25
        hist_term = reg["hist_freq"] * 0.15

        prob = float(np.clip(heat_term + dry_term + wind_term + fwi_term + hist_term - rain_suppress + np.random.normal(0, 0.04), 0.0, 1.0))
        score = round(prob * 100.0, 1)

        if score < 30.0:
            category = "LOW"
            label = 0
        elif score < 60.0:
            category = "MEDIUM"
            label = 0
        elif score < 85.0:
            category = "HIGH"
            label = 1
        else:
            category = "CRITICAL"
            label = 1

        records.append({
            "region": reg["name"],
            "latitude": round(lat, 4),
            "longitude": round(lng, 4),
            "temperature": round(temp, 2),
            "oxygen_level": round(oxygen, 2),
            "humidity": round(humidity, 2),
            "wind_speed": round(wind, 2),
            "pressure": round(pressure, 2),
            "rainfall": round(rainfall, 2),
            "ffmc": round(ffmc, 1),
            "dmc": round(dmc, 1),
            "dc": round(dc, 1),
            "isi": round(isi, 2),
            "bui": round(bui, 1),
            "fwi": round(fwi, 2),
            "historical_frequency": reg["hist_freq"],
            "risk_score": score,
            "risk_category": category,
            "fire_occurrence": label,
        })

    return pd.DataFrame(records)


def main():
    parser = argparse.ArgumentParser(description="Generate forest fire risk dataset.")
    parser.add_argument("--samples", type=int, default=15000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", type=str, default="data/forest/forest_fire_dataset.csv")
    args = parser.parse_args()

    print(f"Generating {args.samples} forest fire environmental records (seed={args.seed})...")
    df = generate_forest_data(args.samples, seed=args.seed)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Saved {len(df)} samples to {out_path}")
    print("\nRisk Category Distribution:")
    print(df["risk_category"].value_counts(normalize=True).map(lambda p: f"{p*100:.2f}%"))


if __name__ == "__main__":
    main()
