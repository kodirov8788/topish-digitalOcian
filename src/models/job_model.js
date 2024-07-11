const mongoose = require("mongoose");

// Create a Job model
const JobsSchema = new mongoose.Schema(
  {
    hr_name: { type: String, default: "" },
    hr_avatar: { type: String, default: "" },
    description: { type: String },
    company: { type: String, default: "" },
    jobStatus: {
      type: String,
      default: "Open",
      enum: ["Open", "Closed", "Expired"],
    },
    jobType: {
      type: String,
      default: "Full Time",
      enum: ["Full Time", "Part Time", "Contract", "Freelance", "Contractual", "Temporary", "Internship"],
    },
    experience: { type: String, default: "" }, // e.g., "No experience", "1 year", "2 years", etc.
    educationLevel: { type: String, default: "" }, // e.g., "Bachelor's", "Master's", "Ph.D."
    benefits: { type: [String], default: [] }, // e.g., "Health insurance", "Paid time off"
    location: { type: String, default: "" }, // e.g., "New York", "Remote"
    createdAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    jobTitle: { type: String, default: "" }, // The specific title of the job
    numberOfVacancies: { type: String, default: "" }, // Number of positions available
    industry: { type: String, default: "" }, // Industry to which the job belongs
    workingHours: { type: String, default: "" }, // e.g., "9am-5pm", "Flexible"
    salaryRange: { type: String, default: "" }, // e.g., "3000-5000" currency units per month
    qualifications: { type: String }, // Detailed qualifications required
    languagesRequired: { type: [String], default: [] }, // e.g., ["English", "Spanish"]
    requirements: { type: String, default: "" },
    workingtype: { type: String, default: "onsite" },
    recommended: { type: Boolean, default: false },
    callOnly: { type: Boolean, default: false },
    phoneNumber: { type: String, default: "" },
    telegramUsername: { type: String, default: "" }
  },
  { timestamps: true }
);


JobsSchema.pre("save", function (next) {
  if (this.validUntil <= new Date()) {
    this.jobStatus = "Expired";
  }
  next();
});

// JobsSchema.virtual("recommended").get(function () {
//   // Check if the employer is verified
//   if (this.employer && this.employer.isVerified) {
//     return true;
//   }
//   return false;
// });
/* 
const recommendedJobs = await Job.find()
  .sort({ recommended: -1 })
  .exec();
 */

module.exports = mongoose.model("Jobs", JobsSchema);
