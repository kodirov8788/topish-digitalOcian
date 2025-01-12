const express = require("express");
const Users = require("../models/user_model");
const bcrypt = require("bcryptjs"); // Assuming you are using bcrypt for password hashing
const router = express.Router();

router.delete("/deleteAccount", async (req, res) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    return res
      .status(400)
      .send({ message: "Phone number and password are required" });
  }
  // phoneNumber should be 9 digits

  if (phoneNumber.length !== 9) {
    return res.status(400).send({ message: "Phone number should be 9 digits" });
  }

  const newPhoneNumber = `+998${phoneNumber}`;
  try {
    // Find the user by phoneNumber
    const user = await Users.findOne({ phoneNumber: newPhoneNumber });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    // Check if the provided password matches the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // Delete the user
    await Users.findByIdAndDelete(user._id);
    res.status(200).send({ message: "Account deleted successfully" });
  } catch (error) {
    // Handle any other errors
    console.error("Error deleting account:", error);
    res.status(500).send({ message: "Failed to delete account" });
  }
});

module.exports = router;
