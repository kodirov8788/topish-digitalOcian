const ChatRoom = require("../../models/chatRoom_model");
const Users = require("../../models/user_model");
const Message = require("../../models/message_model");
const Notification = require("../../utils/Notification");
const { PromptCode } = require("../../models/other_models");
const { uploadFile } = require('../../utils/imageUploads/messageFilesUpload');

const handleJoinRoom = (socket, { userId, chatRoomId }, userChatRoomMap, socketUserMap) => {
    userChatRoomMap[userId] = chatRoomId;
    socketUserMap[socket.id] = userId;
    socket.join(chatRoomId);
    socket.to(chatRoomId).emit("joinedRoom", { userId: userId, chatRoomId: chatRoomId });
};

const handleAdminLogin = async (socket, userId, onlineUsers) => {
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
            socket.emit("adminUnavailable");
            onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
        }
    }, 60000 * 10);
};

const handleLeaveRoom = (socket, { userId, chatRoomId }, userChatRoomMap, socketUserMap) => {
    if (userChatRoomMap[userId] === chatRoomId) {
        delete userChatRoomMap[userId];
        delete socketUserMap[socket.id];
        socket.leave(chatRoomId);
        socket.to(chatRoomId).emit("leftRoom", { userId: userId, chatRoomId: chatRoomId });
    } else {
        socket.emit("error", { message: "You are not in the specified room." });
    }
};

