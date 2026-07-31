# Project Title

Intelligent Cloud Governance Framework for Smart City Digital Services using Policy Intelligence

# Team Members

Aditya Upadhye 24BIT0274
Aman Singh Sachan 24BIT0292
Aditya Jain 24BIT0333

# Objective

1. Design and implement a centralized policy-intelligence engine on AWS that ingests governance signals — AWS CloudTrail logs, AWS Config findings, and IoT telemetry — from smart-city digital services and evaluates them against defined policies in real time.

2. Achieve automated, closed-loop policy enforcement (not just detection) across at least three representative smart-city service domains — e.g., transportation, energy, and public safety — using AWS-native tools (IAM, Config, Organizations, Lambda) to take proportionate action (allow / alert / auto-remediate) rather than passive alerts.

3. Reduce manual governance-review effort by automating at least 70% of routine compliance and audit checks that currently require human verification.

4. Deliver interpretable, plain-language policy decisions for non-technical municipal stakeholders, with near real-time (sub-second) policy-evaluation latency, so governance actions are explainable and not a "black box."

5. Implement secure, role-based multi-department policy management — mirroring a national/city/department governance hierarchy — to preserve data privacy and compliance across city agencies.

6. Provide a centralized dashboard (Amazon QuickSight) visualising governance status and policy compliance across all connected services, supporting transparent, data-driven decisions for city administrators.

# Proposed Architecture / Framework

The proposed framework follows an event-driven, cloud-native architecture built entirely on AWS.
Diagram 1 — AWS Cloud Architecture
Figure 1 illustrates the AWS cloud deployment of the proposed framework. Data from smart city domains such as transportation, energy, public safety, and government services, along with AWS CloudTrail, AWS Config, and IoT telemetry, is collected through AWS IoT Core and Amazon Kinesis. The Policy Intelligence Engine, implemented using AWS Lambda, evaluates governance policies and generates automated decisions. AWS IAM and AWS Organizations provide secure access control, while Amazon S3 and DynamoDB store governance data. Monitoring, notifications, and dashboards are handled through CloudWatch, Security Hub, SNS, and QuickSight, ensuring real-time, secure, and scalable cloud governance.
![alt text](AWS Cloud Architecture.png)
Figure 1: AWS Cloud Architecture — Intelligent Cloud Governance Framework for Smart City Digital Services Using Policy Intelligence

Diagram 2 — Complete System Architecture
Figure 2 presents the end-to-end workflow of the proposed system. Governance signals from CloudTrail, Config, and IoT devices are collected and preprocessed before being analyzed by the AI-based Policy Intelligence Engine. The engine evaluates events against multi-level governance policies and generates decisions such as Allow, Alert, Auto-Remediation, or Governance Recommendation. These decisions are enforced through IAM policies, Service Control Policies, Lambda automation, and configuration updates. All actions are recorded, continuously monitored, and displayed on governance dashboards, providing transparent, auditable, and automated policy management for smart city administrators.
![alt text](Complete System Architecture.png) 
Figure 2: Complete System Architecture of Intelligent Cloud Governance Framework for Smart City Digital Services Using Policy Intelligence

### Workflow

1. Smart city applications generate operational events.
2. AWS CloudTrail, AWS Config, and IoT devices continuously produce governance signals.
3. AWS IoT Core and Amazon Kinesis ingest and stream the data.
4. A Policy Intelligence Engine (AWS Lambda + AI logic) evaluates incoming events against predefined governance policies.
5. Based on policy evaluation, the framework performs one of the following:
   - Allow request
   - Generate alert
   - Auto-remediate the issue
   - Recommend governance action
6. IAM, AWS Organizations, and AWS Config enforce governance policies.
7. Amazon S3 and DynamoDB store governance logs and policy information.
8. CloudWatch, Security Hub, SNS, and QuickSight provide monitoring, notifications, and visualization.

# Technology Stack

## Cloud Platform

- Amazon Web Services (AWS)

## AWS Services

- AWS IoT Core
- Amazon Kinesis Data Streams
- AWS Lambda
- AWS IAM
- AWS Organizations
- AWS Config
- AWS CloudTrail
- Amazon DynamoDB
- Amazon S3
- Amazon SNS
- Amazon CloudWatch
- AWS Security Hub
- Amazon QuickSight

## AI & Analytics

- Policy Intelligence Engine
- Explainable AI-based Policy Evaluation
- Cloud Governance Analytics

## Programming & Data

- Python
- JSON
- AWS SDK (Boto3)

# Dataset Details

| Field | Details |
|--------|---------|
| **Dataset Name** | AWS CloudTrail Logs Dataset (flaws.cloud) |
| **Source** | Scott Piper / Summit Route (Public AWS Security Research Dataset) |
| **Dataset Size** | Approximately 240 MB |
| **Number of Records** | 1,939,207 CloudTrail Events |
| **Data Format** | Semi-Structured JSON |
| **Features** | ~20 CloudTrail Attributes (eventTime, eventSource, eventName, awsRegion, sourceIPAddress, userIdentity, etc.) |
| **Purpose** | Train and evaluate AI models for anomaly detection and policy intelligence |
| **Preprocessing** | JSON flattening, feature engineering, categorical encoding, duplicate removal, timestamp extraction |
| **License** | Publicly released for academic and security research |

# Project Highlights

- AI-powered Policy Intelligence Engine
- Automated Cloud Governance
- Multi-level Policy Enforcement
- Explainable AI Decisions
- Real-time Monitoring
- Serverless AWS Architecture
- Smart City Governance Automation

# Future Enhancements

- Multi-cloud governance support (AWS, Azure, GCP)
- Reinforcement Learning-based policy optimization
- Digital Twin integration
- Predictive governance analytics
- Large Language Model (LLM)-assisted policy recommendations
- Federated governance across multiple smart cities
