const {
  // register,
  // confirmPhoneNumberWithCode,
  confirmRegisterCode,
  sendRegisterCode,
  sendLoginCode,
  signOut,
  deleteAccount,
  resendConfirmationCode,
  confirmLogin,
  renewAccessToken
} = require("../controllers/AuthCTRL");
const jwt = require('jsonwebtoken');
const { generateTokens, createTokenUser } = require('../utils/jwt');
const Users = require('../models/user_model');
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const { handleResponse } = require("../utils/handleResponse");
// requtes code -------------------
router.post("/create-user", sendRegisterCode);
router.post("/create-user/confirmCode", confirmRegisterCode);
router.post("/create-user/resendCode", resendConfirmationCode);
router.post("/sign-in", sendLoginCode);
router.post("/sign-in/confirm", confirmLogin);
router.post("/sign-out", authMiddleware, signOut);
router.delete("/deleteAccount", authMiddleware, deleteAccount);
// router.post("/renewAccessToken", renewAccessToken);
router.post("/renewAccessToken", async (req, res) => {
  console.log("renewAccessToken ishladi")
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return handleResponse(res, 400, "error", "Refresh token is required", null, 0);
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return handleResponse(res, 403, "error", "Invalid refresh token", null, 0);
      }

      const user = await Users.findOne({ 'refreshTokens.token': refreshToken });
      if (!user) {
        return handleResponse(res, 403, "error", "Invalid refresh token", null, 0);
      }

      const tokenUser = createTokenUser(user);
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenUser);

      // Use atomic update operation
      const result = await Users.updateOne(
        { _id: user._id, 'refreshTokens.token': refreshToken },
        {
          $set: { 'refreshTokens.$.token': newRefreshToken }
        }
      );

      if (result.nModified === 0) {
        return handleResponse(res, 403, "error", "Invalid refresh token", null, 0);
      }

      return handleResponse(res, 200, "success", "Access token renewed successfully", { accessToken, refreshToken: newRefreshToken });
    });
  } catch (error) {
    return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
  }
});
module.exports = router;






// const {
//   register,
//   confirmPhoneNumberWithCode,
//   // login,
//   signOut,
//   deleteAccount,
//   resendConfirmationCode,
//   resetPassword,
//   confirmResetPassword,
// } = require("../controllers/AuthCTRL");
// const express = require("express");
// const router = express.Router();
// // const {
// //   validateUserSignUp,
// //   userValidation,
// //   validateUserSignIn,
// // } = require("../middleware/user-validation");
// const authMiddleware = require("../middleware/auth-middleware");
// // requtes code -------------------
// router.post("/create-user", register);
// router.post("/create-user/confirmCode", confirmPhoneNumberWithCode);
// router.post("/create-user/resendCode", resendConfirmationCode);
// router.post("/create-user/resetPassword", resetPassword);
// router.post("/create-user/confirmResetPassword", confirmResetPassword);

// router.post("/sign-in", login);
// router.post("/sign-out", authMiddleware, signOut);
// router.delete("/deleteAccount", authMiddleware, deleteAccount);
// module.exports = router;
