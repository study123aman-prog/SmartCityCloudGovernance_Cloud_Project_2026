## Description
<!-- Provide a clear, concise summary of the changes introduced in this Pull Request. -->

## Motivation & Context
<!-- Why is this change required? What problem or issue does it solve? If applicable, link to issue: Fixes # -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] ⚡ Performance optimization (latency, memory, or query speed)
- [ ] 🧠 Machine Learning / Algorithm update (model weights, Dijkstra routing, hazard cascade)
- [ ] 🏢 Facility Topology / Config update (floorplans, sensors, alert rules)
- [ ] 🛠️ Refactoring / Code cleanup
- [ ] 📝 Documentation update
- [ ] 🔄 CI/CD & GitHub Actions workflow improvement

## Subsystem(s) Affected
- [ ] Backend (`/backend` - Node.js Express API)
- [ ] Frontend (`/frontend` - React 19 / Vite UI)
- [ ] ML Service (`/ml-service` - FastAPI Inference)
- [ ] Telemetry Engine (`/simulator` - Sensor Generation)
- [ ] Configurations (`/configs` - Topologies, alert rules, cloud)
- [ ] Infrastructure & Docker (`docker-compose.yml`, `/infra`, `/lambda`)

## Testing & Verification
- [ ] Backend tests passing (`cd backend && npm test`)
- [ ] Frontend tests and build passing (`cd frontend && npm test && npm run build`)
- [ ] ML Service tests passing (`cd ml-service && python3 -m unittest test_ml_service.py`)
- [ ] Configuration files validated (`python3 -c "import json, glob; [json.load(open(f)) for f in glob.glob('configs/*.json')]"` )
- [ ] Manual verification performed (e.g. simulated incident in UI, verified evacuation route)

## Checklist
- [ ] My code adheres to the project's coding and formatting standards.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented complex algorithmic sections (e.g., propagation formulas, Dijkstra costs).
- [ ] I have updated relevant documentation or README if applicable.
- [ ] No secrets, credentials, or proprietary API keys are committed.
