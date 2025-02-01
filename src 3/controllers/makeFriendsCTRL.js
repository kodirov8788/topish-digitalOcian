// src/controllers/makeFriendsCTRL.js
const Friendship = require("../models/friendship_model");
const Story = require("../models/story_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");

const FRIENDSHIP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  BLOCKED: "blocked",
};

class MakeFriendsCTRL {
  async sendInvitationToFriend(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      const allowedRoles = ["JobSeeker", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const { receiverId } = req.body;
      const receiver = await Users.findById(receiverId);

      if (!receiver) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const isFriend = await Friendship.findOne({
        $or: [
          { sender: req.user.id, receiver: receiverId },
          { sender: receiverId, receiver: req.user.id },
        ],
      });

      if (isFriend) {
        return handleResponse(
          res,
          400,
          "error",
          "You are already friends",
          null,
          0
        );
      }

      const friendship = new Friendship({
        sender: req.user.id,
        receiver: receiverId,
        status: FRIENDSHIP_STATUS.PENDING,
      });

      await friendship.save();

      return handleResponse(
        res,
        200,
        "success",
        "Friend request sent",
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

  async acceptFriendRequest(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      const allowedRoles = ["JobSeeker", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const { senderId } = req.body;
      const friendship = await Friendship.findOne({
        sender: senderId,
        receiver: req.user.id,
        status: FRIENDSHIP_STATUS.PENDING,
      });

      if (!friendship) {
        return handleResponse(
          res,
          404,
          "error",
          "Friend request not found",
          null,
          0
        );
      }

      friendship.status = FRIENDSHIP_STATUS.ACCEPTED;
      friendship.acceptedAt = Date.now();

      await friendship.save();

      return handleResponse(
        res,
        200,
        "success",
        "Friend request accepted",
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

  async blockFriend(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      const allowedRoles = ["JobSeeker", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const { receiverId } = req.body;
      const friendship = await Friendship.findOne({
        $or: [
          { sender: req.user.id, receiver: receiverId },
          { sender: receiverId, receiver: req.user.id },
        ],
      });

      if (!friendship) {
        return handleResponse(
          res,
          404,
          "error",
          "Friendship not found",
          null,
          0
        );
      }

      friendship.status = FRIENDSHIP_STATUS.BLOCKED;
      await friendship.save();

      return handleResponse(
        res,
        200,
        "success",
        "Friendship blocked successfully",
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

  async getAcceptedFriends(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      const allowedRoles = ["JobSeeker", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const friendships = await Friendship.find({
        $or: [{ sender: req.user.id }, { receiver: req.user.id }],
        status: FRIENDSHIP_STATUS.ACCEPTED,
      });
      if (!friendships) {
        return handleResponse(
          res,
          200,
          "success",
          "Friendship not found",
          [],
          0
        );
      }

      const friends = await Promise.all(
        friendships.map(async (friendship) => {
          const friendId =
            friendship.sender.toString() === req.user.id
              ? friendship.receiver
              : friendship.sender;
          return await Users.findById(friendId);
        })
      );

      return handleResponse(
        res,
        200,
        "success",
        "Friends fetched successfully",
        friends,
        friends.length
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

  async getPendingFriends(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      const allowedRoles = ["JobSeeker", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const friendRequests = await Friendship.find({
        receiver: req.user.id,
        status: FRIENDSHIP_STATUS.PENDING,
      });

      const requests = await Promise.all(
        friendRequests.map(
          async (request) => await Users.findById(request.sender)
        )
      );

      return handleResponse(
        res,
        200,
        "success",
        "Friend requests fetched successfully",
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

  async getBlockedFriends(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      const allowedRoles = ["JobSeeker", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const blockedFriends = await Friendship.find({
        $or: [{ sender: req.user.id }, { receiver: req.user.id }],
        status: FRIENDSHIP_STATUS.BLOCKED,
      });

      const friends = await Promise.all(
        blockedFriends.map(async (friendship) => {
          const friendId =
            friendship.sender.toString() === req.user.id
              ? friendship.receiver
              : friendship.sender;
          return await Users.findById(friendId);
        })
      );

      return handleResponse(
        res,
        200,
        "success",
        "Blocked friends fetched successfully",
        friends,
        friends.length
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

  async deleteFriendShip(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      const allowedRoles = ["JobSeeker", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const { friendId } = req.params;
      const friendship = await Friendship.findOne({
        $or: [
          { sender: req.user.id, receiver: friendId },
          { sender: friendId, receiver: req.user.id },
        ],
        status: FRIENDSHIP_STATUS.ACCEPTED,
      });

      if (!friendship) {
        return handleResponse(
          res,
          404,
          "error",
          "Friendship not found",
          null,
          0
        );
      }

      await friendship.deleteOne();

      return handleResponse(
        res,
        200,
        "success",
        "Friend removed successfully",
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

  async cancelFriendRequest(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      const allowedRoles = ["JobSeeker", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const { receiverId } = req.params;
      const friendship = await Friendship.findOne({
        sender: req.user.id,
        receiver: receiverId,
        status: FRIENDSHIP_STATUS.PENDING,
      });

      if (!friendship) {
        return handleResponse(
          res,
          404,
          "error",
          "Friend request not found",
          null,
          0
        );
      }

      await friendship.deleteOne();

      return handleResponse(
        res,
        200,
        "success",
        "Friend request cancelled successfully",
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

  // Get followers (Users who follow the current user)
  async getFollowers(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { page = 1, limit = 10 } = req.query; // Pagination parameters

      // Find followers (users who follow the current user)
      const followers = await Friendship.find({
        receiver: req.user.id,
        status: FRIENDSHIP_STATUS.ACCEPTED,
      })
        .limit(limit * 1) // Limit the number of documents
        .skip((page - 1) * limit) // Skip documents for pagination
        .exec();

      const followerDetails = await Promise.all(
        followers.map(async (follower) => {
          return await Users.findById(follower.sender); // Get details of the follower
        })
      );

      const totalFollowers = await Friendship.countDocuments({
        receiver: req.user.id,
        status: FRIENDSHIP_STATUS.ACCEPTED,
      });

      return handleResponse(
        res,
        200,
        "success",
        "Followers fetched successfully",
        {
          followers: followerDetails,
          totalPages: Math.ceil(totalFollowers / limit), // Calculate total pages
          currentPage: page,
        },
        followerDetails.length
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
  // Get followings (Users the current user follows)
  async getFollowing(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { page = 1, limit = 10 } = req.query; // Pagination parameters

      // Find followings (users the current user follows)
      const followings = await Friendship.find({
        sender: req.user.id,
        status: FRIENDSHIP_STATUS.ACCEPTED,
      })
        .limit(limit * 1) // Limit the number of documents
        .skip((page - 1) * limit) // Skip documents for pagination
        .exec();

      const followingDetails = await Promise.all(
        followings.map(async (following) => {
          return await Users.findById(following.receiver); // Get details of the following user
        })
      );

      const totalFollowing = await Friendship.countDocuments({
        sender: req.user.id,
        status: FRIENDSHIP_STATUS.ACCEPTED,
      });

      return handleResponse(
        res,
        200,
        "success",
        "Following fetched successfully",
        {
          followings: followingDetails,
          totalPages: Math.ceil(totalFollowing / limit), // Calculate total pages
          currentPage: page,
        },
        followingDetails.length
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

  async getAllCounts(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // 1. Get total reactions count from all stories
      const stories = await Story.find();
      const totalReactions = stories.reduce(
        (total, story) => total + story.reactions.length,
        0
      );

      // 2. Get total followers count (users who follow the current user)
      const totalFollowers = await Friendship.countDocuments({
        receiver: req.user.id,
        status: "accepted",
      });

      // 3. Get total followings count (users the current user follows)
      const totalFollowings = await Friendship.countDocuments({
        sender: req.user.id,
        status: "accepted",
      });

      // 4. Return all the counts in one response
      const counts = {
        totalReactions,
        totalFollowers,
        totalFollowings,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Counts retrieved successfully",
        counts,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error retrieving counts: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new MakeFriendsCTRL();
