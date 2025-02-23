// src/socket/Socket.js
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
  handleFileChunk,
  handleVoiceChunk,
  fetchMoreMessages
} = require("./socketHandlers");
const { handleChatGPT } = require("../utils/chatGPT");

let io = null;


const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e8
  });
  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => handleJoinRoom(socket, data, io));
    socket.on("adminLogin", (userId) => handleAdminLogin(socket, userId,));
    socket.on("leaveRoom", (data) => handleLeaveRoom(socket, data, io));
    socket.on("heartbeat", (userId) => handleHeartbeat(socket, userId, io));
    socket.on("requestChatRooms", (data) => handleRequestChatRooms(socket, data));
    //-----------------------------------------------------------------------------------
    socket.on("sendMessage", (data, callback) => handleSendMessage(socket, data, io, callback));
    socket.on('fileChunk', (data, callback) => handleFileChunk(socket, data, callback));
    socket.on('voiceChunk', (data, callback) => handleVoiceChunk(socket, data, callback));
    //-----------------------------------------------------------------------------------
    socket.on("singleChatRoom", (data) => handleSingleChatRoom(socket, data,));
    socket.on('fetchMoreMessages', (data) => fetchMoreMessages(socket, data));
    //-----------------------------------------------------------------------------------
    socket.on("createChatRoom", (data) => handleCreateChatRoom(socket, data));
    socket.on("adminChatRoom", (data) => handleAdminChatRoom(socket, data,));
    socket.on("deleteChatRoom", (data) => handleDeleteChatRoom(socket, data, io));
    socket.on("deleteMessage", (data) => handleDeleteMessage(socket, data, io));
    socket.on("updateMessage", (data) => handleUpdateMessage(socket, data, io));
    socket.on("typing", (data) => handleTyping(socket, data, io));
    socket.on("messageToAdmin", (data) => handleMessageToAdmin(socket, data));
    socket.on("adminMessageToUser", (data) => handleAdminMessageToUser(socket, data, io));
    socket.on("saveGPTConfig", (data) => handleSaveGPTConfig(socket, data));
    socket.on("getGPTConfig", (data) => handleGetGPTConfig(socket, data));
    socket.on("promptString", (data) => handlePromptString(socket, data, io));
    socket.on('searchChatGPT', (data) => handleChatGPT(socket, data));
    socket.on("disconnect", () => handleDisconnect(socket, io));
  });
};

// Utility functions
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};

const getOnlineUsers = () => {
  return;
};

module.exports = {
  initSocketServer,
  getIO,
  getOnlineUsers,
};
