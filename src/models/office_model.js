// src/models/office_model.js
const mongoose = require("mongoose");

// Create a Job model
const OfficeSchema = new mongoose.Schema(
  {
    images: { type: Array, default: [] },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    price: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    officeType: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    postingStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected"],
    },
  },
  { timestamps: true }
);




module.exports = mongoose.model("Offices", OfficeSchema);
