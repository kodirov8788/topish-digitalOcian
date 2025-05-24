const express = require("express");
const router = express.Router();
const searchCTRL = require("../controllers/searchCTRL");
const authMiddleware = require("../middleware/auth-middleware");

router.get("/", authMiddleware, searchCTRL.globalSearch);

module.exports = router;
