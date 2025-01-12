const {
  confirmRegisterCode,
  sendRegisterCode,
  sendLoginCode,
  signOut,
  deleteAccount,
  resendConfirmationCode,
  confirmLogin,
  renewAccessToken,
  getRefreshTokens,
  deleteRefreshToken,
  sendDeleteAccountCode,
  confirmDeleteAccount,
  checkSmsStatus,
  addUsernamesToAllUsers,
  sendVoiceCall
} = require("../controllers/AuthCTRL");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
router.get("/getRefreshTokens", authMiddleware, getRefreshTokens);
router.delete("/deleteRefreshToken", authMiddleware, deleteRefreshToken);
router.post("/create-user", sendRegisterCode);
router.post("/create-user/confirmCode", confirmRegisterCode);
router.post("/create-user/resendCode", resendConfirmationCode);
router.post("/sign-in", sendLoginCode);
router.post("/sign-in/confirm", confirmLogin);
router.post("/sign-out", authMiddleware, signOut);
router.delete("/deleteAccount", authMiddleware, deleteAccount);
router.post("/renewAccessToken", renewAccessToken);
router.post("/sendDeleteAccountCode", sendDeleteAccountCode);
router.post("/confirmDeleteAccount", confirmDeleteAccount);
router.post("/checkSmsStatus", checkSmsStatus);
router.post("/addUsernamesToAllUsers", authMiddleware, addUsernamesToAllUsers);
router.post("/sendVoiceCall", sendVoiceCall);




module.exports = router;




