const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSeekerSchema = new Schema({
    fullName: { type: String, default: "" },
    gender: {
        type: String,
        required: false,
        default: "Choose",
        enum: {
            values: ["Male", "Female", "Choose"],
        },
    },
    birthday: {
        type: String,
        default: ""
    },
    skills: { type: Array, default: [] },
    isVerified: {
        type: Boolean,
        default: false,
    },
    location: {
        type: String,
        default: "Tashkent",
        required: false,
    },
    professions: {
        type: Array,
        default: [],
    },
    savedJobs: {
        type: [{ type: Schema.Types.ObjectId, ref: "Jobs" }],
        default: [],
    },
    cv: {
        type: String,
        required: false,
        validate: {
            validator: function (v) {
                // Add validation rules for file upload here
                // For example, check if the file is a PDF or DOCX file
                const allowedFileTypes = [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ];
                return allowedFileTypes.includes(v.mimetype);
            },
            message: (props) => `${props.value} is not a valid file type!`,
        },
    },
    expectedSalary: { type: String, required: false, default: "" },
    jobtitle: { type: String, required: false, default: "" },
    active: { type: Boolean, default: true },
    workingExperience: { type: String, required: false, default: "" },
    employmentType: { type: String, required: false, default: "full-time" },
    educationalBackground: { type: String, required: false, default: "" },
});
module.exports = { jobSeekerSchema };