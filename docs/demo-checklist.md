# Demonstration Checklist

## Before the demo

- [ ] Start FastAPI on port `8000`.
- [ ] Start Express on port `5000` with MongoDB Atlas configured.
- [ ] Start React on port `5173`.
- [ ] Confirm `GET /api/health`.
- [ ] Confirm no secrets are visible in the repository or browser bundle.

## Demo flow

- [ ] Open the landing page and show the software-only disclaimer.
- [ ] Register a demo user and log in.
- [ ] Open the prediction workspace.
- [ ] Generate simulated values and explain that they are not sensor readings.
- [ ] Run a prediction and show numeric class probabilities.
- [ ] Open the dashboard and explain the summary chart.
- [ ] Open history and show user-scoped records.
- [ ] If configured, demonstrate an S3 presigned upload and SNS preference.
- [ ] If configured, invoke the Lambda report and verify its S3 object.

## Questions to answer

- What features does the model actually accept?
- What does class `0` or `1` mean, and what remains unverified?
- Where are credentials stored?
- Which AWS services are optional?
- Why is this not an emergency warning system?