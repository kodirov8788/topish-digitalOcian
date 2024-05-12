const Joi = require('joi');
const mongoose = require('mongoose');

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
            default: "Full-time",
            enum: ["Full-time", "Part-time", "Freelance", "Internship", "Temporary"],
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
    },
    { timestamps: true }
);

JobsSchema.pre("save", function (next) {
    if (this.validUntil <= new Date()) {
        this.jobStatus = "Expired";
    }
    next();
});

const Jobs = mongoose.model("Jobs", JobsSchema);

// Joi validation schema
const jobValidationSchema = Joi.object({
    hr_name: Joi.string().default(''),
    hr_avatar: Joi.string().default(''),
    description: Joi.string().required(),
    company: Joi.string().default(''),
    jobStatus: Joi.string().valid('Open', 'Closed', 'Expired').default('Open'),
    jobType: Joi.string().valid('Full-time', 'Part-time', 'Freelance', 'Internship', 'Temporary').default('Full-time'),
    experience: Joi.string().default(''),
    educationLevel: Joi.string().default(''),
    benefits: Joi.array().items(Joi.string()).default([]),
    location: Joi.string().default(''),
    createdBy: Joi.string().required(), // Assuming createdBy is provided as a string of ObjectId
    jobTitle: Joi.string().default(''),
    numberOfVacancies: Joi.string().default(''),
    industry: Joi.string().default(''),
    workingHours: Joi.string().default(''),
    salaryRange: Joi.string().default(''),
    image: Joi.string().default(''),
    qualifications: Joi.string().required(""),
    languagesRequired: Joi.array().items(Joi.string()).default([]),
    requirements: Joi.string().default(''),
    workingtype: Joi.string().valid('onsite', 'remote').default('onsite'),
    recommended: Joi.boolean().default(false)
});

// // Example usage
// async function createJob(jobData) {
//   const { error, value } = jobValidationSchema.validate(jobData);
//   if (error) {
//     throw new Error(error.details[0].message);
//   }
//   const job = new Job(value);
//   await job.save();
//   return job;
// }


module.exports = { Jobs, jobValidationSchema };
