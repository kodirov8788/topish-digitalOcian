const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN; // Use environment variable for token
const bot = new TelegramBot(token, { polling: true });
const URL = process.env.SWAGGERT_URL


// /start command
// bot.onText(/\/start/, async (msg) => {
//     console.log('Received /start command');
//     bot.sendMessage(msg.chat.id, 'Welcome! Please use /register to register or /login to login.');
// });


bot.onText(/\/start (\w+)/, async (msg, match) => {
    // console.log('Received /start command with number');
    const telegramId = msg.from.id;
    let params = match[1]; // Extract the number from the start parameter
    // console.log("params: ", params);
    // console.log("telegramId: ", telegramId);

    params = params.split("_");
    if (params[0] === "addTelegram") {
        await addTelegram(msg, params[1]);
    }
});
const addTelegram = async (msg, phoneNumber) => {
    // console.log('Received /addtelegram command');
    const telegramId = msg.from.id;

    // console.log("Raw phoneNumber: ", phoneNumber);
    // console.log("telegramId: ", telegramId);
    if (!phoneNumber) {
        bot.sendMessage(msg.chat.id, 'Please provide a valid 9-digit phone number with the command, e.g., /addtelegram +998954446666');
        return;
    }

    // Remove non-numeric characters and leading zeros
    phoneNumber = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');

    // console.log("Formatted phoneNumber: ", phoneNumber);

    if (phoneNumber.length !== 9) {
        bot.sendMessage(msg.chat.id, 'Please provide a valid 9-digit phone number with the command, e.g., /addtelegram 954446666');
        return;
    }

    phoneNumber = `+998${phoneNumber}`;

    try {
        const response = await axios.post(`${URL}telegram/add-telegram-id`, { phoneNumber, telegramId });
        bot.sendMessage(msg.chat.id, response.data.message);
    } catch (error) {
        console.error('Error adding Telegram ID:', error.message);

        // Handling different error statuses
        if (error.response && error.response.status === 404) {
            bot.sendMessage(msg.chat.id, 'User not found with this phone number.');
        } else if (error.response && error.response.status === 400) {
            bot.sendMessage(msg.chat.id, 'Telegram ID does not match.');
        } else {
            bot.sendMessage(msg.chat.id, 'Something went wrong: ' + error.message);
        }
    }
};
let botId = null;
// Fetch bot information and store bot ID
bot.getMe().then((me) => {
    botId = me.id;
    // console.log(`Bot ID: ${botId}`);
}).catch((err) => {
    console.error('Error fetching bot information:', err);
});
bot.on('my_chat_member', async (msg) => {
    // console.log('my_chat_member', msg);
    try {
        const chat = msg.chat;
        const newChatMember = msg.new_chat_member;

        // console.log("botId: ", botId);
        // console.log("newChatMember: ", newChatMember.user.id);

        if (newChatMember.user.id === botId) {
            if (newChatMember.status === 'administrator') {
                // Bot added as admin to a channel
                const chatInfo = await bot.getChat(chat.id);
                const chatDetails = {
                    chatId: chat.id,
                    chatTitle: chatInfo.title,
                    chatUsername: chatInfo.username,
                    chatType: chatInfo.type,
                    chatDescription: chatInfo.description,
                    chatInviteLink: chatInfo.invite_link,
                    addedById: msg.from.id,
                    addedByUsername: msg.from.username || `first_name: ${msg.from.first_name}, last_name: ${msg.from.last_name}`,
                };

                // console.log(`Bot added as admin to channel: ${chatDetails.chatTitle} (${chatDetails.chatId}) by ${chatDetails.addedByUsername} (${chatDetails.addedById})`);
                // console.log("chatDetails: ", chatDetails);

                try {
                    let response = await axios.post(`${URL}telegram/save-channel`, chatDetails);
                    // console.log("response: ", response.data);

                    bot.sendMessage(chatDetails.addedById, `I have been added as an admin to ${chatDetails.chatTitle} by ${chatDetails.addedByUsername}`);
                } catch (axiosError) {
                    console.error('Error saving channel info:', axiosError.message);
                    bot.sendMessage(msg.from.id, 'There was an error saving the channel info. Please contact the administrator.');
                }

            } else if (newChatMember.status === 'left' || newChatMember.status === 'kicked') {
                // Bot removed from the channel
                try {
                    await axios.post(`${URL}telegram/remove-channel`, { chatId: chat.id });
                    // console.log(`Bot removed from channel: ${chat.title}(${chat.id})`);
                } catch (axiosError) {
                    console.error('Error removing channel info:', axiosError.message);
                    bot.sendMessage(msg.from.id, 'There was an error removing the channel info. Please contact the administrator.');
                }
            }
        }
    } catch (error) {
        console.error('Error handling my_chat_member event:', error.message);
        bot.sendMessage(msg.from.id, 'There was an error with the bot. Please contact the administrator.');
    }
});
bot.onText(/\/register(:\d+)?/, async (msg, match) => {
    console.log('Received /register command');
    const telegramId = msg.from.id;
    const number = match[1] ? match[1].slice(1) : null; // Extract the number if provided

    // try {
    //     // Check if the user is already registered
    //     const userResponse = await axios.post(`auth/check-user`, { telegramId });

    //     if (userResponse.data.isRegistered) {
    //         bot.sendMessage(msg.chat.id, 'You are already registered. Please use /login to login.');
    //     } else {
    //         // User is not registered, proceed with registration
    //         await axios.post(`auth/register-telegram`, { telegramId, number });
    //         bot.sendMessage(msg.chat.id, 'Welcome! Please check your Telegram for the registration confirmation code.');
    //     }
    // } catch (error) {
    //     console.error('Error handling Telegram registration:', error);
    //     bot.sendMessage(msg.chat.id, 'There was an error with your registration.');
    // }
});
// /login command
bot.onText(/\/login/, async (msg) => {
    console.log('Received /login command');
    const telegramId = msg.from.id;

    try {
        // Check if the user is already registered
        const userResponse = await axios.post(`${URL}auth/check-user`, { telegramId });

        if (userResponse.data.isRegistered) {
            // User is registered, send login code
            await axios.post(`auth/login-telegram`, { telegramId });
            bot.sendMessage(msg.chat.id, 'Welcome back! Please check your Telegram for the login confirmation code.');
        } else {
            bot.sendMessage(msg.chat.id, 'You are not registered yet. Please use /register to register.');
        }
    } catch (error) {
        console.error('Error handling Telegram login:', error);
        bot.sendMessage(msg.chat.id, 'There was an error with your login.');
    }
});

module.exports = bot;
