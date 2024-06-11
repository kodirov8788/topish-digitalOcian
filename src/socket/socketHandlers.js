const handleJoinRoom = require("./handlers/handleJoinRoom");
const handleLeaveRoom = require("./handlers/handleLeaveRoom");
const handleSendMessage = require("./handlers/handleSendMessage");
const handleHeartbeat = require("./handlers/handleHeartbeat");
const handleRequestChatRooms = require("./handlers/handleRequestChatRooms");
const handleSingleChatRoom = require("./handlers/handleSingleChatRoom");
const handleAdminChatRoom = require("./handlers/handleAdminChatRoom");
const handleDeleteChatRoom = require("./handlers/handleDeleteChatRoom");
const handleDeleteMessage = require("./handlers/handleDeleteMessage");
const handleUpdateMessage = require("./handlers/handleUpdateMessage");
const handleTyping = require("./handlers/handleTyping");
const handleMessageToAdmin = require("./handlers/handleMessageToAdmin");
const handleAdminMessageToUser = require("./handlers/handleAdminMessageToUser");
const handleAdminLogin = require("./handlers/handleAdminLogin");
const handleDisconnect = require("./handlers/handleDisconnect");

module.exports = {
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
};
