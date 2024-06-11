const ChatRoom = require("../../models/chatRoom_model");
const Message = require("../../models/message_model");

const handleDeleteChatRoom = async (
  socket,
  { userId, chatRoomId },
  onlineUsers,
  io
) => {
  if (!userId) {
    socket.emit("deleteChatRoomResponse", {
      status: 401,
      message: "Unauthorized access. Please log in.",
    });
    return;
  }

  const chatRoom = await ChatRoom.findOne({
    _id: chatRoomId,
    users: userId,
  });

  if (!chatRoom) {
    socket.emit("deleteChatRoomResponse", {
      status: 404,
      message: "Chat room not found or access denied.",
    });
    return;
  }

  await Message.updateMany({ chatRoom: chatRoomId }, { deleted: true });
  await ChatRoom.deleteOne({ _id: chatRoomId });
  chatRoom.users.forEach((memberId) => {
    const member = onlineUsers.find(
      (user) => user.userId === memberId.toString()
    );
    if (member) {
      socket.to(member.socketId).emit("chatRoomDeleted", {
        chatRoomId,
        message: "Chat room has been deleted.",
      });
    }
  });

  socket.emit("deleteChatRoomResponse", {
    status: 200,
    message: "Chat room deleted successfully.",
  });
};

module.exports = handleDeleteChatRoom;
