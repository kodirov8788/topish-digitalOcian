// src/models/PhoneConfirmationCode.js
const mongoose = require("mongoose");

// Define a schema for the ConfirmationCode collection
const phConfirmationCodeSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  phoneConfirmed: { type: Boolean, default: false },
});

// Create a model for the ConfirmationCode collection
const PhConfirmationCode = mongoose.model(
  "PhConfirmationCode",
  phConfirmationCodeSchema
);

module.exports = PhConfirmationCode;
