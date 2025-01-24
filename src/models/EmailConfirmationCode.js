// src/models/EmailConfirmationCode.js
const mongoose = require("mongoose");

// Define a schema for the ConfirmationCode collection
const confirmationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  emailConfirmed: { type: Boolean, default: false },
});

// Create a model for the ConfirmationCode collection
const ConfirmationCode = mongoose.model(
  "ConfirmationCode",
  confirmationCodeSchema
);

module.exports = ConfirmationCode;
