const mongoose = require("mongoose");

const companyServicesSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sub_title: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"], // Use an enum to restrict allowed values
      default: "active",
    },
    image: {
      type: String,
      default: "",
      required: false,
    },
    description: {
      type: String,
      required: true,
      trim: true, // Trims unnecessary spaces
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business_servicesTags",
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("CompanyServices", companyServicesSchema);
