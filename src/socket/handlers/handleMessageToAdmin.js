const ChatRoom = require("../../models/chatRoom_model");
const Message = require("../../models/message_model");
const Users = require("../../models/user_model");
// const Notification = require("../../utils/Notification");
const { findAdminSocketId } = require("../utils/socketUtils");

const handleMessageToAdmin = async (
  socket,
  { senderId, text },
  onlineUsers,
  io
) => {
  try {
    const user = await Users.findById(senderId);
    if (!user) {
      socket.emit("errorNotification", { error: "User not found" });
      return;
    }

    let adminChatRoom = await ChatRoom.findOne({
      isForAdmin: true,
      users: { $all: [senderId] },
    });

    if (!adminChatRoom) {
      adminChatRoom = new ChatRoom({ users: [senderId], isForAdmin: true });
      await adminChatRoom.save();
    }

    const message = new Message({
      text,
      senderId,
      chatRoom: adminChatRoom._id,
      recipientId: "admin",
    });
    await message.save();

    const adminSocketId = findAdminSocketId();
    socket.to(adminSocketId).emit("newAdminMessage", {
      message: text,
      from: user.fullName,
      chatRoomId: adminChatRoom._id,
    });

    socket.emit("messageSentToAdmin", { success: true });
  } catch (error) {
    console.error("Error sending message to admin:", error);
    socket.emit("errorNotification", {
      error: "Failed to send message to admin.",
    });
  }
};

module.exports = handleMessageToAdmin;
