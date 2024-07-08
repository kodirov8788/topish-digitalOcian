const TelegramBot = require('node-telegram-bot-api');

async function sendTelegramChannels(channels, message) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        console.error("Telegram bot token is required");
        return;
    }

    if (!channels || channels.length === 0) {
        console.error("No channels to send message to");
        return;
    }

    if (!message || message.trim() === "") {
        console.error("Message is required to send to channels");
        return;
    }

    const bot = new TelegramBot(botToken);

    for (const channel of channels) {
        try {
            const response = await bot.sendMessage(channel.id, message);

            if (!response.ok) {
                console.error(`Failed to send message to channel ${channel.id}: ${response.description}`);
            }
        } catch (error) {
            console.error(`Error sending message to channel ${channel.id}:`, error.message);
        }
    }
}

module.exports = { sendTelegramChannels };
