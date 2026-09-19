# Project Presentation Outline

1. **Problem and motivation**: explain why environmental context can support inspection workflows, while avoiding claims of certified warnings.
2. **Existing model inspection**: show the serialized Random Forest, its six features, numeric classes, and the missing training-data limitation.
3. **Product goal**: introduce FireGuard as a software-only prototype using manual and simulated data.
4. **Architecture**: explain React, Express, MongoDB Atlas, FastAPI, and the EC2 deployment boundary.
5. **Prediction flow**: input validation, ML request, probability response, persistence, and dashboard rendering.
6. **Cloud integrations**: show private S3, optional SNS, Lambda reports, IAM, and CloudWatch roles.
7. **Security**: cover JWTs, password hashing, private ports, environment variables, least-privilege IAM, and rate limiting.
8. **Testing**: demonstrate backend, ML, frontend, Lambda, and build checks.
9. **Limitations**: discuss model provenance, simulated data, external services, and non-emergency status.
10. **Future work**: retrain with documented data, calibration, weather API caching, staged deployment, and stronger integration tests.