# IgnisCore — Intelligent Fire Hazard Monitoring System

## Cloud-Native Multi-Zone Fire Hazard Intelligence, Graph-Based Risk Propagation & Dynamic Evacuation Decision Support System

**IgnisCore — Intelligent Fire Hazard Monitoring System** is an advanced, software-only, local-first emergency intelligence platform. It fuses **wildland/forest fire risk** (Canadian Fire Weather Index & meteorological dynamics) with **structural/building fire hazards** (optical smoke obscuration, thermal loads, electrical strain, and flammability).

The platform eliminates physical hardware dependency by deploying a high-fidelity **Virtual Sensor Telemetry Engine**, combining dual-domain Machine Learning with deterministic rule-based explainability, graph-based hazard propagation cascades, hazard-weighted dynamic Dijkstra evacuation routing, and an interactive "What-If" incident simulation sandbox with time-step playback.

---

## The Paradigm Shift: Differentiators from Similar Projects

Many open-source repositories and capstone projects share generic fire-related titles (e.g., `GrumpyKit10/Wildfire-Detection-System`, `mayurasandakalum/fireshield360`, `boldmonk89/edge-ai-predictive-fire-hazard-detection`). IgnisCore — Intelligent Fire Hazard Monitoring System fundamentally differentiates itself across all architectural and algorithmic dimensions:

```text
CONVENTIONAL FIRE PROJECTS (Naive / Reactive)
┌────────────────┐      ┌─────────────────────────┐      ┌───────────────┐
│ Physical MQ-2  │ ───> │ Microcontroller Readout │ ───> │ Buzzer / SNS  │
│ Sensor & DHT11 │      │ (If Smoke > 400: Alarm) │      │ Static SMS    │
└────────────────┘      └─────────────────────────┘      └───────────────┘

IGNISCORE — INTELLIGENT FIRE HAZARD MONITORING SYSTEM (Predictive Intelligence & Emergency Decision Support)
┌────────────────────────────────────────────────────────┐
│  Software Virtual Sensor Telemetry Simulator (Multi-Zone)│
│  (Thermal, Optical Smoke, Circuit Load, Occupancy, FWI)│
└───────────────────────────┬────────────────────────────┘
                            │ Event-Driven Ingestion
┌───────────────────────────▼────────────────────────────┐
│      Decoupled Cloud & Local-First Ingestion Layer     │
│  (AWS IoT Core / Lambda / DynamoDB OR Local Repository)│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      Dual-Domain Machine Learning + Rule Comparator     │
│   - Building Structural RF Classifier (Acc: 99.98%)    │
│   - Wildland Canadian FWI RF Classifier (Acc: 92.83%)  │
│   - Deterministic Explainable Rule-Based Comparator    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              Multi-Source Risk Fusion Engine           │
│ HazardScore = w_f·Forest + w_w·Weather + w_b·Building...│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│       Topological Graph Hazard Propagation Model       │
│ Discrete-time multi-hop heat & smoke cascade to nodes  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│        Hazard-Weighted Dynamic Dijkstra Router         │
│ Computes safest egress path, avoiding compromised zones│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      Incident Command Center & Decision Support        │
│ - Interactive 2D Facility Floorplans with Live Risk    │
│ - Interactive "What-If" Simulation with Playback Slider│
│ - Automated Emergency Multi-Channel Alerts (SNS)       │
└────────────────────────────────────────────────────────┘
```

### Comparative Summary

| Capability / Dimension | Conventional Projects (`GrumpyKit10`, `Al-dhubaibi`) | Edge-AI Prototypes (`boldmonk89`, `Salcedo`) | Deep Learning Wildfire (`FireShield360`, `Sentinel`) | **IgnisCore — Intelligent Fire Hazard Monitoring System (This Project)** |
| :--- | :--- | :--- | :--- | :--- |
| **Hardware Dependency** | **100% Dependent** on Arduino, ESP32, cellular shields | **100% Dependent** on physical edge microcontrollers | Dependent on cameras or LoRaWAN nodes | **100% Software-Only**: Virtual telemetry engine simulating multi-zone sensors |
| **System Paradigm** | **Reactive**: Alarms trigger only after smoke/flame occurs | **Narrow Edge Classification**: Safe vs. Warning vs. Fire | **Reactive Flame/Smoke Detection**: Camera bounding boxes | **Predictive Intelligence & Response**: Pre-ignition risk, propagation, evacuation, What-If simulation |
| **Domain Scope** | Single domain (wildfire only or single room) | Single domain (indoor sensor node) | Single domain (forest / wildland) | **Dual-Domain Multi-Source Fusion**: Structural building + Wildland FWI + weather vectors |
| **ML Inference Engine** | None (simple if-else threshold) | Basic local classifier | Heavy CNN / YOLO models requiring GPU | **Dual Random Forest Classifiers** ($99.98\%$ & $92.83\%$) + deterministic rule comparator |
| **Spatial Awareness** | None (isolated sensor coordinates) | None (single location) | Bounding box coordinates | **Topological Facility Graphs**: Multi-building floorplans, rooms, corridors, barriers |
| **Hazard Propagation** | None | None | None | **Algorithmic Graph Cascade**: Discrete-time multi-hop model tracking smoke/heat spread |
| **Evacuation Routing** | None (static exit signage) | None | None | **Hazard-Weighted Dynamic Dijkstra**: Safest egress path rerouting around fire-engulfed corridors |
| **Scenario Modeling** | None | None | None | **Interactive "What-If" Fire Simulator**: Multi-step playback slider adjusting origin, severity, wind |
| **Cloud Architecture** | Passive cloud database pipe or raw IoT upload | Local edge only | Custom external cloud or local | **Decoupled AWS Event-Driven Pipeline** (IoT Core, Lambda, DynamoDB, SNS) + **100% Local-First Autonomy** |

