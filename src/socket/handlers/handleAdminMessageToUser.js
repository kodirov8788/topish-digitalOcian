const ChatRoom = require("../../models/chatRoom_model");
const Message = require("../../models/message_model");
const Users = require("../../models/user_model");
const Notification = require("../../utils/Notification");

const handleAdminMessageToUser = async (
  socket,
  { senderId, userId, text },
  onlineUsers,
  io
) => {
  try {
    const user = await Users.findById(userId);
    if (!user) {
      socket.emit("adminChatRoom", { error: "User not found" });
      return;
    }

    const admin = await Users.findById(senderId);
    if (!admin) {
      socket.emit("adminChatRoom", { error: "Admin not found" });
      return;
    }

    let chatRoom = await ChatRoom.findOne({
      isForAdmin: true,
      users: { $all: [userId] },
    });

    if (!chatRoom) {
      chatRoom = new ChatRoom({
        users: [senderId, userId],
        isForAdmin: true,
      });
      await chatRoom.save();
    } else {
      if (!chatRoom.users.includes(senderId)) {
        chatRoom.users.push(senderId);
        await chatRoom.save();
      }
    }

    const message = new Message({
      text,
      senderId,
      chatRoom: chatRoom._id,
      recipientId: userId,
    });
    await message.save();

    const userSocket = onlineUsers.find((user) => user.userId === userId);
    if (userSocket) {
      const userSocketId = userSocket.socketId;
      socket.to(userSocketId).emit("adminChatRoom", {
        message: message.text,
        _id: message._id,
        avatar: "",
        recipientId: message.recipientId,
        deleted: message.deleted,
        seen: message.seen,
        senderId: "Admin",
        chatRoomId: chatRoom._id,
        timestamp: message.timestamp,
        file: message.file,
      });
    }

    socket.emit("adminChatRoom", {
      message: message.text,
      _id: message._id,
      avatar: "",
      recipientId: message.recipientId,
      deleted: message.deleted,
      seen: message.seen,
      senderId: "Admin",
      chatRoomId: chatRoom._id,
      timestamp: message.timestamp,
      file: message.file,
    });

    const customData = {
      timestamp: new Date().toISOString(),
      senderId: "Admin",
    };

    Notification(
      user.mobileToken,
      { title: "Topish support", body: text },
      customData
    );
  } catch (error) {
    console.error("Error sending message from admin to user:", error);
    socket.emit("adminMessageToUser", {
      error: "Failed to send message to user.",
    });
  }
};

module.exports = handleAdminMessageToUser;
