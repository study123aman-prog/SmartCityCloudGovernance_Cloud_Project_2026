# FireGuard AI — AWS Cloud Integration Guide (Developer Blueprint)

> [!IMPORTANT]
> **Boundary Notice:**
> The FireGuard AI application runs 100% locally out-of-the-box without AWS credentials, AWS CLI, or cloud infrastructure.
> This document serves exclusively as an architectural reference guide for when you personally choose to deploy and wire AWS managed services.

---

## Architecture Overview: Local Abstraction to AWS Mapping

```
                                  FIREGUARD AI APPLICATION LAYER
                                  ┌─────────────────────────────┐
                                  │   Application Business Core │
                                  └──────────────┬──────────────┘
                                                 │
          ┌──────────────────────────────────────┼──────────────────────────────────────┐
          │                                      │                                      │
┌─────────▼──────────────┐             ┌─────────▼──────────────┐             ┌─────────▼──────────────┐
│  ITelemetryRepository  │             │    IRiskRepository     │             │     IAlertService      │
└─────────┬──────────────┘             └─────────┬──────────────┘             └─────────┬──────────────┘
          │ (Active)                             │ (Active)                             │ (Active)
┌─────────▼──────────────┐             ┌─────────▼──────────────┐             ┌─────────▼──────────────┐
│LocalTelemetryRepository│             │  LocalRiskRepository   │             │   LocalAlertService    │
└─────────┬──────────────┘             └─────────┬──────────────┘             └─────────┬──────────────┘
          │ (Future Swap)                        │ (Future Swap)                        │ (Future Swap)
┌─────────▼──────────────┐             ┌─────────▼──────────────┐             ┌─────────▼──────────────┐
│  DynamoDB / IoT Core   │             │   DynamoDB Table       │             │       Amazon SNS       │
└────────────────────────┘             └────────────────────────┘             └────────────────────────┘
```

---

## 1. Connecting `LocalEventPublisher` → AWS IoT Core

### Objective
Publish high-frequency IoT sensor telemetry from building sensors directly into an MQTT topic on AWS IoT Core.

### Location in Codebase
`backend/src/services/events/LocalEventPublisher.js`

### Step-by-Step Implementation Blueprint
1. Install the AWS IoT SDK:
   ```bash
   npm install @aws-sdk/client-iot-data-plane
   ```
2. Create `backend/src/services/events/IoTCoreEventPublisher.js`:
   ```javascript
   import { IoTDataPlaneClient, PublishCommand } from "@aws-sdk/client-iot-data-plane";
   import { IEventPublisher } from "../../repositories/interfaces/contracts.js";

   export class IoTCoreEventPublisher extends IEventPublisher {
     constructor({ endpoint, region }) {
       super();
       this.client = new IoTDataPlaneClient({ endpoint, region });
     }

     async publish(topic, payload) {
       const command = new PublishCommand({
         topic: `fireguard/${topic}`,
         payload: Buffer.from(JSON.stringify(payload)),
         qos: 1,
       });
       return this.client.send(command);
     }
   }
   ```
3. Swap in `backend/src/repositories/index.js` when ready.

---

## 2. Connecting `LocalRiskRepository` & `LocalTelemetryRepository` → Amazon DynamoDB

### Objective
Persist zone risk assessments, timeline steps, and sensor logs into a high-throughput, serverless NoSQL table.

### Location in Codebase
- `backend/src/repositories/local/LocalRiskRepository.js`
- `backend/src/repositories/local/LocalTelemetryRepository.js`

### Target DynamoDB Table Schema
- **Table Name**: `fireguard_risk_assessments`
- **Partition Key (`PK`)**: `SOURCE#<building_id_or_region>` (String)
- **Sort Key (`SK`)**: `TIMESTAMP#<iso8601>` (String)
- **Attributes**: `score` (Number), `level` (String), `probability` (Number), `domain` (String), `telemetry` (Map)

### Implementation Blueprint
1. Install DynamoDB Document Client:
   ```bash
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
   ```
