// src/models/profileAccessRequest_model.js
const mongoose = require("mongoose");
const profileAccessRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  spam: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model(
  "ProfileAccessRequest",
  profileAccessRequestSchema
);
