const { handleResponse } = require("../utils/handleResponse");
const { isTokenValid } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  // console.log("req: ", req);
  // console.log("req.cookies: ", req.cookies);
  const token = req.cookies.token;
  // console.log("token middleware ", token);
  if (!token) {
    return handleResponse(res, 401, "error", "Authentication invalid", {}, 0);
  }
  try {
    const {
      email,
      phoneNumber,
      employer,
      favorites,
      jobSeeker,
      coins,
      id,
      role,
      avatar,
      mobileToken,
    } = isTokenValid({ token });
    req.user = {
      email,
      phoneNumber,
      employer,
      favorites,
      jobSeeker,
      coins,
      id,
      role,
      avatar,
      mobileToken,
    };
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    return handleResponse(res, 401, "error", "No Authenticated", {}, 0);
  }
};

module.exports = authMiddleware; // Export the middleware function for use in other parts of the application
