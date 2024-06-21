const { Server } = require("socket.io");
const ChatRoom = require("../models/chatRoom_model");
const Users = require("../models/user_model");
const Message = require("../models/message_model");
const Notification = require("../utils/Notification");
// const { handleResponse } = require("../utils/handleResponse");
let io = null;

// User management variables
let onlineUsers = [];
let userChatRoomMap = {};
let socketUserMap = {}; // Maps socketId to userId

const typingDebounceTimers = {};
// Initialize Socket.IO on the server

const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ userId, chatRoomId }) => {
      // Update maps to track user's room and socket
      userChatRoomMap[userId] = chatRoomId;
      socketUserMap[socket.id] = userId;
      socket.join(chatRoomId);

      // Notify OTHER users in the room
      socket
        .to(chatRoomId)
        .emit("joinedRoom", { userId: userId, chatRoomId: chatRoomId });
    });
    // Admin login
    socket.on("adminLogin", async (userId) => {
      // Validate token and retrieve admin data
      const admin = await Users.findOne({ _id: userId, role: "Admin" });
      if (admin) {
        const adminUser = {
          userId: admin.id,
          socketId: socket.id,
          lastActive: new Date(),
          isAdmin: true,
          isAvailable: true,
        };
        onlineUsers.push(adminUser);
      }
      setTimeout(() => {
        const adminUser = onlineUsers.find((user) => user.userId === userId);
        if (adminUser) {
          adminUser.isAvailable = false;
          io.to(adminUser.socketId).emit("adminUnavailable");
          onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
        }
      }, 60000 * 10);
    });
    socket.on("leaveRoom", ({ userId, chatRoomId }) => {
      if (userChatRoomMap[userId] === chatRoomId) {
        // Clean up user from room and socket maps
        delete userChatRoomMap[userId];
        delete socketUserMap[socket.id];
        socket.leave(chatRoomId);

        // Notify OTHER users in the room
        socket
          .to(chatRoomId)
          .emit("leftRoom", { userId: userId, chatRoomId: chatRoomId });
      } else {
        socket.emit("error", { message: "You are not in the specified room." });
      }
    });
    socket.on("heartbeat", (userId) => {
      const existingUser = onlineUsers.find((user) => user.userId === userId);
      if (existingUser) {
        existingUser.lastActive = new Date();
      } else {
        onlineUsers.push({
          userId,
          socketId: socket.id,
          lastActive: new Date(),
        });
      }

      // console.count("Heartbeat");
      const timeoutMinutes = 60;
      onlineUsers = onlineUsers.filter(
        (user) => (new Date() - user.lastActive) / 60000 < timeoutMinutes
      );
      // console.log(onlineUsers, "onlineUsers");
      io.emit("getOnlineUsers", onlineUsers);
    });
    socket.on("requestChatRooms", async ({ userId }) => {
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
              console.error(
                `Other user not found in chat room: ${chatRoom._id}`
              );
              return null;
            }

            const otherUser = await Users.findById(otherUserId);
            if (!otherUser) {
              console.error(`User document not found for ID: ${otherUserId} `);
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

            // const roleNameMap = {
            //   JobSeeker: "jobSeeker",
            //   Employer: "employer",
            //   Service: "service",
            // }; // Extend this map based on your application's roles
            // const roleField = roleNameMap[otherUser.role];
            const fullName =
              otherUser && otherUser.fullName
                ? otherUser.fullName
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
    });
    socket.on("sendMessage", async ({ text, recipientId, senderId }) => {
      console.count("sendMessage event received");
      console.log("sendMessage payload:", { text, recipientId, senderId });

      try {
        const sender = onlineUsers.find((user) => user.userId == senderId);
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

        if (senderChatRoom && recipientChatRoom && senderChatRoom === recipientChatRoom) {
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
            _id: sender?.userId,
            avatar: senderFromStorage?.avatar,
          },
          deleted: message.deleted,
          recipientId: message.recipientId,
        };

        const recipient = onlineUsers.find((user) => user.userId == recipientId);

        if (recipient && recipient.socketId) {
          console.count("getMessage event emitted to recipient");
          io.to(recipient.socketId).emit("getMessage", messageToSend);
        } else {
          console.count("getMessage event emitted to sender (recipient not online)");
          socket.emit("getMessage", messageToSend); // Emit to sender
        }

        const fullName =
          senderFromStorage && senderFromStorage.fullName
            ? senderFromStorage.fullName
            : "Unknown User";
        socket.emit("messageSentConfirmation", {
          success: true,
          messageId: message._id,
        });
        let customData = {
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
    });

    socket.on("singleChatRoom", async ({ userId, chatRoomId }) => {
      try {
        const chatRoom = await ChatRoom.findOne({
          _id: chatRoomId,
          users: userId,
        }).populate("users", "avatar"); // Assuming 'users' is an array of user IDs
        if (!chatRoom) {
          socket.emit("chatRoomResponse", {
            status: 404,
            message: "Chat room not found or access denied",
            data: null,
          });
          return;
        }
        // Find the other user in the chat room
        const otherUserId = chatRoom.users.find(
          (user) => user._id.toString() !== userId
        )?.id; // Ensure user._id is available and in the correct format
        if (!otherUserId) {
          socket.emit("chatRoomResponse", {
            status: 404,
            message: "Other user not found in chat room",
            data: null,
          });
          return;
        }
        let otherUser = await Users.findById(otherUserId)
          .select("avatar fullName")
          .exec();

        if (!otherUser) {
          socket.emit("chatRoomResponse", {
            status: 404,
            message: "User document not found",
            data: null,
          });
          return;
        }

        // Update the message status to seen for the current user
        await Message.updateMany(
          { chatRoom: chatRoomId, recipientId: userId, seen: false },
          { $set: { seen: true } }
        );

        const messageHistory = await Message.find({ chatRoom: chatRoomId })
          .sort({ timestamp: 1 })
          .populate("senderId", "avatar")
          .exec();

        // Prepare other user's data to send back
        let otherUserData = {
          fullName: otherUser.fullName,
          avatar: otherUser.avatar,
          _id: otherUser._id,
        };

        // Notify the recipient if they are online
        const recipient = onlineUsers.find(
          (user) => user.userId === otherUserId.toString()
        );
        if (recipient && recipient.socketId) {
          socket.to(recipient.socketId).emit("seenUpdate", messageHistory);
        }

        // Send chat room details and message history back to the requester
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
    });
    socket.on("adminChatRoom", async ({ userId }) => {
      try {
        // Retrieve the chat room where both the user and the admin are present
        const Rooms = await ChatRoom.find().populate("users", "avatar");
        let chatRoom = Rooms.find((chat) => {
          return (
            (chat.users[0]?._id == userId.toString() &&
              chat.isForAdmin == true) ||
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

        // Retrieve message history for the chat room
        const messageHistory = await Message.find({ chatRoom: chatRoom._id })
          .sort({ timestamp: 1 })
          .populate("senderId", "avatar")
          .exec();

        // Update the message status to seen for the current user
        await Message.updateMany(
          { chatRoom: chatRoom._id, recipientId: userId, seen: false },
          { $set: { seen: true } }
        );

        // Notify the recipient if they are online
        const recipient = onlineUsers.find((user) => user.userId === userId);
        if (recipient && recipient.socketId) {
          socket.to(recipient.socketId).emit("seenUpdate", messageHistory);
        }

        // Send chat room details and message history back to the requester
        socket.emit("adminChatRoom", {
          status: 200,
          message: "Admin chat room and message history retrieved successfully",
          data: messageHistory,
        });
      } catch (error) {
        // console.error("Error handling AdminChatRoom event:", error);
        socket.emit("adminChatRoom", {
          status: 500,
          message: "Internal server error",
          data: null,
        });
      }
    });
    socket.on("deleteChatRoom", async ({ userId, chatRoomId }) => {
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

      // Optionally, mark all messages as deleted or directly delete the chat room
      await Message.updateMany({ chatRoom: chatRoomId }, { deleted: true });
      await ChatRoom.deleteOne({ _id: chatRoomId });
      chatRoom.users.forEach((memberId) => {
        const member = onlineUsers.find(
          (user) => user.userId === memberId.toString()
        );
        if (member) {
          io.to(member.socketId).emit("chatRoomDeleted", {
            chatRoomId,
            message: "Chat room has been deleted.",
          });
        }
      });

      // Acknowledge the deletion to the requesting user
      socket.emit("deleteChatRoomResponse", {
        status: 200,
        message: "Chat room deleted successfully.",
      });
    });
    socket.on("deleteMessage", async ({ userId, messageId }) => {
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
            io.to(member.socketId).emit("deleteMessageNotification", {
              // Changed to avoid key duplication and clarify the event type
              messageId: message._id, // Use messageId for clarity
              text: "A message has been deleted.", // Renamed to 'text' to avoid duplication
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
    });
    socket.on("updateMessage", async ({ userId, messageId, newText }) => {
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
        await message.save(); // Ensure changes are saved

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
            io.to(member.socketId).emit("updateMessageNotification", {
              // Consistent naming
              messageId: message._id, // Unique key for the message ID
              newText: message.text, // Clear key for the updated text
              notification: "A message has been updated.", // Descriptive key for the notification message
            });
          }
        });
        // Acknowledge the update to the sender
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
    });
    socket.on("typing", async ({ chatRoomId, userId, isTyping }) => {
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

        // Debounce typing notification
        const debounceKey = `${chatRoomId} -${userId} `;
        if (typingDebounceTimers[debounceKey]) {
          clearTimeout(typingDebounceTimers[debounceKey]);
        }

        // Automatically set typing to false after 2 seconds of inactivity
        typingDebounceTimers[debounceKey] = setTimeout(() => {
          chatRoom.users.forEach((memberId) => {
            if (memberId.toString() === userId) return; // Don't send notification to the user who is typing

            const member = onlineUsers.find(
              (user) => user.userId === memberId.toString()
            );
            if (member) {
              io.to(member.socketId).emit("typingNotification", {
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

        // Immediately notify others if the user is typing
        if (isTyping) {
          chatRoom.users.forEach((memberId) => {
            if (memberId.toString() === userId) return; // Don't send notification to the user who is typing

            const member = onlineUsers.find(
              (user) => user.userId === memberId.toString()
            );
            if (member) {
              io.to(member.socketId).emit("typingNotification", {
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
    });
    // message to admin route
    socket.on("messageToAdmin", async ({ senderId, text }) => {
      try {
        // Check if the user is registered and valid
        const user = await Users.findById(senderId);
        if (!user) {
          socket.emit("errorNotification", { error: "User not found" });
          return;
        }

        // Find an admin's chat room or create it if it does not exist
        let adminChatRoom = await ChatRoom.findOne({
          isForAdmin: true,
          users: { $all: [senderId] },
        });

        if (!adminChatRoom) {
          adminChatRoom = new ChatRoom({ users: [senderId], isForAdmin: true });
          await adminChatRoom.save();
        }
        // Create a new message instance
        const message = new Message({
          text,
          senderId,
          chatRoom: adminChatRoom._id,
          recipientId: "admin", // This can be dynamic based on available admins
        });
        // Save message to database
        await message.save();

        // Emit message to admin dashboard (assuming admins are also connected via socket)
        const adminSocketId = findAdminSocketId(); // Implement this function based on your logic
        io.to(adminSocketId).emit("newAdminMessage", {
          message: text,
          from: user.fullName,
          chatRoomId: adminChatRoom._id,
        });

        // Confirm message sent to the user
        socket.emit("messageSentToAdmin", { success: true });
      } catch (error) {
        console.error("Error sending message to admin:", error);
        socket.emit("errorNotification", {
          error: "Failed to send message to admin.",
        });
      }
    });
    socket.on("adminMessageToUser", async ({ senderId, userId, text }) => {
      try {
        // Check if the user is registered and valid
        const user = await Users.findById(userId);
        if (!user) {
          socket.emit("adminChatRoom", { error: "User not found" });
          return;
        }
        // Check if the sender (admin) is registered and valid
        const admin = await Users.findById(senderId);
        if (!admin) {
          socket.emit("adminChatRoom", { error: "Admin not found" });
          return;
        }
        // Find the existing chat room between any admin and the user
        let chatRoom = await ChatRoom.findOne({
          isForAdmin: true,
          users: { $all: [userId] },
        });
        // If no chat room exists, create a new one
        if (!chatRoom) {
          chatRoom = new ChatRoom({
            users: [senderId, userId],
            isForAdmin: true,
          });
          await chatRoom.save();
        } else {
          // Ensure the admin is added to the chat room if not already
          if (!chatRoom.users.includes(senderId)) {
            chatRoom.users.push(senderId);
            await chatRoom.save();
          }
        }

        // Create a new message instance
        const message = new Message({
          text,
          senderId,
          chatRoom: chatRoom._id,
          recipientId: userId,
        });
        await message.save();

        // console.log("message", message);
        // Emit message to user (assuming users are also connected via socket)
        // Emit message to user (assuming users are also connected via socket)
        const userSocket = onlineUsers.find((user) => user.userId === userId);
        if (userSocket) {
          const userSocketId = userSocket.socketId;
          io.to(userSocketId).emit("adminChatRoom", {
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

        // Confirm message sent to the admin
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

        let customData = {
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
    });
    socket.on("disconnect", () => {
      // Use the socket ID to find the corresponding user ID and chat room
      const userId = socketUserMap[socket.id];
      const chatRoomId = userChatRoomMap[userId];
      if (userId && chatRoomId) {
        socket.leave(chatRoomId);

        // Notify OTHER users in the room
        socket
          .to(chatRoomId)
          .emit("leftRoom", { userId: userId, chatRoomId: chatRoomId });

        // Clean up user from room and socket maps
        delete userChatRoomMap[userId];
        delete socketUserMap[socket.id];
      }

      // Remove user from online users list
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit("updateOnlineUsers", onlineUsers);
    });
  });
};
// find admin socket id
function findAdminSocketId() {
  // Placeholder function to fetch an admin's socket ID
  return onlineUsers.find((user) => user.isAdmin).socketId;
}
// Get the io instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};

// User management functions
const addUser = (user) => {
  onlineUsers.push(user);
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

const getOnlineUsers = () => {
  return onlineUsers;
};

module.exports = {
  initSocketServer,
  getIO,
  addUser,
  removeUser,
  getUser,
  getOnlineUsers,
};
