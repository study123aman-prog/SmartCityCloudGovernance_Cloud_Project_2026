import mongoose from "mongoose";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { getEnvironment } from "./config/env.js";

const environment = getEnvironment();
const host = process.env.HOST ?? "0.0.0.0";

try {
  await connectDatabase(environment.mongoUri);
  console.log("Connected to MongoDB successfully");
} catch (error) {
  console.error("Failed to connect to MongoDB:", error.message);
  process.exit(1);
}

const app = createApp(environment);
const server = app.listen(environment.port, host, () => {
  console.log(`FireGuard backend listening on ${host}:${environment.port}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.disconnect();
      console.log("MongoDB connection closed.");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
    }
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

