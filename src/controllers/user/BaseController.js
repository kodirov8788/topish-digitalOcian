const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");

class BaseController {
  // Helper method to fetch user
  async _getUser(userId, includeSensitive = false) {
    const select = includeSensitive
      ? "-refreshTokens"
      : "-password -refreshTokens";
    return await Users.findOne({ _id: userId }).select(select);
  }

  // Helper method to check authentication
  _checkAuth(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    return true;
  }

  // Helper method to check admin authorization
  async _checkAdminAuth(req, res) {
    if (this._checkAuth(req, res) !== true) return false;

    const user = await this._getUser(req.user.id);
    if (!user) {
      handleResponse(res, 404, "error", "User not found", null, 0);
      return false;
    }

    if (!user.serverRole || !user.serverRole.includes("Admin")) {
      handleResponse(
        res,
        403,
        "error",
        "You don't have permission to perform this action",
        null,
        0
      );
      return false;
    }

    return true;
  }
}

module.exports = BaseController;
