#!/usr/bin/env bash
# FireGuard Deployment Health Check & Verification Script
set -euo pipefail

BASE_URL="${1:-http://localhost:5001}"
ML_URL="${2:-http://127.0.0.1:8000}"

echo "========================================================="
echo " Verifying FireGuard Deployment"
echo " Backend Target:    ${BASE_URL}"
echo " ML Service Target: ${ML_URL}"
echo "========================================================="

# 1. Backend /health
echo -n "[1/6] Checking Backend GET /health... "
HEALTH_RES=$(curl -fsS "${BASE_URL}/health")
echo "OK: ${HEALTH_RES}"

# 2. Backend /api/health
echo -n "[2/6] Checking Backend GET /api/health... "
API_HEALTH_RES=$(curl -fsS "${BASE_URL}/api/health")
echo "OK: ${API_HEALTH_RES}"

# 3. ML Service /health
echo -n "[3/6] Checking ML Service GET /health... "
ML_HEALTH_RES=$(curl -fsS "${ML_URL}/health")
echo "OK: ${ML_HEALTH_RES}"

# 4. User Registration & Auth Token
TEST_EMAIL="verify_$(date +%s)_${RANDOM}@example.com"
TEST_PASS="VerificationPassword123!"

echo -n "[4/6] Testing User Registration (POST /api/auth/register)... "
REG_RES=$(curl -fsS -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Verification Bot\",\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASS}\"}")
AUTH_TOKEN=$(node -e "console.log(JSON.parse(process.argv[1]).token)" "${REG_RES}")
echo "OK: User registered, token received."

# 5. Environment Simulator
echo -n "[5/6] Testing Environment Simulator (GET /api/environment/simulated)... "
SIM_RES=$(curl -fsS "${BASE_URL}/api/environment/simulated" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")
SIM_VALUES=$(node -e "console.log(JSON.stringify(JSON.parse(process.argv[1]).values))" "${SIM_RES}")
echo "OK: Simulated readings received."

# 6. Prediction Request
echo -n "[6/6] Testing Prediction Pipeline (POST /api/predictions)... "
PRED_RES=$(curl -fsS -X POST "${BASE_URL}/api/predictions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "${SIM_VALUES}")
PRED_CLASS=$(node -e "console.log(JSON.parse(process.argv[1]).prediction)" "${PRED_RES}")
PRED_PROB=$(node -e "console.log(JSON.parse(process.argv[1]).probability)" "${PRED_RES}")
echo "OK: Prediction returned class ${PRED_CLASS} with probability ${PRED_PROB}"

echo "========================================================="
echo " ALL DEPLOYMENT VERIFICATION CHECKS PASSED!"
echo "========================================================="
