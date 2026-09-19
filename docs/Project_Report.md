# FIREGUARD AI: SmartCity Cloud Governance Project 2026
## Repository-Based Technical and Project Report

**Repository**: `study123aman-prog/SmartCityCloudGovernance_Cloud_Project_2026`  
**Default Branch Reviewed**: `main` / `develop`  
**Review Date**: 19 September 2026  

---

## 1. Executive Summary

**FireGuard AI** is presented as a local-first emergency intelligence and fire-safety governance platform. Its scope extends beyond simple forest-fire prediction: the project combines wildland and building fire-risk prediction, deterministic safety rules, multi-source risk fusion, fire propagation simulation, evacuation routing, forecasting, telemetry simulation, alerts, and a research concept for remediation-attributed evidence verification.

The repository is architected so that the core application can operate locally without AWS. AWS is treated as a deployment and integration layer, with documented mappings to S3, CloudFront, EC2, SNS, Lambda, CloudWatch, IAM, and potential future IoT Core and DynamoDB integrations.

A central research theme is the distinction between reporting that a corrective action was completed and proving that the correct physical safety asset was actually restored to the required condition. The proposed compliance lifecycle therefore keeps a case unresolved until the available evidence sufficiently supports remediation attribution.

---

## 2. Project Identity and Scope

| Item | Repository Finding |
| :--- | :--- |
| **Project Name** | FireGuard AI / SmartCity Cloud Governance Project 2026 |
| **Repository** | `study123aman-prog/SmartCityCloudGovernance_Cloud_Project_2026` |
| **Branch Reviewed** | `main` / `develop` |
| **Application Style** | Local-first, decoupled web application with ML services |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Leaflet, Recharts |
| **Backend** | Node.js + Express REST API |
| **ML Serving** | FastAPI service (Python 3.13) |
| **Database** | MongoDB / MongoDB Atlas (with in-memory repository fallbacks) |
| **Cloud Layer** | AWS services documented as deployment and integration targets |
| **Research Focus** | Remediation-attributed fire-safety compliance verification |

---

## 3. Problem Statement and Research Focus

The research documents describe a critical gap between detecting a fire-safety violation and proving that a reported remediation actually restored the correct physical condition. Evidence submitted after remediation can be incomplete, stale, contradictory, associated with the wrong physical asset, or insufficient to show that the expected physical change occurred.

The proposed mechanism therefore maintains a machine-readable chain:
1. **Regulation or safety requirement** $\rightarrow$ specific physical safety asset.
2. **Observed violation** $\rightarrow$ recorded remediation action.
3. **Expected physical effect** $\rightarrow$ subsequent physical evidence.
4. **Identity, time, completeness and consistency checks** $\rightarrow$ remediation-attribution decision.
5. **Controlled compliance-state transition** $\rightarrow$ verified resolution only when proof conditions are satisfied.

The repository explicitly describes the novelty statement as a **research hypothesis rather than a confirmed patent claim**. That distinction is preserved in academic and legal-facing documentation.

---

## 4. System Objectives

- **Develop regulation-conditioned, machine-checkable fire-safety compliance conditions** tied to physical assets (fire doors, exits, extinguishers).
- **Evaluate evidence for identity, timestamp, sufficiency, consistency and expected remediation outcome**.
- **Prevent premature transition to `VERIFIED_RESOLVED`** when proof remains insufficient.
- **Initiate targeted follow-up verification** such as new evidence, sensor observations, functional tests or re-inspection.
- **Evaluate the method with measurable metrics** including false-resolution rate, remediation-attribution accuracy, closure time, human intervention and contradiction detection.

---

## 5. Functional Capabilities

| Capability | Description |
| :--- | :--- |
| **Dual-domain fire-risk ML** | Forest/wildland and building/facility prediction using environmental and structural inputs. |
| **Rule-based baseline** | Deterministic fire-safety heuristics provide an explainable reference alongside ML outputs. |
| **Risk fusion** | Forest, weather, building and exposure vectors are combined into an overall hazard score/level. |
| **Facility floorplans** | Interactive 2D building layouts with live zone telemetry and safety attributes. |
| **Hazard propagation** | Graph-based multi-hop simulation for spread of heat/smoke/airflow effects. |
| **Evacuation routing** | Dijkstra-based pathfinding that avoids compromised areas. |
| **What-if simulation** | Scenario playback using origin, severity, environmental values and duration. |
| **Forecasting** | Six-hour time-series hazard forecast. |
| **Geospatial map** | Leaflet-based regional wildfire/risk visualization. |
| **Alerts** | Active/acknowledged incident alert workflow. |
| **Telemetry simulator** | Standalone Node.js sensor stream simulator for building/forest scenarios. |
| **Evidence verification research** | Compliance-state workflow that distinguishes correction claims from verified remediation. |

---

## 6. Software Architecture

The repository separates the application into a browser frontend, an Express API layer, a FastAPI ML service, database/repository components, and simulation/business-logic services.

**Logical Flow:**
```text
React/Vite Frontend -> Express REST Backend -> MongoDB + FastAPI ML Service -> Risk fusion / simulation / routing / alerts
```

