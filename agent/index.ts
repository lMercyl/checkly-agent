import express from 'express';
import { WebSocketServer } from 'ws';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createAssistant } from './src/openai/create-assistant.js';
import { createThread } from './src/openai/create-thread.js';
import { createRun } from './src/openai/create-run.js';
import { performRun } from './src/openai/perform-run.js';

dotenv.config();

const app = express();
const server = app.listen(5555, () => console.log('Server running on http://localhost:5555'));
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws) => {
    console.log('Client connected');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const assistant = await createAssistant(client);

    ws.on('message', async (message) => {
        try {
            console.log('Received message:', message.toString());
            const data = JSON.parse(message.toString());

            if (data.type === 'text') {
                const thread = await createThread(client, data.message);
                const run = await createRun(client, thread, assistant.id);
                console.log('Run created:', run.id);
                const result = await performRun(run, client, thread);
                console.log('Run completed:', result);
                console.log('Sending result:', result);

                // Отправляем результат назад клиенту
                ws.send(JSON.stringify({ type: 'response', chatId: data.chatId, message: JSON.stringify(result) }));
            } else if (data.type === 'image') {
                try {

                    const thread = await client.beta.threads.create();

                    
                    await client.beta.threads.messages.create(thread.id, {
                        role: 'user',
                        content: [
                            {   type: 'text', text: 'Разобрать чек и извлечь информацию (используется, когда тебе присылают фотографию чека) Пришли отчет' },
                            { type: 'image_url', image_url: { url: 'https://api.telegram.org/file/bot7483917044:AAHVgcZTuDhq4UaXzfvw3w7VQ78bqDb9zek/photos/file_14.jpg', detail: 'high' } }, // Передаем URL изображения из данных);
                        ]});

                        const run = await createRun(client, thread, assistant.id);
                    console.log('Run created:', run.id);
            
                    // Ожидаем завершения выполнения
                    const result = await performRun(run, client, thread);
                    console.log('Run completed:', result);
            
                    // Отправляем результат клиенту
                    ws.send(
                        JSON.stringify({
                            type: 'response',
                            chatId: data.chatId,
                            message: result,
                        })
                    );
            
                    console.log('Sending result:', result);
                } catch (error) {
                    console.error('Error during image processing:', error);
                    ws.send(
                        JSON.stringify({
                            error: 'Failed to process the image.',
                            details: error instanceof Error ? error.message : 'Unknown error',
                        })
                    );
                }
            } else {
                console.log('Unsupported message type');
                ws.send(JSON.stringify({ error: 'Unsupported message type' }));
            }
        } catch (error) {
            console.error('Error during message processing:', error);
            ws.send(JSON.stringify({ error: 'Failed to process your message.' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});