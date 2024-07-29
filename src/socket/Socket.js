const { Server } = require("socket.io");
const {
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
} = require("./socketHandlers");

let io = null;
let onlineUsers = [];
let userChatRoomMap = {};
let socketUserMap = {};
const typingDebounceTimers = {};

const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => handleJoinRoom(socket, data, userChatRoomMap, socketUserMap));
    socket.on("adminLogin", (userId) => handleAdminLogin(socket, userId, onlineUsers));
    socket.on("leaveRoom", (data) => handleLeaveRoom(socket, data, userChatRoomMap, socketUserMap));
    socket.on("heartbeat", (userId) => handleHeartbeat(socket, userId, onlineUsers, io));
    socket.on("requestChatRooms", (data) => handleRequestChatRooms(socket, data));
    socket.on("sendMessage", (data) => handleSendMessage(socket, data, userChatRoomMap, onlineUsers, io));
    socket.on("singleChatRoom", (data) => handleSingleChatRoom(socket, data, onlineUsers));
    socket.on("createChatRoom", (data) => handleCreateChatRoom(socket, data));
    socket.on("adminChatRoom", (data) => handleAdminChatRoom(socket, data, onlineUsers));
    socket.on("deleteChatRoom", (data) => handleDeleteChatRoom(socket, data, onlineUsers, io));
    socket.on("deleteMessage", (data) => handleDeleteMessage(socket, data, onlineUsers, io));
    socket.on("updateMessage", (data) => handleUpdateMessage(socket, data, onlineUsers, io));
    socket.on("typing", (data) => handleTyping(socket, data, typingDebounceTimers, onlineUsers, io));
    socket.on("messageToAdmin", (data) => handleMessageToAdmin(socket, data));
    socket.on("adminMessageToUser", (data) => handleAdminMessageToUser(socket, data, onlineUsers, io));
    socket.on("saveGPTConfig", (data) => handleSaveGPTConfig(socket, data));
    socket.on("getGPTConfig", (data) => handleGetGPTConfig(socket, data));
    socket.on("promptString", (data) => handlePromptString(socket, data, onlineUsers, io));
    socket.on("disconnect", () => handleDisconnect(socket, userChatRoomMap, socketUserMap, onlineUsers, io));
  });
};

// Utility functions
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};

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


// Message Queue Functions
const enqueueMessage = (socket, messageData, userChatRoomMap, onlineUsers, io) => {
  const { senderId } = messageData;
  if (!messageQueue.has(senderId)) {
    messageQueue.set(senderId, []);
  }
  messageQueue.get(senderId).push(messageData);
  processMessageQueue(socket, senderId, userChatRoomMap, onlineUsers, io);
};

const processMessageQueue = async (socket, senderId, userChatRoomMap, onlineUsers, io) => {
  const queue = messageQueue.get(senderId);
  if (!queue || queue.processing) return;

  queue.processing = true;
  while (queue.length > 0) {
    const messageData = queue.shift();
    try {
      await handleSendMessage(socket, messageData, userChatRoomMap, onlineUsers, io);
    } catch (error) {
      console.error("Error processing message queue:", error);
    }
  }
  queue.processing = false;
};
module.exports = {
  initSocketServer,
  getIO,
  addUser,
  removeUser,
  getUser,
  getOnlineUsers,
};