| Layer | Technology / Responsibility |
| :--- | :--- |
| **Presentation** | React 19, Vite, Tailwind CSS, Leaflet, Recharts |
| **API** | Node.js / Express REST API |
| **Authentication** | JWT + bcrypt-based password hashing |
| **Validation/Security Middleware** | Zod, Helmet, CORS, rate limiting |
| **Data Access** | Mongoose / repository abstractions (with in-memory fallbacks) |
| **ML Inference** | FastAPI + serialized Random Forest models |
| **Simulation** | Propagation graph and Dijkstra evacuation logic |
| **Local Deployment** | Docker Compose with MongoDB, ML service and backend |

---

## 7. Machine Learning Architecture

The repository contains both a training/evaluation pipeline (`ml/`) and a dedicated deployable ML service (`ml-service/`). The training area includes dataset generation, preprocessing, training, prediction, evaluation and feature-importance scripts. The service layer exposes inference through FastAPI.

| Domain | Documented Inputs / Purpose | Repository-Reported Metrics* |
| :--- | :--- | :--- |
| **Forest** | Temperature, humidity, wind, pressure, rainfall, oxygen, and Canadian Fire Weather Index variables (`FFMC`, `DMC`, `DC`, `ISI`, `BUI`, `FWI`) | Accuracy: 92.83%<br>ROC-AUC: 0.9812<br>F1-Score: 0.8924 |
| **Building** | Smoke, thermal, electrical load, occupancy, airflow, zone type, and material flammability ratings | Accuracy: 99.98%<br>ROC-AUC: 1.0000<br>F1-Score: 0.9970 |

*\*Metrics are reproduced from project training logs. These figures represent project-reported evaluation results under test splits, not externally benchmarked figures.*

---

## 8. Data and Database Layer

The database design utilizes MongoDB Atlas (or local MongoDB/in-memory fallback) for user and prediction persistence. Prediction history is scoped to the authenticated user, and password hashes are excluded from normal API responses.

| Entity | Key Fields |
| :--- | :--- |
| **User** | `name`, `email`, `passwordHash`, `role`, `notificationsEnabled`, `timestamps` |
| **Prediction** | `user`, `inputs`, `prediction`, `probability`, `probabilities`, `modelVersion`, `timestamps` |

The repository also contains static and simulated data domains for forest, building, geography, and weather datasets organized into raw, processed, and sample-data directories.

---

## 9. AWS Cloud Architecture

The target AWS cloud topology maps components as follows:
- **S3 (Private Bucket)**: Static frontend assets delivered via CloudFront OAC; private storage for compliance evidence and generated reports.
- **CloudFront**: Global CDN with Origin Access Control (OAC) restricting direct S3 access.
- **EC2**: Compute runtime hosting the Node.js Express backend and FastAPI ML service fronted by an Nginx reverse proxy.
- **IAM**: Workload roles enforcing least privilege without static long-lived credentials.
- **CloudWatch**: Centralized logging, application metrics, and operational alarms.
- **SNS**: Critical incident notifications topic.
- **AWS Lambda**: Asynchronous serverless compliance report generation.
- **DynamoDB & AWS IoT Core**: Documented future extension options for sensor fleet ingestion.

---

## 10. Security and Governance

- S3 buckets remain private with block-public-access enabled; CloudFront OAC is enforced.
- Only HTTP/HTTPS (ports 80/443) are publicly exposed; SSH (port 22) is restricted to administrator IPs.
- Express (5001), FastAPI (8000), and MongoDB (27017) are bound to localhost/internal network.
- Workload IAM roles are used instead of long-lived access keys.
- Environment variables isolate secrets; credentials are never passed to the browser.
- Rate limiting, Helmet HTTP headers, CORS policies, and Zod input validation protect endpoints.

---

## 11. Research Position & Novelty

The project explicitly narrows its research contribution instead of claiming that AI, IoT, cloud computing, digital twins, evidence collection, or generic audit trails are themselves novel. 

The proposed invention center is **remediation attribution**: determining whether subsequent physical evidence demonstrates that a reported corrective action actually restored the required physical safety condition for the specific physical safety asset, preventing premature transition to `VERIFIED_RESOLVED`.

---

## 12. Current Implementation Status

| Area | Observed Repository State |
| :--- | :--- |
| **Frontend** | Implemented React 19/Vite application with pages, components, context, Leaflet maps, and API client. |
| **Backend** | Implemented Express service with controllers, routes, repositories, and simulation services. |
| **ML Training** | Training, evaluation, and dataset-generation scripts present in `ml/`. |
| **ML Serving** | FastAPI service with Dockerfile, dependencies, and health/prediction endpoints in `ml-service/`. |
| **Database** | Mongoose schemas and in-memory fallback repositories implemented. |
| **Docker** | Docker Compose configuration defines backend, ML service, and MongoDB containers. |
| **Simulator** | Standalone Node.js sensor telemetry simulator present in `simulator/`. |
| **AWS Integration** | CloudFormation template (`infra/fireguard-infra.yaml`), integration guide, and deployment runbooks present. |
| **Lambda** | Report-generator Lambda function and test scripts present in `aws/lambda/`. |

---

## 13. Limitations

- Original training data availability and live field verification limitations exist; datasets use established physical/meteorological models and simulation.
- Simulated sensor values are not equivalent to live certified life-safety systems.
- The software is an academic research prototype and not a certified fire alarm or life-safety control system.
- The proposed novelty is a research hypothesis; patentability requires independent patent examination.
