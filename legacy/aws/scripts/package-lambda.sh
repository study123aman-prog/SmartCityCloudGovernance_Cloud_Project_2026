#!/usr/bin/env bash
# FireGuard Lambda Packaging & Deployment Script
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAMBDA_DIR="${ROOT_DIR}/lambda"
ZIP_FILE="${LAMBDA_DIR}/function.zip"
FUNCTION_NAME="${1:-${LAMBDA_FUNCTION_NAME:-fireguard-report-generator}}"
ROLE_ARN="${2:-${LAMBDA_ROLE_ARN:-}}"

echo "========================================================="
echo " Packaging FireGuard Lambda Function"
echo "========================================================="

cd "${LAMBDA_DIR}"
echo "[1/2] Installing production dependencies..."
npm ci --omit=dev

echo "[2/2] Creating ${ZIP_FILE}..."
rm -f "${ZIP_FILE}"
zip -q -r "${ZIP_FILE}" reportGenerator.mjs package.json node_modules

echo "Package created at ${ZIP_FILE} ($(du -h "${ZIP_FILE}" | cut -f1))"

# Deploy if AWS CLI is available and ROLE_ARN or existing function is specified
if command -v aws >/dev/null 2>&1; then
  if aws lambda get-function --function-name "${FUNCTION_NAME}" >/dev/null 2>&1; then
    echo "Updating existing Lambda function code for ${FUNCTION_NAME}..."
    aws lambda update-function-code \
      --function-name "${FUNCTION_NAME}" \
      --zip-file "fileb://${ZIP_FILE}"
    echo "Lambda function code updated successfully."
  elif [ -n "${ROLE_ARN}" ]; then
    echo "Creating new Lambda function ${FUNCTION_NAME}..."
    aws lambda create-function \
      --function-name "${FUNCTION_NAME}" \
      --runtime nodejs22.x \
      --handler reportGenerator.handler \
      --role "${ROLE_ARN}" \
      --zip-file "fileb://${ZIP_FILE}"
    echo "Lambda function created successfully."
  fi
fi

echo "========================================================="
echo " Lambda packaging complete."
echo "========================================================="
