// src/middleware/auth-middleware.js
const { handleResponse } = require("../utils/handleResponse");
const { isTokenValid } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return handleResponse(
      res,
      401, // 401 Unauthorized is the correct status code for missing token
      "error",
      "Authentication required: No token provided",
      {},
      0
    );
  }

  try {
    const payload = isTokenValid(token, process.env.JWT_SECRET);
    req.user = {
      phoneNumber: payload.phoneNumber,
      employer: payload.employer,
      favorites: payload.favorites,
      jobSeeker: payload.jobSeeker,
      coins: payload.coins,
      id: payload.id,
      role: payload.role,
      avatar: payload.avatar,
      fullName: payload.fullName,
      admin: payload.admin,
      roles: payload.roles,
    };
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error.message);

    // Determine the appropriate status code based on the error
    let statusCode = 401; // Default to 401 Unauthorized
    let message = "Authentication failed: Invalid token";

    if (error.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Authentication failed: Token expired";
    } else if (error.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Authentication failed: " + error.message;
    } else if (error.name === "NotBeforeError") {
      statusCode = 401;
      message = "Authentication failed: Token not active";
    }

    return handleResponse(res, statusCode, "error", message, {}, 0);
  }
};

module.exports = authMiddleware;
