# FireGuard AI

## Multi-Source Fire Hazard Prediction, Risk Propagation & Emergency Response System

**FireGuard AI** is an advanced, local-first dual-domain emergency intelligence platform. It fuses **wildland/forest fire risk** (Canadian Fire Weather Index & meteorological dynamics) with **structural/building fire hazards** (optical smoke obscuration, thermal loads, electrical strain, and flammability).

The platform features:
- Two dedicated Machine Learning inference engines (Random Forest models trained with scikit-learn).
- Deterministic rule-based baseline engines for side-by-side empirical comparison.
- A multi-source **Risk Fusion Engine** combining environmental, facility, and exposure vectors.
- Graph-based algorithmic fire hazard propagation simulation.
- Dynamic safest-route evacuation pathfinding (Dijkstra algorithm avoiding compromised zones).
- Interactive What-If fire progression simulation with time-step playback.
- A modern Command Center web interface built with React, Vite, TailwindCSS, and Leaflet GIS.
- Completely decoupled architecture: **100% operational locally without AWS credentials or cloud infrastructure**.

---

## Architecture Overview

```
                                      ┌────────────────────────────────────────────────────────┐
                                      │             FIREGUARD AI COMMAND CENTER                │
                                      │ React 19 + Vite + TailwindCSS + Leaflet + Recharts     │
                                      └───────────────────────────┬────────────────────────────┘
                                                                  │ HTTP / REST (Port 5001)
                                      ┌───────────────────────────▼────────────────────────────┐
                                      │                EXPRESS BACKEND (Node.js)               │
                                      │ Controllers • Repositories • Simulation • Fusion       │
                                      └───┬─────────────┬─────────────┬────────────────────┬───┘
                                          │             │             │                    │
                 ┌────────────────────────┘             │             │                    └────────────────────────┐
                 ▼                                      ▼             ▼                                             ▼
┌─────────────────────────────────┐   ┌──────────────────────────┐   ┌────────────────────────────────┐   ┌───────────────────────┐
│     FASTAPI ML ENGINE (Py3.13)  │   │     DATABASE LAYER       │   │      ALGORITHMIC SIMULATORS    │   │  LOCAL STORAGE SERVICE│
│ - Forest Model (RF Classifier)  │   │ - LocalTelemetryRepo     │   │ - Hazard Propagation Engine    │   │ - data/uploads/       │
│ - Building Model (RF Classifier)│   │ - LocalRiskRepo          │   │ - Dijkstra Evacuation Router   │   │ - Floorplan caches    │
│ - Feature Importance & Metrics  │   │ - LocalAlertRepo         │   │ - What-If Fire Progression     │   │ - Local JSON logs     │
│ (Port 8000)                     │   │ - MongoDB / In-Memory    │   │ - 6-Hour Forecast Engine       │   │                       │
└─────────────────────────────────┘   └──────────────────────────┘   └────────────────────────────────┘   └───────────────────────┘
```

---

## Key Features

### 1. Dual-Domain Fire Risk Machine Learning
- **Forest Domain**: Analyzes ambient temperature, relative humidity, wind speed, pressure, rainfall, atmospheric oxygen, and Canadian FWI components (`FFMC`, `DMC`, `DC`, `ISI`, `BUI`, `FWI`).
  - *Accuracy*: 92.83% | *ROC-AUC*: 0.9812 | *F1-Score*: 0.8924
- **Building Domain**: Evaluates optical smoke obscuration index, thermal sensors, electrical circuit loads, occupant counts, airflow, zone types, and NFPA material flammability ratings.
  - *Accuracy*: 99.98% | *ROC-AUC*: 1.0000 | *F1-Score*: 0.9970

### 2. Deterministic Rule-Based Baseline Engine
An explainable, threshold-driven rule engine runs alongside the ML models, allowing operators to compare ML confidence against established fire safety heuristics.

