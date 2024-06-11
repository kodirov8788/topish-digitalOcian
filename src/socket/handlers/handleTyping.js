const ChatRoom = require("../../models/chatRoom_model");

const typingDebounceTimers = {};

const handleTyping = async (
  socket,
  { chatRoomId, userId, isTyping },
  onlineUsers,
  io
) => {
  try {
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      users: userId,
    });
    if (!chatRoom) {
      socket.emit("typingResponse", {
        status: 404,
        message: "Chat room not found or access denied.",
      });
      return;
    }

    const debounceKey = `${chatRoomId}-${userId}`;
    if (typingDebounceTimers[debounceKey]) {
      clearTimeout(typingDebounceTimers[debounceKey]);
    }

    typingDebounceTimers[debounceKey] = setTimeout(() => {
      chatRoom.users.forEach((memberId) => {
        if (memberId.toString() === userId) return;

        const member = onlineUsers.find(
          (user) => user.userId === memberId.toString()
        );
        if (member) {
          socket.to(member.socketId).emit("typingNotification", {
            chatRoomId,
            userId,
            typing: false,
            text: "Online",
            notification: "User is online",
          });
        }
      });
      delete typingDebounceTimers[debounceKey];
    }, 2000);

    if (isTyping) {
      chatRoom.users.forEach((memberId) => {
        if (memberId.toString() === userId) return;

        const member = onlineUsers.find(
          (user) => user.userId === memberId.toString()
        );
        if (member) {
          socket.to(member.socketId).emit("typingNotification", {
            chatRoomId,
            userId,
            typing: true,
            text: "Typing...",
            notification: "User is typing...",
          });
        }
      });
    }
  } catch (error) {
    console.error("Error handling typing event:", error);
  }
};

module.exports = handleTyping;
