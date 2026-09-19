# Database Schema

MongoDB Atlas stores two Mongoose collections.

## User

```text
name                 string, required
email                string, unique, lowercase, required
passwordHash         string, required, excluded from normal queries
role                 user | admin
notificationsEnabled boolean, default false
createdAt            date
updatedAt            date
```

## Prediction

```text
user                 ObjectId reference to User
inputs               temperature, oxygenLevel, humidity, windSpeed, pressure, rainfall
prediction           numeric class 0 or 1
probability          class-1 probability between 0 and 1
probabilities        map of class label to probability
modelVersion         string
createdAt            date
updatedAt            date
```

Prediction history is scoped by authenticated user ID. Password hashes are never returned by the API. MongoDB Atlas network access should be restricted to the deployment environment.