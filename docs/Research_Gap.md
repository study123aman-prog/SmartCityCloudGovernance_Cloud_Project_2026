# Critical Research and Engineering Gaps

## Project Title
**IgnisCore — Intelligent Fire Hazard Monitoring System: Cloud-Native Multi-Zone Fire Hazard Intelligence, Graph-Based Risk Propagation & Dynamic Evacuation Decision Support System**

---

## 1. Overview

A critical evaluation of 15 recent peer-reviewed research papers (published between 2023 and 2025 across **IEEE, Springer, Elsevier, ACM, Wiley, MDPI, and Nature**) reveals foundational algorithmic, architectural, and operational limitations in contemporary fire hazard monitoring and emergency evacuation systems.

Prior art suffers from physical sensor hardware vulnerability, heavy non-real-time computational fluid dynamics (CFD) modeling, black-box unexplainable machine learning, binary obstacle routing assumptions, single-domain isolation between wildland and structural contexts, and passive cloud pipelines lacking embedded spatial intelligence.

This document formalizes the **15 specific research and engineering gaps** identified directly from the surveyed literature and details how the **IgnisCore** platform systematically resolves each gap.

---

## 2. Identified Research & Engineering Gaps (Based on Surveyed Literature)

---

### Gap 1: Inability to Execute Real-Time Hazard Propagation Without Heavy CFD Pre-Computation
- **Surveyed Literature**: Wang, Y., Zhang, X., & Liu, H. (2023). *"A dynamic evacuation path planning method for building fires based on real-time hazard propagation and improved Dijkstra algorithm."* **Safety Science (Elsevier)**, Vol. 164, 106168.
- **Existing Limitation in Literature**: Prior methods rely on heavy numerical CFD simulations (FDS / PyroSim) to generate fire spread tables prior to path computation. Because numerical differential solvers take hours or days to converge, they cannot execute dynamically on live streaming telemetry during evolving emergencies.
- **Consequence**: Systems cannot adapt in real time to unexpected fire behaviors (e.g., flashover, door openings, or sudden wind shifts) that deviate from pre-computed CFD tables.
- **How IgnisCore Resolves the Gap**: Implements a lightweight, discrete-time algorithmic graph cascade model on topological networks $G = (V, E)$. Calculates multi-hop thermal and smoke dissemination across neighboring rooms at sub-second intervals directly from streaming telemetry without requiring offline CFD look-up tables.

---

### Gap 2: Physical Hardware Fragility and Infeasibility of Destructive Testing
- **Surveyed Literature**: Chen, J., Li, M., & Kumar, S. (2024). *"Cloud-Native Edge-Assisted Smart Building Fire Hazard Monitoring Using Distributed AIoT Telemetry and Lightweight Machine Learning."* **IEEE Internet of Things Journal**, 11(4), 5890–5904.
- **Existing Limitation in Literature**: State-of-the-art smart building prototypes depend entirely on physical microcontroller testbeds (Arduino, ESP32, Raspberry Pi) and hobbyist environmental sensors (MQ-2, DHT22).
- **Consequence**: Physical sensors are destroyed by heat and flames during live fire events, terminating telemetry streams when needed most. Furthermore, safety regulations prevent researchers and evaluators from igniting real fires during live system demonstrations, resulting in superficial testing.
- **How IgnisCore Resolves the Gap**: Deploys a **100% Software-Only Virtual Sensor Telemetry Engine** streaming multi-zone environmental, electrical, and structural parameters (`NORMAL`, `HIGH_TEMPERATURE`, `ELECTRICAL_OVERLOAD`, `SMOKE_INGRESS`, `CRITICAL_FIRE_RISK`). Guarantees zero hardware destruction risk, zero calibration drift, and complete experimental reproducibility.

---

### Gap 3: Disconnection Between Black-Box ML Risk Scores and Deterministic Fire Safety Codes
- **Surveyed Literature**: Al-Smadi, M., Al-Ghamdi, A., & Khan, Z. (2023). *"Predictive Multi-Zone Structural Fire Risk Modeling Using Ensembled Machine Learning and Temporal Feature Engineering."* **Fire Technology (Springer)**, 59(5), 2315–2342.
- **Existing Limitation in Literature**: Stacking ensemble models predict fire occurrence with high numerical accuracy but output opaque probabilities without explaining feature attributions or validating against established fire safety heuristics.
- **Consequence**: Incident commanders and regulatory authorities distrust black-box AI predictions, causing hesitation and delayed evacuation orders during critical life-safety windows.
- **How IgnisCore Resolves the Gap**: Implements dual-domain supervised Random Forest classifiers deployed **side-by-side with an explainable deterministic rule-based engine** (evaluating NFPA thermal and electrical load thresholds). Provides emergency responders with transparent, auditable rationale alongside ML probabilities.

