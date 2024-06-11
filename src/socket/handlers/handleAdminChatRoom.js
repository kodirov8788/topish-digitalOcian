const ChatRoom = require("../../models/chatRoom_model");
const Message = require("../../models/message_model");

const handleAdminChatRoom = async (socket, { userId }, onlineUsers, io) => {
  try {
    const Rooms = await ChatRoom.find().populate("users", "avatar");
    let chatRoom = Rooms.find((chat) => {
      return (
        (chat.users[0]?._id == userId.toString() && chat.isForAdmin == true) ||
        (chat.users[1]?._id == userId.toString() && chat.isForAdmin == true)
      );
    });
    if (!chatRoom) {
      socket.emit("adminChatRoom", {
        status: 404,
        message: "No chat room found between you and the admin",
        data: null,
      });
      return;
    }

    const messageHistory = await Message.find({ chatRoom: chatRoom._id })
      .sort({ timestamp: 1 })
      .populate("senderId", "avatar")
      .exec();

    await Message.updateMany(
      { chatRoom: chatRoom._id, recipientId: userId, seen: false },
      { $set: { seen: true } }
    );

    const recipient = onlineUsers.find((user) => user.userId === userId);
    if (recipient && recipient.socketId) {
      socket.to(recipient.socketId).emit("seenUpdate", messageHistory);
    }

    socket.emit("adminChatRoom", {
      status: 200,
      message: "Admin chat room and message history retrieved successfully",
      data: messageHistory,
    });
  } catch (error) {
    socket.emit("adminChatRoom", {
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = handleAdminChatRoom;
