const findAdminSocketId = (onlineUsers) => {
  const admin = onlineUsers.find((user) => user.isAdmin);
  return admin ? admin.socketId : null;
};

module.exports = {
  findAdminSocketId,
};
