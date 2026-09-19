import "dotenv/config";

const requiredEnvironment = ["JWT_SECRET"];

export function getEnvironment() {
  const missing = requiredEnvironment.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    // Provide default in dev mode so the app starts cleanly without fuss
    if (process.env.NODE_ENV !== "production") {
      process.env.JWT_SECRET = "fireguard-ai-development-jwt-secret-key-32chars";
    } else {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 5001),
    host: process.env.HOST ?? "0.0.0.0",
    mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/fireguard_ai",
    useInMemoryDb: process.env.USE_IN_MEMORY_DB === "true",
    jwtSecret: process.env.JWT_SECRET ?? "fireguard-ai-development-jwt-secret-key-32chars",
    mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
    frontendOrigin: process.env.FRONTEND_ORIGIN
      ? (process.env.FRONTEND_ORIGIN.includes(",")
          ? process.env.FRONTEND_ORIGIN.split(",").map((s) => s.trim())
          : process.env.FRONTEND_ORIGIN)
      : ["http://localhost:5173", "http://127.0.0.1:5173"],
    storageDir: process.env.LOCAL_STORAGE_DIR ?? "data/uploads",
    localStorageDir: process.env.LOCAL_STORAGE_DIR ?? "data/uploads",
    alertRiskThreshold: Number(process.env.ALERT_WARNING_THRESHOLD ?? 65),
    FOREST_WEIGHT: Number(process.env.FOREST_WEIGHT ?? 0.35),
    WEATHER_WEIGHT: Number(process.env.WEATHER_WEIGHT ?? 0.20),
    BUILDING_WEIGHT: Number(process.env.BUILDING_WEIGHT ?? 0.30),
    EXPOSURE_WEIGHT: Number(process.env.EXPOSURE_WEIGHT ?? 0.15),
    riskWeights: {
      forest: Number(process.env.FOREST_WEIGHT ?? 0.35),
      weather: Number(process.env.WEATHER_WEIGHT ?? 0.20),
      building: Number(process.env.BUILDING_WEIGHT ?? 0.30),
      exposure: Number(process.env.EXPOSURE_WEIGHT ?? 0.15),
    },
    alertThresholds: {
      warning: Number(process.env.ALERT_WARNING_THRESHOLD ?? 60),
      critical: Number(process.env.ALERT_CRITICAL_THRESHOLD ?? 85),
    },
  };
}

export const env = getEnvironment();
export default env;
