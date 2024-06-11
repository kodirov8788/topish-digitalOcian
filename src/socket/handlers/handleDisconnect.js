const userChatRoomMap = require("../utils/userChatRoomMap");
const socketUserMap = require("../utils/socketUserMap");

const handleDisconnect = (socket, onlineUsers, io) => {
  const userId = socketUserMap[socket.id];
  const chatRoomId = userChatRoomMap[userId];
  if (userId && chatRoomId) {
    socket.leave(chatRoomId);
    socket.to(chatRoomId).emit("leftRoom", { userId, chatRoomId });
    delete userChatRoomMap[userId];
    delete socketUserMap[socket.id];
  }

  onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
  io.emit("updateOnlineUsers", onlineUsers);
};

module.exports = handleDisconnect;
