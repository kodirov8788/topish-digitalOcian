const mongoose = require("mongoose");


// {
//     "_id": ObjectId("unique_id"),
//     "reportedUserId": "user_id_of_the_reported_user",
//     "reportReason": "reason_for_reporting",
//     "details": "additional_details",
//     "reportedBy": "user_id_of_the_reporter",
//     "reportDate": "ISODate",
//     "status": "open/resolved"
//   }
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
