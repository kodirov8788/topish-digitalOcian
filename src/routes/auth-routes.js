const {
  register,
  confirmPhoneNumberWithCode,
  sendLoginCode,
  signOut,
  deleteAccount,
  resendConfirmationCode,
  confirmLogin
} = require("../controllers/AuthCTRL");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
// requtes code -------------------
router.post("/create-user", register);
router.post("/create-user/confirmCode", confirmPhoneNumberWithCode);
router.post("/create-user/resendCode", resendConfirmationCode);
router.post("/sign-in", sendLoginCode);
router.post("/sign-in/confirm", confirmLogin);
router.post("/sign-out", authMiddleware, signOut);
router.delete("/deleteAccount", authMiddleware, deleteAccount);
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
