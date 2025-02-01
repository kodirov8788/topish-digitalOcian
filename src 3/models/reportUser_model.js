// src/models/reportUser_model.js
const mongoose = require("mongoose");

const ReportUser = new mongoose.Schema(
    {
        reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", default: null },
        reportReason: { type: String, required: true },
        details: { type: String, default: "" },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        reportDate: { type: Date, default: Date.now },
        status: {
            type: String,
            default: "open",
            enum: ["open", "resolved"],
        },

    });




module.exports = mongoose.model("ReportUser", ReportUser);
