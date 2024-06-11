const ChatRoom = require("../../models/chatRoom_model");
const Users = require("../../models/user_model");
const Message = require("../../models/message_model");

const handleRequestChatRooms = async (socket, { userId, userRole }) => {
  try {
    if (!userId) {
      socket.emit("chatRoomsResponse", {
        status: 401,
        message: "Unauthorized access. Please log in.",
        data: null,
        count: 0,
      });
      return;
    }
    const chatRooms = await ChatRoom.find({ users: userId });
    if (!chatRooms.length) {
      socket.emit("chatRoomsResponse", {
        status: 200,
        message: "No chat rooms found.",
        data: [],
        count: 0,
      });
      return;
    }

    const chatRoomsWithInfo = await Promise.all(
      chatRooms.map(async (chatRoom) => {
        const otherUserId = chatRoom.users.find(
          (uId) => uId.toString() !== userId.toString()
        );

        if (!otherUserId) {
          console.error(`Other user not found in chat room: ${chatRoom._id}`);
          return null;
        }

        const otherUser = await Users.findById(otherUserId);
        if (!otherUser) {
          console.error(`User document not found for ID: ${otherUserId}`);
          return null;
        }

        const lastMessage = await Message.findOne({
          chatRoom: chatRoom._id,
        })
          .sort({ timestamp: -1 })
          .populate("senderId")
          .exec();

        const unreadMessagesCount = await Message.countDocuments({
          chatRoom: chatRoom._id,
          recipientId: userId,
          seen: false,
        });

        const roleNameMap = {
          JobSeeker: "jobSeeker",
          Employer: "employer",
          Service: "service",
        };
        const roleField = roleNameMap[otherUser.role];
        const fullName =
          otherUser[roleField] && otherUser[roleField].fullName
            ? otherUser[roleField].fullName
            : "Unknown User";

        return {
          _id: chatRoom._id,
          otherUser: {
            _id: otherUser._id,
            fullName: fullName,
            avatar: otherUser.avatar,
            role: otherUser.role,
          },
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                timestamp: lastMessage.timestamp,
                senderId: lastMessage.senderId._id,
                recipientId:
                  lastMessage.senderId._id.toString() === userId.toString()
                    ? otherUserId
                    : userId,
              }
            : null,
          unreadMessagesCount,
        };
      })
    );
    const filteredChatRooms = chatRoomsWithInfo.filter(
      (chatRoom) => chatRoom !== null
    );

    socket.emit("chatRoomsResponse", {
      status: 200,
      message: "Chat rooms retrieved successfully.",
      data: filteredChatRooms,
      count: filteredChatRooms.length,
    });
  } catch (error) {
    console.error(error);
    socket.emit("chatRoomsResponse", {
      status: 500,
      message: "An error occurred while retrieving chat rooms.",
      data: null,
      count: 0,
    });
  }
};

module.exports = handleRequestChatRooms;