---

### Gap 4: Binary Obstacle Assumptions Causing Route Oscillation in Dynamic Egress
- **Surveyed Literature**: Zhou, T., Xu, P., & Kang, K. (2023). *"Digital twin-driven dynamic emergency evacuation framework for smart buildings integrated with BIM and spatial topological graphs."* **Automation in Construction (Elsevier)**, Vol. 152, 104921.
- **Existing Limitation in Literature**: BIM-based dynamic evacuation frameworks treat hazard obstacles as binary states (either completely passable or 100% blocked).
- **Consequence**: Occupants are routed through corridors with rapidly accumulating toxic smoke until a discrete threshold is tripped, triggering abrupt route recalculation and severe path oscillation that induces civilian panic.
- **How IgnisCore Resolves the Gap**: Employs continuous **quadratic hazard-cost edge penalization** ($\text{Weight} \propto \text{HazardLevel}^2$) in its dynamic Dijkstra pathfinding algorithm. Edge traversal costs smoothly scale with heat and smoke obscuration, steering occupants away from creeping smoke plumes well before corridors become impassable.

---

### Gap 5: Siloed Indoor Structural Focus Neglecting Wildland-Urban Interface (WUI) Threats
- **Surveyed Literature**: Sharma, P., Verma, A., & Gupta, R. (2024). *"Multi-Sensor Risk Fusion and Pre-Ignition Hazard Identification in Smart Commercial Facilities Using Deep Learning."* **IEEE Access**, 12, 41250–41267.
- **Existing Limitation in Literature**: Smart facility fire detection systems focus exclusively on interior parameters (electrical wiring loads, HVAC duct sensors), completely ignoring regional meteorological weather and ambient wildfire danger.
- **Consequence**: Facilities located in Wildland-Urban Interface (WUI) zones remain oblivious to approaching wildfire ember showers, low atmospheric humidity deficits, and high ambient wind gusts that drastically elevate structural ignition risk.
- **How IgnisCore Resolves the Gap**: Implements a **Real-Time Multi-Source Risk Fusion Engine** that mathematically unifies external forest fire risk ($w_f$), meteorological weather vectors ($w_w$), interior structural parameters ($w_b$), and human occupancy exposure ($w_e$) into an explainable composite index.

---

### Gap 6: Opaque Graph Neural Networks Lacking Parameterizable Barrier Flammability Controls
- **Surveyed Literature**: Zhang, L., Wu, J., & Zhao, Y. (2023). *"Graph neural networks for spatiotemporal modeling of hazard propagation in complex indoor architectural networks."* **Scientific Reports (Nature Portfolio)**, 13, Article 18452.
- **Existing Limitation in Literature**: Spatiotemporal GNNs predict hazard diffusion using latent vector embeddings that obscure the physical parameters governing fire progression, requiring heavy GPU clusters for inference.
- **Consequence**: Safety officers cannot adjust physical barrier properties (e.g., fire-rated doors, concrete partitions vs. drywalls) to model structural containment strategies.
- **How IgnisCore Resolves the Gap**: Formulates an algorithmic discrete-time cascade model explicitly incorporating physical room volumes, distance attenuation, and **structural barrier flammability factors ($\Phi_{barrier}$)**. Executes in milliseconds on standard CPU and browser runtimes.

---

### Gap 7: Wireless Mesh Partitioning and Total Absence of Local-First Cloud Resiliency
- **Surveyed Literature**: Al-Khafaji, H., Al-Bayati, A., & Taha, M. (2024). *"An IoT-Enabled Real-Time Fire Hazard Monitoring and Dynamic Egress Routing System Using Wireless Sensor Networks."* **Sensors (MDPI)**, 24(8), 2541.
- **Existing Limitation in Literature**: IoT egress routing prototypes depend on active ZigBee/LoRa wireless mesh communication and centralized cloud servers.
- **Consequence**: Intense fire burns intermediary gateway nodes and severs wide-area internet connections, inducing complete network partitioning and causing the entire safety monitoring and evacuation system to crash.
- **How IgnisCore Resolves the Gap**: Engineered with a **strictly decoupled dual architecture**:
  - **Local-First Autonomy**: 100% operational locally with in-memory state, local ML serving (FastAPI), and local client rendering during internet or cloud outages.
  - **Cloud-Native Scalability**: Ready for production-scale deployment via AWS CloudFormation (AWS IoT Core, Lambda, DynamoDB, SNS).

