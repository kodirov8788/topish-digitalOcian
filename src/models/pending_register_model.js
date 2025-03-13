const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    confirmationCode: {
      type: Number,
      required: true,
    },
    confirmationCodeExpires: {
      type: Date,
      required: true,
    },
    mobileToken: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Automatically delete documents after 1 hour (TTL index)
    },
  },
  {
    timestamps: true,
  }
);

const PendingUsers = mongoose.model("PendingUsers", pendingUserSchema);

module.exports = PendingUsers;
