// src/models/companyEmploymentReq_model.js
const mongoose = require("mongoose");

const companyEmploymentRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  spam: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model(
  "companyEmploymentReq_model",
  companyEmploymentRequestSchema
);
