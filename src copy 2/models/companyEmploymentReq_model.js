const mongoose = require("mongoose");
//  await CompanyEmploymentReq.findByIdAndUpdate(newReq.id, {
//   status: "rejected",
//   rejectionDate: new Date(), // Add a rejection date
// });
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