const handleHeartbeat = (socket, userId, onlineUsers, io) => {
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
    const timeoutMinutes = 60;
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

                const fullName =
                    otherUser && otherUser.fullName
                        ? otherUser.fullName
                        : "Unknown User";
                if (lastMessage !== null && lastMessage.deleted !== true) {
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
// --------------------------------- File Uploads ---------------------------------

const fileChunksMap = {};

const handleFileChunk = async (socket, { name, type, data, chunkIndex, totalChunks, senderId, recipientId }, callback) => {
    if (!fileChunksMap[name]) {
        fileChunksMap[name] = { type, chunks: new Array(totalChunks).fill(null), totalChunks };
    }
    console.log("name: ", name);
    // console.log("type: ", type);
    // console.log("data: ", data);
    console.log("chunkIndex: ", chunkIndex);
    console.log("totalChunks: ", totalChunks);
    console.log(`Received chunk ${chunkIndex + 1}/${totalChunks} for file ${name} from sender ${senderId} to recipient ${recipientId}`);

    if (!data) {
        console.error(`Received invalid chunk data for file ${name}, chunk ${chunkIndex + 1}/${totalChunks}`);
        return;
    }

    // Extract the base64 data part
    const base64Data = data.split(',')[1];
    if (!base64Data) {
        console.error(`Failed to split base64 data for file ${name}, chunk ${chunkIndex + 1}/${totalChunks}`);
        return;
    }

    const bufferData = Buffer.from(base64Data, 'base64');

    // Store the chunk in the correct position
    fileChunksMap[name].chunks[chunkIndex] = bufferData;

    // Count the received chunks
    const receivedChunksCount = fileChunksMap[name].chunks.filter(chunk => chunk !== null).length;

    console.log(`Stored chunk ${chunkIndex + 1}/${totalChunks} for file ${name}. Received chunks: ${receivedChunksCount}/${totalChunks}`);

    if (receivedChunksCount === totalChunks) {
        console.log(`All chunks received for file ${name}. Concatenating and uploading...`);
        const completeFileData = Buffer.concat(fileChunksMap[name].chunks);

        // Upload the concatenated file
        const uploadedUrl = await uploadFile({ buffer: completeFileData, originalname: name, mimetype: type });

        console.log(`File ${name} uploaded successfully. URL: ${uploadedUrl}`);

        // Clean up the stored chunks
        delete fileChunksMap[name];

        callback(uploadedUrl);
        return uploadedUrl;
    }
};
const handleSendMessage = async (socket, { text, recipientId, senderId, chatRoomId, timestamp, files }, userChatRoomMap, onlineUsers, io, callback) => {
    console.log("text: ", text);
    console.log("recipientId: ", recipientId);
    console.log("senderId: ", senderId);
    console.log("files: ", files);

    try {
        const sender = onlineUsers.find((user) => user.userId == senderId);
        if (!sender) {
            const error = { success: false, error: "Sender not found" };
            socket.emit("errorNotification", error);
            return callback(error);
        }

        let fileUrls = [];
        if (files && files.length > 0) {
            for (let file of files) {
                // Retrieve file URLs from stored chunks
                const uploadedUrl = await new Promise((resolve) => {
                    handleFileChunk(socket, { ...file, senderId, recipientId }, resolve);
                });
                fileUrls.push(uploadedUrl);
            }
        }
        console.log("fileUrls:", fileUrls);

        const recipientUser = await Users.findById(recipientId);
        if (!recipientUser) {
            const error = { success: false, error: "Recipient not found" };
            socket.emit("errorNotification", error);
            return callback(error);
        }

        let chatRoom = await ChatRoom.findOne({ users: { $all: [senderId, recipientId] } });
        if (!chatRoom) {
            chatRoom = new ChatRoom({ users: [senderId, recipientId] });
            await chatRoom.save();
        }

        const message = new Message({
            text,
            senderId,
            recipientId,
            chatRoom: chatRoom._id,
            fileUrls: fileUrls.length > 0 ? fileUrls : [],
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
            fileUrls: fileUrls.length > 0 ? fileUrls : [],
        };

        const recipient = onlineUsers.find((user) => user.userId == recipientId);

        if (recipient && recipient.socketId) {
            io.to(recipient.socketId).emit("getMessage", messageToSend);
        }
        socket.emit("getMessage", messageToSend);

        const fullName = senderFromStorage?.fullName || "Unknown User";

        const successResponse = {
            success: true,
            messageId: message._id,
        };
        socket.emit("messageSentConfirmation", successResponse);
        callback(successResponse);

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
        const errorResponse = {
            success: false,
            error: "An error occurred while sending the message.",
        };
        socket.emit("errorNotification", errorResponse);
        callback(errorResponse);
    }
};


// --------------------------------- File Uploads ---------------------------------

const handleSingleChatRoom = async (socket, { userId, chatRoomId }, onlineUsers) => {
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

const handleCreateChatRoom = async (socket, { userId, otherUserId }) => {
    try {
        const user = await Users.findById(userId);
        if (!user) {
            socket.emit("errorNotification", { status: 404, error: "User not found" });
            return;
        }

        const recipient = await Users.findById(otherUserId);
        if (!recipient) {
            socket.emit("errorNotification", { status: 404, error: "Recipient not found" });
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

const handleAdminChatRoom = async (socket, { userId }, onlineUsers) => {
    try {
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

const handleDeleteChatRoom = async (socket, { userId, chatRoomId }, onlineUsers, io) => {
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

const handleDeleteMessage = async (socket, { userId, messageId }, onlineUsers, io) => {
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

const handleUpdateMessage = async (socket, { userId, messageId, text }, onlineUsers, io) => {
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

const handleTyping = async (socket, { chatRoomId, userId, isTyping }, typingDebounceTimers, onlineUsers, io) => {
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
        const user = await Users.findById(senderId);
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

const handleAdminMessageToUser = async (socket, { senderId, userId, text }, onlineUsers, io) => {
    try {
        const user = await Users.findById(userId);
        if (!user) {
            socket.emit("adminChatRoom", { error: "User not found" });
            return;
        }
        const admin = await Users.findById(senderId);
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
        const user = await Users.findById(userId);
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

const handleGetGPTConfig = async (socket, { userId }) => {
    try {
        const user = await Users.findById(userId);
        if (!user) {
            socket.emit("errorNotification", { error: "User not found" });
            return;
        }
        const { gptToken } = user;

        socket.emit("gptConfigReceive", { success: true, config: { gptToken } });
    } catch (error) {
        socket.emit("errorNotification", { error: "Failed to retrieve GPT config" });
    }
};

const handlePromptString = async (socket, { userId, text }, onlineUsers, io) => {
    try {
        const user = await Users.findById(userId);

        if (!user || user.role !== "Admin") {
            socket.emit("errorNotification", { error: "Unauthorized action" });
            return;
        }

        const promptMessage = {
            text,
            senderId: userId,
            timestamp: new Date(),
        };

        onlineUsers.forEach((onlineUser) => {
            io.to(onlineUser.socketId).emit("receivePrompt", promptMessage);
        });

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

        let prompt = await PromptCode.find();
        if (prompt.length > 0) {
            await PromptCode.updateOne({ _id: prompt[0]._id }, { code: text });
        } else {
            const promptCode = new PromptCode({ code: text });
            await promptCode.save();
        }

        const usersWithoutGptPrompt = await Users.find({ gptPrompt: { $exists: false } });

        for (const user of usersWithoutGptPrompt) {
            user.gptPrompt = text;
            await user.save();
        }

        await Users.updateMany({}, { gptPrompt: text });

        socket.emit("promptSentConfirmation", {
            success: true,
            message: "Prompt message sent and gptPrompt updated for all users",
        });
    } catch (error) {
        console.error("Error sending prompt message:", error);
        socket.emit("errorNotification", {
            error: "Failed to send prompt message",
        });
    }
};

const handleDisconnect = (socket, userChatRoomMap, socketUserMap, onlineUsers, io) => {
    const userId = socketUserMap[socket.id];
    const chatRoomId = userChatRoomMap[userId];
    if (userId && chatRoomId) {
        socket.leave(chatRoomId);
        socket.to(chatRoomId).emit("leftRoom", { userId: userId, chatRoomId: chatRoomId });
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
    handleFileChunk
};
