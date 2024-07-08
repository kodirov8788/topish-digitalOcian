const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const Joi = require("joi");

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

    async deleteTelegramChannel(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, "error", "Unauthorized", null, 0);
            }

            const user = await Users.findById(req.user.id);

            if (user.role !== "Employer") {
                return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
            }

            const { channelId } = req.params;

            if (!channelId) {
                return handleResponse(res, 400, "error", "Channel ID is required", null, 0);
            }

            // Find the index of the channel to be deleted
            const channelIndex = user.telegramChannelIds.findIndex(channel => channel.id === channelId);

            if (channelIndex === -1) {
                return handleResponse(res, 404, "error", "Channel not found", null, 0);
            }

            // Remove the channel from the array
            user.telegramChannelIds.splice(channelIndex, 1);
            await user.save();

            return handleResponse(res, 200, "success", "Telegram channel deleted successfully", null, 1);
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

    async updateTelegramChannel(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, "error", "Unauthorized", null, 0);
            }

            const user = await Users.findById(req.user.id);

            if (user.role !== "Employer") {
                return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
            }

            const { channelId } = req.params;

            if (!channelId) {
                return handleResponse(res, 400, "error", "Channel ID is required", null, 0);
            }

            // Validate the request body
            const { error, value } = updateChannelSchema.validate(req.body);

            if (error) {
                return handleResponse(res, 400, "error", "Validation failed", error.details, 0);
            }

            const { name, link, available } = value;

            // Find the channel to be updated
            const channelIndex = user.telegramChannelIds.findIndex(channel => channel.id === channelId);

            if (channelIndex === -1) {
                return handleResponse(res, 404, "error", "Channel not found", null, 0);
            }

            // Update the channel details
            if (name !== undefined) user.telegramChannelIds[channelIndex].name = name;
            if (link !== undefined) user.telegramChannelIds[channelIndex].link = link;
            if (available !== undefined) user.telegramChannelIds[channelIndex].available = available;

            await user.save();

            return handleResponse(res, 200, "success", "Telegram channel updated successfully", user.telegramChannelIds[channelIndex], 1);
        } catch (error) {
            return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
        }
    }


}

module.exports = new TelegramCTRL();
