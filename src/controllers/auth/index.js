/**
 * Authentication Controllers Index
 * Centralized exports for all authentication-related controllers
 */

// Base controller
const BaseAuthController = require("./BaseAuthController");

// Specialized controllers
const authRegistrationController = require("./authRegistrationController");
const authLoginController = require("./authLoginController");
const authAccountController = require("./authAccountController");
const authTokenController = require("./authTokenController");

// Export all controllers
module.exports = {
  // Base controller
  BaseAuthController,

  // Authentication controllers
  authRegistrationController,
  authLoginController,
  authAccountController,
  authTokenController,

  // Legacy compatibility - if needed for gradual migration
  // Export a combined API to match old controller
  AuthController: {
    // Registration methods
    registerUserByAdmin: authRegistrationController.registerUserByAdmin,
    sendRegisterCode: authRegistrationController.sendRegisterCode,
    confirmRegisterCode: authRegistrationController.confirmRegisterCode,
    resendConfirmationCode: authRegistrationController.resendConfirmationCode,
    sendVoiceCall: authRegistrationController.sendVoiceCall,
    addUsernamesToAllUsers: authRegistrationController.addUsernamesToAllUsers,

    // Login methods
    sendLoginCode: authLoginController.sendLoginCode,
    confirmLogin: authLoginController.confirmLogin,
    signOut: authLoginController.signOut,

    // Token management methods
    renewAccessToken: authTokenController.renewAccessToken,
    getRefreshTokens: authTokenController.getRefreshTokens,
    deleteRefreshToken: authTokenController.deleteRefreshToken,

    // Account management methods
    deleteAccount: authAccountController.deleteAccount,
    sendDeleteAccountCode: authAccountController.sendDeleteAccountCode,
    confirmDeleteAccount: authAccountController.confirmDeleteAccount,
    checkSmsStatus: authAccountController.checkSmsStatus,
  },
};
