const Message = require("../../models/message_model");
const ChatRoom = require("../../models/chatRoom_model");

const handleUpdateMessage = async (
  socket,
  { userId, messageId, newText },
  onlineUsers,
  io
) => {
  try {
    if (!userId) {
      socket.emit("updateMessageResponse", {
        status: 401,
        message: "Unauthorized",
      });
      return;
    }

    const message = await Message.findById(messageId);
    if (!message) {
      socket.emit("updateMessageResponse", {
        status: 404,
        message: "Message not found",
      });
      return;
    }

    if (message.senderId.toString() !== userId.toString()) {
      socket.emit("updateMessageResponse", {
        status: 403,
        message: "You are not authorized to update this message",
      });
      return;
    }

    if (message.text === newText) {
      socket.emit("updateMessageResponse", {
        status: 200,
        message: "No changes detected, message not updated.",
      });
      return;
    }

    message.text = newText;
    await message.save();

    const chatRoom = await ChatRoom.findOne({ _id: message.chatRoom });
    if (!chatRoom) {
      socket.emit("updateMessageResponse", {
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
        socket.to(member.socketId).emit("updateMessageNotification", {
          messageId: message._id,
          newText: message.text,
          notification: "A message has been updated.",
        });
      }
    });

    socket.emit("updateMessageResponse", {
      status: 200,
      message: "Message updated successfully",
    });
  } catch (error) {
    console.error("Error updating message:", error);
    socket.emit("updateMessageResponse", {
      status: 500,
      message: "Internal Server Error",
    });
  }
};

module.exports = handleUpdateMessage;