### 3. Multi-Source Risk Fusion Engine
Synthesizes four distinct vectors into a single unified `overall_fire_hazard_score` and `overall_fire_hazard_level` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`):
$$\text{HazardScore} = w_f \cdot \text{Forest} + w_w \cdot \text{Weather} + w_b \cdot \text{Building} + w_e \cdot \text{Exposure}$$
Weights are configurable in real-time via the Command Center settings.

### 4. Interactive 2D Facility Floorplans
Renders interactive 2D spatial layouts for **Building A** (Advanced Research Facility), **Building B** (Academic & Compute Complex), and **Building C** (Operations & Logistics Center) with live zone telemetry and flammability metrics.

### 5. Algorithmic Hazard Propagation Simulation
Discrete-time multi-hop graph cascade model that tracks heat, smoke, and airflow spread to connected zones based on distance attenuation and barrier flammability.

### 6. Dijkstra Safest Evacuation Routing
Dynamically calculates the shortest and lowest-hazard egress path from any room to designated emergency exits (Exit A / Exit B), dynamically avoiding compromised or fire-engulfed corridors.

### 7. Interactive What-If Fire Simulation
Allows incident commanders to pick an origin room, initial severity, ambient weather, and duration, then scrub through a step-by-step playback slider showing flame spread and real-time egress rerouting.

### 8. 6-Hour Time-Series Forecast
Diurnal atmospheric modeling (temperature cycle, humidity drop, wind gusts) evaluated through machine learning pipelines for Current, +1h, +2h, +3h, +4h, +5h, and +6h intervals.

### 9. Open-Source Geospatial Fire Map
Leaflet-powered map displaying wildland regional basins, live ignition probabilities, and danger perimeters without external proprietary mapping APIs.

---

## Local Development Quickstart

FireGuard AI runs 100% locally. No AWS credentials, accounts, or cloud resources are required.

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- Python 3.10+ (tested on Python 3.13)
- Optional: MongoDB (an in-memory resilient repository fallback is active automatically if Mongo is offline)

---

### Step 1: Clone and Configure Environment

```bash
git clone https://github.com/study123aman-prog/SmartCityCloudGovernance_Cloud_Project_2026.git
cd SmartCityCloudGovernance_Cloud_Project_2026

# Copy configuration
cp .env.example .env
```

---

### Step 2: Install Dependencies

```bash
# 1. Install Backend Dependencies
cd backend
npm install
cd ..

# 2. Install Frontend Dependencies
cd frontend
npm install
cd ..

# 3. Setup Python Virtual Environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

### Step 3: Generate Datasets & Train Models

Run the reproducible synthetic dataset generators and train the Random Forest pipelines:

```bash
# Generate Correlated Datasets
python ml/generate_building_dataset.py --samples 20000 --seed 42
python ml/generate_forest_dataset.py --samples 15000 --seed 42

# Train Forest & Building Models
python ml/train_forest.py
python ml/train_building.py

# Evaluate Model Accuracy
python ml/evaluate_forest.py
python ml/evaluate_building.py
```

---

### Step 4: Launch Local Services

Start each service in a terminal window:

```bash
# Terminal 1: Start ML Inference Engine (Port 8000)
cd ml
../.venv/bin/uvicorn app:app --port 8000 --host 0.0.0.0 --reload

# Terminal 2: Start Express Backend API (Port 5001)
cd backend
npm run dev

# Terminal 3: Start Command Center Frontend (Port 5173)
cd frontend
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

### Step 5: (Optional) Run Live Sensor Stream Simulator

Simulate streaming IoT sensor telemetry across building zones and forest stations:

```bash
# Standard periodic telemetry stream (5-second intervals)
node simulator/sensorSimulator.js

