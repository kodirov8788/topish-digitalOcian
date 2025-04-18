const BaseController = require("./BaseController");
const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");
const mongoose = require("mongoose");

class UserCoinsController extends BaseController {
  constructor() {
    super();
    // Bind methods to preserve 'this' context
    this.getUserCoins = this.getUserCoins.bind(this);
    this.addCoins = this.addCoins.bind(this);
    this.deductCoins = this.deductCoins.bind(this);
    this.transferCoins = this.transferCoins.bind(this);
    this.setUserCoins = this.setUserCoins.bind(this);
  }

  /**
   * Get user's coin balance
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserCoins(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const userId = req.params.userId || req.user.id;

      // If requesting another user's coins, check if admin
      if (userId !== req.user.id) {
        const isAdmin = await this._checkAdminAuth(req, res);
        if (!isAdmin) return;
      }

      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "User coins retrieved successfully",
        { coins: user.coins },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to retrieve user coins: " + error.message,
        null,
        0
      );
    }
  }

  /**
   * Add coins to a user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addCoins(req, res) {
    try {
      // Only admins can add coins
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const { userId, amount, reason } = req.body;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid user ID is required",
          null,
          0
        );
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid positive amount is required",
          null,
          0
        );
      }

      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Add coins using $inc for atomic operation
      const updatedUser = await Users.findByIdAndUpdate(
        userId,
        { $inc: { coins: amount } },
        { new: true }
      ).select("-password -refreshTokens");

      if (!updatedUser) {
        return handleResponse(
          res,
          404,
          "error",
          "Failed to update user",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        `Added ${amount} coins to user${reason ? ` (${reason})` : ""}`,
        {
          user: updatedUser.username || updatedUser.fullName || updatedUser._id,
          previousCoins: updatedUser.coins - amount,
          currentCoins: updatedUser.coins,
          added: amount,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to add coins: " + error.message,
        null,
        0
      );
    }
  }

  /**
   * Deduct coins from a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deductCoins(req, res) {
    try {
      const { userId, amount, reason } = req.body;

      // If deducting from another user, check if admin
      if (userId && userId !== req.user.id) {
        if ((await this._checkAdminAuth(req, res)) !== true) return;
      }

      const targetUserId = userId || req.user.id;

      if (!amount || isNaN(amount) || amount <= 0) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid positive amount is required",
          null,
          0
        );
      }

      const user = await this._getUser(targetUserId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if user has enough coins
      if (user.coins < amount) {
        return handleResponse(
          res,
          400,
          "error",
          "Insufficient coins",
          { available: user.coins, requested: amount },
          0
        );
      }

      // Deduct coins using $inc for atomic operation
      const updatedUser = await Users.findByIdAndUpdate(
        targetUserId,
        { $inc: { coins: -amount } },
        { new: true }
      ).select("-password -refreshTokens");

      if (!updatedUser) {
        return handleResponse(
          res,
          404,
          "error",
          "Failed to update user",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        `Deducted ${amount} coins from user${reason ? ` (${reason})` : ""}`,
        {
          user: updatedUser.username || updatedUser.fullName || updatedUser._id,
          previousCoins: updatedUser.coins + amount,
          currentCoins: updatedUser.coins,
          deducted: amount,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to deduct coins: " + error.message,
        null,
        0
      );
    }
  }

  /**
   * Transfer coins from one user to another
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async transferCoins(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { recipientId, amount, message } = req.body;
      const senderId = req.user.id;

      if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid recipient ID is required",
          null,
          0
        );
      }

      if (recipientId === senderId) {
        return handleResponse(
          res,
          400,
          "error",
          "Cannot transfer coins to yourself",
          null,
          0
        );
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid positive amount is required",
          null,
          0
        );
      }

      // Start a session for the transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Get sender and check if they have enough coins
        const sender = await Users.findById(senderId).session(session);
        if (!sender) {
          throw new Error("Sender not found");
        }

        if (sender.coins < amount) {
          throw new Error("Insufficient coins");
        }

        // Get recipient
        const recipient = await Users.findById(recipientId).session(session);
        if (!recipient) {
          throw new Error("Recipient not found");
        }

        // Update sender and recipient
        const updatedSender = await Users.findByIdAndUpdate(
          senderId,
          { $inc: { coins: -amount } },
          { new: true, session }
        ).select("-password -refreshTokens");

        const updatedRecipient = await Users.findByIdAndUpdate(
          recipientId,
          { $inc: { coins: amount } },
          { new: true, session }
        ).select("-password -refreshTokens");

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return handleResponse(
          res,
          200,
          "success",
          "Coins transferred successfully",
          {
            from: {
              id: updatedSender._id,
              name: updatedSender.username || updatedSender.fullName,
              previousCoins: updatedSender.coins + amount,
              currentCoins: updatedSender.coins,
            },
            to: {
              id: updatedRecipient._id,
              name: updatedRecipient.username || updatedRecipient.fullName,
              previousCoins: updatedRecipient.coins - amount,
              currentCoins: updatedRecipient.coins,
            },
            amount,
            message: message || "",
          },
          1
        );
      } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();

        if (error.message === "Insufficient coins") {
          return handleResponse(
            res,
            400,
            "error",
            "Insufficient coins for transfer",
            null,
            0
          );
        } else if (error.message === "Recipient not found") {
          return handleResponse(
            res,
            404,
            "error",
            "Recipient not found",
            null,
            0
          );
        } else {
          throw error; // Re-throw for the outer catch block
        }
      }
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to transfer coins: " + error.message,
        null,
        0
      );
    }
  }

  /**
   * Set user's coin balance directly (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async setUserCoins(req, res) {
    try {
      // Only admins can set coins directly
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const { userId, amount, reason } = req.body;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid user ID is required",
          null,
          0
        );
      }

      if (amount === undefined || isNaN(amount) || amount < 0) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid non-negative amount is required",
          null,
          0
        );
      }

      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const previousCoins = user.coins;

      // Set coins directly
      const updatedUser = await Users.findByIdAndUpdate(
        userId,
        { coins: amount },
        { new: true }
      ).select("-password -refreshTokens");

      if (!updatedUser) {
        return handleResponse(
          res,
          404,
          "error",
          "Failed to update user",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        `Set coins to ${amount}${reason ? ` (${reason})` : ""}`,
        {
          user: updatedUser.username || updatedUser.fullName || updatedUser._id,
          previousCoins,
          currentCoins: updatedUser.coins,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to set coins: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new UserCoinsController();
