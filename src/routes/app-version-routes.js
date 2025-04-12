const express = require("express");
const router = express.Router();
const appVersionCTRL = require("../controllers/appVersionCTRL");
const authMiddleware = require("../middleware/auth-middleware");

// Public route - mobile apps use this to check if they need to update
router.get("/check", appVersionCTRL.getVersionInfo);

// Admin routes - protected
router.get("/", authMiddleware, appVersionCTRL.getAllVersions);
router.post("/", authMiddleware, appVersionCTRL.createOrUpdateVersion);

module.exports = router;
