const mongoose = require("mongoose");

// Define a subschema for version history entries
const VersionHistoryEntrySchema = new mongoose.Schema(
  {
    latestVersion: {
      type: String,
      required: true,
    },
    minRequiredVersion: {
      type: String,
      required: false,
    },
    updateMessage: String,
    updateUrl: String,
    updateRequired: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const AppVersionSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ["ios", "android"],
      index: true, // Add index for faster queries by platform
    },
    latestVersion: {
      type: String,
      required: true,
    },
    minRequiredVersion: {
      type: String,
      required: false,
    },
    updateMessage: {
      type: String,
      default:
        "Please update to the latest version for new features and bug fixes.",
    },
    updateUrl: {
      type: String,
      required: false,
    },
    updateRequired: {
      type: Boolean,
      default: false,
    },
    hasUpdate: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    // Add the history array to store previous versions
    versionHistory: [VersionHistoryEntrySchema],
  },
  { timestamps: true }
);

// Create a compound index to ensure uniqueness of platform
AppVersionSchema.index({ platform: 1 }, { unique: true });

module.exports = mongoose.model("AppVersion", AppVersionSchema);
