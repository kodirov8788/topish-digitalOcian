const bot = require('../../bot');
const { Form_0_uz, Form_1_uz } = require('./telegramForm');

async function sendTelegramChannels(telegram, message) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    // console.log("botToken: ", botToken);
    // console.log("channels: ", channels);
    // console.log("message: ", message);
    if (!botToken) {
        console.error("Telegram bot token is required");
        return;
    }

    if (!telegram.channels || telegram.channels.length === 0) {
        console.error("No channels to send message to");
        return;
    }


    // console.log("Form_1(message): ", Form_1(message));
    for (const channel of telegram.channels) {
        try {

            if (channel.available) {
                if (telegram.post.selectedPost === 0) {
                    const response = await bot.sendPhoto(Number(channel.id), telegram.post.images[telegram.post.selectedImage], {
                        caption: Form_0_uz(message, telegram),
                        parse_mode: 'HTML'
                    });

                    if (response.error) {
                        console.error(`Failed to send message to channel ${channel.id}: ${response.error.description}`);
                    } else {
                        console.log(`Message sent to channel ${channel.id}:`, response);
                    }
                } else if (telegram.post.selectedPost === 1) {
                    const response = await bot.sendMessage(Number(channel.id), Form_1_uz(message, telegram), {
                        parse_mode: 'HTML'
                    });

                    if (response.error) {
                        console.error(`Failed to send message to channel ${channel.id}: ${response.error.description}`);
                    } else {
                        console.log(`Message sent to channel ${channel.id}:`, response);
                    }
                }
            }
        } catch (error) {
            console.error(`Error sending message to channel ${channel.id}:`, error.message);
        }
    }
}

module.exports = { sendTelegramChannels };
