// src/routes/messages-route.js
const express = require("express");
const messagesCTRL = require("../controllers/messagesCTRL");
const { upload } = require("../utils/uploadFile");
const router = express.Router();

router.post("/sendMessage", upload, (req, res) => messagesCTRL.sendMessage(req, res));
router.get("/allmessages", (req, res) => messagesCTRL.getAllChatRooms(req, res));
router.get("/allmessagesTest", (req, res) => messagesCTRL.getAllChatRoomsTest(req, res));
router.get("/:chatRoomId", (req, res) => messagesCTRL.getSingleChatRoom(req, res));
router.get("/typing/:chatRoomId", (req, res) => messagesCTRL.messageTyping(req, res));
router.delete("/:chatRoomId", (req, res) => messagesCTRL.deleteChatRoom(req, res));
router.delete("/message/:messageId", (req, res) => messagesCTRL.deleteMessage(req, res));
router.delete("/deleteFiles/:messageId", (req, res) => messagesCTRL.deleteMessageFile(req, res));
router.patch("/message/:messageId", (req, res) => messagesCTRL.updateMessage(req, res));



module.exports = router;

