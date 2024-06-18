const handleHeartbeat = (socket, userId, onlineUsers, io) => {
  const existingUser = onlineUsers.find((user) => user.userId === userId);
  if (existingUser) {
    existingUser.lastActive = new Date();
  } else {
    onlineUsers.push({
      userId,
      socketId: socket.id,
      lastActive: new Date(),
    });
  }

  const timeoutMinutes = 20;
  onlineUsers = onlineUsers.filter(
    (user) => (new Date() - user.lastActive) / 60000 < timeoutMinutes
  );

  io.emit("getOnlineUsers", onlineUsers);
};

module.exports = handleHeartbeat;
