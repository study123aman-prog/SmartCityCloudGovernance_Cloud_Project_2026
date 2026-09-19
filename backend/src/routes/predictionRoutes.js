import { Router } from "express";

export function createPredictionRoutes(controller, authMiddleware) {
  const router = Router();
  router.use(authMiddleware);
  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/stats", controller.stats);
  router.get("/:id", controller.getById);
  return router;
}