---

### Gap 8: Inability to Provide Interactive "What-If" Scenario Sandboxing for Incident Drill
- **Surveyed Literature**: Ray, P. P., Dash, D., & De, D. (2023). *"Edge-Computing-Driven Cyber-Physical System for Fire Emergency Evacuation: Architecture, Path Optimization, and Validation."* **ACM Transactions on Cyber-Physical Systems**, 7(3), 1–24.
- **Existing Limitation in Literature**: Cyber-physical emergency systems operate strictly in reactive real-time or playback mode, lacking interactive sandbox tools for simulating counterfactual disaster scenarios.
- **Consequence**: Incident commanders and emergency planning personnel cannot conduct interactive table-top drills or test facility vulnerabilities before actual emergencies take place.
- **How IgnisCore Resolves the Gap**: Incorporates an interactive **"What-If" Fire Incident Simulation Sandbox** featuring a timeline scrubber. Operators configure origin rooms, initial flame/smoke severity, occupancy densities, and ambient wind conditions to observe time-step cascade evolution and dynamic egress rerouting.

---

### Gap 9: Static Post-Hoc Risk Inspection Without Live Dynamic Egress Coupling
- **Surveyed Literature**: Patel, K., Shah, M., & Vora, J. (2024). *"Explainable AI-Driven Multi-Criteria Decision Support System for Industrial Fire Hazard Assessment and Emergency Response."* **Expert Systems (Wiley)**, 41(2), e13421.
- **Existing Limitation in Literature**: Industrial risk assessment frameworks utilize explainable AI (SHAP/XGBoost) for static post-hoc safety audits based on historical inspection records, disconnected from real-time spatial navigation.
- **Consequence**: High-fidelity risk explanations remain isolated in static audit reports, providing zero operational guidance to building occupants during an active fire incident.
- **How IgnisCore Resolves the Gap**: Couples continuous real-time ML risk predictions and explainable rule heuristics directly into an active graph navigation pipeline, translating live threat classifications into dynamic egress updates instantly.

---

### Gap 10: Outdoor-Only Wildfire Meteorologies Disconnected from Building Life Safety
- **Surveyed Literature**: Meng, X., Chen, C., & Sun, J. (2024). *"Coupled Wildland-Urban Interface Fire Risk Assessment Using Meteorological Indices and Machine Learning Algorithms."* **Fire Safety Journal (Elsevier)**, Vol. 143, 104085.
- **Existing Limitation in Literature**: Regional wildfire hazard models utilize Canadian Forest Fire Weather Index (FWI) components (`FFMC`, `DMC`, `DC`, `ISI`, `BUI`) exclusively for open-terrain vegetation fires.
- **Consequence**: FWI indices are never ingested by indoor facility monitoring systems, leaving campus facilities vulnerable to peripheral wildfire fronts and ember cast.
- **How IgnisCore Resolves the Gap**: Ingests Canadian FWI parameters into its dual-domain ML pipeline, mathematically fusing outdoor moisture and weather danger with indoor circuit loads, room temperatures, and occupant counts.

---

### Gap 11: High Desktop Compute Overhead Preventing Web-Accessible Cloud Alerting
- **Surveyed Literature**: Li, X., Wang, Q., & Han, D. (2025). *"Multi-Agent Simulation and Dynamic Pathfinding for High-Rise Building Fire Evacuation Considering Real-Time Toxic Smoke Diffusion."* **Buildings (MDPI)**, 15(2), 298.
- **Existing Limitation in Literature**: Sophisticated multi-agent pedestrian evacuation and smoke models require heavy desktop simulation suites (AnyLogic, Pyrosim), lacking lightweight web interfaces or automated cloud alerting.
- **Consequence**: Emergency personnel in the field and mobile building occupants cannot access the simulation outputs, and the system cannot automatically trigger multi-channel SMS/push alerts.
- **How IgnisCore Resolves the Gap**: Built as a responsive, cloud-native web application accessible from any modern browser, backed by lightweight REST/WebSocket APIs and integrated with **Amazon SNS** for automated multi-channel emergency broadcast.

