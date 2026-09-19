import assert from "node:assert/strict";
import { buildReport } from "./reportGenerator.mjs";

const report = buildReport({
  userId: "test-user",
  generatedAt: "2026-09-19T00:00:00.000Z",
  summary: { total: 4, risky: 1, averageProbability: 0.42 },
});

assert.equal(report.reportType, "prediction-summary");
assert.equal(report.userId, "test-user");
assert.equal(report.generatedAt, "2026-09-19T00:00:00.000Z");
assert.equal(report.summary.risky, 1);
assert.match(report.disclaimer, /prototype/);
console.log("local report test: passed");
