import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

app.post('/webhook', async (req, res) => {
    const message = req.body.message;
    if (message && message.text) {
        const chatId = message.chat.id;
        const text = message.text;

        // Forward the message to your agent
        await forwardMessageToAgent(chatId, text);

        // Respond to the Telegram API
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text: 'Message received and forwarded to the agent.'
        });
    }
    res.sendStatus(200);
});

async function forwardMessageToAgent(chatId: number, text: string) {
    // Implement the logic to forward the message to your agent
    console.log(`Forwarding message to agent: ${text}`);
    // Example: Send the message to an agent endpoint
    // await axios.post('http://your-agent-endpoint', { chatId, text });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
