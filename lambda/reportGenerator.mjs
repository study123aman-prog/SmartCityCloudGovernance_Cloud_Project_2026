import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({ region: process.env.AWS_REGION });

export function buildReport({ userId, summary, generatedAt = new Date().toISOString() }) {
  if (!userId || !summary) throw new Error("userId and summary are required");
  return {
    reportType: "prediction-summary",
    userId,
    generatedAt,
    summary,
    disclaimer: "FireGuard is a software prototype and does not provide certified emergency warnings.",
  };
}

export async function handler(event) {
  const bucket = process.env.REPORT_BUCKET ?? event.bucket;
  if (!bucket) throw new Error("REPORT_BUCKET environment variable is required");

  const report = buildReport(event);
  const date = report.generatedAt.slice(0, 10);
  const key = `reports/${report.userId}/${date}-${Date.now()}.json`;

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(report),
    ContentType: "application/json",
    ServerSideEncryption: "AES256",
  }));

  return { bucket, key, reportType: report.reportType };
}
