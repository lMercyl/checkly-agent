import express from 'express';
import { WebSocketServer } from 'ws';
import OpenAI from 'openai';
import { createAssistant } from './src/openai/create-assistant.js';
import { createThread } from './src/openai/create-thread.js';
import { createRun } from './src/openai/create-run.js';
import { performRun } from './src/openai/perform-run.js';

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
            const thread = await createThread(client, message.toString());
            const run = await createRun(client, thread, assistant.id);
            console.log('Run created:', run.id);
            const result = await performRun(run, client, thread);
            console.log('Run completed:', result);
            console.log('Sending result:', result);

            // Отправляем результат назад клиенту
            ws.send(JSON.stringify(result));
        } catch (error) {
            console.error('Error during message processing:', error);
            ws.send(JSON.stringify({ error: 'Failed to process your message.' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
