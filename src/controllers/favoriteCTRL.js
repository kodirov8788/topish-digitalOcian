// src/controllers/favoriteCTRL.js
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");

class FavoriteCTRL {
  async AddToFavorite(req, res, next) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const currentUser = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );

      const favoriteId = req.params.favoriteId;
      const favoriteUser = await Users.findById(favoriteId).select(
        "-password -refreshTokens"
      );

      if (!favoriteUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (currentUser.favorites.includes(favoriteUser.id)) {
        return handleResponse(
          res,
          400,
          "error",
          "User already in favorites",
          null,
          0
        );
      }

      currentUser.favorites.push(favoriteUser.id);
      await currentUser.save();

      return handleResponse(
        res,
        200,
        "success",
        "User added to favorites",
        null,
        1
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
  async GetFavoriteUser(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // It's more efficient to check for the favoriteId early on to avoid unnecessary database queries
      const favoriteId = req.params.favoriteId;
      if (!favoriteId) {
        return handleResponse(
          res,
          400,
          "error",
          "No favorite user specified",
          null,
          0
        );
      }

      // Directly query the favorite user within the favorites array of the current user
      const currentUser = await Users.findById(req.user.id, {
        favorites: { $elemMatch: { $eq: favoriteId } },
      })
        .select("-password -refreshTokens")
        .populate("favorites");

      if (
        !currentUser ||
        !currentUser.favorites ||
        currentUser.favorites.length === 0
      ) {
        return handleResponse(
          res,
          404,
          "error",
          "Favorite user not found in your favorites",
          null,
          0
        );
      }

      // Since we're populating the favorites, we can directly return the first (and only) populated favorite
      const favoriteUser = currentUser.favorites[0];

      return handleResponse(
        res,
        200,
        "success",
        "Favorite user retrieved successfully",
        favoriteUser,
        1
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
  async RemoveFromFavorite(req, res, next) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // Assuming you want to restrict this action to a specific role, ensure this matches your application logic
      // const user = await Users.findById(req.user.id).select(
      //   "-password -refreshTokens"
      // );
      // if (user.role === "JobSeeker") {
      //   return handleResponse(
      //     res,
      //     400,
      //     "error",
      //     "JobSeeker can't remove from favorites",
      //     null,
      //     0
      //   );
      // }
      const currentUser = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      const favoriteId = req.params.favoriteId;
      // Check if the user is in favorites using ObjectId comparison
      if (
        !currentUser.favorites.some((favId) => favId.toString() === favoriteId)
      ) {
        return handleResponse(
          res,
          404,
          "error",
          "User not found in favorites",
          null,
          0
        );
      }
      // Use MongoDB's $pull operator to remove the user from favorites efficiently
      await Users.findByIdAndUpdate(req.user.id, {
        $pull: { favorites: favoriteId },
      });
      return handleResponse(
        res,
        200,
        "success",
        "User removed from favorites",
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
  async GetAllFavoriteUsers(req, res, next) {
    try {
      // Check if the user is authenticated
      if (!req.user || !req.user.id) {
        return handleResponse(
          res,
          401,
          "error",
          "Unauthorized! Missing user ID.",
          null,
          0
        );
      }
      // Pagination parameters
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
      const skip = (page - 1) * limit;

      // Retrieve the user but don't populate yet to check favorites
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (!user || user.favorites.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "Your favorites list is empty.",
          [],
          0
        );
      }

      // Retrieve and populate paginated favorites using find and $in with sliced IDs for pagination
      const favorites = await Users.find({
        _id: { $in: user.favorites.slice(skip, skip + limit) },
      }).select("-password -refreshTokens");

      // Count for pagination
      const totalFavorites = user.favorites.length;
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalFavorites / limit),
        limit: limit,
        totalDocuments: totalFavorites,
      };

      // Send the list of favorite users
      return handleResponse(
        res,
        200,
        "success",
        "Favorite users retrieved successfully.",
        favorites,
        favorites.length,
        pagination
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
}

module.exports = new FavoriteCTRL();
