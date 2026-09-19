# FireGuard AI — Data Sources & Provenance Documentation

This document provides transparent documentation for all datasets utilized in **FireGuard AI**. In accordance with scientific and engineering best practices, synthetic data generators and their underlying correlation equations are explicitly demarcated from empirical observations.

---

## 1. Building / Infrastructure Fire Dataset (`data/building/building_fire_dataset.csv`)

| Metadata Attribute | Specification |
| :--- | :--- |
| **Dataset Name** | FireGuard Correlated Building Multi-Sensor Fire Hazard Dataset |
| **Nature** | **SYNTHETIC** (Generated via reproducible physical-correlation engine) |
| **Generator Script** | `ml/generate_building_dataset.py` |
| **Command** | `python ml/generate_building_dataset.py --samples 20000 --seed 42` |
| **Sample Count** | 20,000 discrete sensor observations |
| **License / Provenance** | MIT License / Tsukikage23 Research Workspace |
| **Primary Target** | `fire_hazard_label` (Binary: 0 = Safe, 1 = Active Hazard / Ignition) |
| **Secondary Target** | `risk_score` (Continuous: 0.0 – 100.0) & `risk_level` (LOW, MEDIUM, HIGH, CRITICAL) |

### Features
1. `timestamp`: ISO-8601 synthetic time sequence
2. `building_id`: Target facility (`building_a`, `building_b`, `building_c`)
3. `zone_id`: Zone identifier (e.g. `bldg_a_elec`, `bldg_b_server`, `bldg_c_kitchen`)
4. `zone_type`: Zone category (`electrical`, `server_room`, `kitchen`, `lab`, `classroom`, `corridor`, `storage`, `office`, `exit`)
5. `flammability`: NFPA-aligned fuel flammability coefficient (1.0 to 5.0)
6. `temperature`: Ambient indoor temperature in Celsius (°C)
7. `humidity`: Relative humidity percentage (%)
8. `smoke_index`: Optical obscuration smoke density index (0.0 to 100.0)
9. `electrical_load`: Measured power consumption or circuit strain (kW / %)
10. `occupancy`: Headcount present in zone (integer)
11. `wind_speed`: HVAC ventilation / external infiltration velocity (km/h)
12. `scenario`: Trigger condition (`normal`, `hot_weather`, `dry_conditions`, `electrical_overload`, `smoke_increase`, `critical`)

### Realistic Correlated Generation Logic
The generator does **not** draw independent random variables. Instead, it models correlated physical scenarios:
- **Electrical Overload Scenario**: Electrical load spikes (110–180 kW), triggering Joule heating in ambient temperature (35–65°C), and low-level particulate smoldering (smoke 2–18).
- **Kitchen / Lab Flashover**: Correlated smoke escalation (15–80) accompanied by rapid temperature rises (45–110°C).
- **Corridor / Exit Normal**: Low baseline temperatures (18–24°C), zero smoke (<0.5), and low loads.

### Limitations
- Does not model turbulent 3D Navier-Stokes gas fluid dynamics.
- Designed specifically for multi-zone sensor classification and risk propagation heuristics.

---

## 2. Forest / Wildland Fire Dataset (`data/forest/forest_fire_dataset.csv`)

| Metadata Attribute | Specification |
| :--- | :--- |
| **Dataset Name** | FireGuard Augmented Canadian Fire Weather Index (FWI) & Environmental Dataset |
| **Nature** | **SEMI-EMPIRICAL / AUGMENTED SYNTHETIC** (Anchored in empirical forest fire literature with FWI calibrations) |
| **Generator Script** | `ml/generate_forest_dataset.py` |
| **Sample Count** | 15,000 spatial observations |
| **Provenance** | Anchored on Canadian Forest Service FWI equations (Van Wagner & Pickett, 1985) and standard UCI Forest Fires benchmarks |
| **Target** | `fire_occurrence` (Binary: 0 = No Fire, 1 = Fire Occurrence) |
| **Risk Score** | Continuous risk score (0.0 to 100.0) |

### Features
1. `temperature`: Ambient dry-bulb temperature (°C)
2. `oxygen_level`: Atmospheric oxygen percentage (nominal 20.95%)
3. `humidity`: Relative humidity (%)
4. `wind_speed`: 10m sustained wind velocity (km/h)
5. `pressure`: Barometric atmospheric pressure (hPa)
6. `rainfall`: 24-hour precipitation (mm)
7. `latitude`: Geographic coordinate
8. `longitude`: Geographic coordinate
9. `ffmc`: Fine Fuel Moisture Code (litter and fine cured fuels)
10. `dmc`: Duff Moisture Code (loosely compacted organic layers)
11. `dc`: Drought Code (deep, compact organic layers)
12. `isi`: Initial Spread Index (rate of fire spread combining wind and FFMC)
13. `bui`: Buildup Index (total fuel available to the spreading fire)
14. `fwi`: Fire Weather Index (numerical rating of fire intensity)

### Preprocessing Pipeline (`ml/preprocessing/forest_preprocessor.py`)
- Standardizes numerical variables using Scikit-Learn `StandardScaler`.
- Missing optional features are imputed using fitted training means.
- Feature column names are normalized to lowercase snake_case.

### Limitations
- Microclimate wind channeling due to complex steep canyon topography is approximated.
- Not a substitute for physical fire perimeter infrared satellite feeds (MODIS/VIIRS).

---

## 3. Geographic Wildfire Basin Definitions (`data/geography/`)

Empirical coordinates of Western US high-risk wildland-urban interface (WUI) corridors:
- **Sierra Foothills Corridor** (38.5439°N, -120.9380°W)
- **Cascades Valley Basin** (45.6298°N, -121.8535°W)
- **Pacific Coast Ridge** (38.2620°N, -122.1024°W)
- **High Desert Plateau** (34.6882°N, -117.2833°W)
- **Redwood Coastal Basin** (41.2033°N, -124.0046°W)
- **Angeles National Forest Ridge** (34.2500°N, -118.1500°W)
