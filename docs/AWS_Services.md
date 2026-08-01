## AWS Services Planning

The framework is built natively on AWS, mapping each layer of the proposed architecture (Fig. 1 and Fig. 2) to a specific managed AWS service. This keeps governance logic "in the cloud, of the cloud" rather than bolted on afterward, and gives every automated decision a traceable, auditable service-level origin.

| AWS Service | Architecture Layer | Role in the Framework |
|---|---|---|
| AWS IoT Core | Data Ingestion | Ingests real-time telemetry from transportation, energy-grid, and public-safety IoT devices |
| Amazon Kinesis Data Streams | Data Ingestion | Streams and buffers CloudTrail/Config/IoT events into one fused, ordered event pipeline |
| AWS IAM (incl. permission boundaries) | Authentication & Governance | Role-based access control and department-level permission boundaries |
| AWS Organizations (SCPs) | Authentication & Governance | National/city-level guardrails via Service Control Policies across accounts |
| AWS Lambda | Processing & AI Decision | Hosts the Policy Intelligence Engine; executes automated response and remediation actions |
| Amazon DynamoDB | Storage | Stores policy definitions, department rules, and live enforcement status (read/write policy state) |
| Amazon S3 | Storage | Stores raw CloudTrail logs, processed events, and historical audit data |
| Amazon SNS | Notification | Delivers alerts to city administrators, department heads, and the security team |
| Amazon CloudWatch | Monitoring | Operational metrics, logs, and performance monitoring |
| AWS Security Hub | Monitoring | Aggregates security findings and compliance monitoring |
| AWS CloudTrail | Monitoring / Signal Source | Provides the audit trail of every governance action and the primary API-activity signal |
| AWS Config | Monitoring / Signal Source | Detects configuration drift and supplies compliance-state findings |
| Amazon QuickSight | Visualization | Centralized compliance dashboard — risk heat-map, security alerts, cost analytics, policy violations, historical trends |
