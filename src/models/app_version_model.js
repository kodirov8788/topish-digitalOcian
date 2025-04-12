const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppVersion", AppVersionSchema);
