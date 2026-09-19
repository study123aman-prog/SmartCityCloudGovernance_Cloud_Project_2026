import { Router } from "express";

export function createAuthRoutes(controller, authMiddleware) {
  const router = Router();
  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.get("/me", authMiddleware, controller.me);
  router.patch("/notifications", authMiddleware, controller.updateNotifications);
  return router;
}
