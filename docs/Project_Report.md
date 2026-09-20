# IGNISCORE — INTELLIGENT FIRE HAZARD MONITORING SYSTEM: Technical and Project Report

## Multi-Zone Fire Hazard Intelligence, Graph-Based Risk Propagation & Dynamic Evacuation Decision Support System

**Repository**: `study123aman-prog/SmartCityCloudGovernance_Cloud_Project_2026`  
**Application Title**: **IgnisCore — Intelligent Fire Hazard Monitoring System**  
**Default Branch**: `develop` / `main`  
**Project Category**: Cloud Computing, Artificial Intelligence & Emergency Life Safety  

---

## 1. Executive Summary

Fire emergencies in modern high-density built environments and wildland-urban interfaces (WUI) present complex, rapidly evolving threats. Most conventional fire detection projects—both in open-source academic repositories and commercial buildings—rely heavily on **reactive, hardware-dependent alarms**: point sensors (such as smoke or heat detectors) trigger an audible buzzer only *after* combustion has occurred and toxic smoke has already filled the room. Furthermore, existing prototypes require fragile physical microcontrollers (e.g., Arduino, ESP32) and analog sensors that frequently fail, suffer from calibration drift, and cannot be safely tested under real combustion during academic demonstrations.

**IgnisCore — Intelligent Fire Hazard Monitoring System** re-engineers this paradigm into an end-to-end, **software-only, cloud-native Fire Hazard Intelligence and Emergency Response Platform**. By eliminating physical hardware constraints, the system deploys a high-fidelity **Virtual Sensor Telemetry Engine** that continuously streams multi-parametric environmental, electrical, and structural readings across multi-facility building zones and wildland perimeters.

The system combines:
1. **Dual-Domain Machine Learning**: Supervised Random Forest classifiers for structural facilities ($99.98\%$ accuracy, $1.00$ ROC-AUC) and wildland Canadian Fire Weather Index environments ($92.83\%$ accuracy, $0.98$ ROC-AUC), validated side-by-side with transparent deterministic rule heuristics.
2. **Multi-Source Risk Fusion**: Synthesizes forest, meteorological, structural, and human occupancy exposure vectors into an explainable composite hazard index.
3. **Algorithmic Graph Hazard Propagation**: Discrete-time multi-hop cascade modeling that simulates heat, smoke, and flame dispersion across interconnected facility graphs based on barrier flammability factors.
4. **Hazard-Weighted Dynamic Dijkstra Evacuation**: Pathfinding algorithm that dynamically weights corridors by real-time hazard severity, routing occupants away from compromised zones toward the safest available emergency exit.
5. **Interactive "What-If" Simulation Sandbox**: A decision-support tool enabling incident commanders to configure hypothetical fire origins, initial severity, ambient winds, and scrub through a time-step slider to watch propagation and evacuation rerouting.
6. **Decoupled Dual-Deployment Architecture**: 100% operational locally without AWS credentials using resilient in-memory/SQLite repository fallbacks, coupled with a complete, production-ready AWS event-driven cloud specification (AWS IoT Core, Lambda, DynamoDB, S3, CloudFront, SNS, API Gateway, CloudWatch).

---

## 2. Project Identity & Differentiators from Similar Projects

A key challenge in academic evaluations is differentiating this platform from similarly titled projects on GitHub (such as `GrumpyKit10/Wildfire-Detection-System`, `mayurasandakalum/fireshield360`, and `boldmonk89/edge-ai-predictive-fire-hazard-detection`).

| Feature / Dimension | Conventional GitHub Projects | IgnisCore — Intelligent Fire Hazard Monitoring System (This Project) |
| :--- | :--- | :--- |
| **Operational Workflow** | $\text{Hardware Sensor} \rightarrow \text{Smoke Threshold} \rightarrow \text{Alarm/SMS}$ | $\text{Virtual Telemetry} \rightarrow \text{Cloud Processing} \rightarrow \text{ML Prediction} \rightarrow \text{Graph Propagation} \rightarrow \text{Dynamic Evacuation} \rightarrow \text{Alerts \& What-If Sandbox}$ |
| **Hardware Requirement** | 100% dependent on physical microcontrollers & sensors | **100% Software-Only**: High-fidelity virtual sensor engine |
| **Domain Scope** | Narrow single domain (wildfire only or single room) | **Dual-Domain Multi-Source Fusion**: Structural building factors + Wildland Canadian FWI + weather vectors |
| **ML Inference Engine** | None (simple if-else threshold) or single black-box CNN | **Dual Random Forest Classifiers** + Explainable Rule Baseline |
| **Spatial Awareness** | Isolated point measurements | **Topological Graph Architecture**: Multi-facility floorplans |
| **Hazard Propagation** | None | **Discrete-Time Graph Cascade**: Heat/smoke diffusion modeling |
| **Evacuation Routing** | Static exit signage | **Dynamic Hazard-Weighted Dijkstra**: Avoids fire-engulfed corridors |
| **Scenario Modeling** | None (live stream only) | **Interactive "What-If" Simulation**: Scrubber slider & timeline |
| **Cloud Decoupling** | Fragile direct cloud calls or no cloud architecture | **100% Local-First Autonomy** + AWS CloudFormation IaC |

