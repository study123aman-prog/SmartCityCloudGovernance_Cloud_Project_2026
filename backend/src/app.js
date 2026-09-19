import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { createAuthController } from "./controllers/authController.js";
import { createPredictionController } from "./controllers/predictionController.js";
import { createFileController } from "./controllers/fileController.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createAuthRoutes } from "./routes/authRoutes.js";
import { createPredictionRoutes } from "./routes/predictionRoutes.js";
import { createFileRoutes } from "./routes/fileRoutes.js";
import { createEnvironmentRoutes } from "./routes/environmentRoutes.js";
import { createFireGuardRoutes } from "./routes/fireGuardRoutes.js";
import { createMlService } from "./services/mlService.js";
import { LocalStorageService } from "./services/storage/LocalStorageService.js";
import { createNotificationService } from "./services/notificationService.js";
import { repositories } from "./repositories/index.js";

export function createApp(environment) {
  const app = express();
  const authMiddleware = requireAuth(environment.jwtSecret);
  const mlService = createMlService(environment.mlServiceUrl);
  const storageService = new LocalStorageService(environment.localStorageDir || "data/uploads");
  const notificationService = createNotificationService({
    threshold: environment.alertRiskThreshold || 65,
    alertRepository: repositories.alerts,
  });

  const authController = createAuthController(environment);
  const predictionController = createPredictionController({ mlService, notificationService });
  const fileController = createFileController({ storageService });

  if (environment.nodeEnv === "production") {
    app.set("trust proxy", 1);
  }

  app.use(helmet({
    contentSecurityPolicy: false, // allow local mapping & tile loading
  }));
  app.use(cors({ origin: environment.frontendOrigin || "*", credentials: true }));
  app.use(express.json({ limit: "50kb" }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

  const healthHandler = (_request, response) => {
    response.json({
      status: "ok",
      project: "FireGuard AI",
      version: "2.0.0",
      architecture: "Local-First Decoupled Microservices",
      database: mongoose.connection.readyState === 1 ? "connected" : "in_memory_resilient",
      ml_service: environment.mlServiceUrl,
    });
  };

  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  // FireGuard AI Multi-Domain Endpoints
  app.use("/api", createFireGuardRoutes());

  // Legacy/Compatibility Auth, Env, File, and Prediction Routes
  app.use("/api/auth", createAuthRoutes(authController, authMiddleware));
  app.use("/api/environment", createEnvironmentRoutes(authMiddleware));
  app.use("/api/files", createFileRoutes(fileController, authMiddleware));
  app.use("/api/predictions", createPredictionRoutes(predictionController, authMiddleware));

  app.use(errorHandler);

  return app;
}
