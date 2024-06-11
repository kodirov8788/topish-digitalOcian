const ChatRoom = require("../../models/chatRoom_model");
const Users = require("../../models/user_model");
const Message = require("../../models/message_model");
const Notification = require("../../utils/Notification");
const userChatRoomMap = require("../utils/userChatRoomMap");
const socketUserMap = require("../utils/socketUserMap");

const handleSendMessage = async (
  socket,
  { text, recipientId, senderId },
  io
) => {
  try {
    const sender = onlineUsers.find((user) => user.userId === senderId);
    if (!sender) {
      socket.emit("errorNotification", { error: "Sender not found" });
      return;
    }

    const recipientUser = await Users.findById(recipientId);
    if (!recipientUser) {
      socket.emit("errorNotification", { error: "Recipient not found" });
      return;
    }

    let chatRoom = await ChatRoom.findOne({
      users: { $all: [senderId, recipientId] },
    });
    if (!chatRoom) {
      chatRoom = new ChatRoom({ users: [senderId, recipientId] });
      await chatRoom.save();
    }
    const message = new Message({
      text,
      senderId,
      recipientId,
      chatRoom: chatRoom._id,
    });

    const senderChatRoom = userChatRoomMap[senderId];
    const recipientChatRoom = userChatRoomMap[recipientId];

    if (
      senderChatRoom &&
      recipientChatRoom &&
      senderChatRoom === recipientChatRoom
    ) {
      message.read = true;
      io.to(senderChatRoom).emit("messageRead", {
        messageId: message._id,
        chatRoomId: senderChatRoom,
        readBy: recipientId,
        read: true,
      });
    }
    await message.save();

    const senderFromStorage = await Users.findById(senderId);
    const messageToSend = {
      _id: message._id,
      text: message.text,
      timestamp: message.timestamp,
      seen: message.seen,
      chatRoomId: chatRoom._id,
      senderId: {
        _id: sender.userId,
        avatar: senderFromStorage.avatar,
      },
      deleted: message.deleted,
      recipientId: message.recipientId,
    };

    const recipient = onlineUsers.find((user) => user.userId === recipientId);
    if (recipient && recipient.socketId) {
      socket.to(recipient.socketId).emit("getMessage", messageToSend);
    }
    socket.emit("getMessage", messageToSend);

    const roleNameMap = {
      JobSeeker: "jobSeeker",
      Employer: "employer",
      Service: "service",
    };
    const roleField = roleNameMap[senderFromStorage.role];
    const fullName =
      senderFromStorage[roleField] && senderFromStorage[roleField].fullName
        ? senderFromStorage[roleField].fullName
        : "Unknown User";

    socket.emit("messageSentConfirmation", {
      success: true,
      messageId: message._id,
    });

    const customData = {
      chatRoomId: chatRoom._id.toString(),
      messageId: message._id.toString(),
      timestamp: new Date().toISOString(),
      senderId: sender.userId,
      senderAvatar: senderFromStorage.avatar,
      recipientId: message.recipientId.toString(),
    };

    Notification(
      recipientUser.mobileToken,
      { title: fullName, body: text },
      customData
    );
  } catch (error) {
    console.error("Error in sendMessage socket event:", error);
    socket.emit("errorNotification", {
      error: "An error occurred while sending the message.",
    });
  }
};

module.exports = handleSendMessage;
