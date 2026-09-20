# AWS Cloud Architecture & Services Specification

## Project Title
**IgnisCore — Intelligent Fire Hazard Monitoring System: Cloud-Native Multi-Zone Fire Hazard Intelligence, Graph-Based Risk Propagation & Dynamic Evacuation Decision Support System**

---

## 1. Cloud Architecture Overview

IgnisCore — Intelligent Fire Hazard Monitoring System is engineered around an **event-driven, serverless, and decoupled cloud architecture** designed on Amazon Web Services (AWS). The system provides scalable data ingestion, real-time machine learning risk classification, automated multi-channel alerting, and low-latency command center visualization.

Importantly, the architecture implements an **abstracted repository pattern**: the system is **100% operational locally** without cloud credentials or costs, while providing production-ready AWS cloud service mappings and Infrastructure-as-Code (CloudFormation) templates.

### Cloud Topology Diagram

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             VIRTUAL SENSOR SIMULATOR                             │
│                  Python / Node.js Multi-Zone Telemetry Stream                    │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ MQTT (TLS Port 8883)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                  AWS IoT CORE                                    │
│  - MQTT Topic: fireguard/telemetry/{building_id}/{zone_id}                       │
│  - IoT Topic Rules: Filter anomaly readings & route to AWS Lambda / DynamoDB     │
└──────────────────┬─────────────────────────────────────────────┬─────────────────┘
                   │ SQL Filter: temperature > 60 OR smoke > 50  │ Direct Put
                   ▼                                             ▼
┌─────────────────────────────────────┐        ┌───────────────────────────────────┐
│              AWS LAMBDA             │        │          AMAZON DYNAMODB          │
│  - Real-Time Hazard Pre-Processing  │        │  - FireGuard_Telemetry (Time-Series)│
│  - Anomaly Validation & ML Hook    │        │  - FireGuard_RiskAssessments       │
│  - Asynchronous Report Generation   │        │  - FireGuard_Alerts               │
│  - S3 Archival Writing              │        │  - Partition: building_id / zone  │
└──────────────────┬──────────────────┘        └─────────────────┬─────────────────┘
                   │                                             │
                   │ Critical Risk Detected                      │ Query / Fetch
                   ▼                                             ▼
┌─────────────────────────────────────┐        ┌───────────────────────────────────┐
│              AMAZON SNS             │        │         AMAZON API GATEWAY        │
│  - Emergency Notification Topic     │        │  - REST API Proxy / Direct Route  │
│  - Multi-Channel Fan-out:           │        │  - CORS & Rate Limiting           │
│    * SMS Alerts to Site Responders  │        │  - Target: Node.js / FastAPI Pods │
│    * Email Alerts to Safety Officers│        └─────────────────┬─────────────────┘
└─────────────────────────────────────┘                          │ HTTPS
                                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   AMAZON CLOUDFRONT + S3 (OAC Edge Delivery)                     │
│  - Static React 19 + Vite Command Center Dashboard SPA                           │
│  - Sub-50ms Global Edge Latency with Automatic HTTPS                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Service-by-Service Cloud Specifications

### 2.1 AWS IoT Core
- **Role**: Secure, high-throughput ingestion of simulated telemetry from virtual multi-zone sensor engines.
- **Protocol**: MQTT over TLS (Port 8883) with X.509 device certificate authentication.
- **Topic Hierarchy**:
  - `fireguard/telemetry/building-a/electrical-room`
  - `fireguard/telemetry/building-a/lab-1`
  - `fireguard/telemetry/building-b/server-room`
  - `fireguard/telemetry/forest/wildland-interface`
- **IoT Topic Rules**:
  - **Telemetry Persistence Rule**:
    ```sql
    SELECT * FROM 'fireguard/telemetry/+/+'
    ```
    *Action*: Writes raw telemetry record directly to Amazon DynamoDB table `FireGuard_Telemetry`.
  - **High-Hazard Alarm Rule**:
    ```sql
    SELECT * FROM 'fireguard/telemetry/+/+' WHERE temperature > 65.0 OR smoke_index > 60.0
    ```
    *Action*: Triggers `fireguard-hazard-processor` AWS Lambda function for immediate evaluation.

