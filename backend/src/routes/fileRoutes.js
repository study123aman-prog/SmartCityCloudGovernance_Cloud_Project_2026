import { Router } from "express";

export function createFileRoutes(controller, authMiddleware) {
  const router = Router();
  router.use(authMiddleware);
  router.post("/upload-url", controller.createUploadUrl);
  router.get("/", controller.listFiles);
  return router;
}
