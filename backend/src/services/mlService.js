import axios from "axios";

export function createMlService(mlServiceUrl) {
  const client = axios.create({
    baseURL: mlServiceUrl,
    timeout: 10000,
  });

  return {
    async predict(inputs) {
      const { data } = await client.post("/predict", inputs);
      return data;
    },
    async health() {
      const { data } = await client.get("/health");
      return data;
    },
  };
}