---

### Gap 12: Passive Cloud Pipelines Lacking Embedded Spatial Domain Intelligence
- **Surveyed Literature**: Sunkpho, J., Ramaswamy, M., & Kaewkham-Ai, B. (2023). *"Cloud-Based Intelligent Smart City Disaster Monitoring System Utilizing IoT Sensors and Event-Driven Microservices."* **Journal of Ambient Intelligence and Humanized Computing (Springer)**, 14(9), 11845–11858.
- **Existing Limitation in Literature**: Existing smart-city cloud architectures utilize serverless microservices purely as passive data ingestion pipelines (relaying raw sensor packets to cloud databases).
- **Consequence**: Cloud services remain domain-agnostic pipelines with no embedded knowledge of building topology, fire spread mechanics, or dynamic route recalculation.
- **How IgnisCore Resolves the Gap**: Integrates serverless AWS building blocks (**AWS IoT Core**, **AWS Lambda**, **Amazon DynamoDB**, **Amazon SNS**) directly with domain-specific machine learning classifiers, topological graph models, and dynamic pathfinding algorithms.

---

### Gap 13: Simulation Sandboxes Disconnected from Live Streaming Telemetry Pipelines
- **Surveyed Literature**: Song, W., Lv, X., & Fang, Z. (2024). *"Interactive 'What-If' Scenario Simulation for Building Emergency Response Management Based on Graph-Theoretic Hazard Diffusion Models."* **Advanced Engineering Informatics (Elsevier)**, Vol. 60, 102431.
- **Existing Limitation in Literature**: Interactive emergency management sandboxes operate as isolated offline demonstration tools using hand-crafted static inputs.
- **Consequence**: Emergency commanders cannot switch between live telemetry feeds and hypothetical contingency modeling within the same operational dashboard.
- **How IgnisCore Resolves the Gap**: Unifies streaming virtual telemetry monitoring with on-demand "What-If" scenario sandboxing in a single cohesive platform, allowing operators to seamlessly toggle between live monitoring and simulated crisis scenarios.

---

### Gap 14: Generic Industrial Edge-Cloud Systems Lacking Fire Safety Domain Specifics
- **Surveyed Literature**: Kumar, A., Singh, R., & Buyya, R. (2024). *"Fault-Tolerant and Resilient IoT-Edge-Cloud Architectures for Critical Industrial Safety Monitoring Systems."* **IEEE Transactions on Industrial Informatics**, 20(3), 3412–3423.
- **Existing Limitation in Literature**: Edge-cloud resilience frameworks focus on generalized server failover and generic message queuing, lacking fire-safety domain semantics.
- **Consequence**: General failover protocols do not incorporate life-safety egress routing, pre-ignition thermal precursor heuristics, or multi-zone hazard prioritization.
- **How IgnisCore Resolves the Gap**: Tailors local-first autonomous edge execution specifically for fire emergencies—ensuring that ML risk classification, graph propagation, and Dijkstra evacuation routing continue functioning with zero latency even during total cloud disconnect.

---

### Gap 15: Macroscopic Urban Hazard Indices Lacking Granular Room-Level Routing
- **Surveyed Literature**: Park, S., Kim, H., & Choi, J. (2025). *"Multi-Source Risk Fusion for Comprehensive Urban Fire Hazard Indexing Integrating Physical, Environmental, and Human Vulnerability Factors."* **Fire (MDPI)**, 8(1), 19.
- **Existing Limitation in Literature**: Multi-source urban hazard indices evaluate aggregate municipal census tracts or macro building complexes, producing static city-wide risk maps.
- **Consequence**: Macroscopic indices cannot resolve micro-scale indoor room hazards (e.g., an electrical cabinet fire in Basement Vault B vs. safe corridors on Level 2) and cannot guide individual building occupants to safety.
- **How IgnisCore Resolves the Gap**: Applies multi-source risk fusion down to granular, multi-zone indoor room and corridor nodes, linking room-level threat scores directly to dynamic egress path optimization across individual facility floorplans.

---

## 3. Summary Gap-Resolution Matrix

