import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

const wsUrl = process.env.WS_URL;
if (!wsUrl) {
    throw new Error('WS_URL is not defined');
}

console.log('Starting Telegram bot with token:', token);

const bot = new Telegraf(token);
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('message', async (message) => {
    try {
        const data = JSON.parse(message.toString());
        if (data.type === 'response') {
            const chatId = data.chatId;
            const responseMessage = JSON.parse(data.message);
            await bot.telegram.sendMessage(chatId, responseMessage.text.value);
            console.log(`Sent response to chat ${chatId}: ${responseMessage.text.value}`);
        }
    } catch (error) {
        console.error('Error processing WebSocket message:', error);
    }
});

bot.on('message', async (ctx) => {
    try {
        const user = ctx.message.from;
        const userName = user.username || `${user.first_name} ${user.last_name}`;
        const chatType = ctx.chat.type;
        const chatId = ctx.chat.id;

        if ('text' in ctx.message) {
            const message = ctx.message.text;
            if (!message.startsWith('Rukia')) {
                console.log(`Ignored message from ${userName} in ${chatType} chat: ${message}`);
                return;
            }
            console.log(`Received text message from ${userName} in ${chatType} chat: ${message}`);

            // Отправляем данные по WebSocket
            ws.send(JSON.stringify({ type: 'text', userName, chatType, chatId, message }));
        } else {
            console.log(`Received unsupported message type from ${userName} in ${chatType} chat`);
        }
    } catch (error) {
        console.error('Error during message processing:', error);
    }
});

bot.launch({ dropPendingUpdates: true }).then(() => {
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