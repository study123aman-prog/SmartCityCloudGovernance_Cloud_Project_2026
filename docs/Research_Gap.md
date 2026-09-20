# Critical Research and Engineering Gaps

## Project Title
**IgnisCore — Intelligent Fire Hazard Monitoring System: Cloud-Native Multi-Zone Fire Hazard Intelligence, Graph-Based Risk Propagation & Dynamic Evacuation Decision Support System**

---

## 1. Overview

While research in fire safety engineering, Internet of Things (IoT) monitoring, and machine learning has expanded rapidly over the past decade, a rigorous review of academic literature and existing open-source repositories reveals significant structural and algorithmic gaps. 

Most existing projects—such as open-source student repositories on GitHub and conventional smart-building prototypes—suffer from hardware dependency, reactive detection limitations, spatial blindness, static evacuation planning, and a lack of interactive decision support.

This document formalizes the **seven core research and engineering gaps** identified across existing literature and systems, detailing how **IgnisCore — Intelligent Fire Hazard Monitoring System** directly addresses each gap.

---

## 2. Identified Research & Engineering Gaps

### Gap 1: Reactive Detection vs. Proactive Pre-Ignition Risk Prediction
- **Existing Limitation in Literature**: The overwhelming majority of existing systems operate on a *post-ignition detection paradigm*. Optical smoke alarms, thermal threshold relays, and computer vision flame-detection models only activate after combustion is underway and smoke or fire is physically present.
- **Consequence**: By the time an alarm is raised, structural damage has begun, toxic carbon monoxide has accumulated, and safe evacuation windows are severely compressed.
- **How IgnisCore — Intelligent Fire Hazard Monitoring System Resolves the Gap**: Implements dual-domain supervised **Random Forest classifiers** trained to detect subtle pre-ignition precursors (e.g., steady thermal creep, electrical circuit load overload, humidity deficit, and ambient atmospheric stress) to predict `HIGH` and `CRITICAL` fire risk *before* flame inception occurs.

---

### Gap 2: Physical Hardware Fragility and Deployment Vulnerability
- **Existing Limitation in Literature**: Academic prototypes and GitHub repositories frequently rely on physical microcontroller boards (Arduino, ESP32, Raspberry Pi) with cheap hobbyist sensors (MQ-2, DHT11/22).
- **Consequence**: Physical hardware sensors are vulnerable to calibration drift, wiring faults, signal noise, and physical destruction during fire events. Crucially, academic evaluators and students cannot safely start real fires to test emergency response during demonstrations, leading to superficial or canned demos.
- **How IgnisCore — Intelligent Fire Hazard Monitoring System Resolves the Gap**: Introduces a **100% Software-Only Virtual Sensor Telemetry Engine** capable of streaming multi-zone environmental, electrical, and structural telemetry across arbitrary facilities. The simulator supports deterministic and stochastic scenario generation (`NORMAL`, `HIGH_TEMPERATURE`, `ELECTRICAL_OVERLOAD`, `SMOKE_INGRESS`, `CRITICAL_FIRE_RISK`), guaranteeing high reproducibility and safe, comprehensive testing.

---

### Gap 3: Spatial Isolation and Absence of Multi-Hop Hazard Propagation
- **Existing Limitation in Literature**: Typical IoT cloud monitoring dashboards treat sensor readings as disconnected data points or isolated rooms. They plot temperatures or smoke indices on separate charts without modeling the spatial topology connecting the spaces.
- **Consequence**: Operators cannot predict how a fire in a basement electrical vault will spread to adjacent ground-floor laboratories, stairwells, or ventilation corridors over time.
- **How IgnisCore — Intelligent Fire Hazard Monitoring System Resolves the Gap**: Represents building facilities as **topological directed graphs** $G = (V, E)$. Implements an algorithmic discrete-time hazard propagation model that calculates heat, smoke, and flame diffusion across neighboring nodes based on physical distance attenuation, room volumes, and structural barrier flammability factors ($\Phi_{barrier}$).

---

### Gap 4: Static Egress Signage vs. Hazard-Adaptive Dynamic Evacuation Routing
- **Existing Limitation in Literature**: Standard architectural safety relies on static exit signage (fixed green exit signs directing occupants toward predetermined staircases). Even modern digital dashboards typically highlight static exits on floorplans.
- **Consequence**: In an actual emergency, a fire or smoke plume may completely engulf the primary designated exit corridor. Occupants following static evacuation routes are led directly into hazardous or impassable zones.
- **How IgnisCore — Intelligent Fire Hazard Monitoring System Resolves the Gap**: Implements a **hazard-weighted dynamic Dijkstra shortest-and-safest pathfinding algorithm**. Zone hazard classifications (`HIGH`, `CRITICAL`) dynamically augment edge traversal costs toward infinity, automatically rerouting occupants away from compromised corridors toward the nearest verified safe emergency exit (e.g., dynamically shifting from Exit A to Exit B).

