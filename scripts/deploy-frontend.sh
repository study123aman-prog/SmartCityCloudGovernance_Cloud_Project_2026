#!/usr/bin/env bash
# FireGuard Frontend Build and S3/CloudFront Deployment Script
set -euo pipefail

FRONTEND_S3_BUCKET="${1:-${FRONTEND_S3_BUCKET:-}}"
PRODUCTION_API_URL="${2:-${PRODUCTION_API_URL:-}}"
CLOUDFRONT_DIST_ID="${3:-${CLOUDFRONT_DISTRIBUTION_ID:-}}"

if [ -z "${FRONTEND_S3_BUCKET}" ] || [ -z "${PRODUCTION_API_URL}" ]; then
  echo "Usage: $0 <frontend-s3-bucket> <production-api-url> [cloudfront-distribution-id]"
  echo "Example: $0 fireguard-frontend-bucket https://api.example.com/api E12345EXAMPLE"
  exit 1
fi

echo "========================================================="
echo " Deploying FireGuard Frontend"
echo " S3 Bucket: ${FRONTEND_S3_BUCKET}"
echo " API URL:   ${PRODUCTION_API_URL}"
echo "========================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}/frontend"

# Build production distribution
echo "[1/3] Building production frontend with Vite..."
export VITE_API_URL="${PRODUCTION_API_URL}"
npm ci
npm run build

# Sync assets to S3
echo "[2/3] Syncing dist/ to s3://${FRONTEND_S3_BUCKET}..."
aws s3 sync dist/ "s3://${FRONTEND_S3_BUCKET}" --delete

# CloudFront cache invalidation
if [ -n "${CLOUDFRONT_DIST_ID}" ]; then
  echo "[3/3] Creating CloudFront cache invalidation for distribution ${CLOUDFRONT_DIST_ID}..."
  aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DIST_ID}" --paths "/*"
else
  echo "[3/3] CloudFront distribution ID not provided. Skipping cache invalidation."
fi

echo "========================================================="
echo " Frontend deployment completed successfully!"
echo "========================================================="
