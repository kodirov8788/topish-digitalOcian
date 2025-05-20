// src/utils/jwt.js
const jwt = require("jsonwebtoken");

// Function to create JWT
const createJWT = ({ payload, secret, expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

// Function to verify JWT
const isTokenValid = (token, secret) => jwt.verify(token, secret);

// Function to generate access and refresh tokens
const generateTokens = (user) => {
  const payload = {
    phoneNumber: user.phoneNumber,
    coins: user.coins,
    id: user.id,
    // Use the first role from roles array for backward compatibility
    role:
      Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : null,
    favorites: user.favorites,
    avatar: user.avatar,
    fullName: user.fullName,
    roles: user.roles,
  };

  // Create access token
  const accessToken = createJWT({
    payload,
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_LIFETIME,
  });

  // Create refresh token
  const refreshToken = createJWT({
    payload,
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_LIFETIME,
  });

  return {
    accessToken: `Bearer ${accessToken}`,
    refreshToken,
  };
};

// Function to create a token payload from user data
const createTokenUser = (user) => ({
  phoneNumber: user.phoneNumber,
  coins: user.coins,
  id: user.id,
  // Use the first role from roles array for backward compatibility
  role:
    Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : null,
  favorites: user.favorites,
  avatar: user.avatar,
  fullName: user.fullName,
  roles: user.roles,
});

module.exports = {
  createJWT,
  isTokenValid,
  generateTokens,
  createTokenUser,
};
