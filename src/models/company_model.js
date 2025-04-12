// src/models/company_model.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    logo: {
      type: Array,
      required: false,
      default: [],
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    info: {
      legal_representative: {
        type: String,
        required: false,
        default: "",
      },
      registration_capital: {
        type: String,
        required: false,
        default: "",
      },
      date_of_establishment: {
        type: String,
        required: false,
        default: "",
      },
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: false,
      enum: [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1001-5000",
        "5001-10000",
        "10001+",
      ],
    },
    working_time: {
      type: String,
      required: false,
      default: "",
    },
    working_days: {
      type: String,
      required: false,
      default: "",
    },
    overtime: {
      type: String,
      required: false,
      default: "",
    },
    benefits: [],
    location: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: false,
      default: "",
    },
    workers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
        role: {
          type: String,
          default: "",
        },
      },
    ],
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // New companies are pending approval
    },
    phoneNumber: {
      type: String,
      required: true,
      default: "",
    },
    licenseFiles: {
      type: Array,
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