2. Create `backend/src/repositories/aws/DynamoDBRiskRepository.js`:
   ```javascript
   import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
   import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
   import { IRiskRepository } from "../interfaces/contracts.js";

   export class DynamoDBRiskRepository extends IRiskRepository {
     constructor({ tableName, region }) {
       super();
       const rawClient = new DynamoDBClient({ region });
       this.docClient = DynamoDBDocumentClient.from(rawClient);
       this.tableName = tableName;
     }

     async saveRiskAssessment(assessment) {
       const item = {
         PK: `SOURCE#${assessment.source_id || assessment.building_id || 'system'}`,
         SK: `TIMESTAMP#${assessment.timestamp || new Date().toISOString()}`,
         ...assessment,
       };
       await this.docClient.send(new PutCommand({ TableName: this.tableName, Item: item }));
       return item;
     }

     async getRiskHistory(filters = {}, limit = 100) {
       const pk = `SOURCE#${filters.source_id || filters.building_id}`;
       const res = await this.docClient.send(new QueryCommand({
         TableName: this.tableName,
         KeyConditionExpression: "PK = :pk",
         ExpressionAttributeValues: { ":pk": pk },
         ScanIndexForward: false,
         Limit: limit,
       }));
       return res.Items || [];
     }
   }
   ```

---

## 3. Connecting `LocalStorageService` → Amazon S3

### Objective
Store generated What-If simulation timelines, evaluation reports, and floorplan vector exports in an S3 bucket.

### Location in Codebase
`backend/src/services/storage/LocalStorageService.js`

### Implementation Blueprint
1. Install S3 Client and Presigner:
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```
2. Create `backend/src/services/storage/S3ObjectStorageService.js`:
   ```javascript
   import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
   import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
   import { IObjectStorageService } from "../../repositories/interfaces/contracts.js";

   export class S3ObjectStorageService extends IObjectStorageService {
     constructor({ bucket, region }) {
       super();
       this.client = new S3Client({ region });
       this.bucket = bucket;
     }

     async storeFile(filename, content, contentType = "application/json") {
       const key = `artifacts/${Date.now()}-${filename}`;
       await this.client.send(new PutObjectCommand({
         Bucket: this.bucket,
         Key: key,
         Body: content,
         ContentType: contentType,
       }));
       return { key, bucket: this.bucket };
     }

     async createUploadUrl(filename, contentType) {
       const key = `uploads/${filename}`;
       const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
       const uploadUrl = await getSignedUrl(this.client, cmd, { expiresIn: 300 });
       return { key, uploadUrl, expiresIn: 300 };
     }
   }
   ```

---

## 4. Connecting `LocalAlertService` → Amazon Simple Notification Service (SNS)

### Objective
Transmit critical hazard broadcasts to first responders via SMS and email alerts.

### Location in Codebase
`backend/src/services/alerts/LocalAlertService.js`

### Implementation Blueprint
1. Install SNS Client:
   ```bash
   npm install @aws-sdk/client-sns
   ```
2. Create `backend/src/services/alerts/SNSAlertService.js`:
   ```javascript
   import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
   import { IAlertService } from "../../repositories/interfaces/contracts.js";

   export class SNSAlertService extends IAlertService {
     constructor({ topicArn, region, alertRepository }) {
       super();
       this.client = new SNSClient({ region });
       this.topicArn = topicArn;
       this.alertRepository = alertRepository;
     }

     async dispatchAlert(alertPayload) {
       // First, record in repository
       const saved = await this.alertRepository.saveAlert(alertPayload);

       // Publish to SNS if CRITICAL or HIGH
       if (alertPayload.severity === 'CRITICAL' || alertPayload.severity === 'HIGH') {
         await this.client.send(new PublishCommand({
           TopicArn: this.topicArn,
           Subject: `[FireGuard AI] ${alertPayload.severity}: ${alertPayload.title}`,
           Message: JSON.stringify({
             alertId: saved.id,
             severity: saved.severity,
             title: saved.title,
             message: saved.message,
             score: saved.score,
             building_id: saved.building_id,
             zone_id: saved.zone_id,
             timestamp: saved.timestamp,
           }, null, 2),
         }));
       }
       return saved;
     }
   }
   ```

---

## 5. Hosting Backend API on AWS Lambda & API Gateway

### Objective
Execute the Express REST API serverlessly.

### Blueprint
1. Install `serverless-http`:
   ```bash
   npm install serverless-http
   ```
2. Export the handler in `backend/src/lambda.js`:
   ```javascript
   import serverless from "serverless-http";
   import { createApp } from "./app.js";
   import { getEnvironment } from "./config/env.js";

   const app = createApp(getEnvironment());
   export const handler = serverless(app);
   ```
3. Configure HTTP API in Amazon API Gateway pointing to the Lambda function.

---

## 6. Forwarding Logs to Amazon CloudWatch

### Objective
Capture telemetry streams and operational alerts in a central CloudWatch Log Group (`/fireguard/backend`).

### Blueprint
- In AWS Lambda, standard `console.log()` and `console.error()` calls automatically stream to CloudWatch Logs.
- For containerized deployments on Amazon ECS or AWS Fargate, configure the `awslogs` log driver in the task definition.

---

## Summary of AWS Services Needed Later

| Service | Intended Role | Local Equivalent Currently Active |
| :--- | :--- | :--- |
| **AWS IoT Core** | Physical sensor telemetry ingestion | `LocalTelemetryRepository` / `simulator/sensorSimulator.js` |
| **Amazon DynamoDB** | Fast NoSQL risk state & telemetry history | `LocalRiskRepository` / MongoDB |
| **Amazon S3** | Floorplan assets & report uploads | `LocalStorageService` (`data/uploads`) |
| **Amazon SNS** | First responder SMS/Email alerts | `LocalAlertService` |
| **AWS Lambda / API Gateway** | Serverless backend execution | Express (`backend/src/server.js`) on port 5001 |
| **Amazon CloudWatch** | Structured incident log archiving | Console & local task logs |
