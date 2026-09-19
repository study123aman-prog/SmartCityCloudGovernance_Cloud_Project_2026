# API Documentation

Base URL: `http://localhost:5000/api`. Protected routes require `Authorization: Bearer <jwt>`.

## Authentication

`POST /auth/register`

```json
{"name":"Asha","email":"asha@example.com","password":"minimum-8-chars"}
```

`POST /auth/login` accepts `email` and `password` and returns `{ "token", "user" }`.

`GET /auth/me` returns the authenticated user. `PATCH /auth/notifications` accepts `{ "enabled": true }`.

## Prediction

`POST /predictions` accepts:

```json
{
  "temperature": 25,
  "oxygenLevel": 21,
  "humidity": 60,
  "windSpeed": 10,
  "pressure": 1013,
  "rainfall": 0
}
```

The response includes `prediction`, `probability`, `probabilities`, `modelVersion`, and input values. The probability is the model probability for numeric class `1`.

`GET /predictions` lists the user’s history. `GET /predictions/:id` returns one record. `GET /predictions/stats` returns total count, class-1 count, and average class-1 probability.

## Simulated data

`GET /environment/simulated` returns bounded test values and `{ "source": "simulated" }`. It does not represent live conditions.

## Files

`POST /files/upload-url` accepts `filename` and `contentType`, then returns a five-minute S3 presigned URL. Upload directly to that URL and do not expose AWS credentials in the browser. `GET /files` lists only the authenticated user’s object prefix.

## Errors

Validation errors return `400`, missing or invalid authentication returns `401`, unavailable configured integrations generally return `503`, and unexpected server errors return `500`.