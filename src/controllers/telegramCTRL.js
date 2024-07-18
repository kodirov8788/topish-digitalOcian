const bot = require("../../bot");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const Joi = require("joi");
const axios = require("axios");
const { getIO } = require('../socket/Socket');
// Define the schema for validation
const telegramChannelSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required',
        'string.empty': 'Name cannot be empty'
    }),
    id: Joi.string().required().messages({
        'any.required': 'ID is required',
        'string.empty': 'ID cannot be empty'
    }),
    link: Joi.string().uri().required().messages({
        'any.required': 'Link is required',
        'string.empty': 'Link cannot be empty',
        'string.uri': 'Link must be a valid URL'
    }),
    available: Joi.boolean().optional()
});

const updateChannelSchema = Joi.object({
    name: Joi.string().optional(),
    link: Joi.string().uri().optional().messages({
        'string.uri': 'Link must be a valid URL'
    }),
    available: Joi.boolean().optional()
});

class TelegramCTRL {
    async addTelegramChannel(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, "error", "Unauthorized", null, 0);
            }

            const user = await Users.findById(req.user.id);

            if (user.role !== "Employer") {
                return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
            }

            // Validate the request body
            const { error, value } = telegramChannelSchema.validate(req.body);

            if (error) {
                return handleResponse(res, 400, "error", "Validation failed", error.details, 0);
            }

            const { name, id, link, available } = value;

            if (user.telegramChannelIds.find(channel => channel.id === id)) {
                return handleResponse(res, 400, "error", "Channel already exists", null, 0);
            }

            if (user.telegramChannelIds.length >= 5) {
                return handleResponse(res, 400, "error", "You can add up to 5 channels", null, 0);
            }

            const channel = {
                name: name,
                id: id,
                link: link,
                available: available !== undefined ? available : true,
            };

            user.telegramChannelIds.push(channel);
            await user.save();

            return handleResponse(res, 201, "success", "Telegram channel added successfully", channel, 1);
        } catch (error) {
            return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
        }
    }
    async getTelegramChannels(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, "error", "Unauthorized", null, 0);
            }

            const user = await Users.findById(req.user.id);

            if (user.role !== "Employer") {
                return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
            }

            return handleResponse(res, 200, "success", "Telegram channels fetched successfully", user.telegramChannelIds, user.telegramChannelIds.length);
        } catch (error) {
            return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
        }
    }
    async deleteTelegramChannel(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, "error", "Unauthorized", null, 0);
            }

            const user = await Users.findById(req.user.id);

            if (user.role !== "Employer") {
                return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
            }

            const { id } = req.params;
            // console.log("id: ", id);
            if (!id) {
                return handleResponse(res, 400, "error", "Channel ID is required", null, 0);
            }

            // Find the channel to be deleted
            const channel = user.telegramChannelIds.find(channel => channel._id.toString() === id);

            if (!channel) {
                return handleResponse(res, 404, "error", "Channel not found", null, 0);
            }

            // Remove the channel from the array
            user.telegramChannelIds = user.telegramChannelIds.filter(channel => channel._id.toString() !== id);

            // console.log("user.telegramChannelIds: ", user.telegramChannelIds);

            await user.save();

            return handleResponse(res, 200, "success", "Telegram channel deleted successfully", null, 1);
        } catch (error) {
            return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
        }
    }
    async updateTelegramChannel(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, "error", "Unauthorized", null, 0);
            }

            const user = await Users.findById(req.user.id);

            if (user.role !== "Employer") {
                return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
            }

            const { id } = req.params;

            if (!id) {
                return handleResponse(res, 400, "error", "Channel ID is required", null, 0);
            }

            // Validate the request body
            const { error, value } = updateChannelSchema.validate(req.body);

            if (error) {
                return handleResponse(res, 400, "error", "Validation failed", error.details, 0);
            }

            const { name, link, available } = value;

            // Find the channel to be updated
            const channel = user.telegramChannelIds.find(channel => channel._id.toString() === id);

            if (!channel) {
                return handleResponse(res, 404, "error", "Channel not found", null, 0);
            }

            // Update the channel details
            if (name !== undefined) channel.name = name;
            if (link !== undefined) channel.link = link;
            if (available !== undefined) channel.available = available;

            await user.save();

            return handleResponse(res, 200, "success", "Telegram channel updated successfully", channel, 1);
        } catch (error) {
            return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
        }
    }
    async leaveChannel(req, res) {
        try {
            // Check if the user is authenticated
            if (!req.user) {
                return handleResponse(res, 401, "error", "Unauthorized", null, 0);
            }
            // Find the user by their ID
            const user = await Users.findById(req.user.id);
            // Check if the user has the "Employer" role
            if (user.role !== "Employer") {
                return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
            }
            // Validate the request body to ensure chatId is provided
            const { chatId } = req.body;
            // console.log("chatId: ", chatId);
            if (!chatId) {
                return handleResponse(res, 400, "error", "Chat ID is required", null, 0);
            }
            const newChatId = Number(chatId);
            // console.log("newChatId: ", newChatId);
            try {
                // Assuming `bot` is your Telegram bot instance
                await bot.leaveChat(newChatId);
                // console.log(`Bot left the channel: ${chatId}`);
                // Respond with success message
                return handleResponse(res, 200, "success", "Bot has left the channel", null, 1);
            } catch (error) {
                console.error('Error leaving the channel:', error.message);
                return handleResponse(res, 500, "error", "There was an error leaving the channel", error.message, 0);
            }
        } catch (error) {
            return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
        }
    }
    async addTelegramId(req, res) {
        let io = getIO();
        const { phoneNumber, telegramId } = req.body;
        console.log("phoneNumber: ", phoneNumber);
        console.log("telegramId: ", telegramId);
        const telegramIdString = telegramId.toString();
        try {
            const user = await Users.findOne({ phoneNumber });

            if (!user) {
                return res.status(404).json({ error: "User not found with this phone number" });
            }
            if (user.telegramId === telegramIdString) {
                return res.status(200).json({ message: "Telegram ID already added" });
            }

            if (user.telegramId && user.telegramId !== telegramIdString) {
                return res.status(400).json({ error: "Telegram ID does not match" });
            }

            user.telegramId = telegramIdString;
            await user.save();
            io.emit('telegramIdAdded', { telegramId: telegramIdString });

            return res.status(200).json({ message: "Telegram ID added successfully" });

        } catch (error) {
            console.error("Error adding Telegram ID:", error.message);
            return res.status(500).json({ error: "Something went wrong: " + error.message });
        }
    }
    async removeTelegramId(req, res) {
        // console.log("remove telegram id")
        let io = getIO();
        try {

            if (!req.user) {
                return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
            }

            const user = await Users.findById(req.user.id);

            if (!user) {
                return handleResponse(res, 400, "error", "User not found", null, 0);
            }
            user.telegramId = null; // Remove the telegramId
            await user.save();
            io.emit('telegramIdRemoved', { telegramId: user.telegramId });
            return handleResponse(res, 200, "success", "Telegram ID removed successfully", null, 0);
        } catch (error) {
            return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
        }
    }
    async saveChannel(req, res) {
        const io = getIO();
        try {
            const { chatId, chatTitle, addedById, addedByUsername } = req.body;
            let user = await Users.findOne({ telegramId: addedById });
            let newChatId = chatId.toString();

            if (!user) {
                return res.status(404).send("User not found");
            }

            if (user.telegramChannelIds.some(channel => channel.id === newChatId)) {
                console.log("Channel already exists");
                return res.status(400).send("Channel already exists");
            }

            user.telegramChannelIds.push({
                name: chatTitle,
                id: newChatId,
                available: true
            });

            let savedUser = await user.save();

            //   give saved user info like {
            //     name: chatTitle,
            //     id: newChatId,
            //     available: true
            // }
            // add _id to the saved user's telegramChannelIds last added channel 

            io.emit('telegramChannelAdded',
                {
                    name: chatTitle,
                    id: newChatId,
                    available: true,
                    _id: savedUser.telegramChannelIds[savedUser.telegramChannelIds.length - 1]._id
                }
            );


            // console.log(`Channel info saved: ${chatTitle} (${chatId})`);
            res.status(200).send("OK");
        } catch (error) {
            console.error("Error saving channel info:", error.message);
            res.status(500).send("Internal Server Error");
        }
    }
    async removeChannel(req, res) {
        const io = getIO();
        try {
            const { chatId } = req.body;

            if (!chatId) {
                return res.status(400).send("chatId is required");
            }
            let user = await Users.findOne({ 'telegramChannelIds.id': chatId.toString() });
            if (!user) {
                return res.status(404).send("User not found");
            }
            let channel = user.telegramChannelIds.find(channel => channel.id === chatId.toString());
            if (!channel) {
                return res.status(404).send("Channel not found");
            }
            user.telegramChannelIds = user.telegramChannelIds.filter(channel => channel.id !== chatId.toString());
            await user.save();
            console.log(`Channel info removed: ${chatId}`);
            io.emit('telegramChannelRemoved', chatId);
            bot.sendMessage(user.telegramId, `I have been removed from ${channel.name}`);
            return res.status(200).send("OK");

        } catch (error) {
            console.error("Error removing channel info:", error.message);
            res.status(500).send("Internal Server Error");
        }
    }
}

module.exports = new TelegramCTRL();
