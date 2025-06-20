// src/socket/socketHandlers.js
const ChatRoom = require("../models/chatRoom_model");
const Users = require("../models/user_model");
const Message = require("../models/message_model");
const Notification = require("../utils/Notification");
const { PromptCode } = require("../models/other_models");
const { uploadFile } = require("../utils/imageUploads/messageFilesUpload");
const { isValidObjectId } = require("mongoose");
let onlineUsers = [];
let userChatRoomMap = {};
let socketUserMap = {};
const typingDebounceTimers = {};
const handleMarkMessagesAsSeen = async (socket, { userId, chatRoomId }) => {
  try {
    // console.log("handleMarkMessagesAsSeen is called");
    // console.log("userId: ", userId);
    // console.log("chatRoomId: ", chatRoomId);

    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      users: userId,
    });

    if (!chatRoom) {
      socket.emit("errorNotification", {
        error: "Chat room not found or access denied.",
      });
      return;
    }

    const updatedMessages = await Message.updateMany(
      {
        chatRoom: chatRoomId,
        recipientId: userId,
        seen: false,
      },
      {
        $set: { seen: true },
      }
    );

    if (updatedMessages.nModified > 0) {
      const seenMessages = await Message.find({
        chatRoom: chatRoomId,
        recipientId: userId,
        seen: true,
      });

      socket
        .to(chatRoomId)
        .emit("seenUpdate", { chatRoomId, userId, messages: seenMessages });
      socket.emit("messagesMarkedAsSeen", {
        success: true,
        chatRoomId,
        userId,
        seen: true,
      });
    } else {
      socket.emit("messagesMarkedAsSeen", {
        success: false,
        chatRoomId,
        userId,
        message: "No unseen messages found.",
      });
    }
  } catch (error) {
    console.error("Error in handleMarkMessagesAsSeen:", error);
    socket.emit("errorNotification", {
      error: "An error occurred while marking messages as seen.",
    });
  }
};
const handleJoinRoom = (socket, { userId, chatRoomId }, io) => {
  userChatRoomMap[userId] = chatRoomId;
  socketUserMap[socket.id] = userId;
  socket.join(chatRoomId);
  socket.to(chatRoomId).emit("joinedRoom", { userId, chatRoomId });
  handleSingleChatRoom(socket, { userId, chatRoomId }, io);
  handleMarkMessagesAsSeen(socket, { userId, chatRoomId }, io);
};
const handleAdminLogin = async (socket, userId) => {
  const admin = await Users.findOne({ _id: userId, role: "Admin" }).select(
    "-password -refreshTokens"
  );
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
      socket.emit("adminUnavailable");
      onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    }
  }, 60000 * 10);
};
const handleLeaveRoom = (socket, { userId, chatRoomId }, io) => {
  if (userChatRoomMap[userId] === chatRoomId) {
    delete userChatRoomMap[userId];
    delete socketUserMap[socket.id];
    socket.leave(chatRoomId);
    socket.to(chatRoomId).emit("leftRoom", { userId, chatRoomId });
  } else {
    socket.emit("error", { message: "You are not in the specified room." });
  }

  // Clean up online users and update the list
  onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
  io.emit("getOnlineUsers", onlineUsers);
};
const handleHeartbeat = (socket, userId, io) => {
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
  const timeoutMinutes = 30;
  onlineUsers = onlineUsers.filter(
    (user) => (new Date() - user.lastActive) / 60000 < timeoutMinutes
  );
  io.emit("getOnlineUsers", onlineUsers);
};
const handleRequestChatRooms = async (socket, { userId }) => {
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
    const chatRooms = await ChatRoom.find({ users: userId, isForAdmin: false });
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
        const otherUser = await Users.findById(otherUserId).select(
          "-password -refreshTokens"
        );
        if (!otherUser) {
          console.error(`User document not found for ID: ${otherUserId}`);
          return null;
        }
        const lastMessage = await Message.findOne({
          chatRoom: chatRoom._id,
          deleted: { $ne: true },
        })
          .sort({ timestamp: -1 })
          .populate("senderId")
          .exec();

        const unreadMessagesCount = await Message.countDocuments({
          chatRoom: chatRoom._id,
          recipientId: userId,
          seen: false,
        });
        const fullName =
          otherUser && otherUser.fullName ? otherUser.fullName : "Unknown User";
        if (lastMessage !== null) {
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
                  _id: lastMessage._id,
                  text: lastMessage.text,
                  seen: lastMessage.seen,
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
        } else {
          return null;
        }
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

const fileChunksMap = {};
const voiceChunkMap = {};

const handleVoiceChunk = async (
  socket,
  { data, chunkIndex, totalChunks, senderId },
  callback
) => {
  if (!voiceChunkMap[senderId]) {
    voiceChunkMap[senderId] = {
      chunks: new Array(totalChunks).fill(null),
      totalChunks,
    };
  }
  const base64Data = data.split(",")[1];
  if (!base64Data) {
    console.error(`Failed to split base64 data for file`);
    return;
  }
  const bufferData = Buffer.from(base64Data, "base64");
  voiceChunkMap[senderId].chunks[chunkIndex] = bufferData;
  const receivedChunksCount = voiceChunkMap[senderId].chunks.filter(
    (chunk) => chunk !== null
  ).length;
  if (receivedChunksCount === totalChunks) {
    const completeFileData = Buffer.concat(voiceChunkMap[senderId].chunks);
    const uploadedUrl = await uploadFile({
      buffer: completeFileData,
      originalname: "voice.wav",
      mimetype: "audio/wav",
    });
    delete voiceChunkMap[senderId];
    // console.log("uploadedUrl: ", uploadedUrl);
    callback(uploadedUrl);
    socket.emit("fileUploadComplete", {
      name: "voice.wav",
      type: "audio/wav",
      uploadedUrl,
      senderId,
    });
    return uploadedUrl;
  } else {
    callback({ success: true });
  }
};
const handleFileChunk = async (
  socket,
  { name, type, data, chunkIndex, totalChunks, senderId, recipientId },
  callback
) => {
  if (!fileChunksMap[name]) {
    fileChunksMap[name] = {
      type,
      chunks: new Array(totalChunks).fill(null),
      totalChunks,
    };
  }
  if (!data) {
    console.error(
      `Received invalid chunk data for file ${name}, chunk ${
        chunkIndex + 1
      }/${totalChunks}`
    );
    return;
  }
  const base64Data = data.split(",")[1];
  if (!base64Data) {
    console.error(
      `Failed to split base64 data for file ${name}, chunk ${
        chunkIndex + 1
      }/${totalChunks}`
    );
    return;
  }

  const bufferData = Buffer.from(base64Data, "base64");
  fileChunksMap[name].chunks[chunkIndex] = bufferData;
  const receivedChunksCount = fileChunksMap[name].chunks.filter(
    (chunk) => chunk !== null
  ).length;

  if (receivedChunksCount === totalChunks) {
    const completeFileData = Buffer.concat(fileChunksMap[name].chunks);
    const uploadedUrl = await uploadFile({
      buffer: completeFileData,
      originalname: name,
      mimetype: type,
    });
    delete fileChunksMap[name];
    callback(uploadedUrl);
    socket.emit("fileUploadComplete", {
      name,
      type,
      uploadedUrl,
      senderId,
      recipientId,
    });
    return uploadedUrl;
  }
};

const handleSendMessage = async (
  socket,
  { text, recipientId, senderId, chatRoomId, timestamp, files, replyTo },
  io,
  callback
) => {
  try {
    let sender = onlineUsers.find((user) => user.userId == senderId);
    if (!sender) {
      handleHeartbeat(socket, senderId, io);
      sender = onlineUsers.find((user) => user.userId == senderId);
    }

    const recipientUser = await Users.findById(recipientId).select(
      "-password -refreshTokens"
    );
    if (!recipientUser) {
      const error = { success: false, error: "Recipient not found" };
      socket.emit("errorNotification", error);
      if (typeof callback === "function") callback(error);
      return;
    }

    let chatRoom = await ChatRoom.findOne({
      users: { $all: [senderId, recipientId] },
    });
    if (!chatRoom) {
      chatRoom = new ChatRoom({ users: [senderId, recipientId] });
      await chatRoom.save();
    }

    const senderFromStorage = await Users.findById(senderId).select(
      "-password -refreshTokens"
    );
    const repliedMessage = replyTo ? await Message.findById(replyTo) : null;
    let customRepliedMessage = null;

    if (repliedMessage) {
      customRepliedMessage = {
        _id: repliedMessage._id,
        text: repliedMessage.text,
        timestamp: repliedMessage.timestamp,
        chatRoomId: repliedMessage.chatRoom,
        senderId: {
          _id: repliedMessage.senderId,
          avatar: senderFromStorage?.avatar,
          fullName: senderFromStorage?.fullName,
        },
        deleted: repliedMessage.deleted,
        recipientId: repliedMessage.recipientId,
        fileUrls: repliedMessage.fileUrls,
        replyTo: repliedMessage.replyTo,
      };
    }

    const message = new Message({
      text,
      senderId,
      recipientId,
      chatRoom: chatRoom._id,
      replyTo: customRepliedMessage,
      fileUrls: files?.length > 0 ? files : [],
    });

    const recipient = onlineUsers.find((user) => user.userId == recipientId);
    const messageToSend = {
      _id: message._id,
      text: message.text,
      timestamp: message.timestamp,
      seen: message.seen,
      chatRoomId: chatRoom._id,
      senderId: {
        _id: sender?.userId,
        avatar: senderFromStorage?.avatar,
        fullName: senderFromStorage?.fullName,
      },
      deleted: message.deleted,
      recipientId: message.recipientId,
      fileUrls: message.fileUrls,
      replyTo: customRepliedMessage,
    };

    // console.log("recipient: ", recipient);
    if (recipient) {
      const senderChatRoom = userChatRoomMap[senderId];
      const recipientChatRoom = userChatRoomMap[recipientId];
      if (
        senderChatRoom &&
        recipientChatRoom &&
        senderChatRoom === recipientChatRoom
      ) {
        message.seen = true;
        setTimeout(() => {
          io.to(senderChatRoom).emit("messageRead", {
            messageId: message._id,
            chatRoomId: senderChatRoom,
            readBy: recipientId,
            read: true,
          });
        }, 300);
      } else {
        io.to(recipient.socketId).emit("getMessageOutSide", messageToSend);
      }
    }
    await message.save();
    console.log("chatRoom._id.toString():", chatRoom._id.toString());
    io.to(chatRoom._id.toString()).emit("getMessage", messageToSend);
    const successResponse = {
      success: true,
      messageId: message._id,
    };
    socket.emit("messageSentConfirmation", successResponse);

    const customData = {
      chatRoomId: chatRoom._id.toString(),
      messageId: message._id.toString(),
      timestamp: new Date().toISOString(),
      senderId: sender.userId,
      senderAvatar: senderFromStorage?.avatar,
      recipientId: message.recipientId.toString(),
    };
    Notification(
      recipientUser.mobileToken,
      { title: senderFromStorage?.fullName || "Unknown User", body: text },
      customData
    );
  } catch (error) {
    console.error("Error in sendMessage socket event:", error);
    const errorResponse = {
      success: false,
      error: "An error occurred while sending the message.",
    };
    socket.emit("errorNotification", errorResponse);
    if (typeof callback === "function") callback(errorResponse);
  }
};
const handleSingleChatRoom = async (
  socket,
  { userId, chatRoomId, limit = 15, skip = 0 }
) => {
  try {
    if (!isValidObjectId(chatRoomId) || !isValidObjectId(userId)) {
      socket.emit("errorNotification", {
        status: 400,
        message: "Invalid chat room or user ID.",
      });
      return;
    }
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
    let otherUser = await Users.findById(otherUserId)
      .select("-password -refreshTokens")
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

    await Message.updateMany(
      { chatRoom: chatRoomId, recipientId: userId, seen: false },
      { $set: { seen: true } }
    );

    const messageHistory = await Message.find({ chatRoom: chatRoomId })
      .sort({ timestamp: -1 }) // Sort by newest first
      // .skip(skip)
      // .limit(limit)
      .populate("senderId", "avatar")
      .exec();

    messageHistory.reverse();

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
const fetchMoreMessages = async (
  socket,
  { chatRoomId, userId, currentMessageCount }
) => {
  const limit = 15;
  const skip = currentMessageCount;
  await handleSingleChatRoom(socket, { userId, chatRoomId, limit, skip });
};
// --------------------------------- hundle chatRoom ---------------------------------
const handleCreateChatRoom = async (socket, { userId, otherUserId }) => {
  // console.log("CreateChatRoom userId: ", userId);
  // console.log("CreateChatRoom otherUserId: ", otherUserId);
  try {
    const user = await Users.findById(userId).select(
      "-password -refreshTokens"
    );
    if (!user) {
      socket.emit("errorNotification", {
        status: 404,
        error: "User not found",
      });
      return;
    }

    const recipient = await Users.findById(otherUserId).select(
      "-password -refreshTokens"
    );
    if (!recipient) {
      socket.emit("errorNotification", {
        status: 404,
        error: "Recipient not found",
      });
      return;
    }

    let chatRoom = await ChatRoom.findOne({
      users: { $all: [userId, otherUserId] },
    });

    if (!chatRoom) {
      chatRoom = new ChatRoom({ users: [userId, otherUserId] });
      await chatRoom.save();
    }

    socket.emit("chatRoomCreated", {
      status: 200,
      chatRoomId: chatRoom._id,
      recipient: {
        _id: recipient._id,
        fullName: recipient.fullName,
        avatar: recipient.avatar,
      },
    });
  } catch (error) {
    console.error("Error creating chat room:", error);
    socket.emit("errorNotification", {
      status: 500,
      error: "Failed to create chat room.",
    });
  }
};
const handleAdminChatRoom = async (socket, { userId }) => {
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
const handleDeleteChatRoom = async (socket, { userId, chatRoomId }, io) => {
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
      io.to(member.socketId).emit("chatRoomDeleted", {
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
const handleDeleteMessage = async (socket, { userId, messageId }, io) => {
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
const handleUpdateMessage = async (socket, { userId, messageId, text }, io) => {
  const newText = text.trim();
  // console.log("userId: ", userId);
  // console.log("messageId: ", messageId);
  // console.log("newText: ", newText);

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
    // console.log("message.text", message.text);
    // console.log("newText", newText);
    if (message.text === newText) {
      socket.emit("updateMessageResponse", {
        status: 200,
        message: "No changes detected, message not updated.",
      });
      return;
    }

    message.text = newText;
    // console.log("message.text 2", message.text);
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
        io.to(member.socketId).emit("updateMessageNotification", {
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
const handleTyping = async (socket, { chatRoomId, userId, isTyping }, io) => {
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

    const debounceKey = `${chatRoomId} -${userId} `;
    if (typingDebounceTimers[debounceKey]) {
      clearTimeout(typingDebounceTimers[debounceKey]);
    }

    typingDebounceTimers[debounceKey] = setTimeout(() => {
      chatRoom.users.forEach((memberId) => {
        if (memberId.toString() === userId) return;
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

    if (isTyping) {
      chatRoom.users.forEach((memberId) => {
        if (memberId.toString() === userId) return;
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
};
const handleMessageToAdmin = async (socket, { senderId, text }) => {
  try {
    const user = await Users.findById(senderId).select(
      "-password -refreshTokens"
    );
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
    io.to(adminSocketId).emit("newAdminMessage", {
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
const handleAdminMessageToUser = async (
  socket,
  { senderId, userId, text },
  io
) => {
  try {
    const user = await Users.findById(userId).select(
      "-password -refreshTokens"
    );
    if (!user) {
      socket.emit("adminChatRoom", { error: "User not found" });
      return;
    }
    const admin = await Users.findById(senderId).select(
      "-password -refreshTokens"
    );
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
};
const handleSaveGPTConfig = async (socket, { gptToken, userId }) => {
  try {
    const user = await Users.findById(userId).select(
      "-password -refreshTokens"
    );
    if (!user) {
      socket.emit("errorNotification", { error: "User not found" });
      return;
    }
    user.gptToken = gptToken;
    await user.save();
    socket.emit("gptConfigSaved", { success: true, config: { gptToken } });
  } catch (error) {
    socket.emit("errorNotification", { error: "Failed to save GPT config" });
  }
};
// const handleGetGPTConfig = async (socket, { userId }) => {
//   try {
//     const user = await Users.findById(userId).select(
//       "-password -refreshTokens"
//     );
//     if (!user) {
//       socket.emit("errorNotification", { error: "User not found" });
//       return;
//     }
//     const { gptToken } = user;

//     socket.emit("gptConfigReceive", { success: true, config: { gptToken } });
//   } catch (error) {
//     socket.emit("errorNotification", {
//       error: "Failed to retrieve GPT config",
//     });
//   }
// };
// const handlePromptString = async (socket, { userId, text }, io) => {
//   try {
//     const user = await Users.findById(userId).select(
//       "-password -refreshTokens"
//     );

//     if (!user || user.role !== "Admin") {
//       socket.emit("errorNotification", { error: "Unauthorized action" });
//       return;
//     }

//     const promptMessage = {
//       text,
//       senderId: userId,
//       timestamp: new Date(),
//     };

//     onlineUsers.forEach((onlineUser) => {
//       io.to(onlineUser.socketId).emit("receivePrompt", promptMessage);
//     });

//     const chatRoom = await ChatRoom.findOne({ isForAdmin: true });

//     if (chatRoom) {
//       const message = new Message({
//         text,
//         senderId: userId,
//         chatRoom: chatRoom._id,
//         recipientId: "all",
//       });
//       await message.save();
//     }

//     let prompt = await PromptCode.find();
//     if (prompt.length > 0) {
//       await PromptCode.updateOne({ _id: prompt[0]._id }, { code: text });
//     } else {
//       const promptCode = new PromptCode({ code: text });
//       await promptCode.save();
//     }

//     const usersWithoutGptPrompt = await Users.find({
//       gptPrompt: { $exists: false },
//     }).select("-password -refreshTokens");

//     for (const user of usersWithoutGptPrompt) {
//       user.gptPrompt = text;
//       await user.save();
//     }

//     await Users.updateMany({}, { gptPrompt: text });

//     socket.emit("promptSentConfirmation", {
//       success: true,
//       message: "Prompt message sent and gptPrompt updated for all users",
//     });
//   } catch (error) {
//     console.error("Error sending prompt message:", error);
//     socket.emit("errorNotification", {
//       error: "Failed to send prompt message",
//     });
//   }
// };

const handleGetGPTConfig = async (socket, { userId }) => {
  try {
    const user = await Users.findById(userId).select(
      "-password -refreshTokens"
    );
    if (!user) {
      socket.emit("errorNotification", { error: "User not found" });
      return;
    }

    // Get today's usage information
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    let usageInfo = await require("../models/gpt_usage_model").findOne({
      userId,
      date: today,
    });

    // Default daily limit if not set for the user
    const dailyLimit = user.gptDailyLimit || 5;

    socket.emit("gptConfigReceive", {
      success: true,
      config: {
        gptPrompt: user.gptPrompt || "You are a helpful assistant.",
        gptToken: user.gptToken || "",
        gptDailyLimit: dailyLimit,
        usageToday: usageInfo ? usageInfo.count : 0,
        remaining: dailyLimit - (usageInfo ? usageInfo.count : 0),
        lastUsed: usageInfo ? usageInfo.lastUsed : null,
      },
    });
  } catch (error) {
    console.error("Error in handleGetGPTConfig:", error);
    socket.emit("errorNotification", {
      error: "Failed to retrieve GPT config",
    });
  }
};

const handlePromptString = async (socket, { userId, text }, io) => {
  try {
    const user = await Users.findById(userId).select(
      "-password -refreshTokens"
    );

    if (!user || user.role !== "Admin") {
      socket.emit("errorNotification", { error: "Unauthorized action" });
      return;
    }

    const promptMessage = {
      text,
      senderId: userId,
      timestamp: new Date(),
    };

    // Broadcast the prompt to all online users
    onlineUsers.forEach((onlineUser) => {
      io.to(onlineUser.socketId).emit("receivePrompt", promptMessage);
    });

    // Save prompt to admin chat room if exists
    const chatRoom = await ChatRoom.findOne({ isForAdmin: true });
    if (chatRoom) {
      const message = new Message({
        text,
        senderId: userId,
        chatRoom: chatRoom._id,
        recipientId: "all",
      });
      await message.save();
    }

    // Save or update the global prompt code
    let prompt = await PromptCode.find();
    if (prompt.length > 0) {
      await PromptCode.updateOne({ _id: prompt[0]._id }, { code: text });
    } else {
      const promptCode = new PromptCode({ code: text });
      await promptCode.save();
    }

    // Update all users' GPT prompts
    // First handle users who don't have a gptPrompt field yet
    const usersWithoutGptPrompt = await Users.find({
      gptPrompt: { $exists: false },
    }).select("-password -refreshTokens");

    for (const user of usersWithoutGptPrompt) {
      user.gptPrompt = text;

      // Ensure users have the daily limit field
      if (!user.gptDailyLimit) {
        user.gptDailyLimit = 5; // Default value
      }

      await user.save();
    }

    // Then update all users at once
    await Users.updateMany({}, { gptPrompt: text });

    // Send confirmation back to admin
    socket.emit("promptSentConfirmation", {
      success: true,
      message: "Prompt message sent and gptPrompt updated for all users",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error sending prompt message:", error);
    socket.emit("errorNotification", {
      error: "Failed to send prompt message",
    });
  }
};

const handleDisconnect = (socket, io) => {
  const userId = socketUserMap[socket.id];
  const chatRoomId = userChatRoomMap[userId];
  if (userId && chatRoomId) {
    socket.leave(chatRoomId);
    socket
      .to(chatRoomId)
      .emit("leftRoom", { userId: userId, chatRoomId: chatRoomId });
    delete userChatRoomMap[userId];
    delete socketUserMap[socket.id];
  }
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
  io.emit("updateOnlineUsers", onlineUsers);
};
const findAdminSocketId = () => {
  return onlineUsers.find((user) => user.isAdmin).socketId;
};

module.exports = {
  handleJoinRoom,
  handleAdminLogin,
  handleLeaveRoom,
  handleHeartbeat,
  handleRequestChatRooms,
  handleSendMessage,
  handleSingleChatRoom,
  handleCreateChatRoom,
  handleAdminChatRoom,
  handleDeleteChatRoom,
  handleDeleteMessage,
  handleUpdateMessage,
  handleTyping,
  handleMessageToAdmin,
  handleAdminMessageToUser,
  handleSaveGPTConfig,
  handleGetGPTConfig,
  handlePromptString,
  handleDisconnect,
  handleFileChunk,
  handleVoiceChunk,
  fetchMoreMessages,
};