| Gap No. | Surveyed Reference Paper & Venue | Conventional Prior Art / Limitation | IgnisCore Technical Solution |
| :---: | :--- | :--- | :--- |
| **G1** | **Wang et al. (2023)**<br>*Safety Science (Elsevier)* | Heavy offline CFD look-up tables incapable of real-time adaptation | Lightweight discrete-time topological graph cascade calculating real-time diffusion on live streaming telemetry |
| **G2** | **Chen et al. (2024)**<br>*IEEE IoT Journal* | Fragile physical microcontrollers that burn in fires; non-reproducible testing | 100% Software-Only Virtual Sensor Telemetry Engine with multi-regime simulation (`NORMAL` to `CRITICAL`) |
| **G3** | **Al-Smadi et al. (2023)**<br>*Fire Technology (Springer)* | Black-box ML predictions disconnected from safety code standards and routing | Dual Random Forest ML classifiers benchmarked side-by-side with explainable deterministic NFPA rule baselines |
| **G4** | **Zhou et al. (2023)**<br>*Automation in Construction (Elsevier)* | Binary obstacle blocking causing route thrashing and abrupt recalculations | Continuous quadratic hazard-cost edge penalization ($\text{Weight} \propto \text{HazardLevel}^2$) routing away from creeping smoke |
| **G5** | **Sharma et al. (2024)**<br>*IEEE Access* | Indoor structural silo ignoring ambient weather and wildfire threats | Multi-Source Real-Time Risk Fusion Engine uniting wildland FWI ($w_f$), weather ($w_w$), structural ($w_b$), and exposure ($w_e$) |
| **G6** | **Zhang et al. (2023)**<br>*Scientific Reports (Nature)* | Opaque GNN physics lacking parameterizable structural barrier controls | Parameterizable discrete-time hazard cascade incorporating barrier flammability factors ($\Phi_{barrier}$) and distance attenuation |
| **G7** | **Al-Khafaji et al. (2024)**<br>*Sensors (MDPI)* | Wireless sensor mesh partitioning during fires causing total system blackout | Strictly decoupled architecture with 100% local-first operational autonomy + production AWS CloudFormation IaC readiness |
| **G8** | **Ray et al. (2023)**<br>*ACM Trans. Cyber-Phys. Syst.* | Static reactive monitoring lacking interactive disaster drill simulation | Interactive "What-If" Fire Incident Simulation Sandbox with time-step scrubber for emergency drill modeling |
| **G9** | **Patel et al. (2024)**<br>*Expert Systems (Wiley)* | Static post-hoc risk audits disconnected from active egress guidance | Live streaming ML classification directly feeding real-time hazard graphs and dynamic evacuation routing |
| **G10** | **Meng et al. (2024)**<br>*Fire Safety Journal (Elsevier)* | Wildland Canadian FWI restricted to open terrain, ignoring indoor facilities | Dual-domain ML engine ingesting Canadian FWI moisture indices and synthesizing them with indoor facility telemetry |
| **G11** | **Li et al. (2025)**<br>*Buildings (MDPI)* | Heavy desktop simulation software (AnyLogic/PyroSim) with no cloud alerts | Lightweight browser-accessible cloud-native web application with automated Amazon SNS multi-channel emergency broadcast |
| **G12** | **Sunkpho et al. (2023)**<br>*J. Ambient Intell. Humaniz. Comput. (Springer)* | Passive cloud ingestion pipeline devoid of spatial fire intelligence | Integrated AWS serverless architecture (IoT Core, Lambda, DynamoDB, SNS) coupled with ML models and dynamic routing |
| **G13** | **Song et al. (2024)**<br>*Adv. Eng. Informatics (Elsevier)* | Offline standalone simulation sandbox isolated from streaming telemetry | Unified platform seamlessly coupling live/virtual telemetry streaming with an interactive What-If contingency sandbox |
| **G14** | **Kumar et al. (2024)**<br>*IEEE Trans. Ind. Informatics* | Generic industrial edge failover lacking fire emergency domain semantics | Specialized local-first fire intelligence maintaining ML inference, hazard cascade, and Dijkstra routing even if disconnected |
| **G15** | **Park et al. (2025)**<br>*Fire (MDPI)* | Macroscopic city-scale risk maps lacking granular room-level routing | Granular room-level multi-source risk fusion driving building-scale dynamic safest evacuation route recalculation |