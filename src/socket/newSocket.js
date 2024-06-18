const { Server } = require("socket.io");
const {
  handleJoinRoom,
  handleLeaveRoom,
  handleSendMessage,
  handleHeartbeat,
  handleRequestChatRooms,
  handleSingleChatRoom,
  handleAdminChatRoom,
  handleDeleteChatRoom,
  handleDeleteMessage,
  handleUpdateMessage,
  handleTyping,
  handleMessageToAdmin,
  handleAdminMessageToUser,
  handleAdminLogin,
  handleDisconnect,
} = require("./socketHandlers");

let io = null;
let onlineUsers = [];

const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => handleJoinRoom(socket, data));
    socket.on("leaveRoom", (data) => handleLeaveRoom(socket, data));
    socket.on("sendMessage", (data) => handleSendMessage(socket, data, io));
    socket.on("heartbeat", (userId) =>
      handleHeartbeat(socket, userId, onlineUsers, io)
    );
    socket.on("requestChatRooms", (data) =>
      handleRequestChatRooms(socket, data)
    );
    socket.on("singleChatRoom", (data) =>
      handleSingleChatRoom(socket, data, onlineUsers, io)
    );
    socket.on("adminChatRoom", (data) =>
      handleAdminChatRoom(socket, data, onlineUsers, io)
    );
    socket.on("deleteChatRoom", (data) =>
      handleDeleteChatRoom(socket, data, onlineUsers, io)
    );
    socket.on("deleteMessage", (data) =>
      handleDeleteMessage(socket, data, onlineUsers, io)
    );
    socket.on("updateMessage", (data) =>
      handleUpdateMessage(socket, data, onlineUsers, io)
    );
    socket.on("typing", (data) => handleTyping(socket, data, onlineUsers, io));
    socket.on("messageToAdmin", (data) =>
      handleMessageToAdmin(socket, data, onlineUsers, io)
    );
    socket.on("adminMessageToUser", (data) =>
      handleAdminMessageToUser(socket, data, onlineUsers, io)
    );
    socket.on("adminLogin", (data) =>
      handleAdminLogin(socket, data, onlineUsers, io)
    );
    socket.on("disconnect", () => handleDisconnect(socket, onlineUsers, io));
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};

module.exports = {
  initSocketServer,
  getIO,
  onlineUsers,
};
