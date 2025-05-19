// src/models/user_model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UsersSchema = new Schema(
  {
    loginCodeAttempts: {
      type: Array,
      default: [],
    },
    phoneNumber: { type: String, required: true, unique: true },
    purpose: { type: String, default: "" },
    phoneConfirmed: { type: Boolean, default: false },
    confirmationCode: { type: String, default: null },
    confirmationCodeExpires: { type: Date, default: null },
    jobTitle: { type: String, default: "" },
    fullName: { type: String, default: "" },
    username: { type: String, unique: false, required: false },
    gender: {
      type: String,
      required: false,
      default: "Choose",
      enum: ["Male", "Female", "Choose"],
    },
    accountVisibility: { type: String, default: "public" },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    lastSeen: { type: Date, default: Date.now },
    blocked: { type: Boolean, default: false },
    policyAgreed: { type: Boolean, default: true },
    serverRole: {
      type: [String],
      required: false,
      enum: ["Admin", "Supervisor", "Consultant", "Copywriter"],
      default: [],
    },
    refreshTokens: {
      type: String,
      default: "",
    },
    password: { type: String, required: false, minlength: 8 },
    root: { type: Boolean, default: false },
    mobileToken: {
      type: String,
      default: "",
    },
    resume: {
      summary: {
        type: String,
        default: null,
      },
      industry: { type: Array, default: [] },
      employmentType: { type: Array, default: "" },
      contact: {
        email: { type: String, default: null },
        phone: { type: String, default: null },
        location: { type: String, default: null },
      },
      workExperience: { type: Array, default: [] },
      education: { type: Array, default: [] },
      projects: { type: Array, default: [] },
      certificates: { type: Array, default: [] },
      awards: { type: Array, default: [] },
      languages: { type: Array, default: [] },
      cv: {
        type: Object,
        items: {
          path: { type: String, default: null },
          filename: { type: String, default: null },
          size: { type: Number, default: null },
          key: { type: String, default: null },
        },
        default: {
          path: null,
          filename: null,
          size: null,
          key: null,
        },
      },
      skills: { type: Array, default: [] },
      expectedSalary: { type: String, required: false, default: "" },
    },
    savedJobs: {
      type: [{ type: Schema.Types.ObjectId, ref: "Jobs" }],
      default: [],
    },
    searchJob: { type: Boolean, default: true },
    recommending: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    birthday: { type: String, default: "" },
    active: { type: Boolean, default: true },
    location: { type: String, default: "", required: false },
    coins: { type: Number, default: 1000 },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    avatar: { type: String, default: "" },
    gptToken: { type: String, default: "" },
    gptPrompt: { type: String, default: "" },
    lastActivity: { type: Date, default: null },
    stories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
    fullOpenVP: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Partial index for unique username
UsersSchema.index({ username: 1 }, { unique: true, sparse: true });

// Hash the password before saving the user
UsersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UsersSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Users = mongoose.model("Users", UsersSchema);
module.exports = Users;
