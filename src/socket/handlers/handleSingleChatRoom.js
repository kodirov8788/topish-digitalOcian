const ChatRoom = require("../../models/chatRoom_model");
const Users = require("../../models/user_model");
const Message = require("../../models/message_model");

const handleSingleChatRoom = async (
  socket,
  { userId, chatRoomId, userRole },
  onlineUsers,
  io
) => {
  try {
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      users: userId,
    }).populate("users", "avatar");

    if (!chatRoom) {
      socket.emit("chatRoomResponse", {
        status: 404,
        message: "Chat room not found or access denied",
        data: null,
      });
      return;
    }

    const otherUserId = chatRoom.users.find(
      (user) => user._id.toString() !== userId
    )?.id;
    if (!otherUserId) {
      socket.emit("chatRoomResponse", {
        status: 404,
        message: "Other user not found in chat room",
        data: null,
      });
      return;
    }
    let otherUser;
    if (userRole === "JobSeeker") {
      otherUser = await Users.findById(otherUserId)
        .select("avatar employer.fullName")
        .exec();
    } else {
      otherUser = await Users.findById(otherUserId)
        .select("avatar jobSeeker.fullName")
        .exec();
    }

    if (!otherUser) {
      socket.emit("chatRoomResponse", {
        status: 404,
        message: "User document not found",
        data: null,
      });
      return;
    }

    await Message.updateMany(
      { chatRoom: chatRoomId, recipientId: userId, seen: false },
      { $set: { seen: true } }
    );

    const messageHistory = await Message.find({ chatRoom: chatRoomId })
      .sort({ timestamp: 1 })
      .populate("senderId", "avatar")
      .exec();

    let otherUserData = {
      fullName: otherUser.fullName,
      avatar: otherUser.avatar,
      _id: otherUser._id,
    };

    const recipient = onlineUsers.find(
      (user) => user.userId === otherUserId.toString()
    );
    if (recipient && recipient.socketId) {
      socket.to(recipient.socketId).emit("seenUpdate", messageHistory);
    }

    socket.emit("chatRoomResponse", {
      status: 200,
      message: "Chat room and message history retrieved successfully",
      data: { otherUser: otherUserData, messageHistory },
    });
  } catch (error) {
    console.error("Error handling singleChatRoom event:", error);
    socket.emit("chatRoomResponse", {
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = handleSingleChatRoom;
