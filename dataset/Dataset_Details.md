# Dataset Details

Phase 1 uses a real, publicly released AWS CloudTrail dataset to develop and evaluate the security-related detection component of the policy-intelligence engine—the same event source referenced in the review of Paper 12. Its details are summarized below.

| Field | Detail |
|--------|--------|
| **Dataset Name** | AWS CloudTrail Logs Dataset (from flaws.cloud) |
| **Source** | Scott Piper / Summit Route — publicly released for AWS security research; also mirrored on Kaggle |
| **URL** | https://summitroute.com/downloads/flaws_cloudtrail_logs.tar (mirror: https://www.kaggle.com/datasets/nobukim/aws-cloudtrails-dataset-from-flaws-cloud) |
| **Size** | Approximately **240 MB** compressed, distributed as gzipped JSON chunks of **100,000 events** each |
| **Number of Records** | **1,939,207** CloudTrail events spanning **2017-02-12** to **2020-10-07** |
| **Number of Features** | Approximately **20** top-level CloudTrail fields (*eventTime, eventSource, eventName, awsRegion, sourceIPAddress, userAgent, errorCode, requestParameters, responseElements, resources*, etc.), several of which contain nested JSON objects such as **userIdentity** and **sessionContext** |
| **Data Type** | Semi-structured JSON event logs containing categorical, timestamp, and nested text-based fields |
| **License / Usage Terms** | Released publicly by the author for security research. IP addresses, account IDs, and access keys are anonymized. No formal open-source license is attached; therefore, the dataset is used only for non-commercial academic research. |
| **Purpose of Using the Dataset** | Train and evaluate the classifier that detects anomalous authentication, privilege-escalation, and reconnaissance patterns, serving as the security-domain input to the policy-intelligence engine. |
| **Preprocessing Required** | Flatten nested JSON fields (*userIdentity*, *requestParameters*); encode categorical attributes (*eventName*, *eventSource*, *awsRegion*); derive temporal features from *eventTime*; remove duplicate API calls; and generate malicious/benign labels using known **flaws.cloud** attack levels and associated IP/user-agent indicators. |

AWS Config findings and IoT telemetry—the other two governance signal sources in the proposed framework—do not currently have an equivalent publicly available combined dataset. Therefore, **Phase 2** will generate a synthetic AWS Config and IoT telemetry dataset based on real AWS Config rule outputs and representative smart-city sensor schemas, enabling end-to-end fusion of all three governance signals.