---

## Architecture Overview

```text
                                      ┌────────────────────────────────────────────────────────┐
                                      │             IGNISCORE — INTELLIGENT FIRE HAZARD MONITORING SYSTEM COMMAND CENTER                │
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

IgnisCore — Intelligent Fire Hazard Monitoring System runs 100% locally. No AWS credentials, accounts, or cloud resources are required.

### Prerequisites
- Node.js 18+ (tested on Node.js v22/v24)
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

### Step 2: Set Up Python ML Service

```bash
cd ml-service

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI ML engine (Runs on port 8000)
uvicorn app:app --reload --port 8000
```

---

### Step 3: Set Up Backend Service

In a new terminal:

```bash
cd backend

# Install dependencies
npm install

# Start Express backend (Runs on port 5001)
npm run dev
```

---

### Step 4: Set Up Frontend Application

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Runs on port 5173)
npm run dev
```

Open your browser at `http://localhost:5173` to access the Command Center.

---

## Project Structure

```text
SmartCityCloudGovernance_Cloud_Project_2026/
├── frontend/                 # React 19 + Vite + TailwindCSS Command Center UI
│   ├── src/
│   │   ├── components/       # Floorplans, maps, charts, simulation playback
│   │   ├── pages/            # Dashboard, Facility, Analytics, Simulation, Alerts
│   │   └── services/         # API client & data transformers
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/      # Route request handlers
│   │   ├── services/         # Risk fusion, Dijkstra routing, propagation cascade
│   │   ├── repositories/     # In-memory & MongoDB database abstractions
│   │   └── models/           # Domain schemas & entities
├── ml-service/               # Python FastAPI Microservice
│   ├── models/               # Serialized .joblib models and evaluation metrics
│   ├── preprocessing/        # Custom scikit-learn transformers
│   ├── app.py                # FastAPI dual-domain prediction server
│   ├── train_forest.py       # Forest model training
│   ├── train_building.py     # Building model training
│   ├── predict_forest.py     # Forest inference
│   ├── predict_building.py   # Building inference
│   └── feature_importance.py # MDI feature importance analysis
├── simulator/                # Multi-zone sensor telemetry simulator
│   └── sensorSimulator.js
├── data/                     # Data stores (forest, building, weather, geography)
├── docs/                     # Academic, architectural, and deployment documentation
│   ├── Abstract.md           # Formal academic abstract
│   ├── Objectives.md         # 8 technical and research objectives
│   ├── Novelty.md            # Technical novelty & comparative analysis vs prior art
│   ├── Research_Gap.md       # 7 identified literature & engineering gaps
│   ├── Literature_Survey_Table.md # 15 surveyed papers & systems comparative matrix
│   ├── Project_Report.md     # Complete technical and academic capstone report
│   ├── AWS_Services.md       # AWS cloud architecture & local-first specifications
│   ├── aws-deployment.md     # AWS deployment runbook
│   ├── aws-integration-guide.md # Cloud architecture & IAM policies
│   └── lambda.md             # Serverless report generator specification
├── infra/                    # Infrastructure as Code (IaC)
│   └── fireguard-infra.yaml  # AWS CloudFormation production template
└── scripts/                  # Automation scripts (setup-ec2.sh, etc.)
```

---

## Complete Documentation Index

For in-depth technical specifications and academic deliverables, refer to the documents in [`docs/`](docs/):

1. **[Academic Abstract](docs/Abstract.md)**: Formal executive summary and academic abstract.
2. **[Project Objectives](docs/Objectives.md)**: The eight foundational technical objectives of the platform.
3. **[Novelty & Prior-Art Analysis](docs/Novelty.md)**: Detailed comparative analysis against existing GitHub fire projects.
4. **[Research Gaps](docs/Research_Gap.md)**: Comprehensive breakdown of the 7 research and engineering gaps resolved by IgnisCore — Intelligent Fire Hazard Monitoring System.
5. **[Literature Survey Table](docs/Literature_Survey_Table.md)**: Analysis of 15 foundation papers and open-source systems.
6. **[Project Report](docs/Project_Report.md)**: Full capstone project report including architecture, ML metrics, and test results.
7. **[AWS Cloud Architecture](docs/AWS_Services.md)**: Production-grade cloud service specifications and local-first mappings.
8. **[AWS Deployment Runbook](docs/aws-deployment.md)**: Step-by-step production cloud deployment guide.
9. **[AWS Integration Guide](docs/aws-integration-guide.md)**: Cloud blueprints, IAM policies, and integration details.
10. **[CloudFormation Infrastructure Template](infra/fireguard-infra.yaml)**: Complete AWS IaC template.

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

Run the automated test suites locally:

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

MIT License - IgnisCore — Intelligent Fire Hazard Monitoring System Project 2026.
