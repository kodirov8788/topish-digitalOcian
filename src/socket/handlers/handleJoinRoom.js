const userChatRoomMap = require("../utils/userChatRoomMap");
const socketUserMap = require("../utils/socketUserMap");

const handleJoinRoom = (socket, { userId, chatRoomId }) => {
  userChatRoomMap[userId] = chatRoomId;
  socketUserMap[socket.id] = userId;
  socket.join(chatRoomId);
  socket.to(chatRoomId).emit("joinedRoom", { userId, chatRoomId });
};

module.exports = handleJoinRoom;
