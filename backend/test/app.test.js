import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";

async function withServer(callback) {
  const app = createApp({
    jwtSecret: "test-secret-32-character-minimum-len",
    mlServiceUrl: "http://127.0.0.1:8000",
    frontendOrigin: "http://localhost:5173",
  });
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  try {
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

test("health endpoint returns status ok and project metadata", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.project, "FireGuard AI");
    assert.equal(body.version, "2.0.0");
  });
});

test("buildings endpoint returns all 3 facilities with zone counts and coordinates", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/buildings`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "success");
    assert.equal(body.buildings.length, 3);
    const bldgA = body.buildings.find((b) => b.id === "building_a");
    assert.ok(bldgA);
    assert.equal(bldgA.zone_count, 7);
  });
});

test("evacuation routing computes safest egress route via Dijkstra", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/buildings/building_a/evacuation-route?start_zone_id=bldg_a_elec`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "success");
    assert.ok(body.evacuation_plan.route.length >= 2);
    assert.equal(body.evacuation_plan.start_zone.id, "bldg_a_elec");
    assert.ok(body.evacuation_plan.destination_exit.name.includes("Exit"));
  });
});

test("what-if fire simulation computes multi-step hazard progression", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/simulation/fire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        building_id: "building_a",
        origin_zone_id: "bldg_a_elec",
        initial_severity: "CRITICAL",
        duration: 4,
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "success");
    assert.equal(body.simulation.total_steps, 5); // 0 to 4
    assert.ok(body.simulation.final_affected_zones >= 1);
  });
});

test("6-hour forecast returns time-series predictions", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/forecast`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "success");
    assert.equal(body.forecast.timeline.length, 7); // Current + 6 hours
  });
});

test("alerts endpoint returns seeded local incidents", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/alerts`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "success");
    assert.ok(body.alerts.length >= 1);
  });
});

test("analytics endpoint returns multi-sensor trends and facility comparison", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/analytics`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "success");
    assert.equal(body.sensor_trends.length, 24);
    assert.equal(body.building_comparison.length, 3);
  });
});