const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;

  const isSecure = res.req.secure || res.req.headers["x-forwarded-proto"] === "https";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "None" : "Lax",
    expires: new Date(Date.now() + thirtyDays),
  });
};

const createTokenUser = (user) => ({
  phoneNumber: user.phoneNumber,
  coins: user.coins,
  id: user._id,
  role: user.role,
  favorites: user.favorites,
  employer: user.employer,
  jobSeeker: user.jobSeeker,
  service: user.service,
  avatar: user.avatar,
  mobileToken: user.mobileToken,
  fullName: user.fullName,
});

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
};
