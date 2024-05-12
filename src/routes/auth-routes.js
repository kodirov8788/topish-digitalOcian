const { register, initiateCodeSending, confirmPhoneNumberWithCode, login, signOut, deleteAccount } = require("../controllers/AuthCTRL");
const express = require("express");
const router = express.Router();
// const {
//   validateUserSignUp,
//   userValidation,
//   validateUserSignIn,
// } = require("../middleware/user-validation");
const authMiddleware = require("../middleware/auth-middleware");
router.post("/create-user/sendCode", initiateCodeSending);
router.post("/create-user/confirmCode", confirmPhoneNumberWithCode);


// requtes code -------------------
router.post("/create-user", register);
router.post("/sign-in", login);
router.post("/sign-out", authMiddleware, signOut);
router.delete("/deleteAccount", authMiddleware, deleteAccount);
module.exports = router;

