import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      }
    ],
    features: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
