/**
 * FireGuard AI - Real-Time Sensor Telemetry Stream Simulator
 * 
 * Simulates active IoT multi-sensor telemetry broadcast for Building A, B, C
 * and regional forest monitoring stations without needing AWS IoT Core.
 * 
 * Usage:
 *   node simulator/sensorSimulator.js
 *   node simulator/sensorSimulator.js --interval 3000 --anomaly bldg_a_elec
 */

import http from 'http';

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 5001;

const ZONES = [
  { id: 'bldg_a_elec', building_id: 'building_a', type: 'electrical', baseTemp: 28.0, baseSmoke: 1.0, baseLoad: 90 },
  { id: 'bldg_a_lab1', building_id: 'building_a', type: 'lab', baseTemp: 23.0, baseSmoke: 0.5, baseLoad: 50 },
  { id: 'bldg_a_corridor', building_id: 'building_a', type: 'corridor', baseTemp: 22.0, baseSmoke: 0.2, baseLoad: 30 },
  { id: 'bldg_b_server', building_id: 'building_b', type: 'server_room', baseTemp: 19.5, baseSmoke: 0.1, baseLoad: 85 },
  { id: 'bldg_b_corridor', building_id: 'building_b', type: 'corridor', baseTemp: 21.0, baseSmoke: 0.2, baseLoad: 35 },
  { id: 'bldg_c_kitchen', building_id: 'building_c', type: 'kitchen', baseTemp: 31.0, baseSmoke: 1.5, baseLoad: 70 },
];

function parseArgs() {
  const args = process.argv.slice(2);
  let interval = 5000;
  let anomalyZone = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--interval' && args[i + 1]) {
      interval = Number(args[i + 1]);
    }
    if (args[i] === '--anomaly' && args[i + 1]) {
      anomalyZone = args[i + 1];
    }
  }

  return { interval, anomalyZone };
}

function postTelemetry(data) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: API_HOST,
        port: API_PORT,
        path: '/api/telemetry',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }
    );

    req.on('error', (e) => {
      resolve({ error: e.message });
    });

    req.write(payload);
    req.end();
  });
}

async function runTick(tickCount, anomalyZone) {
  console.log(`\n[SensorSimulator] --- Emission Tick #${tickCount} (${new Date().toLocaleTimeString()}) ---`);

  for (const zone of ZONES) {
    const isAnomaly = anomalyZone && zone.id === anomalyZone;
    const jitter = (Math.random() - 0.5) * 1.5;

    const temperature = Number((zone.baseTemp + jitter + (isAnomaly ? 38.0 : 0)).toFixed(1));
    const smoke_index = Number((zone.baseSmoke + (Math.random() * 0.4) + (isAnomaly ? 14.5 : 0)).toFixed(2));
    const electrical_load = Number((zone.baseLoad + (Math.random() * 5.0) + (isAnomaly ? 65.0 : 0)).toFixed(1));
    const humidity = Number(Math.max(15, (45 - (isAnomaly ? 25 : 0) + jitter * 2)).toFixed(1));

    const telemetry = {
      source_id: zone.id,
      zone_id: zone.id,
      building_id: zone.building_id,
      zone_type: zone.type,
      temperature,
      humidity,
      smoke_index,
      electrical_load,
      occupancy: 5,
      wind_speed: 4.5,
      timestamp: new Date().toISOString(),
    };

    const res = await postTelemetry(telemetry);
    const tag = isAnomaly ? ' [!] CRITICAL ANOMALY' : '';
    console.log(
      `  • ${zone.id.padEnd(18)} | Temp: ${temperature}°C | Smoke: ${smoke_index} | Load: ${electrical_load} kW${tag}`
    );
  }

  // Regional Forest Station Telemetry
  const forestTelemetry = {
    source_id: 'regional_forest_station',
    zone_id: 'regional_forest_station',
    temperature: Number((32.0 + (Math.random() - 0.5) * 2).toFixed(1)),
    humidity: Number((26.0 + (Math.random() - 0.5) * 3).toFixed(1)),
    wind_speed: Number((16.0 + (Math.random() - 0.5) * 4).toFixed(1)),
    pressure: 1007.8,
    rainfall: 0.0,
    oxygen_level: 20.92,
    fwi: 31.2,
    timestamp: new Date().toISOString(),
  };

  await postTelemetry(forestTelemetry);
  console.log(`  🌲 Regional Station  | Temp: ${forestTelemetry.temperature}°C | Hum: ${forestTelemetry.humidity}% | Wind: ${forestTelemetry.wind_speed} km/h`);
}

function start() {
  const { interval, anomalyZone } = parseArgs();
  console.log('====================================================');
  console.log('      FireGuard AI - Telemetry Sensor Simulator     ');
  console.log('====================================================');
  console.log(`Target: http://${API_HOST}:${API_PORT}/api/telemetry`);
  console.log(`Stream interval: ${interval}ms`);
  if (anomalyZone) {
    console.log(`Active Anomaly Injected into: ${anomalyZone}`);
  }
  console.log('Press Ctrl+C to terminate simulator.');

  let tick = 1;
  runTick(tick++, anomalyZone);
  setInterval(() => runTick(tick++, anomalyZone), interval);
}

start();