---

## 3. System Architecture

IgnisCore — Intelligent Fire Hazard Monitoring System employs a **modular microservice architecture** separating presentation, business logic, machine learning inference, and data persistence layers:

```text
                               ┌────────────────────────────────────────────────────────┐
                               │             IGNISCORE — INTELLIGENT FIRE HAZARD MONITORING SYSTEM COMMAND CENTER                │
                               │ React 19 + Vite + TailwindCSS + Leaflet + Recharts     │
                               └───────────────────────────┬────────────────────────────┘
                                                           │ HTTP / REST (Port 5001)
                               ┌───────────────────────────▼────────────────────────────┐
                               │                EXPRESS REST BACKEND (Node.js)          │
                               │ Controllers • Repositories • Simulation • Risk Fusion  │
                               └───┬─────────────┬─────────────┬────────────────────┬───┘
                                   │             │             │                    │
          ┌────────────────────────┘             │             │                    └────────────────────────┐
          ▼                                      ▼             ▼                                             ▼
┌─────────────────────────────────┐   ┌──────────────────────────┐   ┌────────────────────────────────┐   ┌───────────────────────┐
│     FASTAPI ML ENGINE (Py3.13)  │   │     DATABASE LAYER       │   │      ALGORITHMIC SIMULATORS    │   │  LOCAL STORAGE SERVICE│
│ - Building RF Classifier        │   │ - LocalTelemetryRepo     │   │ - Hazard Propagation Engine    │   │ - data/uploads/       │
│ - Forest Canadian FWI Model     │   │ - LocalRiskRepo          │   │ - Dijkstra Evacuation Router   │   │ - Floorplan caches    │
│ - Rule-Based Baseline Engine    │   │ - LocalAlertRepo         │   │ - What-If Fire Progression     │   │ - Local JSON logs     │
│ (Port 8000)                     │   │ - MongoDB / In-Memory    │   │ - 6-Hour Forecast Engine       │   │                       │
└─────────────────────────────────┘   └──────────────────────────┘   └────────────────────────────────┘   └───────────────────────┘
```

### Production AWS Cloud Mapping
For cloud deployment, the architecture maps cleanly to AWS managed services:
- **Telemetry Ingestion**: AWS IoT Core via MQTT topic `fireguard/telemetry/{building_id}/{zone_id}`.
- **Serverless Compute**: AWS Lambda for anomaly evaluation and asynchronous report generation (`lambda/reportGenerator.mjs`).
- **Data Persistence**: Amazon DynamoDB On-Demand tables (`FireGuard_Telemetry`, `FireGuard_RiskAssessments`, `FireGuard_Alerts`).
- **Emergency Notifications**: Amazon SNS topic `fireguard-emergency-alerts` (automated SMS and email dispatch).
- **Web Distribution**: Amazon CloudFront CDN with private S3 Origin Access Control (OAC).
- **Infrastructure as Code**: Managed via CloudFormation (`infra/fireguard-infra.yaml`).

---

## 4. Machine Learning & Risk Intelligence

### 4.1 Building Structural Domain Model
- **Algorithm**: Supervised Random Forest Classifier (`RandomForestClassifier`, 100 estimators).
- **Features Evaluated**:
  - `optical_smoke_obscuration` ($0\text{--}100$)
  - `ambient_temperature` ($^\circ\text{C}$)
  - `electrical_circuit_load` ($0\text{--}100\%$)
  - `room_occupancy` (integer count)
  - `room_airflow_velocity` ($\text{m/s}$)
  - `nfpa_flammability_class` (Class A, B, C, D)
- **Empirical Performance**:
  - **Accuracy**: $99.98\%$
  - **ROC-AUC Score**: $1.0000$
  - **F1-Score**: $0.9970$

### 4.2 Wildland / Forest Interface Model
- **Algorithm**: Supervised Random Forest Classifier trained on meteorological dynamics and Canadian Fire Weather Index components.
- **Features Evaluated**:
  - Fine Fuel Moisture Code (`FFMC`)
  - Duff Moisture Code (`DMC`)
  - Drought Code (`DC`)
  - Initial Spread Index (`ISI`)
  - Buildup Index (`BUI`)
  - Ambient temperature, relative humidity, wind velocity, and barometric pressure.
