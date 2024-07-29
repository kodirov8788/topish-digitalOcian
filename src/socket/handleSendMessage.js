const messageQueue = new Map();

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
            await processSingleMessage(socket, messageData, userChatRoomMap, onlineUsers, io);
        } catch (error) {
            console.error("Error processing message queue:", error);
        }
    }
    queue.processing = false;
};

const processSingleMessage = async (socket, { text, recipientId, senderId, files }, userChatRoomMap, onlineUsers, io) => {
    console.log("text", text);
    console.log("recipientId", recipientId);
    console.log("senderId", senderId);
    try {
        const sender = onlineUsers.find((user) => user.userId == senderId);
        if (!sender) {
            socket.emit("errorNotification", { error: "Sender not found" });
            return;
        }
        console.log("sender", sender);

        // --------------------------------- File Uploads ---------------------------------
        let fileUrls = [];
        if (files && files.length > 0) {
            for (let file of files) {
                const buffer = Buffer.from(file.data.split(",")[1], 'base64');
                const uploadedUrl = await uploadFile({ buffer, originalname: file.name, mimetype: file.type });
                fileUrls.push(uploadedUrl);
            }
            // Clear the buffer and files array after processing
            files = [];
        }
        // --------------------------------- File Uploads ---------------------------------

        const recipientUser = await Users.findById(recipientId);
        if (!recipientUser) {
            socket.emit("errorNotification", { error: "Recipient not found" });
            return;
        }
        console.log("recipientId_id:=> ", recipientUser._id);

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
            console.log("recipient.socketId:=>", recipient.socketId);
            io.to(recipient.socketId).emit("getMessage", messageToSend);
        }
        // Always emit the message to the sender
        socket.emit("getMessage", messageToSend);

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
    } finally {
        // Clear buffers and files array
        files = [];
        if (socket.buffer) {
            socket.buffer = null;
        }
    }
};


exports.enqueueMessage = enqueueMessage;