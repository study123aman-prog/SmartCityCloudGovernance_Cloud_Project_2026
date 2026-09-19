import { Router } from "express";
import { createSimulatedEnvironment } from "../services/environmentSimulator.js";

export function createEnvironmentRoutes(authMiddleware) {
  const router = Router();
  router.get("/simulated", authMiddleware, (_request, response) => {
    response.json({ source: "simulated", values: createSimulatedEnvironment() });
  });
  return router;
}
