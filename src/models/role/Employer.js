const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create an Employer model
const employerSchema = new Schema({
    fullName: { type: String, default: "" },
    companyName: { type: String, default: "" },
    aboutcompany: { type: String, default: "" },
    industry: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    location: { type: String, default: "" },
    active: { type: Boolean, default: true },
    isVerified: {
        type: Boolean,
        default: false,
    },
    jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Jobs" }],
});


module.exports = { employerSchema };