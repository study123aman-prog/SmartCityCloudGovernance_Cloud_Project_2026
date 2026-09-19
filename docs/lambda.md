# Lambda Report Generator

FireGuard uses Lambda only for asynchronous report generation. The Express and FastAPI services remain on EC2 for synchronous predictions.

## Function

`lambda/reportGenerator.mjs` accepts an event containing `userId` and `summary`, then writes a dated JSON report to `REPORT_BUCKET` under `reports/{userId}/`.

Example event:

```json
{
  "userId": "user-id",
  "summary": {
    "total": 20,
    "risky": 6,
    "averageProbability": 0.61
  }
}
```

## IAM policy

The Lambda execution role should allow only `s3:PutObject` for the report prefix in the private report bucket. Attach standard Lambda logging permissions for CloudWatch Logs. Do not grant broad S3 administration permissions.

## Schedule

An EventBridge scheduled rule can invoke the function daily with a prepared event. A later version can obtain summaries from an internal report-generation API before invoking Lambda.

## Deployment outline

```bash
cd lambda
npm install
zip -r function.zip reportGenerator.mjs package.json node_modules
aws lambda create-function \
  --function-name fireguard-report-generator \
  --runtime nodejs22.x \
  --handler reportGenerator.handler \
  --role arn:aws:iam::<account-id>:role/<lambda-role> \
  --zip-file fileb://function.zip
```

The deployment command is intentionally not run without an AWS account, role ARN, and bucket configuration.
