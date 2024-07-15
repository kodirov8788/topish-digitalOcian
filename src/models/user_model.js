const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const telegramChannelSchema = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  link: { type: String, required: false },
  available: { type: Boolean, default: true },

});

const refreshSchema = new Schema({
  token: { type: String, required: true },
  deviceId: { type: String, required: false },
  deviceName: { type: String, required: false },
  region: { type: String, required: false },
  os: { type: String, required: false },
  browser: { type: String, required: false },
  ip: { type: String, required: false },
  mobileToken: { type: String, required: false },
});

const UsersSchema = new Schema(
  {
    service: {
      savedOffices: {
        type: [{ type: Schema.Types.ObjectId, ref: "Office" }],
        default: [],
      },
    },
    loginCodeAttempts: {
      type: Array,
      default: [],
    },
    phoneNumber: { type: String, required: true, unique: true },
    phoneConfirmed: { type: Boolean, default: false },
    confirmationCode: { type: String, default: null },
    confirmationCodeExpires: { type: Date, default: null },
    jobSeeker: {
      skills: { type: Array, default: [] },
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
            // Validate file extension instead of mimetype
            const allowedFileTypes = ["pdf", "docx"];
            const fileExtension = v.split(".").pop();
            return allowedFileTypes.includes(fileExtension);
          },
          message: (props) => `${props.value} is not a valid file type!`,
        },
      },
      expectedSalary: { type: String, required: false, default: "" },
      jobTitle: { type: String, required: false, default: "" },
      nowSearchJob: { type: Boolean, default: true },
      workingExperience: { type: String, required: false, default: "" },
      employmentType: { type: String, required: false, default: "full-time" },
      educationalBackground: { type: String, required: false, default: "" },
    },
    employer: {
      companyName: { type: String, default: "" },
      aboutCompany: { type: String, default: "" },
      industry: { type: String, default: "" },
      contactNumber: { type: String, default: "" },
      contactEmail: { type: String, default: "" },
      jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Jobs" }],
    },
    fullName: { type: String, default: "" },
    username: { type: String, default: "", unique: false, required: false },
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
    role: {
      type: String,
      required: true,
      enum: ["JobSeeker", "Employer", "Service", "Admin"],
    },
    refreshTokens: {
      type: [refreshSchema],
    },
    password: { type: String, required: false, minlength: 8 },
    root: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    subAdmin: { type: Boolean, default: false },
    mobileToken: { type: Array, default: [] },
    resume: {
      summary: {
        type: String,
        default: null,
      },
      industry: { type: Array, default: [] },
      contact: {
        email: { type: String, default: null },
        phone: { type: String, default: null },
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
    },
    recommending: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    birthday: { type: String, default: "" },
    active: { type: Boolean, default: true },
    location: { type: String, default: "Tashkent", required: false },
    coins: { type: Number, default: 1000 },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    avatar: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/1/1e/Default-avatar.jpg",
    },
    telegramChannelIds: [telegramChannelSchema],
    gptToken: { type: String, default: "" },
    gptPrompt: { type: String, default: "" },
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
