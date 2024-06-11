const Message = require("../../models/message_model");
const ChatRoom = require("../../models/chatRoom_model");

const handleDeleteMessage = async (
  socket,
  { userId, messageId },
  onlineUsers,
  io
) => {
  try {
    if (!userId) {
      socket.emit("deleteMessageResponse", {
        status: 401,
        message: "Unauthorized",
      });
      return;
    }

    const message = await Message.findById(messageId);
    if (!message) {
      socket.emit("deleteMessageResponse", {
        status: 404,
        message: "Message not found",
      });
      return;
    }

    if (message.senderId.toString() !== userId) {
      socket.emit("deleteMessageResponse", {
        status: 403,
        message: "You are not authorized to delete this message",
      });
      return;
    }

    message.deleted = true;
    await message.save();

    const chatRoom = await ChatRoom.findOne({ _id: message.chatRoom });
    if (!chatRoom) {
      socket.emit("deleteMessageResponse", {
        status: 404,
        message: "Chat room not found or access denied.",
      });
      return;
    }
    chatRoom.users.forEach((memberId) => {
      const member = onlineUsers.find(
        (user) => user.userId === memberId.toString()
      );
      if (member) {
        socket.to(member.socketId).emit("deleteMessageNotification", {
          messageId: message._id,
          text: "A message has been deleted.",
        });
      }
    });

    socket.emit("deleteMessageResponse", {
      status: 200,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    socket.emit("deleteMessageResponse", {
      status: 500,
      message: "Internal Server Error",
    });
  }
};

module.exports = handleDeleteMessage;
