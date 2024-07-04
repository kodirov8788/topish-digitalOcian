const { handleResponse } = require("../utils/handleResponse");
const { isTokenValid } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  console.log("token: ", token)
  if (!token) {
    return handleResponse(res, 401, "error", "Authentication invalid", {}, 0);
  }

  try {
    const payload = isTokenValid(token); // Pass the token directly
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
    console.error("Error in authMiddleware:", error);
    return handleResponse(res, 401, "error", "Authentication invalid", {}, 0);
  }
};

module.exports = authMiddleware;
