const userChatRoomMap = require("../utils/userChatRoomMap");
const socketUserMap = require("../utils/socketUserMap");

const handleLeaveRoom = (socket, { userId, chatRoomId }) => {
  if (userChatRoomMap[userId] === chatRoomId) {
    delete userChatRoomMap[userId];
    delete socketUserMap[socket.id];
    socket.leave(chatRoomId);
    socket.to(chatRoomId).emit("leftRoom", { userId, chatRoomId });
  } else {
    socket.emit("error", { message: "You are not in the specified room." });
  }
};

module.exports = handleLeaveRoom;
