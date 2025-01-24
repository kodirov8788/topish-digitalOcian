// src/models/quickjob_model.js
const mongoose = require("mongoose");

// Create a Job model
const QuickJob = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    hr_name: { type: String, default: "" },
    hr_avatar: { type: String, default: "" },
    description: { type: String, default: "" },
    jobStatus: {
      type: String,
      default: "Open",
      enum: ["Open", "Closed", "Expired"],
    },
    phoneNumber: { type: String, default: "" },
    recommending: { type: Boolean, default: false },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    location: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    validUntil: {
      type: Date,
      validate: {
        validator: function (value) {
          // This validator simply checks if the date is in the future.
          return value > new Date();
        },
        message: "Please choose a future date for validUntil.",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobSeeker" }],
    callOnly: { type: Boolean, default: false },
    telegramOnly: { type: Boolean, default: false },
    telegramUsername: { type: String, default: "" },
    postingStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected"],
    },
  },
  { timestamps: true }
);

QuickJob.pre("save", function (next) {
  if (this.validUntil <= new Date()) {
    this.jobStatus = "Expired";
  }
  next();
});

QuickJob.virtual("recommended").get(function () {
  // Check if the employer is verified
  if (this.employer && this.employer.isVerified) {
    return true;
  }
  return false;
});

/* 
const recommendedJobs = await Job.find()
  .sort({ recommended: -1 })
  .exec();
 */

module.exports = mongoose.model("Quickjobs", QuickJob);
