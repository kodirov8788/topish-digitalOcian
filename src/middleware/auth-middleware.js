const { handleResponse } = require("../utils/handleResponse");
const { isTokenValid } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log(" req.headers.authorization: ", req.headers)
  const token = authHeader && authHeader.split(' ')[1];
  // console.log("token: ", token)
  if (!token) {
    return handleResponse(res, 401, "error", "Authentication invalid: No token provided", {}, 0);
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
      mobileToken: payload.mobileToken,
      fullName: payload.fullName,
    };
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error.message);
    return handleResponse(res, 401, "error", "Authentication invalid: Token verification failed", {}, 0);
  }
};

module.exports = authMiddleware;
