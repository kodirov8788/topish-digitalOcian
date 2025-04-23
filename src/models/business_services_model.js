// src/models/business_services_model.js
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
    location: {
      type: String,
      default: "",
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
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "",
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DiscoverTag",
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("CompanyServices", companyServicesSchema);
