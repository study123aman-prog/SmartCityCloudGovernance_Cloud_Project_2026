# FireGuard Test Plan

## Automated coverage

| Area | Test | Result |
|---|---|---|
| Express health | Reports API health while MongoDB is disconnected | Passed |
| Express authentication | Rejects anonymous prediction history requests | Passed |
| Express validation | Rejects malformed registration before database access | Passed |
| ML service | Preserves the six model feature columns and returns real probabilities | Passed |
| ML service | Returns `503` behavior when the model is unavailable | Passed |
| ML service | Rejects out-of-range input | Passed |
| React | Displays numeric model class without inventing a risk label | Passed |
| Lambda | Builds a dated summary report with the prototype disclaimer | Passed |

## Commands

Run the suites independently from the repository root:

```bash
node --test backend/test/app.test.js
cd ml-service && .venv/bin/python -m unittest -v test_ml_service.py
npm --prefix frontend test
npm --prefix lambda test
npm --prefix frontend run build
```

## Manual integration scenarios

These require MongoDB Atlas, the ML service, and optionally AWS credentials:

- Register and log in with valid credentials.
- Submit valid and invalid prediction inputs.
- Confirm ML service unavailable errors are shown cleanly.
- Confirm prediction history belongs only to the authenticated user.
- Confirm a private S3 presigned upload and object listing.
- Confirm SNS subscription confirmation and threshold notification.
- Invoke Lambda with a report event and verify the private S3 object.
- Check unauthorized API access, expired JWTs, and rate-limit responses.

## Known test limitations

The automated suite does not connect to MongoDB Atlas, AWS S3, SNS, EC2, CloudWatch, or a deployed Lambda function. Those integrations require configured accounts and should be tested in a disposable staging environment before deployment.

The serialized model emits a scikit-learn version warning when loaded outside its training version. Deployment should use the pinned ML requirements and a compatible Python runtime.