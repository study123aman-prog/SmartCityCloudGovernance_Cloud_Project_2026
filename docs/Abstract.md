# Abstract

## Project Title
**IgnisCore — Intelligent Fire Hazard Monitoring System: Cloud-Native Multi-Zone Fire Hazard Intelligence, Graph-Based Risk Propagation & Dynamic Evacuation Decision Support System**

---

### Executive & Academic Abstract

Traditional fire safety systems and academic fire detection projects predominantly operate on a **reactive paradigm**: physical sensors detect smoke or flames, triggering an audible alarm or static alert notification. Furthermore, most existing open-source and IoT-based solutions require physical microcontrollers (e.g., Arduino, ESP32, Raspberry Pi) and delicate hardware sensors that are fragile, difficult to scale across complex multi-room facilities, and prone to failure during live demonstrations. These systems lack pre-ignition risk prediction, multi-zone spatial awareness, dynamic evacuation guidance, and interactive emergency scenario modeling.

This project presents **IgnisCore — Intelligent Fire Hazard Monitoring System**, an advanced, software-only, cloud-native Fire Hazard Intelligence and Emergency Response Platform. IgnisCore — Intelligent Fire Hazard Monitoring System eliminates physical hardware dependency by deploying a high-fidelity **Virtual Sensor Telemetry Engine** that simulates multi-modal environmental, electrical, and structural parameters—including optical smoke obscuration, ambient and circuit temperatures, electrical power loads, room occupancy, wind velocities, and Canadian Fire Weather Index (FWI) components (`FFMC`, `DMC`, `DC`, `ISI`, `BUI`) across heterogeneous multi-facility zones and wildland-urban interfaces.

The platform introduces five core technical innovations that fundamentally differentiate it from conventional fire monitoring systems:

1. **Dual-Domain Machine Learning Risk Prediction**: Supervised Random Forest classification pipelines that evaluate pre-ignition hazard probabilities in both structural/building environments ($99.98\%$ accuracy, $1.00$ ROC-AUC) and wildland/forest interfaces ($92.83\%$ accuracy, $0.98$ ROC-AUC), continuously benchmarked against deterministic, explainable rule-based heuristics.
2. **Multi-Source Risk Fusion Engine**: A real-time mathematical aggregation pipeline that synthesizes structural, wildland, meteorological, and occupancy exposure vectors into an explainable, unified hazard index:
   $$\text{HazardScore} = w_f \cdot \text{Forest} + w_w \cdot \text{Weather} + w_b \cdot \text{Building} + w_e \cdot \text{Exposure}$$
3. **Algorithmic Graph Hazard Propagation Simulation**: A discrete-time cascade model that represents interconnected facilities as directed graphs, dynamically calculating multi-hop thermal and smoke dissemination across adjacent corridors and rooms based on physical distance attenuation and structural barrier flammability factors.
4. **Hazard-Weighted Dynamic Evacuation Routing**: A graph-theoretic Dijkstra algorithm that dynamically weights edges by real-time zone hazard severity, recalculating the shortest and safest egress path to emergency exits while actively routing civilian occupants away from compromised or fire-engulfed corridors.
5. **Interactive "What-If" Incident Simulation Engine**: A decision-support sandbox enabling incident commanders and facility managers to select arbitrary fire origin rooms, initial severity levels, ambient atmospheric conditions, and scrub through time-step progression sliders to observe real-time flame spread and adaptive evacuation rerouting.

IgnisCore — Intelligent Fire Hazard Monitoring System is architected with a **dual deployment strategy**: it is 100% operational locally without cloud credentials using resilient in-memory and SQLite repository fallbacks, while providing a production-grade, event-driven AWS cloud architecture specification utilizing **AWS IoT Core** for MQTT telemetry ingestion, **AWS Lambda** for serverless event processing and report generation, **Amazon DynamoDB** for time-series persistence, **Amazon S3** and **CloudFront** for secure web delivery, **Amazon SNS** for automated emergency multi-channel alerting, and **Amazon CloudWatch** for system observability.

The system demonstrates that shifting the fire safety paradigm from *reactive hardware alarms* to *cloud-native predictive intelligence, spatial hazard propagation, and dynamic evacuation optimization* dramatically improves situational awareness, minimizes false alarm latency, and provides actionable, data-driven life safety decision support.
