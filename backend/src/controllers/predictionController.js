import mongoose from "mongoose";
import { z } from "zod";
import { Prediction } from "../models/Prediction.js";
import { User } from "../models/User.js";

const predictionInputSchema = z.object({
  temperature: z.number().finite().min(-10).max(50),
  oxygenLevel: z.number().finite().min(10).max(30),
  humidity: z.number().finite().min(0).max(100),
  windSpeed: z.number().finite().min(0).max(50),
  pressure: z.number().finite().min(900).max(1050),
  rainfall: z.number().finite().min(0).max(500),
});

export function createPredictionController({ mlService, notificationService }) {
  return {
    async create(request, response) {
      const input = predictionInputSchema.safeParse(request.body);
      if (!input.success) return response.status(400).json({ error: "Invalid prediction input", details: input.error.flatten() });

      let result;
      try {
        result = await mlService.predict(input.data);
      } catch (error) {
        const statusCode = error.response?.status === 422 ? 400 : 503;
        return response.status(statusCode).json({ error: "ML service unavailable or rejected the request" });
      }

      const prediction = await Prediction.create({
        user: request.auth.sub,
        inputs: input.data,
        prediction: result.prediction,
        probability: result.probability,
        probabilities: result.probabilities,
        modelVersion: result.model_version,
      });

      const user = await User.findById(request.auth.sub).select("email notificationsEnabled");
      if (user?.notificationsEnabled && notificationService.isThresholdCrossed(result)) {
        try {
          await notificationService.notifyRisk({ userEmail: user.email, prediction: result.prediction, probability: result.probability, modelVersion: result.model_version });
        } catch (notificationError) {
          console.error("SNS notification failed", notificationError);
        }
      }

      return response.status(201).json({
        id: prediction._id,
        inputs: prediction.inputs,
        prediction: result.prediction,
        probability: result.probability,
        probabilities: result.probabilities,
        modelVersion: result.model_version,
        createdAt: prediction.createdAt,
      });
    },

    async list(request, response) {
      const limit = Math.min(Number(request.query.limit ?? 20), 100);
      const predictions = await Prediction.find({ user: request.auth.sub }).sort({ createdAt: -1 }).limit(limit).lean();
      return response.json({ predictions });
    },

    async getById(request, response) {
      const prediction = await Prediction.findOne({ _id: request.params.id, user: request.auth.sub }).lean();
      if (!prediction) return response.status(404).json({ error: "Prediction not found" });
      return response.json({ prediction });
    },

    async stats(request, response) {
      const userObjectId = new mongoose.Types.ObjectId(request.auth.sub);
      const [summary] = await Prediction.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: null, total: { $sum: 1 }, risky: { $sum: { $cond: [{ $eq: ["$prediction", 1] }, 1, 0] } }, averageProbability: { $avg: "$probability" } } },
        { $project: { _id: 0, total: 1, risky: 1, averageProbability: 1 } },
      ]);
      return response.json(summary ?? { total: 0, risky: 0, averageProbability: 0 });
    },
  };
}