---

### Gap 5: Absence of Interactive "What-If" Incident Scenario Modeling
- **Existing Limitation in Literature**: Existing smart-city and building management platforms are strictly passive monitoring dashboards. They display historical telemetry or current alerts, but offer no sandbox capability for emergency planners.
- **Consequence**: Facility safety officers and incident commanders cannot evaluate emergency preparedness or train staff on hypothetical scenarios (e.g., *"What happens if an electrical fire ignites in the Server Room at 2:00 PM during peak occupancy under 30 km/h wind conditions?"*).
- **How IgnisCore — Intelligent Fire Hazard Monitoring System Resolves the Gap**: Delivers an interactive **"What-If" Fire Simulation Sandbox** with a time-step scrubber slider. Incident commanders can configure origin rooms, initial severity, ambient weather, and duration, then observe time-step propagation, casualty exposure estimates, and real-time egress adaptation.

---

### Gap 6: Siloed Single-Domain Analysis (Wildland vs. Structural Fire Separation)
- **Existing Limitation in Literature**: Fire safety literature is sharply divided: wildfire research focuses exclusively on satellite imagery and Canadian Forest Fire Weather Index (FWI) meteorology, while smart-building research focuses exclusively on indoor HVAC and smoke sensors.
- **Consequence**: Neglects the Wildland-Urban Interface (WUI), where regional forest fire danger, ambient atmospheric humidity deficits, and high winds directly threaten nearby institutional and commercial campuses.
- **How IgnisCore — Intelligent Fire Hazard Monitoring System Resolves the Gap**: Implements a **Multi-Source Real-Time Risk Fusion Engine** that mathematically combines wildland/forest risk vectors ($w_f$), meteorological weather vectors ($w_w$), structural indoor facility vectors ($w_b$), and human occupancy exposure vectors ($w_e$) into an explainable, unified hazard score.

---

### Gap 7: Cloud Vendor Lock-In vs. Decoupled Local-First Operational Resiliency
- **Existing Limitation in Literature**: Cloud-based fire monitoring systems in literature often hardcode proprietary AWS or Azure SDK calls directly into core prediction logic. If cloud credentials expire, internet connectivity drops, or student cloud budgets run out, the system crashes completely.
- **Consequence**: Fragile evaluation setups, zero offline survivability, and high barrier to entry for educational review.
- **How IgnisCore — Intelligent Fire Hazard Monitoring System Resolves the Gap**: Engineered with a **strictly decoupled dual architecture**:
  - **Local-First Core**: Fully functional locally with in-memory and local repository fallbacks, local ML serving (FastAPI), and local simulation.
  - **Production Cloud Readiness**: Full architectural mapping and Infrastructure-as-Code (AWS CloudFormation) for AWS IoT Core, Lambda, DynamoDB, S3, CloudFront, SNS, API Gateway, and CloudWatch.

---

## 3. Summary Gap-Resolution Matrix

| Research Gap | Conventional Prior Art | IgnisCore — Intelligent Fire Hazard Monitoring System Technical Solution |
| :--- | :--- | :--- |
| **G1: Pre-Ignition Prediction** | Reactive alarms after smoke/flame occurs | Dual Random Forest ML classifiers evaluating pre-ignition precursors |
| **G2: Hardware Fragility** | Fragile physical microcontrollers & sensors | 100% Software-Only high-fidelity virtual telemetry generator |
| **G3: Spatial Propagation** | Isolated point sensors without spatial topology | Directed graph discrete-time hazard cascade across adjacent rooms |
| **G4: Dynamic Evacuation** | Static fixed exit signs | Hazard-weighted dynamic Dijkstra routing avoiding compromised zones |
| **G5: What-If Simulation** | Passive live dashboards only | Interactive sandbox with time-step playback slider & scenario modeling |
| **G6: Domain Fragmentation** | Wildland OR structural, never unified | Multi-source weighted risk fusion ($w_f \cdot \text{Forest} + w_b \cdot \text{Building} + \dots$) |
| **G7: Cloud Lock-In** | Fragile cloud-dependent or cloud-absent setups | Decoupled local-first autonomy + production-grade AWS CloudFormation IaC |