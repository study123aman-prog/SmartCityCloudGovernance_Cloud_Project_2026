# Example systemd service units

Replace `/opt/fireguard` and the service user with the actual EC2 paths.

## ML service

```ini
[Unit]
Description=FireGuard FastAPI ML service
After=network.target

[Service]
User=fireguard
WorkingDirectory=/opt/fireguard/ml-service
ExecStart=/opt/fireguard/ml-service/.venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Backend

```ini
[Unit]
Description=FireGuard Express backend
After=network.target

[Service]
User=fireguard
WorkingDirectory=/opt/fireguard/backend
EnvironmentFile=/opt/fireguard/backend/.env
ExecStart=/usr/bin/node src/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
