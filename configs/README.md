# IgnisCore Configuration Directory (`configs/`)

This directory houses the centralized, canonical configuration matrices and schemas for **IgnisCore — Intelligent Fire Hazard Monitoring System**.

All files are structured in standardized JSON format with JSON-Schema validation headers, allowing seamless consumption across the Node.js Express backend, Python FastAPI machine learning microservice, IoT virtual sensor simulator, and cloud deployment pipelines.

---

## Directory Index

| File | Subsystem | Purpose & Contents |
| :--- | :--- | :--- |
| **[`facility_topology.json`](facility_topology.json)** | Graph Propagation & Egress Router | Canonical spatial blueprints for Buildings A, B, and C with 2D coordinates, zone types, material flammabilities, distance matrices, and exit stairwells. |
| **[`simulation_config.json`](simulation_config.json)** | Virtual Telemetry Engine | Sampling intervals, sensor physics distributions (noise std-dev), baseline zone metrics, meteorological cycles, and pre-configured fire anomaly scenarios. |
| **[`risk_fusion_config.json`](risk_fusion_config.json)** | Multi-Source Fusion Engine | Normalized convex combination weights ($w_f, w_w, w_b, w_e$), 4-tier hazard classifications (LOW, MEDIUM, HIGH, CRITICAL), normalization scales, and deterministic rule heuristics. |
| **[`alert_rules.json`](alert_rules.json)** | Emergency Dispatch System | Warning ($60$) and Critical ($85$) thresholds, cooldown delays, multi-channel targets (SNS, Email, SMS, Webhook), and the 4-step emergency escalation hierarchy. |
| **[`ml_models_config.json`](ml_models_config.json)** | Machine Learning Engine | Dual Random Forest model hyperparameters, feature ordering, decision thresholds, benchmark evaluation metrics, and deterministic fallback calculations. |
| **[`aws_cloud_config.json`](aws_cloud_config.json)** | Cloud Governance & Deployment | AWS IoT Core MQTT topic patterns, DynamoDB tables and TTL schemas, S3 bucket settings, SNS topics, and CloudWatch alarm definitions. |

---

## Subsystem Details & Integration

### 1. Facility Topology (`facility_topology.json`)
Defines the topological graph nodes (rooms, corridors, stairwells) and edges (walkways, doors) used by:
- **Hazard Propagation Cascade**: Discrete-time multi-hop heat and smoke spread model using distance attenuation and barrier flammability factors.
- **Dynamic Dijkstra Routing**: Evaluates graph edge costs dynamically adjusted by the zone's instantaneous fire hazard score, steering occupants to the safest available exit.

```json
{
  "id": "bldg_a_elec",
  "name": "Electrical Room",
  "type": "electrical",
  "flammability": 4.8,
  "coordinates": { "x": 50, "y": 50, "width": 140, "height": 110 },
  "connected_zones": [
    { "target_id": "bldg_a_corridor", "distance_meters": 6.0, "hazard_factor": 1.3 }
  ]
}
```

### 2. Risk Fusion Engine (`risk_fusion_config.json`)
Configures the fused risk equation:
$$\text{HazardScore} = w_f \cdot \text{Forest} + w_w \cdot \text{Weather} + w_b \cdot \text{Building} + w_e \cdot \text{Exposure}$$

The weights can be modified in this file or dynamically adjusted via the Command Center UI / API endpoint `POST /api/risk/weights`.

### 3. Virtual Telemetry Simulator (`simulation_config.json`)
Controls `simulator/sensorSimulator.js`. Set the sampling frequency and trigger automated anomaly injection tests:
```bash
node simulator/sensorSimulator.js --interval 3000 --anomaly bldg_a_elec
```

### 4. Alerting & Escalation Matrix (`alert_rules.json`)
Implements an automated 4-tier escalation hierarchy:
1. **Zone Operator** (T+0 to 2 mins): Local sensor verification and damper shutoff.
2. **Floor Warden** (T+2 to 5 mins): Guided staging towards Exit A / Exit B.
3. **Incident Commander** (T+5 to 10 mins): Facility-wide evacuation order.
4. **Municipal Fire Dispatch** (Immediate upon CRITICAL): Automatic 911 dispatch webhook.

---

## Overriding Configurations via Environment Variables

All parameters configured in `configs/` can be overridden at runtime using environment variables in `.env`:

| Configuration Key | Environment Variable Equivalent | Default Value |
| :--- | :--- | :--- |
| `weights.forest.default` | `FOREST_WEIGHT` | `0.35` |
| `weights.weather.default` | `WEATHER_WEIGHT` | `0.20` |
| `weights.building.default` | `BUILDING_WEIGHT` | `0.30` |
| `weights.exposure.default` | `EXPOSURE_WEIGHT` | `0.15` |
| `thresholds.warning_score` | `ALERT_WARNING_THRESHOLD` | `60.0` |
| `thresholds.critical_score` | `ALERT_CRITICAL_THRESHOLD` | `85.0` |
| `engine.default_interval_ms`| `SIMULATION_INTERVAL_MS` | `5000` |