# Inject thermal anomaly in Building A Electrical Room
node simulator/sensorSimulator.js --interval 3000 --anomaly bldg_a_elec
```

---

## Project Structure

```
forest-fire-risk-prediction/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Environment variables & Building topologies
│   │   ├── controllers/      # Building, Risk, Forecast, Simulation, Alerts, Analytics
│   │   ├── repositories/     # Repository interfaces & local in-memory/disk implementations
│   │   ├── routes/           # Centralized API route definitions
│   │   └── services/         # Rule engine, Risk fusion, Dijkstra routing, Propagation
│   └── test/                 # Automated API unit tests
├── frontend/                 # React 19 + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/       # Layout, Navigation, RiskBadges
│   │   ├── pages/            # 10 Command Center Views (Dashboard, Map, 2D Floorplan, etc.)
│   │   └── services/         # Axios API client
├── ml/                       # Dual-Domain Machine Learning Pipeline
│   ├── datasets/             # Local data caches
│   ├── models/               # Serialized .joblib models and evaluation metrics
│   ├── preprocessing/        # Custom scikit-learn transformers
│   ├── app.py                # FastAPI dual-domain prediction server
│   ├── train_forest.py       # Forest model training
│   ├── train_building.py     # Building model training
│   ├── predict_forest.py     # Forest inference
│   ├── predict_building.py   # Building inference
│   └── feature_importance.py # MDI feature importance analysis
├── simulator/                # Standalone IoT sensor telemetry simulator
│   └── sensorSimulator.js
├── data/                     # Data stores (forest, building, weather, geography)
├── docs/                     # Architectural documentation
│   ├── aws-integration-guide.md # Blueprint for future cloud integration
│   └── data-sources.md          # Dataset provenance and synthetic transparency
└── legacy/aws/               # Quarantined legacy cloud formation & deployment scripts
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and database connectivity |
| `GET` | `/api/buildings` | List monitored buildings with summary statistics |
| `GET` | `/api/buildings/:id` | Full building topology, zones, coordinates, and live risk states |
| `GET` | `/api/zones` | Filterable zone list with live sensor telemetry |
| `GET` | `/api/buildings/:id/evacuation-route` | Dijkstra safest evacuation route from origin zone to safe exit |
| `GET` | `/api/risk/current` | Multi-source fused operational fire hazard index |
| `GET/POST` | `/api/risk/forest` | Forest wildland fire ML prediction vs rule-based evaluation |
| `GET/POST` | `/api/risk/building` | Facility zone fire ML prediction vs rule-based evaluation |
| `GET` | `/api/risk/overall` | Fused hazard score with custom weights |
| `POST` | `/api/risk/weights` | Update dynamic Risk Fusion Engine weights |
| `GET` | `/api/forecast` | 6-hour predictive time-series hazard forecast |
| `POST` | `/api/simulation/fire` | Run What-If multi-step fire propagation simulation |
| `GET` | `/api/geospatial/risk` | Regional wildfire coordinates and weather intensity for Leaflet |
| `GET` | `/api/alerts` | Active and acknowledged incident alert feed |
| `POST` | `/api/alerts/:id/ack` | Acknowledge incident alert |
| `GET` | `/api/analytics` | Multi-sensor 24h historical trends and ML model performance metrics |
| `GET` | `/api/telemetry/latest` | Latest sensor readings across facilities and stations |
| `POST` | `/api/telemetry` | Ingest sensor telemetry stream |

---

## Future AWS Cloud Integration

The core application utilizes clear interfaces (`ITelemetryRepository`, `IRiskRepository`, `IAlertService`, `IObjectStorageService`, `IEventPublisher`) enabling straightforward cloud integration:

- **LocalTelemetryRepository** $\rightarrow$ **AWS IoT Core / Amazon DynamoDB**
- **LocalRiskRepository** $\rightarrow$ **Amazon DynamoDB**
- **LocalAlertService** $\rightarrow$ **Amazon Simple Notification Service (SNS)**
- **LocalStorageService** $\rightarrow$ **Amazon Simple Storage Service (S3)**
- **Express Backend** $\rightarrow$ **AWS Lambda + Amazon API Gateway**
- **Console / Task Logs** $\rightarrow$ **Amazon CloudWatch Logs**

See [docs/aws-integration-guide.md](docs/aws-integration-guide.md) for full implementation details, IAM policies, and code blueprints.

---

## Verification & Automated Testing

Run the test suites locally:

```bash
# Backend Automated Tests (Node.js Test Runner)
npm --prefix backend run test

# Frontend Unit Tests (Vitest)
npm --prefix frontend run test

# Frontend Production Build Verification
npm --prefix frontend run build
```

---

## License

MIT License - SmartCity Cloud Governance Project 2026.
