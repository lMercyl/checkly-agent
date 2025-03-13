import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import path from 'path';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

console.log('Starting Telegram bot with token:', token);

const bot = new Telegraf(token);

bot.on('message', async (ctx) => {
    try {
        const user = ctx.message.from;
        const userName = user.username || `${user.first_name} ${user.last_name}`;
        const chatType = ctx.chat.type;

        if ('text' in ctx.message) {
            const message = ctx.message.text;
            console.log(`Received text message from ${userName} in ${chatType} chat: ${message}`);
            await ctx.reply(`Message from ${userName}: ${message}`);
            console.log('Reply sent');
        } else if ('photo' in ctx.message) {
            const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Получаем наибольшее разрешение
            const fileId = photo.file_id;
            console.log(`Received photo from ${userName} in ${chatType} chat: ${fileId}`);
            const file = await bot.telegram.getFile(fileId);
            const fileLink = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
            const filePath = path.join(__dirname, '..', 'downloads', `${fileId}.jpg`);

            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }

            const writer = fs.createWriteStream(filePath);
            const response = await axios({
                url: fileLink,
                method: 'GET',
                responseType: 'stream'
            });
            (response.data as NodeJS.ReadableStream).pipe(writer);
            writer.on('finish', () => {
                console.log(`Photo saved to ${filePath}`);
            });
            writer.on('error', (err) => {
                console.error('Error saving photo:', err);
            });
            await ctx.reply(`Photo from ${userName}: ${fileId}`);
            console.log('Reply sent');
        } else {
            console.log(`Received unsupported message type from ${userName} in ${chatType} chat`);
            await ctx.reply('Unsupported message type');
        }
    } catch (error) {
        console.error('Error during message processing:', error);
        await ctx.reply('Failed to process your message.');
    }
});

bot.launch().then(() => {
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