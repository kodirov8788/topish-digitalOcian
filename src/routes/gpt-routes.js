const express = require("express");
const router = express.Router();
const gptCTRL = require("../controllers/gptCTRL");

// Send a prompt to GPT
router.post("/prompt", gptCTRL.sendPrompt);

// Update user's GPT settings
router.put("/settings", gptCTRL.updateGPTSettings);

// Get user's GPT usage for today
router.get("/usage", gptCTRL.getUserGPTUsage);

module.exports = router;
