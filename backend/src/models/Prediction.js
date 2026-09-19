import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    inputs: {
      temperature: { type: Number, required: true },
      oxygenLevel: { type: Number, required: true },
      humidity: { type: Number, required: true },
      windSpeed: { type: Number, required: true },
      pressure: { type: Number, required: true },
      rainfall: { type: Number, required: true },
    },
    prediction: { type: Number, required: true, enum: [0, 1] },
    probability: { type: Number, required: true, min: 0, max: 1 },
    probabilities: { type: Map, of: Number, required: true },
    modelVersion: { type: String, required: true },
  },
  { timestamps: true },
);

export const Prediction = mongoose.model("Prediction", predictionSchema);