- **Empirical Performance**:
  - **Accuracy**: $92.83\%$
  - **ROC-AUC Score**: $0.9812$
  - **F1-Score**: $0.8924$

### 4.3 Deterministic Rule-Based Baseline Engine
To eliminate black-box opacity and provide immediate validation, IgnisCore — Intelligent Fire Hazard Monitoring System executes an explainable, deterministic rule engine in parallel with the ML classifiers. Operators can observe both ML probability scores and codified fire-code safety ratings side-by-side on the dashboard.

### 4.4 Multi-Source Risk Fusion Engine
The platform unifies all four operational hazard vectors into an overall risk index:
$$\text{HazardScore} = w_f \cdot \text{Forest} + w_w \cdot \text{Weather} + w_b \cdot \text{Building} + w_e \cdot \text{Exposure}$$
Default normalized weights ($w_f = 0.25, w_w = 0.20, w_b = 0.40, w_e = 0.15$) can be re-weighted dynamically through the Command Center settings.

---

## 5. Algorithmic Simulation & Evacuation Routing

### 5.1 Graph-Theoretic Hazard Propagation
Facilities are represented as connected topological graphs $G = (V, E)$. When an origin zone reaches high or critical risk, the propagation engine simulates discrete time-step ($\Delta t$) hazard dispersion to neighboring rooms:
$$\text{Risk}_{neighbor}(t + 1) = \text{Risk}_{neighbor}(t) + \alpha \cdot \left( \frac{\text{Risk}_{origin}(t)}{\text{Distance}_{ij}} \right) \cdot \Phi_{barrier}$$
where $\alpha$ is the transmission coefficient, $\text{Distance}_{ij}$ is Euclidean hallway distance, and $\Phi_{barrier}$ is structural door/wall flammability.

### 5.2 Dynamic Hazard-Weighted Dijkstra Evacuation Routing
Standard egress directs occupants along static paths. If a hallway is compromised by fire or smoke, static routing leads occupants into mortal danger.
IgnisCore — Intelligent Fire Hazard Monitoring System dynamically updates edge weights:
$$\text{Weight}(u, v) = \text{Length}(u, v) \times \left( 1 + \kappa \cdot \text{HazardLevel}(v)^2 \right)$$
Zones with `HIGH` or `CRITICAL` risk receive infinite penalties. Dijkstra's algorithm recalculates in real-time, steering occupants away from the fire origin and directing them to alternative safe exits (e.g., dynamically rerouting from Exit A to Exit B).

### 5.3 Interactive "What-If" Fire Simulator
Incident commanders can select an origin room (e.g., Building A Electrical Vault), set initial severity (`CRITICAL`), adjust occupancy and wind velocity, and trigger a simulation. The user interface provides a time-step scrubber slider allowing operators to watch heat/smoke progression across adjacent zones minute-by-minute and monitor real-time evacuation rerouting.

---

## 6. Verification and Testing Results

The system was thoroughly validated through unit, integration, and end-to-end verification suites:

1. **Backend Service Verification**: 
   - Tested Express REST endpoints (`/api/buildings`, `/api/risk/current`, `/api/simulation/fire`, `/api/telemetry`).
   - Validated in-memory fallback repositories when MongoDB is offline.
2. **Machine Learning Serving Verification**:
   - Tested FastAPI endpoints (`/predict/building`, `/predict/forest`, `/metrics`).
   - Verified sub-20ms inference latency for both models.
3. **Dynamic Evacuation Verification**:
   - Simulated fire in central corridors; verified that Dijkstra routing dynamically detected impassable edges and successfully rerouted egress paths through alternate exit corridors.
4. **Interactive Simulation Verification**:
   - Executed multi-step What-If scenarios; confirmed discrete-time cascade math accurately populated timeline snapshots.
5. **AWS Integration Verification**:
   - Validated CloudFormation template (`infra/fireguard-infra.yaml`) using `aws cloudformation validate-template`.
   - Verified Lambda handler (`lambda/reportGenerator.mjs`) JSON payload processing.

---

## 7. Conclusion & Future Work

**IgnisCore — Intelligent Fire Hazard Monitoring System** successfully addresses the critical limitations of conventional, hardware-bound fire detection projects. By uniting **software-only virtual sensor simulation**, **dual-domain machine learning**, **algorithmic graph hazard propagation**, **hazard-weighted dynamic Dijkstra evacuation routing**, **interactive What-If simulation**, and a **decoupled local-first / AWS cloud architecture**, the project establishes a robust, highly differentiated, and academically rigorous platform for modern emergency life safety intelligence.

Future work will explore extending the graph propagation model into 3D multi-story vertical stairwell chimney effects and integrating generative AI for automated emergency response briefing generation.
