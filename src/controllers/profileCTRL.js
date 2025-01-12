// src/controllers/profileCTRL.js
const Users = require("../models/user_model");

const ProfileAccessRequest = require("../models/profileAccessRequest_model");
const { handleResponse } = require("../utils/handleResponse");

// Controller function to send a profile access request

class ProfileCTRL {
  async UpdateProfileVisibility(req, res) {
    try {
      // Ensure the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const userId = req.user.id; // Get the userId from the req.user object
      const { visibility } = req.body; // You can send "public" or "private"

      // Update the profile visibility settings for the user
      // value will be boolean
      await Users.findByIdAndUpdate(userId, { accountVisibility: visibility });

      return handleResponse(
        res,
        200,
        "success",
        "Profile visibility updated successfully",
        null,
        0
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  async SendProfileAccessRequest(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { requesterId } = req.body;
      const targetUserId = req.user.id;

      if (!targetUserId) {
        return handleResponse(
          res,
          400,
          "error",
          "Target user ID must be provided",
          null,
          0
        );
      }

      if (!requesterId) {
        return handleResponse(
          res,
          400,
          "error",
          "Requester user ID must be provided",
          null,
          0
        );
      }

      if (requesterId === targetUserId) {
        return handleResponse(
          res,
          400,
          "error",
          "Requester and target user cannot be the same",
          null,
          0
        );
      }

      // Check if a request already exists between these two users
      let existingRequest = await ProfileAccessRequest.findOne({
        requesterId: requesterId,
        targetUserId: targetUserId,
      });

      if (existingRequest) {
        // If a request exists, update its status to "pending"
        existingRequest.status = "pending";
        await existingRequest.save();
        return handleResponse(
          res,
          200,
          "success",
          "Existing profile access request status updated to pending",
          null,
          0
        );
      }

      // If no existing request, create a new profile access request
      const request = new ProfileAccessRequest({
        requesterId,
        targetUserId,
      });
      await request.save();
      return handleResponse(
        res,
        200,
        "success",
        "Profile access request sent successfully",
        null,
        0
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  async GetProfileAccessRequests(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // Query your database to retrieve profile access requests for the jobseeker
      const requests = await ProfileAccessRequest.find({
        targetUserId: req.user.id,
      });
      if (requests.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No requests received",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Profile access requests retrieved successfully",
        requests,
        requests.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  async AcceptProfileAccessRequest(req, res) {
    try {
      const { requestId } = req.params;

      // Find the profile access request by ID
      const request = await ProfileAccessRequest.findById(requestId);

      if (!request) {
        return handleResponse(res, 404, "error", "Request not found", null, 0);
      }

      // Check if the request is pending
      if (request.status === "pending") {
        // Find both users involved in the request
        const [requestUser, targetUser] = await Promise.all([
          Users.findById(request.requesterId),
          Users.findById(request.targetUserId),
        ]);

        if (!requestUser || !targetUser) {
          return handleResponse(
            res,
            404,
            "error",
            "One or both users not found",
            null,
            0
          );
        }

        // Add each user's ID to the other's friends array if not already present
        if (!requestUser.friends.includes(request.targetUserId)) {
          requestUser.friends.push(request.targetUserId);
          await requestUser.save();
        }
        if (!targetUser.friends.includes(request.requesterId)) {
          targetUser.friends.push(request.requesterId);
          await targetUser.save();
        }

        // Update the request status to "accepted"
        request.status = "accepted";
        await request.save();

        return handleResponse(
          res,
          200,
          "success",
          "Request accepted and users are now friends",
          null,
          0
        );
      } else {
        return handleResponse(
          res,
          400,
          "error",
          "Request has already been processed",
          null,
          0
        );
      }
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  // Controller function to decline a profile access request
  async DeclineProfileAccessRequest(req, res) {
    try {
      const { requestId } = req.params;

      // Find the profile access request by ID
      const request = await ProfileAccessRequest.findById(requestId);

      if (!request) {
        return handleResponse(res, 404, "error", "Request not found", null, 0);
      }

      // Check if the request is pending
      if (request.status === "pending") {
        // Find both users involved in the request
        const [requestUser, targetUser] = await Promise.all([
          Users.findById(request.requesterId),
          Users.findById(request.targetUserId),
        ]);

        if (!requestUser || !targetUser) {
          return handleResponse(
            res,
            404,
            "error",
            "One or both users not found",
            null,
            0
          );
        }

        // Remove each user's ID from the other's friends array if present
        requestUser.friends = requestUser.friends.filter(
          (id) => id.toString() !== request.targetUserId.toString()
        );
        await requestUser.save();

        targetUser.friends = targetUser.friends.filter(
          (id) => id.toString() !== request.requesterId.toString()
        );
        await targetUser.save();

        // Update the request status to "declined"
        request.status = "rejected";
        await request.save();

        return handleResponse(
          res,
          200,
          "success",
          "Request declined and users are no longer friends",
          null,
          0
        );
      } else {
        return handleResponse(
          res,
          400,
          "error",
          "Request has already been processed",
          null,
          0
        );
      }
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  async ReverseAcceptanceOfProfileAccessRequest(req, res) {
    try {
      const { requestId } = req.params;

      // Find the profile access request by ID
      const request = await ProfileAccessRequest.findById(requestId);

      if (!request) {
        return handleResponse(res, 404, "error", "Request not found", null, 0);
      }

      // Check if the request is already accepted
      if (request.status === "accepted") {
        // Find both users involved in the request
        const [requestUser, targetUser] = await Promise.all([
          Users.findById(request.requesterId),
          Users.findById(request.targetUserId),
        ]);

        if (!requestUser || !targetUser) {
          return handleResponse(
            res,
            404,
            "error",
            "One or both users not found",
            null,
            0
          );
        }

        // Remove each user's ID from the other's friends array if present
        requestUser.friends = requestUser.friends.filter(
          (id) => id.toString() !== request.targetUserId.toString()
        );
        await requestUser.save();

        targetUser.friends = targetUser.friends.filter(
          (id) => id.toString() !== request.requesterId.toString()
        );
        await targetUser.save();

        // Update the request status to "rejected"
        request.status = "rejected";
        await request.save();

        return handleResponse(
          res,
          200,
          "success",
          "Friendship reversed and request status set to declined",
          null,
          0
        );
      } else {
        return handleResponse(
          res,
          400,
          "error",
          "Request is not in an accepted state",
          null,
          0
        );
      }
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new ProfileCTRL();
