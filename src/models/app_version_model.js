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
      required: true,
    },
    updateMessage: String,
    updateUrl: String,
    updateRequired: Boolean,
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
    },
    latestVersion: {
      type: String,
      required: true,
    },
    minRequiredVersion: {
      type: String,
      required: true,
    },
    updateMessage: {
      type: String,
      default:
        "Please update to the latest version for new features and bug fixes.",
    },
    updateUrl: {
      type: String,
      required: true,
    },
    updateRequired: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("AppVersion", AppVersionSchema);
