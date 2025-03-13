import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

const bot = new Telegraf(token);

bot.on('text', async (ctx) => {
    try {
        const message = ctx.message.text;
        const user = ctx.message.from;
        const userName = user.username || `${user.first_name} ${user.last_name}`;
        console.log(`Received message from ${userName}: ${message}`);

        await ctx.reply(`Message from ${userName}: ${message}`);
        console.log('Reply sent');
    } catch (error) {
        console.error('Error during message processing:', error);
        await ctx.reply('Failed to process your message.');
    }
});

bot.launch(() => {
    console.log('Telegram bot is running');
}).catch((error) => {
    console.error('Failed to launch Telegram bot:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});