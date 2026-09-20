# Project Objectives

## Project Title
**IgnisCore — Intelligent Fire Hazard Monitoring System: Cloud-Native Multi-Zone Fire Hazard Intelligence, Graph-Based Risk Propagation & Dynamic Evacuation Decision Support System**

---

### Primary Project Goal

The primary objective of **IgnisCore — Intelligent Fire Hazard Monitoring System** is to build a comprehensive, software-only, cloud-based fire hazard intelligence and emergency response platform. The system eliminates reliance on physical sensor hardware by generating high-fidelity simulated environmental and structural telemetry, predicting multi-zone fire risk via machine learning, modeling multi-hop fire propagation across interconnected facility graphs, dynamically computing safest evacuation egress routes that avoid compromised zones, and providing interactive incident decision-support tooling.

---

### Key Technical & Research Objectives

#### 1. Implement a Software-Only Virtual Sensor Telemetry Simulator
- Develop a Python and Node.js virtual sensor telemetry generator capable of streaming realistic, multi-parametric data across heterogeneous facilities (e.g., Building A: Research Labs & Electrical Vaults; Building B: Compute Infrastructure & Classrooms; Building C: Logistics & Hazardous Storage).
- Simulate both baseline and hazardous operational regimes, including:
  - `NORMAL`: Ambient diurnal thermal variations and nominal electrical loads.
  - `HIGH_TEMPERATURE`: Overheating equipment, thermal runaway, and summer heatwaves.
  - `ELECTRICAL_OVERLOAD`: Circuit breaker strain, wiring stress, and excessive current draws.
  - `SMOKE_INGRESS`: Rising optical smoke obscuration indices.
  - `CRITICAL_FIRE_RISK`: Compounded thermal, electrical, and combustible atmospheric vectors.
- Ensure the simulator is fully controllable via CLI flags and REST API endpoints (e.g., `--scenario`, `--interval`, `--building`).

#### 2. Build Dual-Domain Machine Learning Risk Prediction Engines with Rule Baselines
- **Forest / Wildland Interface**: Train and serialize a supervised Random Forest classifier on meteorological variables (temperature, relative humidity, wind speed, pressure, rainfall) and Canadian Fire Weather Index components (`FFMC`, `DMC`, `DC`, `ISI`, `BUI`, `FWI`).
- **Building / Facility Domain**: Train and serialize a Random Forest classifier evaluating optical smoke obscuration, thermal sensors, electrical circuit loads, occupant counts, room airflow, and NFPA material flammability ratings.
- Output calibrated risk classifications (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) along with continuous risk probabilities (0.0 to 1.0).
- Deploy an explainable, deterministic rule-based engine running side-by-side with the ML models to allow incident operators to validate AI predictions against established fire-safety safety heuristics.

#### 3. Engineer a Multi-Source Real-Time Risk Fusion Engine
- Formulate a mathematical risk synthesis algorithm that fuses four independent risk vectors into a single unified hazard score:
  $$\text{HazardScore} = w_f \cdot \text{Forest} + w_w \cdot \text{Weather} + w_b \cdot \text{Building} + w_e \cdot \text{Exposure}$$
- Provide real-time configurable weighting via the web interface to enable operators to adapt risk sensitivity based on seasonal or structural threat profiles.

#### 4. Formulate an Algorithmic Graph Hazard Propagation Cascade Model
- Represent facility floorplans as topological graphs where nodes denote functional rooms/corridors and edges denote physical connections (doors, hallways, ventilation shafts).
- Implement a discrete-time multi-hop hazard cascade algorithm that models the spread of heat, smoke, and combustible gasses to adjacent zones based on distance attenuation and structural barrier flammability factors.
- Avoid physically inaccurate black-box claims by framing the engine explicitly as an *algorithmic hazard-propagation model* for emergency decision support.

#### 5. Implement Dynamic Hazard-Adaptive Evacuation Routing
- Develop a graph-theoretic shortest-and-safest pathfinding engine using Dijkstra's algorithm.
- Dynamically augment edge traversal weights based on real-time zone hazard severity:
  - Zones with `HIGH` or `CRITICAL` fire hazard are marked impassable or heavily penalized.
  - Occupant evacuation routes automatically recalculate in real time to direct individuals to the nearest safe emergency exit (e.g., Exit A vs. Exit B) while avoiding smoke-filled or fire-compromised corridors.
- Provide clear route warnings if safe evacuation egress is severely compromised.

#### 6. Build an Interactive "What-If" Fire Incident Simulation Sandbox
- Create an API and user interface allowing emergency managers to model hypothetical disaster scenarios by configuring:
  - Fire origin room
  - Initial flame/smoke severity
  - Facility occupancy levels
  - Ambient wind speed and direction
  - Simulation duration (minutes)
- Generate a multi-step timeline playback allowing operators to scrub through simulated fire progression and observe real-time spread across neighboring rooms and dynamic evacuation rerouting.

#### 7. Architect an Event-Driven AWS Cloud Integration with Local-First Independence
- Design a cloud-native AWS serverless reference architecture:
  - **AWS IoT Core**: Ingesting virtual MQTT telemetry packets.
  - **AWS Lambda**: Serverless execution of telemetry validation, report generation, and alarm thresholds.
  - **Amazon DynamoDB**: Scalable NoSQL persistence for time-series readings, zone hazard states, and prediction logs.
  - **Amazon S3 & CloudFront**: Secure hosting of the static web application and archival report storage.
  - **Amazon SNS**: Instantaneous dispatch of multi-channel emergency SMS and email notifications upon detection of critical risks.
  - **Amazon CloudWatch & IAM**: System observability, metric dashboards, and least-privilege security roles.
- Maintain complete **local-first operational autonomy**: ensure the entire application can run, simulate, predict, and visualize locally without requiring an active AWS account, cloud billing, or internet connectivity.

#### 8. Deliver an Operator Command Center Web Dashboard
- Build a responsive, modern web interface using React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Leaflet GIS.
- Incorporate interactive 2D spatial facility floorplans color-coded by real-time risk level (`LOW` = Green, `MEDIUM` = Yellow, `HIGH` = Orange, `CRITICAL` = Red).
- Provide live multi-sensor telemetry charts, 6-hour time-series predictive forecasts, active alert management with acknowledgment workflows, and geospatial wildland risk mapping.

---

### Expected Outcomes & Academic Deliverables

1. **Working Prototype**: A fully functional, local-first web platform running on Node.js/Express, Python/FastAPI, and React with zero hardware dependencies.
2. **Reproducible Machine Learning Pipelines**: Fully scripted synthetic dataset generation, training scripts, model serialization (`joblib`), and empirical evaluation metrics (confusion matrices, ROC curves, F1-scores).
3. **Infrastructure as Code (IaC)**: Production-ready AWS CloudFormation (`fireguard-infra.yaml`) and deployment runbooks for cloud migration.
4. **Research Documentation**: Comprehensive technical reports, literature surveys, and novelty analyses clearly establishing the project's differentiators over conventional fire alarm systems.
