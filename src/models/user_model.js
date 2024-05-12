const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const { jobSeekerSchema } = require("./role/JobSeeker");
const { employerSchema } = require("./role/Employer");
const { ServiceSchema } = require("./role/Service_model");
const { AdminSchema } = require("./role/Admin_model");

// Create a User model
const UsersSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  phoneConfirmed: { type: Boolean, default: false },
  emailConfirmed: { type: Boolean, default: false },
  accountVisibility: { type: String, default: "public" },
  friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  lastSeen: { type: Date, default: Date.now },
  blocked: { type: Boolean, default: false },
  role: {
    type: String,
    required: true,
    enum: ["JobSeeker", "Employer", "Service", "Admin"],
  },
  password: { type: String, required: true, minlength: 8 },
  jobSeeker: {
    type: jobSeekerSchema,
    required: function () {
      return this.role === "JobSeeker";
    },
  },
  admin: {
    type: AdminSchema,
    required: function () {
      return this.role === "Admin";
    },
  },
  service: {
    type: ServiceSchema,
    required: function () {
      return this.role === "Service";
    },
  },
  employer: {
    type: employerSchema,
    required: function () {
      return this.role === "Employer";
    },
  },
  mobileToken: { type: Array, default: [] },
  resumeId: {
    type: Schema.Types.ObjectId,
    ref: "Resume",
    required: false,
  },
  recommending: {
    type: Boolean,
    default: false,
  },
  coins: { type: Number, default: 50 },
  favorites: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  avatar: {
    type: String,
    default:
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Default-avatar.jpg",
  },
  // createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// it generates passwords into hash
UsersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password function
UsersSchema.methods.comparePassword = async function (candidatePasssword) {
  const isMatch = await bcrypt.compare(candidatePasssword, this.password);
  return isMatch;
};




const Users = mongoose.model("Users", UsersSchema);
module.exports = Users;