---

### 2.2 AWS Lambda
- **Role**: Serverless, event-driven compute for real-time hazard evaluation and asynchronous compliance/summary report generation.
- **Runtime**: Node.js 22.x / Python 3.13.
- **Functions in Repository**:
  1. **`fireguard-report-generator`** (`lambda/reportGenerator.mjs`):
     - Receives asynchronous report generation events containing `userId`, `building_id`, and `summary`.
     - Compiles risk metrics, active alerts, and time-series telemetry into an archival JSON summary.
     - Persists generated reports into the private S3 bucket under `reports/{userId}/report-{timestamp}.json`.
  2. **`fireguard-hazard-processor`** (Event Trigger):
     - Receives high-temperature/smoke anomaly events from IoT Core.
     - Calls the ML risk scoring service, checks safety thresholds, and invokes SNS if severity is `CRITICAL`.
- **Execution Role**: `FireGuardLambdaExecutionRole` with least-privilege access restricted to specific DynamoDB tables, S3 prefixes, and CloudWatch Log groups.

---

### 2.3 Amazon DynamoDB
- **Role**: Fully managed, high-performance NoSQL database for time-series telemetry, zone hazard states, active alerts, and simulation snapshots.
- **Billing Mode**: `PAY_PER_REQUEST` (On-Demand capacity to eliminate idle costs).
- **Table Schemas**:
  1. **`FireGuard_Telemetry`**:
     - *Partition Key (PK)*: `zone_id` (String)
     - *Sort Key (SK)*: `timestamp` (String / ISO 8601)
     - *Attributes*: `temperature`, `humidity`, `smoke_index`, `electrical_load`, `occupancy`, `wind_speed`.
     - *Time to Live (TTL)*: Automatically expires raw telemetry after 30 days (`ttl_timestamp`).
  2. **`FireGuard_RiskAssessments`**:
     - *PK*: `building_id` (String)
     - *SK*: `timestamp` (String)
     - *Attributes*: `risk_score`, `risk_level`, `model_confidence`, `rule_engine_baseline`, `affected_zones`.
  3. **`FireGuard_Alerts`**:
     - *PK*: `alert_id` (String / UUID)
     - *Sort Key (SK)*: `timestamp` (String)
     - *Attributes*: `severity`, `building`, `zone`, `message`, `status` (`ACTIVE` / `ACKNOWLEDGED`), `recommended_action`.

---

### 2.4 Amazon S3 & Amazon CloudFront
- **Role**: Secure hosting of the static Command Center web frontend and archival storage for incident reports and floorplan spatial assets.
- **Buckets**:
  1. **Frontend Hosting Bucket** (`fireguard-frontend-<account-id>`):
     - Private S3 bucket storing compiled React/Vite assets (`index.html`, JavaScript chunks, CSS).
     - Configured with **Origin Access Control (OAC)** to prevent direct public S3 access.
  2. **Reports & Data Bucket** (`fireguard-reports-<account-id>`):
     - Private bucket storing generated incident summaries (`reports/{userId}/...`) and baseline datasets.
     - Default server-side encryption with AWS KMS (`aws:kms`).
- **CloudFront CDN Distribution**:
  - Distributes frontend assets globally with sub-50ms latency.
  - Automatic HTTPS enforcement with TLS 1.3.
  - Custom error response: redirects 403/404 errors to `/index.html` with status 200 for client-side React Router navigation.

---

### 2.5 Amazon Simple Notification Service (SNS)
- **Role**: Instantaneous, multi-channel emergency broadcast when fire risk escalates to `CRITICAL` or `HIGH`.
- **Topic**: `fireguard-emergency-alerts` (`arn:aws:sns:<region>:<account>:fireguard-emergency-alerts`).
- **Subscribers**:
  - **SMS Protocol**: Direct emergency SMS alerts to facility incident commanders.
  - **Email Protocol**: Detailed operational incident digests to safety officers.
  - **Webhook / HTTPS**: Downstream automated building actuators (e.g., HVAC shutdown signals, access control fire door unlocks).
