const Users = require("../../models/user_model");

const handleAdminLogin = async (socket, userId, onlineUsers, io) => {
  const admin = await Users.findOne({ _id: userId, role: "Admin" });
  if (admin) {
    const adminUser = {
      userId: admin.id,
      socketId: socket.id,
      lastActive: new Date(),
      isAdmin: true,
      isAvailable: true,
    };
    onlineUsers.push(adminUser);
  }
  setTimeout(() => {
    const adminUser = onlineUsers.find((user) => user.userId === userId);
    if (adminUser) {
      adminUser.isAvailable = false;
      socket.to(adminUser.socketId).emit("adminUnavailable");
      onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    }
  }, 60000 * 10);
};

module.exports = handleAdminLogin;
