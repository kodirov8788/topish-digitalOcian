const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

async function migrateRefreshTokens() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    const MONGODB_URI = process.env.MONGO_URI;

    await mongoose.connect(MONGODB_URI);

    console.log("Successfully connected to MongoDB");

    // Import model after connection is established
    const Users = require("./src/models/user_model");

    console.log("Starting refresh tokens migration...");

    // Find all users
    const users = await Users.find({});
    console.log(`Found ${users.length} users to migrate`);

    let migratedCount = 0;

    for (const user of users) {
      // Update each user document to set refreshTokens to empty string
      await Users.updateOne({ _id: user._id }, { $set: { refreshTokens: "" } });

      migratedCount++;
      console.log(
        `Migrated user ${user._id} - ${user.phoneNumber || "unknown"}`
      );
    }

    console.log(`Migration completed. ${migratedCount} users updated.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the MongoDB connection
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
    }
  }
}

// Execute the migration
migrateRefreshTokens()
  .then(() => console.log("Migration script completed"))
  .catch((err) => console.error("Migration script error:", err));