- **Message Payload Example**:
  ```json
  {
    "event": "CRITICAL_FIRE_HAZARD",
    "building": "Building A - Advanced Research Facility",
    "origin_zone": "Electrical Vault A",
    "risk_score": 94.2,
    "severity": "CRITICAL",
    "recommended_action": "Evacuate Lab 1 and Lab 2 via Exit B immediately. Avoid central corridor.",
    "timestamp": "2026-09-20T16:30:00.000Z"
  }
  ```

---

### 2.6 Amazon API Gateway
- **Role**: Managed REST API entry point exposing secure endpoints for external integrations and the web dashboard.
- **Features**:
  - CORS configuration enabling cross-origin browser requests from CloudFront.
  - Rate limiting (e.g., 500 requests/sec with burst to 1000) to protect compute backends against denial-of-service.
  - HTTP proxy integration to backend microservices (Express REST API on Port 5001, FastAPI on Port 8000).

---

### 2.7 Amazon CloudWatch & AWS IAM
- **Amazon CloudWatch**:
  - Centralized log streaming for Lambda functions (`/aws/lambda/fireguard-report-generator`) and EC2 system daemons (`/var/log/fireguard-backend.log`).
  - **CloudWatch Alarms**: Metric alarms monitoring `HighRiskZoneCount > 0` and triggering SNS alerts.
- **AWS IAM (Identity and Access Management)**:
  - Strict adherence to the principle of least privilege.
  - Dedicated IAM roles:
    - `FireGuardEC2Role`: Grants `s3:PutObject`/`s3:GetObject` on the report bucket and `sns:Publish` on the alert topic.
    - `FireGuardLambdaExecutionRole`: Grants basic execution logging and targeted S3 write access.
  - Eliminates hardcoded AWS Access Keys (`AKIA...`) in source code.

---

## 3. Local-First Abstraction vs. Cloud Deployment

To guarantee that students, evaluators, and engineers can run the entire platform **without AWS credentials, billing accounts, or internet access**, IgnisCore — Intelligent Fire Hazard Monitoring System implements a repository abstraction layer:

| Component | Local Development Mode (Zero AWS Cost) | AWS Production Cloud Mode |
| :--- | :--- | :--- |
| **Telemetry Ingestion** | Local in-process simulator stream / HTTP POST `/api/telemetry` | AWS IoT Core MQTT broker (`fireguard/telemetry/+/+`) |
| **Database Persistence** | In-memory repository fallback / SQLite / MongoDB | Amazon DynamoDB On-Demand tables |
| **Alert Notification** | In-memory alert repository with console logging and UI alerts | Amazon SNS multi-channel SMS & Email broadcast |
| **ML Inference** | Local FastAPI service (`127.0.0.1:8000`) | FastAPI container on ECS / EC2 or SageMaker endpoint |
| **File / Report Storage**| Local disk storage under `data/uploads/` and `data/reports/` | Private Amazon S3 bucket with KMS encryption |
| **Web Dashboard Hosting**| Local Vite development server (`http://localhost:5173`) | Amazon CloudFront CDN + S3 Origin Access Control |

Switching between local-first and AWS modes requires toggling only environment variables in `.env` (e.g., `USE_AWS_SERVICES=true`, `AWS_REGION=us-east-1`, `SNS_TOPIC_ARN=...`), without altering application business logic.

---

## 4. Automated CloudFormation Deployment

The repository includes a production-grade CloudFormation Infrastructure-as-Code template: [`infra/fireguard-infra.yaml`](../infra/fireguard-infra.yaml).

To provision the complete cloud infrastructure automatically:

```bash
aws cloudformation create-stack \
  --stack-name fireguard-cloud-production \
  --template-body file://infra/fireguard-infra.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=EnvironmentName,ParameterValue=production \
               ParameterKey=AdministratorCIDR,ParameterValue="$(curl -s https://checkip.amazonaws.com)/32"
```

This automates the provisioning of:
- S3 Frontend & Report buckets with strict public-access blocking
- CloudFront CDN distribution with Origin Access Control (OAC)
- Amazon SNS topic with email and SMS delivery policies
- Security Groups and IAM least-privilege instance profiles
