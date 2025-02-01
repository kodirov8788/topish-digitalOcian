// src/controllers/SendCodeCTRL.js
const PhConfirmationCode = require("../models/PhoneConfirmationCode");
// const twilio = require("twilio");
require("dotenv").config(); // It exports .env files

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

// const client = new twilio(accountSid, authToken);

// async function sendConfirmationCodeViaPhoneNumber(
//   phoneNumber,
//   confirmationCode
// ) {
//   try {
//     await client.messages.create({
//       body: `Your confirmation code is: ${confirmationCode}.`,
//       from: "+19843685075", // Your Twilio phone number
//       to: phoneNumber, // Recipient's phone number
//     });
//   } catch (error) {
//     throw error; // Handle the error appropriately (e.g., log it or return an error response)
//   }
// }

// This function saves the confirmation code associated with an email in the database.
async function saveConfirmationCodeByPhoneNumber(
  phoneNumber,
  confirmationCode
) {
  try {
    const code = new PhConfirmationCode({
      phoneNumber,
      code: confirmationCode,
    });
    await code.save();
  } catch (error) {
    throw error; // Handle the error appropriately (e.g., log it or return an error response)
  }
}
async function getConfirmationCodeByPhoneNumber(phoneNumber) {
  try {
    const codeRecord = await PhConfirmationCode.findOne({ phoneNumber });
    return codeRecord ? codeRecord.code : null;
  } catch (error) {
    throw error; // Handle the error appropriately (e.g., log it or return an error response)
  }
}
// This function marks the email as confirmed before creating the user.
async function markPhoneNumberAsConfirmed(phoneNumber) {
  try {
    // Find the confirmation code document
    const confirmationCodeDoc = await PhConfirmationCode.findOne({
      phoneNumber,
    });

    if (confirmationCodeDoc) {
      // Mark the email as confirmed
      confirmationCodeDoc.phoneConfirmed = true;
      await confirmationCodeDoc.save();
    }
  } catch (error) {
    throw error; // Handle the error appropriately (e.g., log it or return an error response)
  }
}
const checkPhoneNumberConfirmationStatus = async (phoneNumber) => {
  try {
    // Search for a user with the provided email and check their emailConfirmed field
    const user = await PhConfirmationCode.findOne({ phoneNumber });
    if (user.phoneConfirmed == true) {
      return true; // phone is confirmed
    }
    return false; // Email is not confirmed or user not found
  } catch (error) {
    // console.error("Error checking email confirmation status:", error);
    throw error; // You can handle the error based on your application's needs
  }
};

module.exports = {
  // sendConfirmationCodeViaPhoneNumber,
  saveConfirmationCodeByPhoneNumber,
  getConfirmationCodeByPhoneNumber,
  markPhoneNumberAsConfirmed,
  checkPhoneNumberConfirmationStatus,
};
