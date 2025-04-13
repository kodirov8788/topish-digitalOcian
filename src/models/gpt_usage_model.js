const mongoose = require("mongoose");

const GPTUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    date: {
      type: String, // Store as YYYY-MM-DD format
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of userId + date combination
GPTUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("GPTUsage", GPTUsageSchema);
