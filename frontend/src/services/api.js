import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fireguard_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiError(error, fallback = "Something went wrong") {
  if (!error?.response) {
    if (error?.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    return "Unable to connect to server. Please check your connection or server status.";
  }
  const data = error.response.data;
  if (data?.error) {
    if (data.details?.fieldErrors) {
      const fieldMessages = Object.entries(data.details.fieldErrors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
        .join("; ");
      if (fieldMessages) return `${data.error} (${fieldMessages})`;
    }
    return data.error;
  }
  return fallback;
}

// FireGuard AI API Service Helpers
export const fireGuardApi = {
  // Buildings & Zones
  getBuildings: () => api.get('/buildings').then((r) => r.data.buildings),
  getBuilding: (id) => api.get(`/buildings/${id}`).then((r) => r.data.building),
  getZones: (params) => api.get('/zones', { params }).then((r) => r.data.zones),
  getEvacuationRoute: (buildingId, startZoneId) =>
    api.get(`/buildings/${buildingId}/evacuation-route`, { params: { start_zone_id: startZoneId } }).then((r) => r.data.evacuation_plan),

  // Risk Assessment
  getCurrentRisk: () => api.get('/risk/current').then((r) => r.data),
  getForestRisk: (params) => api.post('/risk/forest', params).then((r) => r.data),
  getBuildingRisk: (params) => api.post('/risk/building', params).then((r) => r.data),
  getOverallRisk: (params) => api.get('/risk/overall', { params }).then((r) => r.data),
  updateRiskWeights: (weights) => api.post('/risk/weights', weights).then((r) => r.data),

  // Forecasting
  getForecast: () => api.get('/forecast').then((r) => r.data.forecast),

  // Simulation
  runSimulation: (params) => api.post('/simulation/fire', params).then((r) => r.data.simulation),

  // Geospatial
  getGeospatialRisk: () => api.get('/geospatial/risk').then((r) => r.data.locations),

  // Alerts
  getAlerts: (params) => api.get('/alerts', { params }).then((r) => r.data),
  acknowledgeAlert: (id) => api.post(`/alerts/${id}/ack`).then((r) => r.data),

  // Analytics
  getAnalytics: () => api.get('/analytics').then((r) => r.data),

  // Telemetry
  getLatestTelemetry: (params) => api.get('/telemetry/latest', { params }).then((r) => r.data.telemetry),
};
