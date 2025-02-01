// src/middleware/last-active.js
const updateLastActivity = async (req, res, next) => {
  // if (req.user) { // Assuming you have user data in req.user after authentication
  //     await Users.findByIdAndUpdate(req.user.id, { lastActivity: new Date() });
  // }
  next();
};

module.exports = updateLastActivity;
